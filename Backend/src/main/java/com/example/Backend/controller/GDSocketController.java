package com.example.Backend.controller;


import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

import com.example.Backend.model.GDMessage;

@Controller
public class GDSocketController {

    // When a user joins: /app/gd.join/{roomId}
    @MessageMapping("/gd.join/{roomId}")
    @SendTo("/topic/room/{roomId}")
    public GDMessage joinRoom(@DestinationVariable String roomId, @Payload GDMessage message) {
        message.setType(GDMessage.MessageType.JOIN);
        message.setContent(message.getSender() + " entered the discussion.");
        return message;
    }

    // When a user speaks: /app/gd.speak/{roomId}
    @MessageMapping("/gd.speak/{roomId}")
    @SendTo("/topic/room/{roomId}")
    public GDMessage handleSpeech(@DestinationVariable String roomId, @Payload GDMessage message) {
        // This will notify everyone who is currently speaking
        return message; 
    }
}