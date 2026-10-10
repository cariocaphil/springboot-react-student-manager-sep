package com.example.demo.course.domain;

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

@ToString
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table
public class Course {

    @Id
    @SequenceGenerator(
            name = "course_sequence",
            sequenceName = "course_sequence",
            allocationSize = 1
    )
    @GeneratedValue(
            generator = "course_sequence",
            strategy = GenerationType.SEQUENCE
    )
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column
    private String description;

    @Column(nullable = false)
    private Integer capacity;

    public Course(Long id, String title, String description, Integer capacity) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.capacity = capacity;
    }

    /** New course before persistence; id is assigned by the database. */
    public static Course createNew(String title, String description, Integer capacity) {
        return new Course(null, title, description, capacity);
    }
}
