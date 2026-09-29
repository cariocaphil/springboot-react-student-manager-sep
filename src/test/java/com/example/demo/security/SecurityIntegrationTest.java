package com.example.demo.security;

import com.example.demo.student.api.StudentApiPaths;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.httpBasic;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class SecurityIntegrationTest {

    private static final String STUDENTS_URI = "/" + StudentApiPaths.BASE;

    /** Matches spring.security.user.* in src/test/resources/application.properties */
    private static final String TEST_USER = "test";
    private static final String TEST_PASSWORD = "test";

    @Autowired
    private MockMvc mockMvc;

    @Test
    void protectedStudentEndpoint_returnsUnauthorizedWithoutCredentials() throws Exception {
        mockMvc.perform(get(STUDENTS_URI))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void protectedStudentEndpoint_allowsAccessWithBasicAuth() throws Exception {
        mockMvc.perform(get(STUDENTS_URI).with(httpBasic(TEST_USER, TEST_PASSWORD)))
                .andExpect(status().isOk());
    }

    @Test
    void openApiDocs_remainPublicWithoutAuthentication() throws Exception {
        mockMvc.perform(get("/v3/api-docs"))
                .andExpect(status().isOk());
    }
}
