package com.example.demo.course.api;

import com.example.demo.course.domain.Course;

final class CourseMapper {

    private CourseMapper() {
    }

    static Course toEntity(CourseRequest request) {
        return Course.createNew(request.title(), request.description(), request.capacity());
    }

    static CourseResponse toResponse(Course course) {
        return new CourseResponse(
                course.getId(),
                course.getTitle(),
                course.getDescription(),
                course.getCapacity()
        );
    }
}
