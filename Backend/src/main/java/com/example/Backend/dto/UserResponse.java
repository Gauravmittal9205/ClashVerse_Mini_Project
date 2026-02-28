package com.example.Backend.dto;

import java.time.Instant;

/**
 * Response sent back to the frontend after a successful user sync.
 */
public class UserResponse {
    private Long id;
    private String firebaseUid;
    private String displayName;
    private String email;
    private String provider;
    private String photoUrl;
    private Instant createdAt;
    private Instant lastLoginAt;

    public UserResponse() {}

    public UserResponse(Long id, String firebaseUid, String displayName, String email, String provider, String photoUrl, Instant createdAt, Instant lastLoginAt) {
        this.id = id;
        this.firebaseUid = firebaseUid;
        this.displayName = displayName;
        this.email = email;
        this.provider = provider;
        this.photoUrl = photoUrl;
        this.createdAt = createdAt;
        this.lastLoginAt = lastLoginAt;
    }

    public static UserResponseBuilder builder() {
        return new UserResponseBuilder();
    }

    // Builder-like class to keep changes in AuthService minimal
    public static class UserResponseBuilder {
        private Long id;
        private String firebaseUid;
        private String displayName;
        private String email;
        private String provider;
        private String photoUrl;
        private Instant createdAt;
        private Instant lastLoginAt;

        public UserResponseBuilder id(Long id) { this.id = id; return this; }
        public UserResponseBuilder firebaseUid(String firebaseUid) { this.firebaseUid = firebaseUid; return this; }
        public UserResponseBuilder displayName(String displayName) { this.displayName = displayName; return this; }
        public UserResponseBuilder email(String email) { this.email = email; return this; }
        public UserResponseBuilder provider(String provider) { this.provider = provider; return this; }
        public UserResponseBuilder photoUrl(String photoUrl) { this.photoUrl = photoUrl; return this; }
        public UserResponseBuilder createdAt(Instant createdAt) { this.createdAt = createdAt; return this; }
        public UserResponseBuilder lastLoginAt(Instant lastLoginAt) { this.lastLoginAt = lastLoginAt; return this; }

        public UserResponse build() {
            return new UserResponse(id, firebaseUid, displayName, email, provider, photoUrl, createdAt, lastLoginAt);
        }
    }

    // Getters
    public Long getId() { return id; }
    public String getFirebaseUid() { return firebaseUid; }
    public String getDisplayName() { return displayName; }
    public String getEmail() { return email; }
    public String getProvider() { return provider; }
    public String getPhotoUrl() { return photoUrl; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getLastLoginAt() { return lastLoginAt; }
}
