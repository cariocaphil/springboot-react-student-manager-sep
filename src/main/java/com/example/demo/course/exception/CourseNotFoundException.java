package com.example.demo.course.exception;

public class CourseNotFoundException extends RuntimeException {

    public CourseNotFoundException(String msg) {
        super(msg);
    }
}
