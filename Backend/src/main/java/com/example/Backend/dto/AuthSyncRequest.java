package com.example.Backend.dto;

/**
 * Payload sent by the frontend AFTER Firebase authentication.
 * The frontend gets a Firebase ID token and sends it here so the backend
 * can verify it and upsert the user into PostgreSQL.
 */
public class AuthSyncRequest {

    /** Firebase ID token obtained from getIdToken() on the client */
    private String idToken;

    public AuthSyncRequest() {}

    public String getIdToken() { return idToken; }
    public void setIdToken(String idToken) { this.idToken = idToken; }
}
