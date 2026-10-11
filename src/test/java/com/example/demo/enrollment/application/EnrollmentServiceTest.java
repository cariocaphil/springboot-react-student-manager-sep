package com.example.demo.enrollment.application;

import com.example.demo.course.domain.Course;
import com.example.demo.course.exception.CourseNotFoundException;
import com.example.demo.course.persistence.CourseRepository;
import com.example.demo.enrollment.domain.Enrollment;
import com.example.demo.enrollment.exception.CourseFullException;
import com.example.demo.enrollment.exception.DuplicateEnrollmentException;
import com.example.demo.enrollment.exception.EnrollmentNotFoundException;
import com.example.demo.enrollment.persistence.EnrollmentRepository;
import com.example.demo.student.exception.StudentNotFoundException;
import com.example.demo.student.persistence.StudentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.hibernate.exception.ConstraintViolationException;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;

import java.sql.SQLException;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class EnrollmentServiceTest {

    @Mock
    private EnrollmentRepository enrollmentRepository;

    @Mock
    private StudentRepository studentRepository;

    @Mock
    private CourseRepository courseRepository;

    private EnrollmentService underTest;

    @BeforeEach
    void setUp() {
        underTest = new EnrollmentService(enrollmentRepository, studentRepository, courseRepository);
    }

    @Test
    void getAllEnrollments_returnsRepositoryResult() {
        Enrollment enrollment = new Enrollment(1L, 2L, 3L, Instant.parse("2026-01-01T00:00:00Z"));
        given(enrollmentRepository.findAll()).willReturn(List.of(enrollment));

        assertThat(underTest.getAllEnrollments()).containsExactly(enrollment);
        verify(enrollmentRepository).findAll();
    }

    @Test
    void enroll_savesWhenStudentAndCourseAvailable() {
        Course course = new Course(10L, "Algorithms", null, 2);
        given(studentRepository.existsById(1L)).willReturn(true);
        given(courseRepository.findByIdForUpdate(10L)).willReturn(Optional.of(course));
        given(enrollmentRepository.existsByStudentIdAndCourseId(1L, 10L)).willReturn(false);
        given(enrollmentRepository.countByCourseId(10L)).willReturn(0L);

        underTest.enroll(1L, 10L);

        ArgumentCaptor<Enrollment> captor = ArgumentCaptor.forClass(Enrollment.class);
        verify(enrollmentRepository).saveAndFlush(captor.capture());
        assertThat(captor.getValue().getStudentId()).isEqualTo(1L);
        assertThat(captor.getValue().getCourseId()).isEqualTo(10L);
        assertThat(captor.getValue().getEnrolledAt()).isNotNull();
        verify(courseRepository).findByIdForUpdate(10L);
    }

    @Test
    void enroll_throwsWhenStudentMissing() {
        given(studentRepository.existsById(99L)).willReturn(false);

        assertThatThrownBy(() -> underTest.enroll(99L, 10L))
                .isInstanceOf(StudentNotFoundException.class)
                .hasMessage("Student with id 99 does not exist");

        verify(courseRepository, never()).findByIdForUpdate(any());
        verify(enrollmentRepository, never()).saveAndFlush(any());
    }

    @Test
    void enroll_throwsWhenCourseMissing() {
        given(studentRepository.existsById(1L)).willReturn(true);
        given(courseRepository.findByIdForUpdate(10L)).willReturn(Optional.empty());

        assertThatThrownBy(() -> underTest.enroll(1L, 10L))
                .isInstanceOf(CourseNotFoundException.class)
                .hasMessage("Course with id 10 does not exist");

        verify(enrollmentRepository, never()).saveAndFlush(any());
    }

    @Test
    void enroll_throwsWhenAlreadyEnrolled() {
        Course course = new Course(10L, "Algorithms", null, 2);
        given(studentRepository.existsById(1L)).willReturn(true);
        given(courseRepository.findByIdForUpdate(10L)).willReturn(Optional.of(course));
        given(enrollmentRepository.existsByStudentIdAndCourseId(1L, 10L)).willReturn(true);

        assertThatThrownBy(() -> underTest.enroll(1L, 10L))
                .isInstanceOf(DuplicateEnrollmentException.class)
                .hasMessage("Student 1 already enrolled in course 10");

        verify(enrollmentRepository, never()).saveAndFlush(any());
    }

    @Test
    void enroll_throwsWhenCourseFull() {
        Course course = new Course(10L, "Algorithms", null, 1);
        given(studentRepository.existsById(1L)).willReturn(true);
        given(courseRepository.findByIdForUpdate(10L)).willReturn(Optional.of(course));
        given(enrollmentRepository.existsByStudentIdAndCourseId(1L, 10L)).willReturn(false);
        given(enrollmentRepository.countByCourseId(10L)).willReturn(1L);

        assertThatThrownBy(() -> underTest.enroll(1L, 10L))
                .isInstanceOf(CourseFullException.class)
                .hasMessage("Course 10 is full");

        verify(enrollmentRepository, never()).saveAndFlush(any());
    }

    @Test
    void enroll_mapsStudentCourseUniqueViolationToDuplicateEnrollment() {
        Course course = new Course(10L, "Algorithms", null, 2);
        given(studentRepository.existsById(1L)).willReturn(true);
        given(courseRepository.findByIdForUpdate(10L)).willReturn(Optional.of(course));
        given(enrollmentRepository.existsByStudentIdAndCourseId(1L, 10L)).willReturn(false);
        given(enrollmentRepository.countByCourseId(10L)).willReturn(0L);
        given(enrollmentRepository.saveAndFlush(any(Enrollment.class)))
                .willThrow(dataIntegrityViolation(
                        EnrollmentService.STUDENT_COURSE_UNIQUE_CONSTRAINT));

        assertThatThrownBy(() -> underTest.enroll(1L, 10L))
                .isInstanceOf(DuplicateEnrollmentException.class)
                .hasMessage("Student 1 already enrolled in course 10");
    }

    @Test
    void enroll_rethrowsDataIntegrityViolationForOtherConstraints() {
        Course course = new Course(10L, "Algorithms", null, 2);
        given(studentRepository.existsById(1L)).willReturn(true);
        given(courseRepository.findByIdForUpdate(10L)).willReturn(Optional.of(course));
        given(enrollmentRepository.existsByStudentIdAndCourseId(1L, 10L)).willReturn(false);
        given(enrollmentRepository.countByCourseId(10L)).willReturn(0L);
        DataIntegrityViolationException otherConstraint =
                dataIntegrityViolation("some_other_constraint");
        given(enrollmentRepository.saveAndFlush(any(Enrollment.class))).willThrow(otherConstraint);

        assertThatThrownBy(() -> underTest.enroll(1L, 10L)).isSameAs(otherConstraint);
    }

    @Test
    void enroll_rethrowsDataIntegrityViolationWhenConstraintNameIsNull() {
        Course course = new Course(10L, "Algorithms", null, 2);
        given(studentRepository.existsById(1L)).willReturn(true);
        given(courseRepository.findByIdForUpdate(10L)).willReturn(Optional.of(course));
        given(enrollmentRepository.existsByStudentIdAndCourseId(1L, 10L)).willReturn(false);
        given(enrollmentRepository.countByCourseId(10L)).willReturn(0L);
        DataIntegrityViolationException nullConstraintName = dataIntegrityViolation(null);
        given(enrollmentRepository.saveAndFlush(any(Enrollment.class)))
                .willThrow(nullConstraintName);

        assertThatThrownBy(() -> underTest.enroll(1L, 10L)).isSameAs(nullConstraintName);
    }

    @Test
    void enroll_rethrowsDataIntegrityViolationWithoutConstraintCause() {
        Course course = new Course(10L, "Algorithms", null, 2);
        given(studentRepository.existsById(1L)).willReturn(true);
        given(courseRepository.findByIdForUpdate(10L)).willReturn(Optional.of(course));
        given(enrollmentRepository.existsByStudentIdAndCourseId(1L, 10L)).willReturn(false);
        given(enrollmentRepository.countByCourseId(10L)).willReturn(0L);
        DataIntegrityViolationException unknown =
                new DataIntegrityViolationException("unrelated integrity failure");
        given(enrollmentRepository.saveAndFlush(any(Enrollment.class))).willThrow(unknown);

        assertThatThrownBy(() -> underTest.enroll(1L, 10L)).isSameAs(unknown);
    }

    private static DataIntegrityViolationException dataIntegrityViolation(String constraintName) {
        ConstraintViolationException hibernateViolation = new ConstraintViolationException(
                "constraint violated",
                new SQLException("unique violation"),
                constraintName);
        return new DataIntegrityViolationException("could not execute statement", hibernateViolation);
    }

    @Test
    void deleteEnrollment_deletesWhenPresent() {
        given(enrollmentRepository.existsById(5L)).willReturn(true);

        underTest.deleteEnrollment(5L);

        verify(enrollmentRepository).deleteById(5L);
    }

    @Test
    void deleteEnrollment_throwsWhenMissing() {
        given(enrollmentRepository.existsById(5L)).willReturn(false);

        assertThatThrownBy(() -> underTest.deleteEnrollment(5L))
                .isInstanceOf(EnrollmentNotFoundException.class)
                .hasMessage("Enrollment with id 5 does not exist");

        verify(enrollmentRepository, never()).deleteById(any());
    }
}
