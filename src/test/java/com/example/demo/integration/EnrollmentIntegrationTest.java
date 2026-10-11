package com.example.demo.integration;

import com.example.demo.course.domain.Course;
import com.example.demo.course.persistence.CourseRepository;
import com.example.demo.enrollment.api.EnrollmentApiPaths;
import com.example.demo.enrollment.api.EnrollmentRequest;
import com.example.demo.enrollment.domain.Enrollment;
import com.example.demo.enrollment.persistence.EnrollmentRepository;
import com.example.demo.security.TestAppUserFactory;
import com.example.demo.student.domain.Gender;
import com.example.demo.student.domain.Student;
import com.example.demo.student.persistence.StudentRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

import static com.example.demo.security.TestAppUserFactory.TEST_PASSWORD;
import static com.example.demo.security.TestAppUserFactory.TEST_USERNAME;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.httpBasic;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class EnrollmentIntegrationTest {

    private static final String ENROLLMENTS_URI = "/" + EnrollmentApiPaths.BASE;
    private static final String ENROLLMENT_BY_ID_URI = ENROLLMENTS_URI + "/{id}";

    private static final RequestPostProcessor BASIC_AUTH = httpBasic(TEST_USERNAME, TEST_PASSWORD);

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private TestAppUserFactory testAppUserFactory;

    private Student student;
    private Course course;

    @BeforeEach
    void setUp() {
        enrollmentRepository.deleteAllInBatch();
        studentRepository.deleteAllInBatch();
        courseRepository.deleteAllInBatch();
        testAppUserFactory.ensureTestUser();
        student = studentRepository.save(Student.createNew("Ada", "ada-enroll@example.com", Gender.FEMALE));
        course = courseRepository.save(Course.createNew("Algorithms", "Intro", 2));
    }

    @Test
    void getAllEnrollments_returnsEmptyListInitially() throws Exception {
        mockMvc.perform(get(ENROLLMENTS_URI).with(BASIC_AUTH))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    void enroll_createsEnrollmentAndListsIt() throws Exception {
        EnrollmentRequest payload = new EnrollmentRequest(student.getId(), course.getId());

        mockMvc.perform(post(ENROLLMENTS_URI)
                        .with(BASIC_AUTH)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isCreated());

        assertThat(enrollmentRepository.findAll()).hasSize(1);

        mockMvc.perform(get(ENROLLMENTS_URI).with(BASIC_AUTH))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].studentId").value(student.getId().intValue()))
                .andExpect(jsonPath("$[0].courseId").value(course.getId().intValue()))
                .andExpect(jsonPath("$[0].enrolledAt").isNotEmpty());
    }

    @Test
    void enroll_rejectsDuplicatePair() throws Exception {
        enrollmentRepository.save(Enrollment.createNew(student.getId(), course.getId()));
        EnrollmentRequest payload = new EnrollmentRequest(student.getId(), course.getId());

        mockMvc.perform(post(ENROLLMENTS_URI)
                        .with(BASIC_AUTH)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("DUPLICATE_ENROLLMENT"));
    }

    @Test
    void enroll_rejectsMissingStudent() throws Exception {
        EnrollmentRequest payload = new EnrollmentRequest(99999L, course.getId());

        mockMvc.perform(post(ENROLLMENTS_URI)
                        .with(BASIC_AUTH)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("STUDENT_NOT_FOUND"))
                .andExpect(jsonPath("$.message").value("Student with id 99999 does not exist"));
    }

    @Test
    void enroll_rejectsMissingCourse() throws Exception {
        EnrollmentRequest payload = new EnrollmentRequest(student.getId(), 99999L);

        mockMvc.perform(post(ENROLLMENTS_URI)
                        .with(BASIC_AUTH)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("COURSE_NOT_FOUND"))
                .andExpect(jsonPath("$.message").value("Course with id 99999 does not exist"));
    }

    @Test
    void enroll_rejectsWhenCourseIsFull() throws Exception {
        Course tiny = courseRepository.save(Course.createNew("Solo", null, 1));
        Student other = studentRepository.save(Student.createNew("Bob", "bob-enroll@example.com", Gender.MALE));
        enrollmentRepository.save(Enrollment.createNew(other.getId(), tiny.getId()));

        EnrollmentRequest payload = new EnrollmentRequest(student.getId(), tiny.getId());

        mockMvc.perform(post(ENROLLMENTS_URI)
                        .with(BASIC_AUTH)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("COURSE_FULL"))
                .andExpect(jsonPath("$.message").value("Course " + tiny.getId() + " is full"));
    }

    @Test
    void enroll_rejectsNullIds() throws Exception {
        mockMvc.perform(post(ENROLLMENTS_URI)
                        .with(BASIC_AUTH)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"studentId\":null,\"courseId\":null}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_FAILED"));
    }

    @Test
    void deleteEnrollment_removesRow() throws Exception {
        Enrollment saved = enrollmentRepository.save(
                Enrollment.createNew(student.getId(), course.getId()));

        mockMvc.perform(delete(ENROLLMENT_BY_ID_URI, saved.getId()).with(BASIC_AUTH))
                .andExpect(status().isNoContent());

        assertThat(enrollmentRepository.existsById(saved.getId())).isFalse();
    }

    @Test
    void deleteEnrollment_returnsNotFoundWhenMissing() throws Exception {
        mockMvc.perform(delete(ENROLLMENT_BY_ID_URI, 12345L).with(BASIC_AUTH))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("ENROLLMENT_NOT_FOUND"))
                .andExpect(jsonPath("$.message").value("Enrollment with id 12345 does not exist"));
    }
}
