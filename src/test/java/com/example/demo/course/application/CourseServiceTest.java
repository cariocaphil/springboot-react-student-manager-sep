package com.example.demo.course.application;

import com.example.demo.course.domain.Course;
import com.example.demo.course.exception.CourseNotFoundException;
import com.example.demo.course.persistence.CourseRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class CourseServiceTest {

    @Mock
    private CourseRepository courseRepository;

    private CourseService underTest;

    @BeforeEach
    void setUp() {
        underTest = new CourseService(courseRepository);
    }

    @Test
    void getAllCourses_returnsRepositoryResult() {
        Course course = new Course(1L, "Algorithms", "Intro", 30);
        given(courseRepository.findAll()).willReturn(List.of(course));

        List<Course> actual = underTest.getAllCourses();

        assertThat(actual).containsExactly(course);
        verify(courseRepository).findAll();
    }

    @Test
    void addCourse_savesCourse() {
        Course course = Course.createNew("Algorithms", "Intro", 30);

        underTest.addCourse(course);

        ArgumentCaptor<Course> captor = ArgumentCaptor.forClass(Course.class);
        verify(courseRepository).save(captor.capture());
        Course saved = captor.getValue();
        assertThat(saved.getTitle()).isEqualTo("Algorithms");
        assertThat(saved.getDescription()).isEqualTo("Intro");
        assertThat(saved.getCapacity()).isEqualTo(30);
    }

    @Test
    void updateCourse_updatesWhenCourseExists() {
        long id = 42L;
        Course existing = new Course(id, "Old", "Desc", 10);
        given(courseRepository.findById(id)).willReturn(Optional.of(existing));

        underTest.updateCourse(id, "New", "Updated", 20);

        assertThat(existing.getTitle()).isEqualTo("New");
        assertThat(existing.getDescription()).isEqualTo("Updated");
        assertThat(existing.getCapacity()).isEqualTo(20);
        verify(courseRepository).save(existing);
    }

    @Test
    void updateCourse_throwsWhenCourseMissing() {
        long id = 99L;
        given(courseRepository.findById(id)).willReturn(Optional.empty());

        assertThatThrownBy(() -> underTest.updateCourse(id, "A", "B", 5))
                .isInstanceOf(CourseNotFoundException.class)
                .hasMessageContaining(String.valueOf(id));

        verify(courseRepository, never()).save(any());
    }

    @Test
    void deleteCourse_deletesWhenCourseExists() {
        long id = 42L;
        given(courseRepository.existsById(id)).willReturn(true);

        underTest.deleteCourse(id);

        verify(courseRepository).deleteById(id);
    }

    @Test
    void deleteCourse_throwsWhenCourseMissing() {
        long id = 99L;
        given(courseRepository.existsById(id)).willReturn(false);

        assertThatThrownBy(() -> underTest.deleteCourse(id))
                .isInstanceOf(CourseNotFoundException.class)
                .hasMessageContaining(String.valueOf(id));

        verify(courseRepository, never()).deleteById(any());
    }
}
