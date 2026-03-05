package com.example.Backend.dto;

public class BattleResponse {
    private String battleId;
    private Long problemId;
    private String status;

    public BattleResponse(String battleId, Long problemId, String status) {
        this.battleId = battleId;
        this.problemId = problemId;
        this.status = status;
    }

    // Getters and Setters
    public String getBattleId() { return battleId; }
    public void setBattleId(String battleId) { this.battleId = battleId; }

    public Long getProblemId() { return problemId; }
    public void setProblemId(Long problemId) { this.problemId = problemId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
