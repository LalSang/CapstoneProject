package com.Capstone.capstonebackend;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.atomic.AtomicLong;
import org.springframework.stereotype.Service;

@Service
public class StudySessionService {
    private final AtomicLong idGenerator = new AtomicLong(1);
    private final CopyOnWriteArrayList<StudySession> sessions = new CopyOnWriteArrayList<>();

    public StudySession create(CreateStudySessionRequest request, String ownerUsername) {
        String courseCode = clean(request.getCourseCode());
        String topic = clean(request.getTopic());
        StudySession session = new StudySession(
                idGenerator.getAndIncrement(),
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

        sessions.add(session);
        return session;
    }

    public List<StudySession> getAll() {
        List<StudySession> copy = new ArrayList<>(sessions);
        copy.sort(Comparator.comparingLong(StudySession::getId).reversed());
        return copy;
    }

    public Optional<StudySession> findById(long id) {
        return sessions.stream().filter(session -> session.getId() == id).findFirst();
    }

    public boolean deleteById(long id) {
        return sessions.removeIf(session -> session.getId() == id);
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
