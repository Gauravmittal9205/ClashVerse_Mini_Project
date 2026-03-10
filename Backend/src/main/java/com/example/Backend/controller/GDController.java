package com.example.Backend.controller;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.example.Backend.model.GDRoom;
import com.example.Backend.service.GDService;

import java.util.List;

@RestController
@RequestMapping("/api/gd")
@CrossOrigin(origins = "*") // Connects to your MERN frontend
public class GDController {

    @Autowired
    private GDService gdService;

    @PostMapping("/create")
    public GDRoom create(@RequestParam String topic, @RequestParam boolean isPrivate) {
        return gdService.createRoom(topic, isPrivate);
    }

    @GetMapping("/ongoing")
    public List<GDRoom> listOngoing() {
        return gdService.getOngoingPublicRooms();
    }
}