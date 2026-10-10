package com.example.demo.enrollment.api;

import com.example.demo.enrollment.domain.Enrollment;
import org.junit.jupiter.api.Test;

import java.time.Instant;

import static org.assertj.core.api.Assertions.assertThat;

class EnrollmentMapperTest {

    @Test
    void toResponse_mapsAllFields() {
        Instant enrolledAt = Instant.parse("2026-01-15T10:30:00Z");
        Enrollment enrollment = new Enrollment(1L, 2L, 3L, enrolledAt);

        EnrollmentResponse response = EnrollmentMapper.toResponse(enrollment);

        assertThat(response).isEqualTo(new EnrollmentResponse(1L, 2L, 3L, enrolledAt));
    }
}
