package com.example.demo.student.api;

import com.example.demo.student.domain.Gender;
import io.swagger.v3.oas.annotations.media.Schema;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Schema(name = "StudentResponse", description = "Student as returned by the API")
public record StudentResponse(
        @NotNull
        @Schema(description = "Student id", example = "1", requiredMode = Schema.RequiredMode.REQUIRED)
        Long id,
        @NotBlank
        @Schema(description = "Full name", example = "Ada Lovelace", requiredMode = Schema.RequiredMode.REQUIRED)
        String name,
        @NotBlank
        @Schema(description = "Email address", example = "ada@example.com", requiredMode = Schema.RequiredMode.REQUIRED)
        String email,
        @NotNull
        @Schema(description = "Gender", requiredMode = Schema.RequiredMode.REQUIRED)
        Gender gender
) {
}
