package com.example.demo.enrollment.api;

import io.swagger.v3.oas.annotations.media.Schema;

import jakarta.validation.constraints.NotNull;
import java.time.Instant;

@Schema(name = "EnrollmentResponse", description = "Enrollment as returned by the API")
public record EnrollmentResponse(
        @NotNull
        @Schema(description = "Enrollment id", example = "1", requiredMode = Schema.RequiredMode.REQUIRED)
        Long id,
        @NotNull
        @Schema(description = "Student id", example = "1", requiredMode = Schema.RequiredMode.REQUIRED)
        Long studentId,
        @NotNull
        @Schema(description = "Course id", example = "1", requiredMode = Schema.RequiredMode.REQUIRED)
        Long courseId,
        @NotNull
        @Schema(description = "Enrollment timestamp (UTC)", example = "2026-01-15T10:30:00Z", requiredMode = Schema.RequiredMode.REQUIRED)
        Instant enrolledAt
) {
}
