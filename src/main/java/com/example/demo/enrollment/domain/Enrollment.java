package com.example.demo.enrollment.domain;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.Instant;

@ToString
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(uniqueConstraints = @UniqueConstraint(
        name = "uk_enrollment_student_course",
        columnNames = {"student_id", "course_id"}))
public class Enrollment {

    @Id
    @SequenceGenerator(
            name = "enrollment_sequence",
            sequenceName = "enrollment_sequence",
            allocationSize = 1
    )
    @GeneratedValue(
            generator = "enrollment_sequence",
            strategy = GenerationType.SEQUENCE
    )
    private Long id;

    @Column(name = "student_id", nullable = false)
    private Long studentId;

    @Column(name = "course_id", nullable = false)
    private Long courseId;

    @Column(nullable = false)
    private Instant enrolledAt;

    public Enrollment(Long id, Long studentId, Long courseId, Instant enrolledAt) {
        this.id = id;
        this.studentId = studentId;
        this.courseId = courseId;
        this.enrolledAt = enrolledAt;
    }

    /** New enrollment before persistence; id is assigned by the database. */
    public static Enrollment createNew(Long studentId, Long courseId) {
        return new Enrollment(null, studentId, courseId, Instant.now());
    }
}
