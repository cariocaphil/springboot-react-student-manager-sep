package com.example.demo.course.persistence;

import com.example.demo.course.domain.Course;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class CourseRepositoryTest {

    @Autowired
    private CourseRepository underTest;

    @Test
    void saveAndFindById_roundTripsCourse() {
        Course saved = underTest.save(Course.createNew("Algorithms", "Intro", 30));

        assertThat(underTest.findById(saved.getId())).isPresent().get()
                .satisfies(course -> {
                    assertThat(course.getTitle()).isEqualTo("Algorithms");
                    assertThat(course.getDescription()).isEqualTo("Intro");
                    assertThat(course.getCapacity()).isEqualTo(30);
                });
    }

    @Test
    void save_allowsNullDescription() {
        Course saved = underTest.save(Course.createNew("Databases", null, 20));

        assertThat(underTest.findById(saved.getId())).isPresent().get()
                .extracting(Course::getDescription)
                .isNull();
    }
}
