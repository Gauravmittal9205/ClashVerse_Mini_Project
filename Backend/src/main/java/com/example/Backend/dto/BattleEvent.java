package com.example.Backend.dto;

public class BattleEvent {
    private String type; // PLAYER_JOINED, SUBMITTED, BATTLE_END, TYPING
    private String senderId;
    private String payload;

    public BattleEvent() {}

    public BattleEvent(String type, String senderId, String payload) {
        this.type = type;
        this.senderId = senderId;
        this.payload = payload;
    }

    // Getters and Setters
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getSenderId() { return senderId; }
    public void setSenderId(String senderId) { this.senderId = senderId; }

    public String getPayload() { return payload; }
    public void setPayload(String payload) { this.payload = payload; }
}
