package com.example.demo.student;

public record StudentResponse(
        Long id,
        String name,
        String email,
        Gender gender
) {
}
