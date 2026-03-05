package com.example.Backend.controller;

import com.example.Backend.dto.BattleResponse;
import com.example.Backend.model.Battle;
import com.example.Backend.service.ArenaService;
import com.example.Backend.repository.BattleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/arena")
@CrossOrigin(origins = "*") // For development
public class ArenaController {

    @Autowired
    private ArenaService arenaService;

    @Autowired
    private BattleRepository battleRepository;

    @PostMapping("/initiate")
    public ResponseEntity<BattleResponse> initiateBattle(@RequestParam String firebaseUid) {
        try {
            Battle battle = arenaService.initiateBattle(firebaseUid);
            BattleResponse response = new BattleResponse(
                battle.getId().toString(),
                battle.getProblem().getId(),
                battle.getStatus()
            );
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/battle/{battleId}")
    public ResponseEntity<Battle> getBattle(@PathVariable Long battleId) {
        return battleRepository.findById(battleId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/forfeit")
    public ResponseEntity<Void> forfeit(@RequestParam Long battleId, @RequestParam String firebaseUid) {
        try {
            arenaService.forfeit(battleId, firebaseUid);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
