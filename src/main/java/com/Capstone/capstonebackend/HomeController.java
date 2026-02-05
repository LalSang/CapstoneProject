package com.Capstone.capstonebackend;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

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
            @RequestParam String password,
            Model model) {
        if (!authProvider.isValidAppStateUser(username)) {
            model.addAttribute("error", "Only @appstate.edu emails are allowed");
            return "redirect:/SO_SignOnPage.html?error=true";
        }

        return "redirect:/StudyOverDashBoard.html";
    }

}
