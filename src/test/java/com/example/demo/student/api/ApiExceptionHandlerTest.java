package com.example.demo.student.api;

import com.example.demo.student.exception.BadRequestException;
import com.example.demo.student.exception.DuplicateEmailException;
import com.example.demo.student.exception.StudentNotFoundException;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;

import static org.assertj.core.api.Assertions.assertThat;

class ApiExceptionHandlerTest {

    private final ApiExceptionHandler handler = new ApiExceptionHandler();

    @Test
    void handleBadRequest_returnsStableErrorBody() {
        ResponseEntity<ApiErrorResponse> response =
                handler.handleBadRequest(new BadRequestException("Invalid input"));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).isEqualTo(
                new ApiErrorResponse(ApiErrorCode.BAD_REQUEST, "Invalid input", 400, "Bad Request"));
    }

    @Test
    void handleDuplicateEmail_returnsEmailTakenCode() {
        ResponseEntity<ApiErrorResponse> response =
                handler.handleDuplicateEmail(new DuplicateEmailException("jamila@example.com"));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).isEqualTo(
                new ApiErrorResponse(
                        ApiErrorCode.EMAIL_TAKEN,
                        "Email jamila@example.com taken",
                        400,
                        "Bad Request"));
    }

    @Test
    void handleNotFound_returnsStudentNotFoundCode() {
        ResponseEntity<ApiErrorResponse> response =
                handler.handleNotFound(new StudentNotFoundException("Student with id 99 does not exists"));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(response.getBody()).isEqualTo(
                new ApiErrorResponse(
                        ApiErrorCode.STUDENT_NOT_FOUND,
                        "Student with id 99 does not exists",
                        404,
                        "Not Found"));
    }

    @Test
    void handleValidation_joinsFieldErrorsWithValidationFailedCode() throws Exception {
        BeanPropertyBindingResult bindingResult =
                new BeanPropertyBindingResult(new Object(), "studentRequest");
        bindingResult.addError(new FieldError("studentRequest", "email", "must be a well-formed email address"));
        bindingResult.addError(new FieldError("studentRequest", "name", "must not be blank"));
        MethodArgumentNotValidException ex =
                new MethodArgumentNotValidException(null, bindingResult);

        ResponseEntity<ApiErrorResponse> response = handler.handleValidation(ex);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().code()).isEqualTo(ApiErrorCode.VALIDATION_FAILED);
        assertThat(response.getBody().status()).isEqualTo(400);
        assertThat(response.getBody().error()).isEqualTo("Bad Request");
        assertThat(response.getBody().message())
                .contains("email:")
                .contains("name:");
    }
}
