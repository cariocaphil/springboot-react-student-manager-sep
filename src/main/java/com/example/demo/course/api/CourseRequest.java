package com.example.demo.course.api;

import io.swagger.v3.oas.annotations.media.Schema;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Schema(name = "CourseRequest", description = "Payload to create or update a course")
public record CourseRequest(
        @NotBlank
        @Schema(description = "Course title", example = "Intro to Algorithms", requiredMode = Schema.RequiredMode.REQUIRED)
        String title,
        @Schema(description = "Optional course description", example = "Sorting, graphs, and complexity")
        String description,
        @NotNull
        @Min(1)
        @Schema(description = "Maximum number of seats", example = "30", requiredMode = Schema.RequiredMode.REQUIRED, minimum = "1")
        Integer capacity
) {
}
