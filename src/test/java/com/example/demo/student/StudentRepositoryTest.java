package com.example.demo.student;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class StudentRepositoryTest {

    @Autowired
    private StudentRepository underTest;

    @Test
    void selectExistsEmail_isFalseWhenEmpty() {
        assertThat(underTest.selectExistsEmail("nobody@example.com")).isFalse();
    }

    @Test
    void selectExistsEmail_isTrueWhenEmailSaved() {
        Student student = new Student(null, "Alex", "alex@example.com", Gender.MALE);
        underTest.save(student);

        assertThat(underTest.selectExistsEmail("alex@example.com")).isTrue();
        assertThat(underTest.selectExistsEmail("other@example.com")).isFalse();
    }
}
