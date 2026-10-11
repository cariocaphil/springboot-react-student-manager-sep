package com.example.demo.enrollment.api;

import io.swagger.v3.oas.annotations.media.Schema;

import jakarta.validation.constraints.NotNull;

@Schema(name = "EnrollmentRequest", description = "Payload to enroll a student in a course")
public record EnrollmentRequest(
        @NotNull
        @Schema(description = "Student id", example = "1", requiredMode = Schema.RequiredMode.REQUIRED)
        Long studentId,
        @NotNull
        @Schema(description = "Course id", example = "1", requiredMode = Schema.RequiredMode.REQUIRED)
        Long courseId
) {
}
