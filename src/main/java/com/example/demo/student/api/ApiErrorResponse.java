package com.example.demo.student.api;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * Stable error JSON shape for the React client.
 */
@Schema(name = "ApiErrorResponse", description = "Structured API error body")
public record ApiErrorResponse(
        @Schema(description = "User-facing error message", example = "Email ada@example.com taken", requiredMode = Schema.RequiredMode.REQUIRED)
        String message,
        @Schema(description = "HTTP status code", example = "400", requiredMode = Schema.RequiredMode.REQUIRED)
        int status,
        @Schema(description = "HTTP reason phrase", example = "Bad Request", requiredMode = Schema.RequiredMode.REQUIRED)
        String error
) {
}
