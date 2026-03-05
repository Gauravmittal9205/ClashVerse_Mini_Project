package com.example.Backend.controller;

import com.example.Backend.dto.SubmissionRequest;
import com.example.Backend.model.Submission;
import com.example.Backend.service.SubmissionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/submission")
@CrossOrigin(origins = "*")
public class SubmissionController {

    @Autowired
    private SubmissionService submissionService;

    @PostMapping
    public ResponseEntity<Submission> submitCode(@RequestBody SubmissionRequest request) {
        try {
            Submission submission = submissionService.submitCode(
                request.getBattleId(),
                request.getFirebaseUid(),
                request.getCode(),
                request.getLanguage()
            );
            return ResponseEntity.ok(submission);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
