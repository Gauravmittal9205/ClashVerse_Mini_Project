package com.example.Backend.model;

import jakarta.persistence.*;
import java.time.Instant;

/**
 * Represents a ClashVerse user synced from Firebase Auth into PostgreSQL.
 * Passwords are NEVER stored here — Firebase handles credential storage.
 * We store the Firebase UID as the stable unique key.
 */
@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Firebase UID — the stable identifier from Firebase Auth */
    @Column(name = "firebase_uid", nullable = false, unique = true, length = 128)
    private String firebaseUid;

    @Column(name = "display_name", length = 100)
    private String displayName;

    @Column(nullable = false, unique = true, length = 255)
    private String email;

    /** e.g. "EMAIL_PASSWORD", "GOOGLE", "GITHUB" */
    @Column(name = "provider", length = 30)
    private String provider;

    @Column(name = "photo_url", length = 512)
    private String photoUrl;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @Column(name = "last_login_at")
    private Instant lastLoginAt;

    public User() {}

    public User(String firebaseUid, String displayName, String email, String provider, String photoUrl) {
        this.firebaseUid = firebaseUid;
        this.displayName = displayName;
        this.email = email;
        this.provider = provider;
        this.photoUrl = photoUrl;
    }

    @PrePersist
    void onCreate() {
        createdAt = Instant.now();
        lastLoginAt = Instant.now();
    }

    @PreUpdate
    void onUpdate() {
        lastLoginAt = Instant.now();
    }

    // Getters and Seters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getFirebaseUid() { return firebaseUid; }
    public void setFirebaseUid(String firebaseUid) { this.firebaseUid = firebaseUid; }

    public String getDisplayName() { return displayName; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getProvider() { return provider; }
    public void setProvider(String provider) { this.provider = provider; }

    public String getPhotoUrl() { return photoUrl; }
    public void setPhotoUrl(String photoUrl) { this.photoUrl = photoUrl; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getLastLoginAt() { return lastLoginAt; }
    public void setLastLoginAt(Instant lastLoginAt) { this.lastLoginAt = lastLoginAt; }
}
