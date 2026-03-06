package com.example.Backend.dto;

import java.util.List;

public class JudgeResult {
    private String status; // PASSED, FAILED, COMPILATION_ERROR, RUNTIME_ERROR, TIME_LIMIT_EXCEEDED
    private String runtime;
    private String memory;
    private List<TestCaseResult> testCaseResults;

    public JudgeResult() {}

    public JudgeResult(String status, String runtime, String memory, List<TestCaseResult> testCaseResults) {
        this.status = status;
        this.runtime = runtime;
        this.memory = memory;
        this.testCaseResults = testCaseResults;
    }

    // Getters and Setters
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getRuntime() { return runtime; }
    public void setRuntime(String runtime) { this.runtime = runtime; }

    public String getMemory() { return memory; }
    public void setMemory(String memory) { this.memory = memory; }

    public List<TestCaseResult> getTestCaseResults() { return testCaseResults; }
    public void setTestCaseResults(List<TestCaseResult> testCaseResults) { this.testCaseResults = testCaseResults; }

    public static class TestCaseResult {
        private int id;
        private String input;
        private String expectedOutput;
        private String actualOutput;
        private boolean passed;
        private String errorMessage;

        public TestCaseResult() {}

        public TestCaseResult(int id, String input, String expectedOutput, String actualOutput, boolean passed, String errorMessage) {
            this.id = id;
            this.input = input;
            this.expectedOutput = expectedOutput;
            this.actualOutput = actualOutput;
            this.passed = passed;
            this.errorMessage = errorMessage;
        }

        // Getters and Setters
        public int getId() { return id; }
        public void setId(int id) { this.id = id; }

        public String getInput() { return input; }
        public void setInput(String input) { this.input = input; }

        public String getExpectedOutput() { return expectedOutput; }
        public void setExpectedOutput(String expectedOutput) { this.expectedOutput = expectedOutput; }

        public String getActualOutput() { return actualOutput; }
        public void setActualOutput(String actualOutput) { this.actualOutput = actualOutput; }

        public boolean isPassed() { return passed; }
        public void setPassed(boolean passed) { this.passed = passed; }

        public String getErrorMessage() { return errorMessage; }
        public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }
    }
}
