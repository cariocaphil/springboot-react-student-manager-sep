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
import lombok.AllArgsConstructor;
import org.hibernate.exception.ConstraintViolationException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@AllArgsConstructor
@Service
@Transactional(readOnly = true)
public class EnrollmentService {

    static final String STUDENT_COURSE_UNIQUE_CONSTRAINT = "uk_enrollment_student_course";

    private final EnrollmentRepository enrollmentRepository;
    private final StudentRepository studentRepository;
    private final CourseRepository courseRepository;

    public List<Enrollment> getAllEnrollments() {
        return enrollmentRepository.findAll();
    }

    /**
     * Only write path that inserts enrollments. Always locks the course row before
     * counting seats so concurrent enrolls cannot overfill capacity.
     */
    @Transactional
    public void enroll(Long studentId, Long courseId) {
        if (!studentRepository.existsById(studentId)) {
            throw new StudentNotFoundException(
                    "Student with id " + studentId + " does not exist");
        }

        Course course = courseRepository.findByIdForUpdate(courseId)
                .orElseThrow(() -> new CourseNotFoundException(
                        "Course with id " + courseId + " does not exist"));

        if (enrollmentRepository.existsByStudentIdAndCourseId(studentId, courseId)) {
            throw new DuplicateEnrollmentException(studentId, courseId);
        }

        if (enrollmentRepository.countByCourseId(courseId) >= course.getCapacity()) {
            throw new CourseFullException(courseId);
        }

        try {
            enrollmentRepository.saveAndFlush(Enrollment.createNew(studentId, courseId));
        } catch (DataIntegrityViolationException ex) {
            if (isStudentCourseUniqueViolation(ex)) {
                throw new DuplicateEnrollmentException(studentId, courseId);
            }
            throw ex;
        }
    }

    @Transactional
    public void deleteEnrollment(Long enrollmentId) {
        if (!enrollmentRepository.existsById(enrollmentId)) {
            throw new EnrollmentNotFoundException(
                    "Enrollment with id " + enrollmentId + " does not exist");
        }
        enrollmentRepository.deleteById(enrollmentId);
    }

    private static boolean isStudentCourseUniqueViolation(DataIntegrityViolationException ex) {
        for (Throwable cause = ex; cause != null; cause = cause.getCause()) {
            if (cause instanceof ConstraintViolationException constraintViolation) {
                String constraintName = constraintViolation.getConstraintName();
                return constraintName != null
                        && constraintName.equalsIgnoreCase(STUDENT_COURSE_UNIQUE_CONSTRAINT);
            }
        }
        return false;
    }
}
