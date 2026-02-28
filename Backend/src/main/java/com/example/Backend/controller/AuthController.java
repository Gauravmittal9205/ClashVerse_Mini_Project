package com.example.Backend.controller;

import com.example.Backend.dto.AuthSyncRequest;
import com.example.Backend.dto.UserResponse;
import com.example.Backend.service.AuthService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for authentication endpoints.
 *
 * POST /api/auth/sync  — Called by the frontend right after Firebase login.
 *                        Verifies the Firebase ID token and upserts the user
 *                        profile into PostgreSQL.
 *
 * GET  /api/auth/me/{uid} — Returns the PostgreSQL profile for a given UID.
 *
 * GET  /api/health        — Simple liveness check.
 */
@RestController
@RequestMapping("/api")
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /** Health check */
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("ClashVerse backend is running ✅");
    }

    /**
     * Called by the frontend immediately after a successful Firebase login.
     * Body: { "idToken": "<firebase-id-token>" }
     */
    @PostMapping("/auth/sync")
    public ResponseEntity<?> syncUser(@RequestBody AuthSyncRequest request) {
        try {
            UserResponse response = authService.syncUser(request.getIdToken());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Auth sync failed: {}", e.getMessage());
            return ResponseEntity.status(401).body("Token verification failed: " + e.getMessage());
        }
    }

    /**
     * Fetch DB profile by Firebase UID (extend with JWT guard later).
     */
    @GetMapping("/auth/me/{uid}")
    public ResponseEntity<?> getUser(@PathVariable String uid) {
        try {
            UserResponse response = authService.getUserByUid(uid);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(404).body("User not found");
        }
    }
}
