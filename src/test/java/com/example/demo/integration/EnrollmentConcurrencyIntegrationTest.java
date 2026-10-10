package com.example.demo.integration;

import com.example.demo.course.domain.Course;
import com.example.demo.course.persistence.CourseRepository;
import com.example.demo.enrollment.application.EnrollmentService;
import com.example.demo.enrollment.exception.CourseFullException;
import com.example.demo.enrollment.persistence.EnrollmentRepository;
import com.example.demo.student.domain.Gender;
import com.example.demo.student.domain.Student;
import com.example.demo.student.persistence.StudentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
class EnrollmentConcurrencyIntegrationTest {

    @Autowired
    private EnrollmentService enrollmentService;

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private CourseRepository courseRepository;

    @BeforeEach
    void setUp() {
        enrollmentRepository.deleteAllInBatch();
        studentRepository.deleteAllInBatch();
        courseRepository.deleteAllInBatch();
    }

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
}
