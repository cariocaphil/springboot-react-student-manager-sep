package com.example.demo.student;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class StudentMapperTest {

    @Test
    void toEntity_mapsRequestFieldsWithoutId() {
        StudentRequest request = new StudentRequest("Jamila", "jamila@example.com", Gender.FEMALE);

        Student entity = StudentMapper.toEntity(request);

        assertThat(entity.getId()).isNull();
        assertThat(entity.getName()).isEqualTo("Jamila");
        assertThat(entity.getEmail()).isEqualTo("jamila@example.com");
        assertThat(entity.getGender()).isEqualTo(Gender.FEMALE);
    }

    @Test
    void toResponse_mapsEntityFields() {
        Student entity = new Student(7L, "Alex", "alex@example.com", Gender.MALE);

        StudentResponse response = StudentMapper.toResponse(entity);

        assertThat(response.id()).isEqualTo(7L);
        assertThat(response.name()).isEqualTo("Alex");
        assertThat(response.email()).isEqualTo("alex@example.com");
        assertThat(response.gender()).isEqualTo(Gender.MALE);
    }
}
