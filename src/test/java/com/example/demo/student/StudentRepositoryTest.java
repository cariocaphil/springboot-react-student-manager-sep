package com.example.demo.student;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;

@DataJpaTest
class StudentRepositoryTest {

    @Autowired
    private StudentRepository underTest;

    @Test
    void itShouldCheckIfStudentExistsEmail() {
        // given
        Student student = new Student(1_111_111L, "Jamila", "jamila@gmail.com", Gender.FEMALE);
        underTest.save(student);
        // when
        boolean exists = underTest.selectExistsEmail("jamila@gmail.com");
        // then
        assertThat(exists).isTrue();
    }
}