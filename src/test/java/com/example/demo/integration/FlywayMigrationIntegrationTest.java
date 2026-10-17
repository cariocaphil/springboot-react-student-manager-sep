package com.example.demo.integration;

import com.example.demo.course.domain.Course;
import com.example.demo.course.persistence.CourseRepository;
import com.example.demo.enrollment.domain.Enrollment;
import com.example.demo.enrollment.persistence.EnrollmentRepository;
import com.example.demo.student.domain.Gender;
import com.example.demo.student.domain.Student;
import com.example.demo.student.persistence.StudentRepository;
import com.example.demo.user.domain.AppUser;
import com.example.demo.user.domain.Role;
import com.example.demo.user.persistence.AppUserRepository;
import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.jdbc.core.JdbcTemplate;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
class FlywayMigrationIntegrationTest {

    @Autowired
    private Flyway flyway;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Autowired
    private AppUserRepository appUserRepository;

    @BeforeEach
    void cleanData() {
        enrollmentRepository.deleteAllInBatch();
        studentRepository.deleteAllInBatch();
        courseRepository.deleteAllInBatch();
    }

    @Test
    void migrate_isIdempotentAndRecordsVersionOne() {
        var before = flyway.info().applied();
        assertThat(before).isNotEmpty();
        assertThat(before[before.length - 1].getVersion().getVersion()).isEqualTo("1");

        int migrations = flyway.migrate().migrationsExecuted;

        assertThat(migrations).isZero();
        var after = flyway.info().applied();
        assertThat(after).hasSize(before.length);
        assertThat(after[after.length - 1].getVersion().getVersion()).isEqualTo("1");
    }

    @Test
    void schema_hasExpectedSequencesAndPersistingUsesThem() {
        assertThat(sequenceExists("student_sequence")).isTrue();
        assertThat(sequenceExists("course_sequence")).isTrue();
        assertThat(sequenceExists("enrollment_sequence")).isTrue();
        assertThat(sequenceExists("app_user_sequence")).isTrue();

        Student student = studentRepository.save(
                Student.createNew("SeqStudent", "seq-student@example.com", Gender.FEMALE));
        assertThat(student.getId()).isEqualTo(currval("student_sequence"));

        Course course = courseRepository.save(Course.createNew("SeqCourse", null, 5));
        assertThat(course.getId()).isEqualTo(currval("course_sequence"));

        Enrollment enrollment = enrollmentRepository.save(
                Enrollment.createNew(student.getId(), course.getId()));
        assertThat(enrollment.getId()).isEqualTo(currval("enrollment_sequence"));

        String username = "seq-user-" + UUID.randomUUID();
        AppUser user = appUserRepository.save(AppUser.createNew(username, "{noop}x", Role.USER));
        assertThat(user.getId()).isEqualTo(currval("app_user_sequence"));
    }

    @Test
    void uniqueConstraints_rejectDuplicates() {
        assertThat(constraintExists("uk_enrollment_student_course")).isTrue();
        assertThat(constraintExists("ukfe0i52si7ybu0wjedj6motiim")).isTrue();
        assertThat(constraintExists("uk3k4cplvh82srueuttfkwnylq0")).isTrue();

        long studentId = nextval("student_sequence");
        jdbcTemplate.update(
                "INSERT INTO student (id, name, email, gender) VALUES (?, ?, ?, ?)",
                studentId, "A", "unique-email@example.com", "MALE");
        assertThatThrownBy(() -> jdbcTemplate.update(
                "INSERT INTO student (id, name, email, gender) VALUES (?, ?, ?, ?)",
                nextval("student_sequence"), "B", "unique-email@example.com", "FEMALE"))
                .isInstanceOf(DataIntegrityViolationException.class);

        String username = "unique-user-" + UUID.randomUUID();
        jdbcTemplate.update(
                "INSERT INTO app_user (id, username, password_hash, role) VALUES (?, ?, ?, ?)",
                nextval("app_user_sequence"), username, "{noop}x", "USER");
        assertThatThrownBy(() -> jdbcTemplate.update(
                "INSERT INTO app_user (id, username, password_hash, role) VALUES (?, ?, ?, ?)",
                nextval("app_user_sequence"), username, "{noop}y", "ADMIN"))
                .isInstanceOf(DataIntegrityViolationException.class);

        long courseId = nextval("course_sequence");
        jdbcTemplate.update(
                "INSERT INTO course (id, title, description, capacity) VALUES (?, ?, ?, ?)",
                courseId, "EnrollCourse", null, 10);
        jdbcTemplate.update(
                "INSERT INTO enrollment (id, student_id, course_id, enrolled_at) VALUES (?, ?, ?, NOW())",
                nextval("enrollment_sequence"), studentId, courseId);
        assertThatThrownBy(() -> jdbcTemplate.update(
                "INSERT INTO enrollment (id, student_id, course_id, enrolled_at) VALUES (?, ?, ?, NOW())",
                nextval("enrollment_sequence"), studentId, courseId))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    private long nextval(String sequenceName) {
        Long value = jdbcTemplate.queryForObject(
                "SELECT nextval(?)",
                Long.class,
                sequenceName);
        return value == null ? 0L : value;
    }

    private boolean sequenceExists(String sequenceName) {
        Boolean exists = jdbcTemplate.queryForObject(
                """
                SELECT EXISTS (
                    SELECT 1 FROM pg_class c
                    JOIN pg_namespace n ON n.oid = c.relnamespace
                    WHERE c.relkind = 'S' AND n.nspname = 'public' AND c.relname = ?
                )
                """,
                Boolean.class,
                sequenceName);
        return Boolean.TRUE.equals(exists);
    }

    private long currval(String sequenceName) {
        Long value = jdbcTemplate.queryForObject(
                "SELECT currval(?)",
                Long.class,
                sequenceName);
        return value == null ? 0L : value;
    }

    private boolean constraintExists(String constraintName) {
        Boolean exists = jdbcTemplate.queryForObject(
                """
                SELECT EXISTS (
                    SELECT 1 FROM pg_constraint
                    WHERE conname = ?
                )
                """,
                Boolean.class,
                constraintName);
        return Boolean.TRUE.equals(exists);
    }
}
