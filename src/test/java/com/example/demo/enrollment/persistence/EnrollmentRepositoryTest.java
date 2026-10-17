package com.example.demo.enrollment.persistence;

import com.example.demo.enrollment.domain.Enrollment;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.ImportAutoConfiguration;
import org.springframework.boot.autoconfigure.flyway.FlywayAutoConfiguration;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.dao.DataIntegrityViolationException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@DataJpaTest
@ImportAutoConfiguration(FlywayAutoConfiguration.class)
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class EnrollmentRepositoryTest {

    @Autowired
    private EnrollmentRepository underTest;

    @Test
    void saveAndFindById_roundTripsEnrollment() {
        Enrollment saved = underTest.save(Enrollment.createNew(1L, 2L));

        assertThat(underTest.findById(saved.getId())).isPresent().get()
                .satisfies(enrollment -> {
                    assertThat(enrollment.getStudentId()).isEqualTo(1L);
                    assertThat(enrollment.getCourseId()).isEqualTo(2L);
                    assertThat(enrollment.getEnrolledAt()).isNotNull();
                });
    }

    @Test
    void existsAndCount_queryEnrollmentPairs() {
        underTest.save(Enrollment.createNew(1L, 10L));
        underTest.save(Enrollment.createNew(2L, 10L));
        underTest.save(Enrollment.createNew(1L, 11L));

        assertThat(underTest.existsByStudentIdAndCourseId(1L, 10L)).isTrue();
        assertThat(underTest.existsByStudentIdAndCourseId(3L, 10L)).isFalse();
        assertThat(underTest.countByCourseId(10L)).isEqualTo(2L);
        assertThat(underTest.countByCourseId(11L)).isEqualTo(1L);
    }

    @Test
    void save_rejectsDuplicateStudentCoursePair() {
        underTest.saveAndFlush(Enrollment.createNew(1L, 2L));

        assertThatThrownBy(() -> underTest.saveAndFlush(Enrollment.createNew(1L, 2L)))
                .isInstanceOf(DataIntegrityViolationException.class);
    }
}
