package com.Capstone.capstonebackend;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
public class HomeController {

    private final AppstateAuthProvider authProvider;

    public HomeController(AppstateAuthProvider authProvider) {
        this.authProvider = authProvider;
    }

    // landing page
    @GetMapping("/")
    public String index() {
        return "redirect:/SO_SignOnPage.html";
    }

    @PostMapping("/login")
    public String login(
            @RequestParam String username,
            @RequestParam String password) {
        if (password == null || password.isBlank()) {
            return "redirect:/SO_SignOnPage.html?error=missing";
        }

        if (!authProvider.isValidAppStateUser(username)) {
            return "redirect:/SO_SignOnPage.html?error=domain";
        }

        return "redirect:/StudyOverDashBoard.html";
    }

    @GetMapping("/join-session")
    public String joinSession() {
        return "redirect:/SO_RSVPConfrimation.html";
    }

    /*
     * @PostMapping("/login")
     * public String login(
     * 
     * @RequestParam String username,
     * 
     * @RequestParam String password,
     * HttpSession session
     * ) {
     * 
     * if (!username.toLowerCase().endsWith("@appstate.edu")) {
     * return "redirect:/SO_SignOnPage.html?error=true";
     * }
     * 
     * // Store email in session
     * session.setAttribute("userEmail", username);
     * 
     * return "redirect:/StudyOverDashBoard.html";
     * }
     * 
     * 
     * 
     * 
     */

}
