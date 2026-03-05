package com.example.Backend.service;

import com.example.Backend.dto.BattleEvent;
import com.example.Backend.model.Battle;
import com.example.Backend.model.Submission;
import com.example.Backend.model.User;
import com.example.Backend.repository.BattleRepository;
import com.example.Backend.repository.SubmissionRepository;
import com.example.Backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.Random;

@Service
public class SubmissionService {

    @Autowired
    private SubmissionRepository submissionRepository;

    @Autowired
    private BattleRepository battleRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    public Submission submitCode(Long battleId, String firebaseUid, String code, String language) {
        Battle battle = battleRepository.findById(battleId)
                .orElseThrow(() -> new RuntimeException("Battle not found"));
        User user = userRepository.findByFirebaseUid(firebaseUid)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Submission submission = new Submission();
        submission.setBattle(battle);
        submission.setUser(user);
        submission.setCode(code);
        submission.setLanguage(language);
        submission.setStatus("PENDING");
        submission = submissionRepository.save(submission);

        // Simple Mock Judge Logic
        boolean passed = mockJudge(code);
        
        if (passed) {
            submission.setStatus("PASSED");
            submission.setRuntime(new Random().nextInt(50) + "ms");
            submission.setMemory(new Random().nextInt(100) + "MB");
            
            // If winner not already declared, declare this user as winner
            if (battle.getStatus().equals("ACTIVE") && battle.getWinnerId() == null) {
                battle.setWinnerId(user.getFirebaseUid());
                battle.setStatus("COMPLETED");
                battleRepository.save(battle);
                
                // Notify via WebSocket
                messagingTemplate.convertAndSend("/topic/battle/" + battleId, 
                    new BattleEvent("BATTLE_END", user.getFirebaseUid(), user.getDisplayName() + " won the battle!"));
            }
        } else {
            submission.setStatus("FAILED");
        }

        submissionRepository.save(submission);

        // Notify opponent about submission attempt
        messagingTemplate.convertAndSend("/topic/battle/" + battleId, 
            new BattleEvent("SUBMITTED", user.getFirebaseUid(), submission.getStatus()));

        return submission;
    }

    private boolean mockJudge(String code) {
        // Simple logic: if code contains "return", it's likely a valid-ish attempt for mock
        return code != null && code.contains("return");
    }
}
