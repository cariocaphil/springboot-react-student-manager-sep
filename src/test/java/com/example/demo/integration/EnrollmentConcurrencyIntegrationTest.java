package com.example.demo.integration;

import com.example.demo.course.application.CourseService;
import com.example.demo.course.domain.Course;
import com.example.demo.course.exception.CourseCapacityBelowEnrollmentCountException;
import com.example.demo.course.persistence.CourseRepository;
import com.example.demo.enrollment.application.EnrollmentService;
import com.example.demo.enrollment.domain.Enrollment;
import com.example.demo.enrollment.exception.CourseFullException;
import com.example.demo.enrollment.persistence.EnrollmentRepository;
import com.example.demo.student.domain.Gender;
import com.example.demo.student.domain.Student;
import com.example.demo.student.persistence.StudentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicReference;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
class EnrollmentConcurrencyIntegrationTest {

    @Autowired
    private EnrollmentService enrollmentService;

    @Autowired
    private CourseService courseService;

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private PlatformTransactionManager transactionManager;

    @BeforeEach
    void setUp() {
        enrollmentRepository.deleteAllInBatch();
        studentRepository.deleteAllInBatch();
        courseRepository.deleteAllInBatch();
    }

    /** Outcome test: concurrent enrolls end with one seat taken and one COURSE_FULL. */
    @Test
    void concurrentEnroll_respectsCapacityOfOne() throws Exception {
        Course course = courseRepository.save(Course.createNew("SoloSeat", null, 1));
        Student studentA = studentRepository.save(
                Student.createNew("ConcurrentA", "concurrent-a@example.com", Gender.FEMALE));
        Student studentB = studentRepository.save(
                Student.createNew("ConcurrentB", "concurrent-b@example.com", Gender.MALE));

        CountDownLatch start = new CountDownLatch(1);
        AtomicInteger successes = new AtomicInteger();
        AtomicInteger courseFull = new AtomicInteger();
        AtomicInteger unexpected = new AtomicInteger();

        ExecutorService pool = Executors.newFixedThreadPool(2);
        try {
            List<Future<?>> futures = new ArrayList<>();
            for (Student student : List.of(studentA, studentB)) {
                futures.add(pool.submit(() -> {
                    try {
                        start.await(5, TimeUnit.SECONDS);
                        enrollmentService.enroll(student.getId(), course.getId());
                        successes.incrementAndGet();
                    } catch (CourseFullException ex) {
                        courseFull.incrementAndGet();
                    } catch (Exception ex) {
                        unexpected.incrementAndGet();
                    }
                }));
            }

            start.countDown();
            for (Future<?> future : futures) {
                future.get(10, TimeUnit.SECONDS);
            }
        } finally {
            pool.shutdownNow();
        }

        assertThat(unexpected.get()).isZero();
        assertThat(successes.get()).isEqualTo(1);
        assertThat(courseFull.get()).isEqualTo(1);
        assertThat(enrollmentRepository.countByCourseId(course.getId())).isEqualTo(1L);
    }

    /**
     * Lock-ordering test: while one transaction holds {@code findByIdForUpdate} on the course
     * (and has already taken the only seat), a concurrent {@code enroll} cannot finish until
     * that transaction commits — then it fails with {@link CourseFullException}.
     */
    @Test
    void enroll_blocksOnCourseLockUntilHolderCommits() throws Exception {
        Course course = courseRepository.save(Course.createNew("LockedSeat", null, 1));
        Student holder = studentRepository.save(
                Student.createNew("LockHolder", "lock-holder@example.com", Gender.FEMALE));
        Student waiter = studentRepository.save(
                Student.createNew("LockWaiter", "lock-waiter@example.com", Gender.MALE));

        CountDownLatch lockHeld = new CountDownLatch(1);
        CountDownLatch releaseLock = new CountDownLatch(1);
        AtomicReference<Throwable> holderError = new AtomicReference<>();
        TransactionTemplate tx = new TransactionTemplate(transactionManager);

        ExecutorService pool = Executors.newFixedThreadPool(2);
        try {
            Future<?> holderFuture = pool.submit(() -> {
                try {
                    tx.executeWithoutResult(status -> {
                        courseRepository.findByIdForUpdate(course.getId()).orElseThrow();
                        enrollmentRepository.saveAndFlush(
                                Enrollment.createNew(holder.getId(), course.getId()));
                        lockHeld.countDown();
                        try {
                            if (!releaseLock.await(10, TimeUnit.SECONDS)) {
                                throw new IllegalStateException("timed out holding course lock");
                            }
                        } catch (InterruptedException ex) {
                            Thread.currentThread().interrupt();
                            throw new IllegalStateException(ex);
                        }
                    });
                } catch (Throwable ex) {
                    holderError.set(ex);
                    lockHeld.countDown();
                }
            });

            assertThat(lockHeld.await(10, TimeUnit.SECONDS))
                    .as("holder should acquire course lock")
                    .isTrue();
            assertThat(holderError.get()).isNull();

            Future<?> waiterFuture = pool.submit(() ->
                    enrollmentService.enroll(waiter.getId(), course.getId()));

            // enroll must block on the same row lock; it must not finish while the lock is held
            Thread.sleep(500);
            assertThat(waiterFuture.isDone())
                    .as("enroll should still be blocked while the course lock is held")
                    .isFalse();

            releaseLock.countDown();
            holderFuture.get(10, TimeUnit.SECONDS);
            assertThat(holderError.get()).isNull();

            assertThatThrownBy(() -> waiterFuture.get(10, TimeUnit.SECONDS))
                    .cause()
                    .isInstanceOf(CourseFullException.class);

            assertThat(enrollmentRepository.countByCourseId(course.getId())).isEqualTo(1L);
        } finally {
            releaseLock.countDown();
            pool.shutdownNow();
        }
    }

    /**
     * Lock-ordering test: while one transaction holds the course row lock and has taken the only
     * seat, a concurrent {@code updateCourse} that would set capacity below enrollment count
     * blocks until commit, then fails with {@link CourseCapacityBelowEnrollmentCountException}.
     */
    @Test
    void updateCourse_blocksOnCourseLockThenRejectsCapacityBelowEnrollment() throws Exception {
        Course course = courseRepository.save(Course.createNew("CapacityRace", null, 2));
        Student holderA = studentRepository.save(
                Student.createNew("CapHolderA", "cap-holder-a@example.com", Gender.FEMALE));
        Student holderB = studentRepository.save(
                Student.createNew("CapHolderB", "cap-holder-b@example.com", Gender.MALE));

        CountDownLatch lockHeld = new CountDownLatch(1);
        CountDownLatch releaseLock = new CountDownLatch(1);
        AtomicReference<Throwable> holderError = new AtomicReference<>();
        TransactionTemplate tx = new TransactionTemplate(transactionManager);

        ExecutorService pool = Executors.newFixedThreadPool(2);
        try {
            Future<?> holderFuture = pool.submit(() -> {
                try {
                    tx.executeWithoutResult(status -> {
                        courseRepository.findByIdForUpdate(course.getId()).orElseThrow();
                        enrollmentRepository.saveAndFlush(
                                Enrollment.createNew(holderA.getId(), course.getId()));
                        enrollmentRepository.saveAndFlush(
                                Enrollment.createNew(holderB.getId(), course.getId()));
                        lockHeld.countDown();
                        try {
                            if (!releaseLock.await(10, TimeUnit.SECONDS)) {
                                throw new IllegalStateException("timed out holding course lock");
                            }
                        } catch (InterruptedException ex) {
                            Thread.currentThread().interrupt();
                            throw new IllegalStateException(ex);
                        }
                    });
                } catch (Throwable ex) {
                    holderError.set(ex);
                    lockHeld.countDown();
                }
            });

            assertThat(lockHeld.await(10, TimeUnit.SECONDS))
                    .as("holder should acquire course lock")
                    .isTrue();
            assertThat(holderError.get()).isNull();

            Future<?> updaterFuture = pool.submit(() ->
                    courseService.updateCourse(course.getId(), "CapacityRace", null, 1));

            Thread.sleep(500);
            assertThat(updaterFuture.isDone())
                    .as("updateCourse should still be blocked while the course lock is held")
                    .isFalse();

            releaseLock.countDown();
            holderFuture.get(10, TimeUnit.SECONDS);
            assertThat(holderError.get()).isNull();

            assertThatThrownBy(() -> updaterFuture.get(10, TimeUnit.SECONDS))
                    .cause()
                    .isInstanceOf(CourseCapacityBelowEnrollmentCountException.class);

            Course unchanged = courseRepository.findById(course.getId()).orElseThrow();
            assertThat(unchanged.getCapacity()).isEqualTo(2);
            assertThat(enrollmentRepository.countByCourseId(course.getId())).isEqualTo(2L);
        } finally {
            releaseLock.countDown();
            pool.shutdownNow();
        }
    }

    /**
     * Reverse lock-ordering test: while one transaction holds {@code findByIdForUpdate} and
     * lowers capacity to match seats already taken, a concurrent {@code enroll} blocks until
     * that transaction commits — then fails with {@link CourseFullException}.
     */
    @Test
    void enroll_blocksOnCourseLockWhileUpdateLowersCapacityThenFailsFull() throws Exception {
        Course course = courseRepository.save(Course.createNew("LowerCapacity", null, 2));
        Student seated = studentRepository.save(
                Student.createNew("AlreadySeated", "already-seated@example.com", Gender.FEMALE));
        Student waiter = studentRepository.save(
                Student.createNew("CapWaiter", "cap-waiter@example.com", Gender.MALE));
        enrollmentRepository.save(Enrollment.createNew(seated.getId(), course.getId()));

        CountDownLatch lockHeld = new CountDownLatch(1);
        CountDownLatch releaseLock = new CountDownLatch(1);
        AtomicReference<Throwable> holderError = new AtomicReference<>();
        TransactionTemplate tx = new TransactionTemplate(transactionManager);

        ExecutorService pool = Executors.newFixedThreadPool(2);
        try {
            Future<?> holderFuture = pool.submit(() -> {
                try {
                    tx.executeWithoutResult(status -> {
                        Course locked = courseRepository.findByIdForUpdate(course.getId()).orElseThrow();
                        locked.setCapacity(1);
                        courseRepository.saveAndFlush(locked);
                        lockHeld.countDown();
                        try {
                            if (!releaseLock.await(10, TimeUnit.SECONDS)) {
                                throw new IllegalStateException("timed out holding course lock");
                            }
                        } catch (InterruptedException ex) {
                            Thread.currentThread().interrupt();
                            throw new IllegalStateException(ex);
                        }
                    });
                } catch (Throwable ex) {
                    holderError.set(ex);
                    lockHeld.countDown();
                }
            });

            assertThat(lockHeld.await(10, TimeUnit.SECONDS))
                    .as("holder should acquire course lock")
                    .isTrue();
            assertThat(holderError.get()).isNull();

            Future<?> waiterFuture = pool.submit(() ->
                    enrollmentService.enroll(waiter.getId(), course.getId()));

            Thread.sleep(500);
            assertThat(waiterFuture.isDone())
                    .as("enroll should still be blocked while the course lock is held")
                    .isFalse();

            releaseLock.countDown();
            holderFuture.get(10, TimeUnit.SECONDS);
            assertThat(holderError.get()).isNull();

            assertThatThrownBy(() -> waiterFuture.get(10, TimeUnit.SECONDS))
                    .cause()
                    .isInstanceOf(CourseFullException.class);

            Course updated = courseRepository.findById(course.getId()).orElseThrow();
            assertThat(updated.getCapacity()).isEqualTo(1);
            assertThat(enrollmentRepository.countByCourseId(course.getId())).isEqualTo(1L);
        } finally {
            releaseLock.countDown();
            pool.shutdownNow();
        }
    }
}
