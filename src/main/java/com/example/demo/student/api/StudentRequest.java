package com.example.demo.student.api;

import com.example.demo.student.domain.Gender;
import io.swagger.v3.oas.annotations.media.Schema;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Schema(name = "StudentRequest", description = "Payload to create a student")
public record StudentRequest(
        @NotBlank
        @Schema(description = "Full name", example = "Ada Lovelace", requiredMode = Schema.RequiredMode.REQUIRED)
        String name,
        @Email
        @NotBlank
        @Schema(description = "Email address", example = "ada@example.com", requiredMode = Schema.RequiredMode.REQUIRED)
        String email,
        @NotNull
        @Schema(description = "Gender", requiredMode = Schema.RequiredMode.REQUIRED)
        Gender gender
) {
}
