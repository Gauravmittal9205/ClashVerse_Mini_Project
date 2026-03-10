package com.example.Backend.service;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.Backend.model.GDRoom;
import com.example.Backend.repository.GDRoomRepository;

import java.util.List;
import java.util.Random;

@Service
public class GDService {

    @Autowired
    private GDRoomRepository repository;

    public GDRoom createRoom(String topic, boolean isPrivate) {
        GDRoom room = new GDRoom();
        room.setTopic(topic);
        room.setPrivate(isPrivate);

        if (isPrivate) {
            room.setAccessCode(generateRandomCode());
        }
        
        return repository.save(room);
    }

    public List<GDRoom> getOngoingPublicRooms() {
        return repository.findByIsPrivateFalseAndStatus(GDRoom.RoomStatus.WAITING);
    }

    private String generateRandomCode() {
        return String.format("%06d", new Random().nextInt(999999));
    }
}