package com.Capstone.capstonebackend;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class StudySessionService {
    
    @Autowired
    private StudySessionRepository repository;

    public StudySession create(CreateStudySessionRequest request, String ownerUsername) {
        String courseCode = clean(request.getCourseCode());
        String topic = clean(request.getTopic());
        StudySession session = new StudySession(
                0, // Database will auto-generate ID
                ownerUsername,
                clean(request.getUserName()),
                topic,
                courseCode,
                resolveSessionTitle(request.getSessionTitle(), courseCode, topic),
                clean(request.getSessionDate()),
                clean(request.getSessionTime()),
                clean(request.getSessionLocation()),
                clean(request.getMaxParticipants()),
                clean(request.getDifficultyLevel()),
                clean(request.getSessionDescription()));

        return repository.save(session);
    }

    public List<StudySession> getAll() {
        return repository.findAllByOrderByIdDesc();
    }

    public Optional<StudySession> findById(long id) {
        return repository.findById(id);
    }

    public boolean deleteById(long id) {
        if (repository.existsById(id)) {
            repository.deleteById(id);
            return true;
        }
        return false;
    }

    private String resolveSessionTitle(String requestedTitle, String courseCode, String topic) {
        String cleanedTitle = clean(requestedTitle);
        if (!cleanedTitle.isEmpty()) {
            return cleanedTitle;
        }
        if (!courseCode.isEmpty()) {
            return courseCode + " Study Session";
        }
        if (!topic.isEmpty()) {
            return humanizeTopic(topic) + " Study Session";
        }
        return "Study Session";
    }

    private String clean(String value) {
        return value == null ? "" : value.trim();
    }

    private String humanizeTopic(String value) {
        String normalized = clean(value).replace('-', ' ').replace('_', ' ');
        if (normalized.isEmpty()) {
            return "";
        }

        String[] words = normalized.split("\\s+");
        StringBuilder builder = new StringBuilder();
        for (String word : words) {
            if (word.isEmpty()) {
                continue;
            }
            if (!builder.isEmpty()) {
                builder.append(' ');
            }
            builder.append(Character.toUpperCase(word.charAt(0)));
            if (word.length() > 1) {
                builder.append(word.substring(1).toLowerCase());
            }
        }
        return builder.toString();
    }
}
