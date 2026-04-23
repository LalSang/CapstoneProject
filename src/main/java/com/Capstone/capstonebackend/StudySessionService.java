package com.Capstone.capstonebackend;

import java.util.List;
import java.util.ArrayList;
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
                clean(request.getSessionDescription()),
                List.of());

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

    public JoinSessionResult joinSession(long id, String username) {
        Optional<StudySession> existingSession = findById(id);
        if (existingSession.isEmpty()) {
            return JoinSessionResult.notFound();
        }

        StudySession session = existingSession.get();
        String normalizedUsername = clean(username).toLowerCase();
        String ownerUsername = clean(session.getOwnerUsername()).toLowerCase();

        synchronized (session) {
            if (!ownerUsername.isEmpty() && ownerUsername.equals(normalizedUsername)) {
                return JoinSessionResult.ownerBlocked();
            }

            List<String> joinedUsernames = new ArrayList<>(session.getJoinedUsernames());
            if (joinedUsernames.stream().map(value -> clean(value).toLowerCase()).anyMatch(normalizedUsername::equals)) {
                return JoinSessionResult.alreadyJoined();
            }

            int capacity = resolveCapacity(session.getMaxParticipants());
            if (capacity > 0 && joinedUsernames.size() >= capacity) {
                return JoinSessionResult.full();
            }

            joinedUsernames.add(clean(username));
            session.setJoinedUsernames(joinedUsernames);
            return JoinSessionResult.joined(session);
        }
    }

    private int resolveCapacity(String maxParticipants) {
        String cleanedValue = clean(maxParticipants);
        if (cleanedValue.isEmpty()) {
            return 0;
        }

        String[] rangeValues = cleanedValue.split("-");
        String lastValue = clean(rangeValues[rangeValues.length - 1]);
        try {
            return Integer.parseInt(lastValue);
        } catch (NumberFormatException ex) {
            return 0;
        }
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

    public static final class JoinSessionResult {
        private final StudySession session;
        private final JoinSessionStatus status;

        private JoinSessionResult(StudySession session, JoinSessionStatus status) {
            this.session = session;
            this.status = status;
        }

        public static JoinSessionResult joined(StudySession session) {
            return new JoinSessionResult(session, JoinSessionStatus.JOINED);
        }

        public static JoinSessionResult notFound() {
            return new JoinSessionResult(null, JoinSessionStatus.NOT_FOUND);
        }

        public static JoinSessionResult ownerBlocked() {
            return new JoinSessionResult(null, JoinSessionStatus.OWNER_BLOCKED);
        }

        public static JoinSessionResult alreadyJoined() {
            return new JoinSessionResult(null, JoinSessionStatus.ALREADY_JOINED);
        }

        public static JoinSessionResult full() {
            return new JoinSessionResult(null, JoinSessionStatus.FULL);
        }

        public StudySession getSession() {
            return session;
        }

        public JoinSessionStatus getStatus() {
            return status;
        }
    }

    public enum JoinSessionStatus {
        JOINED,
        NOT_FOUND,
        OWNER_BLOCKED,
        ALREADY_JOINED,
        FULL
    }
}
