package com.example.demo.integration;

import com.example.demo.course.api.CourseApiPaths;
import com.example.demo.course.api.CourseRequest;
import com.example.demo.course.domain.Course;
import com.example.demo.course.persistence.CourseRepository;
import com.example.demo.security.TestAppUserFactory;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class CourseIntegrationTest {

    private static final String COURSES_URI = "/" + CourseApiPaths.BASE;
    private static final String COURSE_BY_ID_URI = COURSES_URI + "/{id}";

    private static final RequestPostProcessor BASIC_AUTH = httpBasic(TEST_USERNAME, TEST_PASSWORD);

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private TestAppUserFactory testAppUserFactory;

    @BeforeEach
    void setUp() {
        courseRepository.deleteAllInBatch();
        testAppUserFactory.ensureTestUser();
    }

    @Test
    void getAllCourses_returnsEmptyListInitially() throws Exception {
        mockMvc.perform(get(COURSES_URI).with(BASIC_AUTH))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    void addCourse_createsCourse() throws Exception {
        CourseRequest payload = new CourseRequest("Algorithms", "Intro", 30);

        mockMvc.perform(post(COURSES_URI)
                        .with(BASIC_AUTH)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isCreated());

        assertThat(courseRepository.findAll()).hasSize(1);

        mockMvc.perform(get(COURSES_URI).with(BASIC_AUTH))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].id").isNumber())
                .andExpect(jsonPath("$[0].title").value("Algorithms"))
                .andExpect(jsonPath("$[0].description").value("Intro"))
                .andExpect(jsonPath("$[0].capacity").value(30));
    }

    @Test
    void addCourse_rejectsBlankTitle() throws Exception {
        String invalidJson = """
                {"title":"","description":"Intro","capacity":30}
                """;

        mockMvc.perform(post(COURSES_URI)
                        .with(BASIC_AUTH)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidJson))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_FAILED"));
    }

    @Test
    void addCourse_rejectsNonPositiveCapacity() throws Exception {
        CourseRequest payload = new CourseRequest("Algorithms", "Intro", 0);

        mockMvc.perform(post(COURSES_URI)
                        .with(BASIC_AUTH)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_FAILED"));
    }

    @Test
    void updateCourse_updatesExistingCourse() throws Exception {
        Course saved = courseRepository.save(Course.createNew("Old", "Desc", 10));
        CourseRequest payload = new CourseRequest("New", "Updated", 25);

        mockMvc.perform(put(COURSE_BY_ID_URI, saved.getId())
                        .with(BASIC_AUTH)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isNoContent());

        Course updated = courseRepository.findById(saved.getId()).orElseThrow();
        assertThat(updated.getTitle()).isEqualTo("New");
        assertThat(updated.getDescription()).isEqualTo("Updated");
        assertThat(updated.getCapacity()).isEqualTo(25);
    }

    @Test
    void updateCourse_returnsNotFoundWhenMissing() throws Exception {
        CourseRequest payload = new CourseRequest("Ghost", null, 5);

        mockMvc.perform(put(COURSE_BY_ID_URI, 12345L)
                        .with(BASIC_AUTH)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("COURSE_NOT_FOUND"));
    }

    @Test
    void deleteCourse_removesExistingCourse() throws Exception {
        Course saved = courseRepository.save(Course.createNew("Temp", null, 5));

        mockMvc.perform(delete(COURSE_BY_ID_URI, saved.getId()).with(BASIC_AUTH))
                .andExpect(status().isNoContent());

        assertThat(courseRepository.existsById(saved.getId())).isFalse();
    }

    @Test
    void deleteCourse_returnsNotFoundWhenMissing() throws Exception {
        mockMvc.perform(delete(COURSE_BY_ID_URI, 12345L).with(BASIC_AUTH))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("COURSE_NOT_FOUND"))
                .andExpect(jsonPath("$.message").value("Course with id 12345 does not exists"));
    }
}
