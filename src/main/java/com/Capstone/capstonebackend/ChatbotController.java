package com.Capstone.capstonebackend;

import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@RestController
@RequestMapping("/api")
public class ChatbotController {

    private final RestTemplate restTemplate = new RestTemplate();

    @PostMapping("/chat")
    public ResponseEntity<Map<String, String>> chat(@RequestBody Map<String, String> request) {
        String userMessage = request.get("message").toLowerCase();

        String response = generateResponse(userMessage);

        Map<String, String> result = new HashMap<>();
        result.put("response", response);
        return ResponseEntity.ok(result);
    }

    private String generateResponse(String message) {
        if (message.contains("create") && (message.contains("session") || message.contains("study"))) {
            return "To create a study session, go to the 'Create New Post' page and fill out the form with your session details like subject, date, time, and location.";
        } else if (message.contains("find") && (message.contains("session") || message.contains("study"))) {
            return "You can find study sessions by browsing the 'Browse Sessions' page or checking your dashboard for available groups.";
        } else if (message.contains("help") || message.contains("admin") || message.contains("contact")) {
            return "For additional help, contact our admin at: Email: admin@studyover.com, Phone: (123) 456-7890.";
        } else if (message.contains("welcome") || message.contains("hi") || message.contains("hello")) {
            return "Hello! I'm here to help with StudyOver. You can ask about creating or finding study sessions, or get admin contact info.";
        } else {
            return "I'm sorry, I can only help with StudyOver-related topics like creating or finding study sessions, or providing admin contact information.";
        }
    }
}