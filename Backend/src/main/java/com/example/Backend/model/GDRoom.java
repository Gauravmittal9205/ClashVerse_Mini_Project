package com.example.Backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Data
@Table(name = "gd_rooms")
public class GDRoom {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    private String topic;
    
    @Column(nullable = false)
    private boolean isPrivate;

    private String accessCode; // Only populated if isPrivate is true

    private int maxParticipants = 10;
    
    private int currentParticipants = 0;

    @Enumerated(EnumType.STRING)
    private RoomStatus status = RoomStatus.WAITING;

    private LocalDateTime createdAt = LocalDateTime.now();

    public enum RoomStatus {
        WAITING, ONGOING, COMPLETED
    }
}