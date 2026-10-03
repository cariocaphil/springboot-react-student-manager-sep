package com.example.demo.security;

import com.example.demo.student.api.StudentApiPaths;
import com.example.demo.student.api.StudentRequest;
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

import static com.example.demo.security.TestAppUserFactory.ADMIN_PASSWORD;
import static com.example.demo.security.TestAppUserFactory.ADMIN_USERNAME;
import static com.example.demo.security.TestAppUserFactory.USER_PASSWORD;
import static com.example.demo.security.TestAppUserFactory.USER_USERNAME;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.httpBasic;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class AuthorizationIntegrationTest {

    private static final String STUDENTS_URI = "/" + StudentApiPaths.BASE;
    private static final String STUDENT_BY_ID_URI = STUDENTS_URI + "/{id}";

    private static final RequestPostProcessor ADMIN_AUTH = httpBasic(ADMIN_USERNAME, ADMIN_PASSWORD);
    private static final RequestPostProcessor USER_AUTH = httpBasic(USER_USERNAME, USER_PASSWORD);

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private TestAppUserFactory testAppUserFactory;

    @BeforeEach
    void setUp() {
        studentRepository.deleteAllInBatch();
        testAppUserFactory.ensureAdminUser();
        testAppUserFactory.ensureRegularUser();
    }

    @Test
    void unauthenticated_get_returnsUnauthorized() throws Exception {
        mockMvc.perform(get(STUDENTS_URI))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void user_canReadStudents() throws Exception {
        mockMvc.perform(get(STUDENTS_URI).with(USER_AUTH))
                .andExpect(status().isOk());
    }

    @Test
    void user_cannotCreateStudent() throws Exception {
        StudentRequest payload = new StudentRequest("Nora", "nora@example.com", Gender.FEMALE);

        mockMvc.perform(post(STUDENTS_URI)
                        .with(USER_AUTH)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isForbidden());
    }

    @Test
    void user_cannotDeleteStudent() throws Exception {
        Student saved = studentRepository.save(
                Student.createNew("Alex", "alex-user@example.com", Gender.MALE));

        mockMvc.perform(delete(STUDENT_BY_ID_URI, saved.getId()).with(USER_AUTH))
                .andExpect(status().isForbidden());
    }

    @Test
    void admin_canReadCreateAndDeleteStudent() throws Exception {
        mockMvc.perform(get(STUDENTS_URI).with(ADMIN_AUTH))
                .andExpect(status().isOk());

        StudentRequest payload = new StudentRequest("AdminKid", "admin-kid@example.com", Gender.OTHER);
        mockMvc.perform(post(STUDENTS_URI)
                        .with(ADMIN_AUTH)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isCreated());

        Student saved = studentRepository.findAll().stream()
                .filter(s -> "admin-kid@example.com".equals(s.getEmail()))
                .findFirst()
                .orElseThrow();

        mockMvc.perform(delete(STUDENT_BY_ID_URI, saved.getId()).with(ADMIN_AUTH))
                .andExpect(status().isNoContent());
    }
}
