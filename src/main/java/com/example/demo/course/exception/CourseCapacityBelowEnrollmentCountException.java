package com.example.demo.course.exception;

public class CourseCapacityBelowEnrollmentCountException extends RuntimeException {

    public CourseCapacityBelowEnrollmentCountException(Long courseId, int capacity, long enrollmentCount) {
        super("Course " + courseId + " capacity " + capacity
                + " is below enrollment count " + enrollmentCount);
    }
}
