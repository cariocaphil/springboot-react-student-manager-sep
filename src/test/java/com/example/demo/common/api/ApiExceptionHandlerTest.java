package com.example.demo.common.api;

import com.example.demo.course.exception.CourseCapacityBelowEnrollmentCountException;
import com.example.demo.course.exception.CourseNotFoundException;
import com.example.demo.enrollment.exception.CourseFullException;
import com.example.demo.enrollment.exception.DuplicateEnrollmentException;
import com.example.demo.enrollment.exception.EnrollmentNotFoundException;
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
                handler.handleNotFound(new StudentNotFoundException("Student with id 99 does not exist"));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(response.getBody()).isEqualTo(
                new ApiErrorResponse(
                        ApiErrorCode.STUDENT_NOT_FOUND,
                        "Student with id 99 does not exist",
                        404,
                        "Not Found"));
    }

    @Test
    void handleCourseNotFound_returnsCourseNotFoundCode() {
        ResponseEntity<ApiErrorResponse> response =
                handler.handleCourseNotFound(new CourseNotFoundException("Course with id 99 does not exist"));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(response.getBody()).isEqualTo(
                new ApiErrorResponse(
                        ApiErrorCode.COURSE_NOT_FOUND,
                        "Course with id 99 does not exist",
                        404,
                        "Not Found"));
    }

    @Test
    void handleEnrollmentNotFound_returnsEnrollmentNotFoundCode() {
        ResponseEntity<ApiErrorResponse> response =
                handler.handleEnrollmentNotFound(
                        new EnrollmentNotFoundException("Enrollment with id 99 does not exist"));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(response.getBody()).isEqualTo(
                new ApiErrorResponse(
                        ApiErrorCode.ENROLLMENT_NOT_FOUND,
                        "Enrollment with id 99 does not exist",
                        404,
                        "Not Found"));
    }

    @Test
    void handleDuplicateEnrollment_returnsDuplicateEnrollmentCode() {
        ResponseEntity<ApiErrorResponse> response =
                handler.handleDuplicateEnrollment(new DuplicateEnrollmentException(1L, 2L));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).isEqualTo(
                new ApiErrorResponse(
                        ApiErrorCode.DUPLICATE_ENROLLMENT,
                        "Student 1 already enrolled in course 2",
                        400,
                        "Bad Request"));
    }

    @Test
    void handleCourseFull_returnsCourseFullCode() {
        ResponseEntity<ApiErrorResponse> response =
                handler.handleCourseFull(new CourseFullException(10L));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).isEqualTo(
                new ApiErrorResponse(ApiErrorCode.COURSE_FULL, "Course 10 is full", 400, "Bad Request"));
    }

    @Test
    void handleCourseCapacityBelowEnrollmentCount_returnsConflict() {
        ResponseEntity<ApiErrorResponse> response =
                handler.handleCourseCapacityBelowEnrollmentCount(
                        new CourseCapacityBelowEnrollmentCountException(10L, 2, 5L));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
        assertThat(response.getBody()).isEqualTo(
                new ApiErrorResponse(
                        ApiErrorCode.COURSE_CAPACITY_BELOW_ENROLLMENT_COUNT,
                        "Course 10 capacity 2 is below enrollment count 5",
                        409,
                        "Conflict"));
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
