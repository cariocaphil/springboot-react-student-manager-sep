package com.example.demo.student.api;

import com.example.demo.student.domain.Gender;

public record StudentResponse(
        Long id,
        String name,
        String email,
        Gender gender
) {
}
