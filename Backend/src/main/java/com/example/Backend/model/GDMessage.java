package com.example.Backend.model;

import lombok.Data;

@Data
public class GDMessage {
    private String sender;
    private String content;
    private MessageType type;
    private String roomId;

    public enum MessageType {
        JOIN, CHAT, LEAVE, START_SPEECH, STOP_SPEECH
    }
}