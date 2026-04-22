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
        assertThat(created.getParticipantCount()).isZero();
    }

    @Test
    void sessionOwnerCannotJoinOwnSession() {
        CreateStudySessionRequest request = new CreateStudySessionRequest();
        request.setUserName("owner@appstate.edu");
        request.setTopic("computer-science");
        request.setCourseCode("CS 2440");
        request.setSessionDate("2026-04-16");
        request.setSessionTime("19:00");
        request.setSessionLocation("belk-library");
        request.setMaxParticipants("4");

        MockHttpSession ownerSession = new MockHttpSession();
        ownerSession.setAttribute("userEmail", "owner@appstate.edu");

        var createResponse = homeController.createSession(request, ownerSession);
        StudySession created = (StudySession) createResponse.getBody();

        var joinResponse = homeController.joinSession(created.getId(), ownerSession);

        assertThat(joinResponse.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
        assertThat(joinResponse.getBody()).isEqualTo(java.util.Map.of("error", "You cannot join your own session."));
    }

    @Test
    void joiningSessionTracksParticipantCountUntilCapacity() {
        CreateStudySessionRequest request = new CreateStudySessionRequest();
        request.setUserName("host@appstate.edu");
        request.setTopic("mathematics");
        request.setCourseCode("MATH 1110");
        request.setSessionDate("2026-04-17");
        request.setSessionTime("17:00");
        request.setSessionLocation("walker-hall");
        request.setMaxParticipants("4");

        MockHttpSession ownerSession = new MockHttpSession();
        ownerSession.setAttribute("userEmail", "host@appstate.edu");

        var createResponse = homeController.createSession(request, ownerSession);
        StudySession created = (StudySession) createResponse.getBody();

        MockHttpSession firstJoiner = new MockHttpSession();
        firstJoiner.setAttribute("userEmail", "joiner-one@appstate.edu");
        var firstJoinResponse = homeController.joinSession(created.getId(), firstJoiner);

        MockHttpSession secondJoiner = new MockHttpSession();
        secondJoiner.setAttribute("userEmail", "joiner-two@appstate.edu");
        var secondJoinResponse = homeController.joinSession(created.getId(), secondJoiner);

        MockHttpSession thirdJoiner = new MockHttpSession();
        thirdJoiner.setAttribute("userEmail", "joiner-three@appstate.edu");
        var thirdJoinResponse = homeController.joinSession(created.getId(), thirdJoiner);

        MockHttpSession fourthJoiner = new MockHttpSession();
        fourthJoiner.setAttribute("userEmail", "joiner-four@appstate.edu");
        var fourthJoinResponse = homeController.joinSession(created.getId(), fourthJoiner);

        assertThat(firstJoinResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(secondJoinResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(thirdJoinResponse.getStatusCode()).isEqualTo(HttpStatus.OK);

        StudySession joinedSession = (StudySession) thirdJoinResponse.getBody();
        assertThat(joinedSession).isNotNull();
        assertThat(joinedSession.getParticipantCount()).isEqualTo(3);
        assertThat(joinedSession.getMaxParticipants()).isEqualTo("4");

        assertThat(fourthJoinResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        StudySession fullSession = (StudySession) fourthJoinResponse.getBody();
        assertThat(fullSession).isNotNull();
        assertThat(fullSession.getParticipantCount()).isEqualTo(4);

        MockHttpSession overflowJoiner = new MockHttpSession();
        overflowJoiner.setAttribute("userEmail", "joiner-five@appstate.edu");
        var overflowJoinResponse = homeController.joinSession(created.getId(), overflowJoiner);

        assertThat(overflowJoinResponse.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
        assertThat(overflowJoinResponse.getBody()).isEqualTo(java.util.Map.of("error", "This session is already full."));
    }

    @Test
    void sameUserCannotJoinTheSameSessionTwice() {
        CreateStudySessionRequest request = new CreateStudySessionRequest();
        request.setUserName("repeat-host@appstate.edu");
        request.setTopic("history");
        request.setCourseCode("HIS 1010");
        request.setSessionDate("2026-04-18");
        request.setSessionTime("16:00");
        request.setSessionLocation("anne-belk-hall");
        request.setMaxParticipants("4");

        MockHttpSession ownerSession = new MockHttpSession();
        ownerSession.setAttribute("userEmail", "repeat-host@appstate.edu");

        var createResponse = homeController.createSession(request, ownerSession);
        StudySession created = (StudySession) createResponse.getBody();

        MockHttpSession joinerSession = new MockHttpSession();
        joinerSession.setAttribute("userEmail", "repeat-joiner@appstate.edu");

        var firstJoinResponse = homeController.joinSession(created.getId(), joinerSession);
        var secondJoinResponse = homeController.joinSession(created.getId(), joinerSession);

        assertThat(firstJoinResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(secondJoinResponse.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
        assertThat(secondJoinResponse.getBody()).isEqualTo(java.util.Map.of("error", "You have already joined this session."));
    }
}
