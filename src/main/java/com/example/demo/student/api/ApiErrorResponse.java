package com.example.demo.student.api;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * Stable error JSON shape for the React client.
 */
@Schema(name = "ApiErrorResponse", description = "Structured API error body")
public record ApiErrorResponse(
        @Schema(description = "Stable error code for clients", requiredMode = Schema.RequiredMode.REQUIRED)
        ApiErrorCode code,
        @Schema(description = "Diagnostic detail (not primary UI copy for known codes)", example = "Email ada@example.com taken", requiredMode = Schema.RequiredMode.REQUIRED)
        String message,
        @Schema(description = "HTTP status code", example = "400", requiredMode = Schema.RequiredMode.REQUIRED)
        int status,
        @Schema(description = "HTTP reason phrase", example = "Bad Request", requiredMode = Schema.RequiredMode.REQUIRED)
        String error
) {
}
