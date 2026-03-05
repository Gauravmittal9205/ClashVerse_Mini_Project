package com.example.Backend.controller;

import com.example.Backend.dto.BattleEvent;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class BattleWebSocketController {

    @MessageMapping("/battle/{battleId}/action")
    @SendTo("/topic/battle/{battleId}")
    public BattleEvent handleBattleAction(@DestinationVariable String battleId, BattleEvent event) {
        // Just echo the message to all subscribers of this battle
        return event;
    }
}
