package com.Capstone.capstonebackend;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockHttpSession;

@SpringBootTest
class CapstonebackendApplicationTests {

    @Autowired
    private HomeController homeController;

    @Autowired
    private InMemoryAuthService authService;

    @Test
    void loginRedirectsToDashboardWhenStudentCredentialsMatch() {
        authService.createUser("student", "login-student@appstate.edu", "secret123");

        MockHttpSession session = new MockHttpSession();
        String redirect = homeController.login("login-student@appstate.edu", "secret123", session);

        assertThat(redirect).isEqualTo("redirect:/SO_DashBoard.html");
        assertThat(session.getAttribute("authenticated")).isEqualTo(true);
        assertThat(session.getAttribute("userEmail")).isEqualTo("login-student@appstate.edu");
        assertThat(session.getAttribute("userRole")).isEqualTo("student");
    }

    @Test
    void seededAdminCanLogIn() {
        MockHttpSession session = new MockHttpSession();
        String redirect = homeController.login(
                InMemoryAuthService.DEFAULT_ADMIN_USERNAME,
                InMemoryAuthService.DEFAULT_ADMIN_PASSWORD,
                session);

        assertThat(redirect).isEqualTo("redirect:/SO_DashBoard.html");
        assertThat(session.getAttribute("authenticated")).isEqualTo(true);
        assertThat(session.getAttribute("userEmail")).isEqualTo(InMemoryAuthService.DEFAULT_ADMIN_USERNAME);
        assertThat(session.getAttribute("userRole")).isEqualTo("admin");
    }

    @Test
    void loginRejectsUnknownCredentials() {
        MockHttpSession session = new MockHttpSession();
        String redirect = homeController.login("missing@appstate.edu", "secret123", session);

        assertThat(redirect).isEqualTo("redirect:/SO_SignOnPage.html?error=invalid");
    }

    @Test
    void signupCreatesStudentAccount() {
        String redirect = homeController.signup(
                "Taylor",
                "Boone",
                "signup-student@appstate.edu",
                "mountaineers",
                "senior",
                "2027",
                "2004-09-10",
                "female",
                "mountaineers");

        assertThat(redirect).isEqualTo("redirect:/SO_SignOnPage.html?signup=success");

        MockHttpSession session = new MockHttpSession();
        String loginRedirect = homeController.login("signup-student@appstate.edu", "mountaineers", session);
        assertThat(loginRedirect).isEqualTo("redirect:/SO_DashBoard.html");
    }

    @Test
    void signupRejectsDuplicateStudentAccount() {
        authService.createUser("student", "duplicate-student@appstate.edu", "mountaineers");

        String redirect = homeController.signup(
                "Taylor",
                "Boone",
                "duplicate-student@appstate.edu",
                "mountaineers",
                "senior",
                "2027",
                "2004-09-10",
                "female",
                "mountaineers");

        assertThat(redirect).isEqualTo("redirect:/SO_SignUpPage.html?error=exists");
    }

    @Test
    void createSessionAcceptsSimplifiedRequiredFields() {
        CreateStudySessionRequest request = new CreateStudySessionRequest();
        request.setUserName("student@appstate.edu");
        request.setTopic("computer-science");
        request.setCourseCode("CS 1440");
        request.setSessionDate("2026-04-15");
        request.setSessionTime("18:30");
        request.setSessionLocation("belk-library");
        request.setMaxParticipants("6");

        MockHttpSession session = new MockHttpSession();
        session.setAttribute("userEmail", "student@appstate.edu");

        var response = homeController.createSession(request, session);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody()).isInstanceOf(StudySession.class);

        StudySession created = (StudySession) response.getBody();
        assertThat(created.getSessionTitle()).isEqualTo("CS 1440 Study Session");
        assertThat(created.getDifficultyLevel()).isEmpty();
        assertThat(created.getSessionDescription()).isEmpty();
        assertThat(created.getMaxParticipants()).isEqualTo("6");
    }
}
