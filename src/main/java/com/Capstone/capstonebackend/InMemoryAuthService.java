package com.Capstone.capstonebackend;

import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import org.springframework.stereotype.Component;

@Component
public class InMemoryAuthService {

    public static final String DEFAULT_ADMIN_USERNAME = "admin";
    public static final String DEFAULT_ADMIN_PASSWORD = "admin";
    public static final String DEFAULT_STUDENT_USERNAME = "student";
    public static final String DEFAULT_STUDENT_PASSWORD = "student";

    private final ConcurrentMap<String, UserAccount> accounts = new ConcurrentHashMap<>();

    public InMemoryAuthService() {
        seedAccount("admin", DEFAULT_ADMIN_USERNAME, DEFAULT_ADMIN_PASSWORD);
        seedAccount("student", DEFAULT_STUDENT_USERNAME, DEFAULT_STUDENT_PASSWORD);
    }

    public Optional<String> authenticate(String username, String password) {
        if (isBlank(username) || isBlank(password)) {
            return Optional.empty();
        }

        String normalizedUsername = normalizeUsername(username);
        String normalizedPassword = password.trim();
        UserAccount account = accounts.get(normalizedUsername);
        if (account == null || !normalizedPassword.equals(account.password())) {
            return Optional.empty();
        }

        return Optional.of(account.role());
    }

    public void createUser(String role, String username, String password) {
        if (isBlank(role) || isBlank(username) || isBlank(password)) {
            throw new IllegalArgumentException("Role, username, and password are required.");
        }

        String normalizedRole = role.trim().toLowerCase();
        String normalizedUsername = normalizeUsername(username);
        String normalizedPassword = password.trim();

        if (!normalizedRole.equals("admin") && !normalizedRole.equals("student")) {
            throw new IllegalArgumentException("Role must be either admin or student.");
        }

        UserAccount existing = accounts.putIfAbsent(
                normalizedUsername,
                new UserAccount(normalizedRole, normalizedPassword));
        if (existing != null) {
            throw new IllegalStateException("Username already exists.");
        }
    }

    private void seedAccount(String role, String username, String password) {
        accounts.put(normalizeUsername(username), new UserAccount(role, password.trim()));
    }

    private String normalizeUsername(String username) {
        return username.trim().toLowerCase();
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

    private record UserAccount(String role, String password) {
    }
}
