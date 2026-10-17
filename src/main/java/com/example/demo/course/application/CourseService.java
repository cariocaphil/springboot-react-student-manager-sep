package com.example.demo.course.application;

import com.example.demo.course.domain.Course;
import com.example.demo.course.exception.CourseCapacityBelowEnrollmentCountException;
import com.example.demo.course.exception.CourseNotFoundException;
import com.example.demo.course.persistence.CourseRepository;
import com.example.demo.enrollment.persistence.EnrollmentRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@AllArgsConstructor
@Service
@Transactional(readOnly = true)
public class CourseService {

    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;

    public List<Course> getAllCourses() {
        return courseRepository.findAll();
    }

    @Transactional
    public void addCourse(Course course) {
        courseRepository.save(course);
    }

    /**
     * Locks the course row ({@code findByIdForUpdate}) before reading enrollment count so updates
     * serialize with {@code EnrollmentService.enroll} on the same lock and cannot set capacity
     * below seats already taken.
     */
    @Transactional
    public void updateCourse(Long courseId, String title, String description, Integer capacity) {
        Course course = courseRepository.findByIdForUpdate(courseId)
                .orElseThrow(() -> new CourseNotFoundException(
                        "Course with id " + courseId + " does not exist"));

        long enrollmentCount = enrollmentRepository.countByCourseId(courseId);
        if (capacity < enrollmentCount) {
            throw new CourseCapacityBelowEnrollmentCountException(courseId, capacity, enrollmentCount);
        }

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
