package com.example.Backend.service;

import com.example.Backend.dto.UserResponse;
import com.example.Backend.model.User;
import com.example.Backend.repository.UserRepository;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

/**
 * Core auth service:
 * 1. Verifies the Firebase ID token using Firebase Admin SDK
 * 2. Upserts the user record in PostgreSQL (creates if first login, updates on subsequent logins)
 * 3. Returns a UserResponse DTO
 */
@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);
    private final UserRepository userRepository;

    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Verify Firebase token and upsert the user into PostgreSQL.
     *
     * @param idToken the raw Firebase ID token from the client
     * @return UserResponse with the persisted user data
     */
    @Transactional
    public UserResponse syncUser(String idToken) throws Exception {

        // ── Step 1: Verify the token with Firebase Admin ────────────────────────
        FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(idToken);

        String uid          = decodedToken.getUid();
        String email        = decodedToken.getEmail();
        String displayName  = decodedToken.getName();
        String photoUrl     = decodedToken.getPicture();

        // Determine provider (sign_in_provider claim Google sets)
        String signInProvider = (String) decodedToken.getClaims()
                .getOrDefault("firebase", java.util.Map.of())
                .toString();   // raw string fallback

        // Try a cleaner approach via the nested map
        Object firebaseClaim = decodedToken.getClaims().get("firebase");
        String provider = "EMAIL_PASSWORD";
        if (firebaseClaim instanceof java.util.Map<?, ?> firebaseMap) {
            Object providerObj = firebaseMap.get("sign_in_provider");
            if (providerObj != null) {
                provider = switch (providerObj.toString()) {
                    case "google.com" -> "GOOGLE";
                    case "github.com" -> "GITHUB";
                    default           -> "EMAIL_PASSWORD";
                };
            }
        }

        log.info("Firebase token verified for UID={}, provider={}", uid, provider);

        // ── Step 2: Upsert into PostgreSQL ─────────────────────────────────────
        final String finalProvider = provider;
        final String finalDisplayName = displayName;
        final String finalPhotoUrl = photoUrl;

        User user = userRepository.findByFirebaseUid(uid)
                .map(existing -> {
                    // Update mutable fields on every login
                    existing.setDisplayName(finalDisplayName);
                    existing.setPhotoUrl(finalPhotoUrl);
                    existing.setLastLoginAt(Instant.now());
                    return existing;
                })
                .orElseGet(() -> new User(uid, finalDisplayName, email, finalProvider, finalPhotoUrl));

        user = userRepository.save(user);
        log.info("User upserted in DB: id={}, email={}", user.getId(), user.getEmail());

        // ── Step 3: Return DTO ─────────────────────────────────────────────────
        return toResponse(user);
    }

    /**
     * Fetch a user profile by Firebase UID (for protected routes later).
     */
    public UserResponse getUserByUid(String uid) {
        User user = userRepository.findByFirebaseUid(uid)
                .orElseThrow(() -> new RuntimeException("User not found: " + uid));
        return toResponse(user);
    }

    private UserResponse toResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .firebaseUid(user.getFirebaseUid())
                .displayName(user.getDisplayName())
                .email(user.getEmail())
                .provider(user.getProvider())
                .photoUrl(user.getPhotoUrl())
                .createdAt(user.getCreatedAt())
                .lastLoginAt(user.getLastLoginAt())
                .build();
    }
}
