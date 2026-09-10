package com.example.demo.student.api;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * Stable machine-readable API error codes for clients (i18n mapping, etc.).
 * Human-readable detail remains in {@link ApiErrorResponse#message()}.
 */
@Schema(name = "ApiErrorCode", description = "Stable API error code")
public enum ApiErrorCode {
    EMAIL_TAKEN,
    STUDENT_NOT_FOUND,
    VALIDATION_FAILED,
    BAD_REQUEST
}
