package com.example.Backend.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.Resource;

import jakarta.annotation.PostConstruct;
import java.io.IOException;

/**
 * Initialises the Firebase Admin SDK once at startup.
 * This allows the backend to verify Firebase ID tokens server-side.
 *
 * You MUST download your Firebase service account JSON from:
 *   Firebase Console → Project Settings → Service Accounts → Generate new private key
 * and place it at: src/main/resources/serviceAccountKey.json
 */
@Configuration
public class FirebaseConfig {

    @Value("${firebase.service-account-path}")
    private Resource serviceAccountResource;

    @PostConstruct
    public void initFirebase() throws IOException {
        if (FirebaseApp.getApps().isEmpty()) {
            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccountResource.getInputStream()))
                    .build();
            FirebaseApp.initializeApp(options);
        }
    }
}
