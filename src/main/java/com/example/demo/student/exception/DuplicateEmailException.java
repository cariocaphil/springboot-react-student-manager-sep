package com.example.demo.student.exception;

public class DuplicateEmailException extends RuntimeException {

    public DuplicateEmailException(String email) {
        super("Email " + email + " taken");
    }
}
