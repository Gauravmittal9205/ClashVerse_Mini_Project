package com.example.Backend.service;

import com.example.Backend.dto.BattleEvent;
import com.example.Backend.model.Battle;
import com.example.Backend.model.Submission;
import com.example.Backend.model.User;
import com.example.Backend.repository.BattleRepository;
import com.example.Backend.repository.SubmissionRepository;
import com.example.Backend.repository.UserRepository;
import com.example.Backend.dto.JudgeResult;
import com.fasterxml.jackson.databind.ObjectMapper;
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

    @Autowired
    private CodeExecutorService codeExecutorService;

    private final ObjectMapper objectMapper = new ObjectMapper();

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
        Submission finalSubmission = submissionRepository.save(submission);

        // Real Judge Logic using Docker
        String testCasesJson = battle.getProblem().getTestCases();
        if (testCasesJson == null || testCasesJson.isEmpty() || testCasesJson.equals("[]")) {
            throw new RuntimeException("This problem has no test cases configured.");
        }

        JudgeResult result = codeExecutorService.executeCode(code, language, testCasesJson);
        
        try {
            finalSubmission.setResultJson(objectMapper.writeValueAsString(result));
        } catch (Exception e) {
            finalSubmission.setResultJson("{}");
        }

        finalSubmission.setStatus(result.getStatus());
        finalSubmission.setRuntime(result.getRuntime());
        finalSubmission.setMemory(result.getMemory());
        
        if ("PASSED".equals(result.getStatus())) {
            // If winner not already declared, declare this user as winner
            if (battle.getStatus().equals("ACTIVE") && battle.getWinnerId() == null) {
                battle.setWinnerId(user.getFirebaseUid());
                battle.setStatus("COMPLETED");
                battleRepository.save(battle);
                
                // Notify via WebSocket
                messagingTemplate.convertAndSend("/topic/battle/" + battleId, 
                    new BattleEvent("BATTLE_END", user.getFirebaseUid(), user.getDisplayName() + " won the battle!"));
            }
        }

        submissionRepository.save(submission);

        // Notify opponent about submission attempt
        messagingTemplate.convertAndSend("/topic/battle/" + battleId, 
            new BattleEvent("SUBMITTED", user.getFirebaseUid(), submission.getStatus()));

        return submission;
    }

    public JudgeResult runCode(Long battleId, String code, String language) {
        Battle battle = battleRepository.findById(battleId)
                .orElseThrow(() -> new RuntimeException("Battle not found"));

        String testCasesJson = battle.getProblem().getTestCases();
        if (testCasesJson == null || testCasesJson.isEmpty() || testCasesJson.equals("[]")) {
            throw new RuntimeException("This problem has no test cases configured.");
        }

        return codeExecutorService.executeCode(code, language, testCasesJson);
    }
}
