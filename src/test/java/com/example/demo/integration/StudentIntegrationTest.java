package com.example.demo.integration;

import com.example.demo.student.Gender;
import com.example.demo.student.Student;
import com.example.demo.student.StudentRepository;
import com.example.demo.student.StudentRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class StudentIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private StudentRepository studentRepository;

    @BeforeEach
    void cleanDatabase() {
        studentRepository.deleteAll();
    }

    @Test
    void getAllStudents_returnsEmptyListInitially() throws Exception {
        mockMvc.perform(get("/api/v1/students"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    void addStudent_createsStudent() throws Exception {
        StudentRequest payload = new StudentRequest("Jamila", "jamila@example.com", Gender.FEMALE);

        mockMvc.perform(post("/api/v1/students")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isOk());

        assertThat(studentRepository.selectExistsEmail("jamila@example.com")).isTrue();

        mockMvc.perform(get("/api/v1/students"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].id").isNumber())
                .andExpect(jsonPath("$[0].name").value("Jamila"))
                .andExpect(jsonPath("$[0].email").value("jamila@example.com"))
                .andExpect(jsonPath("$[0].gender").value("FEMALE"));
    }

    @Test
    void addStudent_rejectsDuplicateEmail() throws Exception {
        studentRepository.save(new Student(null, "Jamila", "jamila@example.com", Gender.FEMALE));
        StudentRequest duplicate = new StudentRequest("Other", "jamila@example.com", Gender.OTHER);

        mockMvc.perform(post("/api/v1/students")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(duplicate)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.error").value("Bad Request"))
                .andExpect(jsonPath("$.message").value("Email jamila@example.com taken"));
    }

    @Test
    void addStudent_rejectsInvalidPayload() throws Exception {
        String invalidJson = """
                {"name":"","email":"not-an-email","gender":null}
                """;

        mockMvc.perform(post("/api/v1/students")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidJson))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.error").value("Bad Request"))
                .andExpect(jsonPath("$.message").isNotEmpty());
    }

    @Test
    void deleteStudent_removesExistingStudent() throws Exception {
        Student saved = studentRepository.save(
                new Student(null, "Alex", "alex@example.com", Gender.MALE));

        mockMvc.perform(delete("/api/v1/students/{id}", saved.getId()))
                .andExpect(status().isOk());

        assertThat(studentRepository.existsById(saved.getId())).isFalse();
    }

    @Test
    void deleteStudent_returnsNotFoundWhenMissing() throws Exception {
        mockMvc.perform(delete("/api/v1/students/{id}", 12345L))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.error").value("Not Found"))
                .andExpect(jsonPath("$.message").value("Student with id 12345 does not exists"));
    }
}