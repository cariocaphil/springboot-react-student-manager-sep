package com.example.demo.course.api;

import com.example.demo.course.domain.Course;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class CourseMapperTest {

    @Test
    void toEntity_mapsRequestFieldsWithoutId() {
        CourseRequest request = new CourseRequest("Algorithms", "Intro", 30);

        Course entity = CourseMapper.toEntity(request);

        assertThat(entity.getId()).isNull();
        assertThat(entity.getTitle()).isEqualTo("Algorithms");
        assertThat(entity.getDescription()).isEqualTo("Intro");
        assertThat(entity.getCapacity()).isEqualTo(30);
    }

    @Test
    void toResponse_mapsEntityFields() {
        Course entity = new Course(7L, "Algorithms", null, 15);

        CourseResponse response = CourseMapper.toResponse(entity);

        assertThat(response.id()).isEqualTo(7L);
        assertThat(response.title()).isEqualTo("Algorithms");
        assertThat(response.description()).isNull();
        assertThat(response.capacity()).isEqualTo(15);
    }
}
