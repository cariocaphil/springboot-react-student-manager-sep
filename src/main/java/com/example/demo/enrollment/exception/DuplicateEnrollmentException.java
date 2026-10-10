package com.example.demo.enrollment.exception;

public class DuplicateEnrollmentException extends RuntimeException {

    public DuplicateEnrollmentException(Long studentId, Long courseId) {
        super("Student " + studentId + " already enrolled in course " + courseId);
    }
}
