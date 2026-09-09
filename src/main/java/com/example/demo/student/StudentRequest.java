package com.example.demo.student;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record StudentRequest(
        @NotBlank String name,
        @Email String email,
        @NotNull Gender gender
) {
}
