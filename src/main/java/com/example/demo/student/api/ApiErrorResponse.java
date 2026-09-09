package com.example.demo.student.api;

/**
 * Error JSON shape consumed by the React client ({@code ApiErrorBody}).
 */
public record ApiErrorResponse(
        String message,
        int status,
        String error
) {
}
