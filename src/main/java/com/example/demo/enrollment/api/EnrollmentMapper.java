package com.example.demo.enrollment.api;

import com.example.demo.enrollment.domain.Enrollment;

final class EnrollmentMapper {

    private EnrollmentMapper() {
    }

    static EnrollmentResponse toResponse(Enrollment enrollment) {
        return new EnrollmentResponse(
                enrollment.getId(),
                enrollment.getStudentId(),
                enrollment.getCourseId(),
                enrollment.getEnrolledAt()
        );
    }
}
