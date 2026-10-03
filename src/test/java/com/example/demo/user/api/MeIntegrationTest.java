package com.example.demo.user.api;

import com.example.demo.security.TestAppUserFactory;
import com.example.demo.user.domain.Role;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

import static com.example.demo.security.TestAppUserFactory.ADMIN_PASSWORD;
import static com.example.demo.security.TestAppUserFactory.ADMIN_USERNAME;
import static com.example.demo.security.TestAppUserFactory.USER_PASSWORD;
import static com.example.demo.security.TestAppUserFactory.USER_USERNAME;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.httpBasic;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class MeIntegrationTest {

    private static final String ME_URI = "/" + MeApiPaths.BASE;

    private static final RequestPostProcessor ADMIN_AUTH = httpBasic(ADMIN_USERNAME, ADMIN_PASSWORD);
    private static final RequestPostProcessor USER_AUTH = httpBasic(USER_USERNAME, USER_PASSWORD);

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private TestAppUserFactory testAppUserFactory;

    @BeforeEach
    void setUp() {
        testAppUserFactory.ensureAdminUser();
        testAppUserFactory.ensureRegularUser();
    }

    @Test
    void getCurrentUser_returnsUnauthorizedWithoutCredentials() throws Exception {
        mockMvc.perform(get(ME_URI))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void getCurrentUser_returnsAdminIdentity() throws Exception {
        mockMvc.perform(get(ME_URI).with(ADMIN_AUTH))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value(ADMIN_USERNAME))
                .andExpect(jsonPath("$.role").value(Role.ADMIN.name()));
    }

    @Test
    void getCurrentUser_returnsUserIdentity() throws Exception {
        mockMvc.perform(get(ME_URI).with(USER_AUTH))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value(USER_USERNAME))
                .andExpect(jsonPath("$.role").value(Role.USER.name()));
    }
}
