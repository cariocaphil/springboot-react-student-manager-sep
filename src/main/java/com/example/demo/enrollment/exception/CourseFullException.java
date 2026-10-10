package com.example.demo.enrollment.exception;

public class CourseFullException extends RuntimeException {

    public CourseFullException(Long courseId) {
        super("Course " + courseId + " is full");
    }
}
