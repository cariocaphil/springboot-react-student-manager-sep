package com.example.demo.student.api;

import com.example.demo.student.exception.BadRequestException;
import com.example.demo.student.exception.DuplicateEmailException;
import com.example.demo.student.exception.StudentNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.stream.Collectors;

@RestControllerAdvice
public class ApiExceptionHandler {

    @ExceptionHandler(DuplicateEmailException.class)
    public ResponseEntity<ApiErrorResponse> handleDuplicateEmail(DuplicateEmailException ex) {
        return error(HttpStatus.BAD_REQUEST, ApiErrorCode.EMAIL_TAKEN, ex.getMessage());
    }

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ApiErrorResponse> handleBadRequest(BadRequestException ex) {
        return error(HttpStatus.BAD_REQUEST, ApiErrorCode.BAD_REQUEST, ex.getMessage());
    }

    @ExceptionHandler(StudentNotFoundException.class)
    public ResponseEntity<ApiErrorResponse> handleNotFound(StudentNotFoundException ex) {
        return error(HttpStatus.NOT_FOUND, ApiErrorCode.STUDENT_NOT_FOUND, ex.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .map(this::formatFieldError)
                .collect(Collectors.joining("; "));
        if (message.isBlank()) {
            message = "Validation failed";
        }
        return error(HttpStatus.BAD_REQUEST, ApiErrorCode.VALIDATION_FAILED, message);
    }

    private ResponseEntity<ApiErrorResponse> error(HttpStatus status, ApiErrorCode code, String message) {
        return ResponseEntity
                .status(status)
                .body(new ApiErrorResponse(code, message, status.value(), status.getReasonPhrase()));
    }

    private String formatFieldError(FieldError fieldError) {
        return fieldError.getField() + ": " + fieldError.getDefaultMessage();
    }
}
