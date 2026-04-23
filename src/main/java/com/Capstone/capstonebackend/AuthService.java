package com.Capstone.capstonebackend;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.security.spec.InvalidKeySpecException;
import java.util.Base64;
import java.util.Optional;
import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;
import jakarta.annotation.PostConstruct;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    public static final String DEFAULT_ADMIN_USERNAME = "admin";
    public static final String DEFAULT_ADMIN_PASSWORD = "admin";
    public static final String DEFAULT_STUDENT_USERNAME = "student";
    public static final String DEFAULT_STUDENT_PASSWORD = "student";

    private static final String PASSWORD_HASH_ALGORITHM = "PBKDF2WithHmacSHA256";
    private static final int PASSWORD_HASH_ITERATIONS = 120_000;
    private static final int PASSWORD_SALT_BYTES = 16;
    private static final int PASSWORD_HASH_BYTES = 32;
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final UserAccountRepository userAccountRepository;

    public AuthService(UserAccountRepository userAccountRepository) {
        this.userAccountRepository = userAccountRepository;
    }

    @PostConstruct
    public void seedDefaultAccounts() {
        seedAccount("admin", DEFAULT_ADMIN_USERNAME, DEFAULT_ADMIN_PASSWORD);
        seedAccount("student", DEFAULT_STUDENT_USERNAME, DEFAULT_STUDENT_PASSWORD);
    }

    @Transactional(readOnly = true)
    public Optional<String> authenticate(String username, String password) {
        if (isBlank(username) || isBlank(password)) {
            return Optional.empty();
        }

        String normalizedUsername = normalizeUsername(username);
        String cleanedPassword = password.trim();
        return userAccountRepository.findByNormalizedUsername(normalizedUsername)
                .filter(account -> passwordMatches(cleanedPassword, account.getPasswordHash()))
                .map(UserAccount::getRole);
    }

    @Transactional
    public void createUser(String role, String username, String password) {
        if (isBlank(role) || isBlank(username) || isBlank(password)) {
            throw new IllegalArgumentException("Role, username, and password are required.");
        }

        String normalizedRole = normalizeRole(role);
        String cleanedUsername = username.trim();
        String normalizedUsername = normalizeUsername(cleanedUsername);
        String cleanedPassword = password.trim();

        if (userAccountRepository.existsByNormalizedUsername(normalizedUsername)) {
            throw new IllegalStateException("Username already exists.");
        }

        try {
            userAccountRepository.save(new UserAccount(
                    cleanedUsername,
                    normalizedUsername,
                    hashPassword(cleanedPassword),
                    normalizedRole));
        } catch (DataIntegrityViolationException ex) {
            throw new IllegalStateException("Username already exists.", ex);
        }
    }

    private void seedAccount(String role, String username, String password) {
        String normalizedUsername = normalizeUsername(username);
        if (userAccountRepository.existsByNormalizedUsername(normalizedUsername)) {
            return;
        }

        userAccountRepository.save(new UserAccount(
                username.trim(),
                normalizedUsername,
                hashPassword(password.trim()),
                normalizeRole(role)));
    }

    private String normalizeRole(String role) {
        String normalizedRole = role.trim().toLowerCase();
        if (!normalizedRole.equals("admin") && !normalizedRole.equals("student")) {
            throw new IllegalArgumentException("Role must be either admin or student.");
        }
        return normalizedRole;
    }

    private String hashPassword(String password) {
        byte[] salt = new byte[PASSWORD_SALT_BYTES];
        SECURE_RANDOM.nextBytes(salt);
        byte[] hash = derivePasswordHash(password, salt, PASSWORD_HASH_ITERATIONS);

        return String.join(
                ":",
                PASSWORD_HASH_ALGORITHM,
                Integer.toString(PASSWORD_HASH_ITERATIONS),
                Base64.getEncoder().encodeToString(salt),
                Base64.getEncoder().encodeToString(hash));
    }

    private boolean passwordMatches(String password, String storedPasswordHash) {
        if (isBlank(storedPasswordHash)) {
            return false;
        }

        String[] parts = storedPasswordHash.split(":");
        if (parts.length != 4 || !PASSWORD_HASH_ALGORITHM.equals(parts[0])) {
            return false;
        }

        try {
            int iterations = Integer.parseInt(parts[1]);
            byte[] salt = Base64.getDecoder().decode(parts[2]);
            byte[] expectedHash = Base64.getDecoder().decode(parts[3]);
            byte[] attemptedHash = derivePasswordHash(password, salt, iterations);
            return MessageDigest.isEqual(expectedHash, attemptedHash);
        } catch (IllegalArgumentException ex) {
            return false;
        }
    }

    private byte[] derivePasswordHash(String password, byte[] salt, int iterations) {
        PBEKeySpec spec = new PBEKeySpec(password.toCharArray(), salt, iterations, PASSWORD_HASH_BYTES * 8);
        try {
            SecretKeyFactory factory = SecretKeyFactory.getInstance(PASSWORD_HASH_ALGORITHM);
            return factory.generateSecret(spec).getEncoded();
        } catch (NoSuchAlgorithmException | InvalidKeySpecException ex) {
            throw new IllegalStateException("Unable to secure password.", ex);
        } finally {
            spec.clearPassword();
        }
    }

    private String normalizeUsername(String username) {
        return username.trim().toLowerCase();
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
