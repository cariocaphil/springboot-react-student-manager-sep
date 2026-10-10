package com.example.demo.course.application;

import com.example.demo.course.domain.Course;
import com.example.demo.course.exception.CourseNotFoundException;
import com.example.demo.course.persistence.CourseRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@AllArgsConstructor
@Service
@Transactional(readOnly = true)
public class CourseService {

    private final CourseRepository courseRepository;

    public List<Course> getAllCourses() {
        return courseRepository.findAll();
    }

    @Transactional
    public void addCourse(Course course) {
        courseRepository.save(course);
    }

    @Transactional
    public void updateCourse(Long courseId, String title, String description, Integer capacity) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new CourseNotFoundException(
                        "Course with id " + courseId + " does not exist"));
        course.setTitle(title);
        course.setDescription(description);
        course.setCapacity(capacity);
        courseRepository.save(course);
    }

    @Transactional
    public void deleteCourse(Long courseId) {
        if (!courseRepository.existsById(courseId)) {
            throw new CourseNotFoundException(
                    "Course with id " + courseId + " does not exist");
        }
        courseRepository.deleteById(courseId);
    }
}
