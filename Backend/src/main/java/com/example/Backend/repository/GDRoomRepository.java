package com.example.Backend.repository;


import org.springframework.data.jpa.repository.JpaRepository;

import com.example.Backend.model.GDRoom;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface GDRoomRepository extends JpaRepository<GDRoom, UUID> {
    
    // For "Ongoing Rooms" tab: Only public and active rooms
    List<GDRoom> findByIsPrivateFalseAndStatus(GDRoom.RoomStatus status);

    // For joining a Private Room via code
    Optional<GDRoom> findByAccessCode(String accessCode);
}
