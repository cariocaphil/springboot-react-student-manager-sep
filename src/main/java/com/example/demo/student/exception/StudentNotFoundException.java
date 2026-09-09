package com.example.demo.student.exception;

public class StudentNotFoundException extends RuntimeException {

    public StudentNotFoundException(String msg) {
        super(msg);
    }
}
