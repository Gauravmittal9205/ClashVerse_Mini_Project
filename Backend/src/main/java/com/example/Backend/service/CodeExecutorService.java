package com.example.Backend.service;

import com.example.Backend.dto.JudgeResult;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.*;
import java.util.concurrent.TimeUnit;

/**
 * Executes user-submitted code inside Docker containers.
 *
 * Strategy for ALL languages:
 * - The boilerplate shown in the editor already contains the full I/O harness
 * (reads from stdin, calls the solution method, prints to stdout).
 * - Users only fill in the logic inside the method body.
 * - For Java, because the JVM needs compilation before each run, we compile
 * once in the temp dir and then run the class for each test case.
 */
@Service
public class CodeExecutorService {

    private static final Logger log = LoggerFactory.getLogger(CodeExecutorService.class);
    private final ObjectMapper objectMapper = new ObjectMapper();

    public JudgeResult executeCode(String code, String language, String testCasesJson) {
        List<JudgeResult.TestCaseResult> results = new ArrayList<>();
        String overallStatus = "PASSED";
        long totalStartTime = System.currentTimeMillis();

        try {
            if (code == null || code.trim().isEmpty()) {
                return new JudgeResult("FAILED", "0ms", "0MB",
                        List.of(new JudgeResult.TestCaseResult(1, "", "", "No code submitted", false,
                                "Code is empty")));
            }

            List<Map<String, String>> testCases = objectMapper.readValue(testCasesJson, new TypeReference<>() {
            });
            if (testCases == null || testCases.isEmpty()) {
                return new JudgeResult("ERROR", "0ms", "0MB",
                        List.of(new JudgeResult.TestCaseResult(1, "", "", "No test cases provided", false,
                                "Internal Error")));
            }

            Path tempDir = Files.createTempDirectory("code-exec-");
            String fileName = getFileName(language);
            Path filePath = tempDir.resolve(fileName);
            Files.writeString(filePath, code);

            // For Java: compile once, then run per test case
            if (language.equalsIgnoreCase("java")) {
                String compileError = compileJava(tempDir, fileName);
                if (compileError != null) {
                    // Compilation failed — report error on all test cases
                    int id = 1;
                    for (Map<String, String> tc : testCases) {
                        results.add(new JudgeResult.TestCaseResult(
                                id++, tc.get("input"), tc.get("output"),
                                compileError, false, "Compilation Error: " + compileError));
                    }
                    return new JudgeResult("ERROR",
                            (System.currentTimeMillis() - totalStartTime) + "ms", "16MB", results);
                }
            }

            int testId = 1;
            for (Map<String, String> testCase : testCases) {
                String input = testCase.get("input");
                String expectedOutput = testCase.get("output");
                JudgeResult.TestCaseResult result = runSingleTestCase(testId++, language, input, expectedOutput,
                        tempDir, fileName);
                results.add(result);
                if (!result.isPassed()) {
                    overallStatus = "FAILED";
                }
            }

            // Cleanup
            cleanupDir(tempDir);

        } catch (Exception e) {
            log.error("Execution error", e);
            overallStatus = "ERROR";
        }

        long totalDuration = System.currentTimeMillis() - totalStartTime;
        return new JudgeResult(overallStatus, totalDuration + "ms", "16MB", results);
    }

    // ── Java compile step ────────────────────────────────────────────────────────

    /**
     * Compiles the Java file inside a Docker container using javac.
     * Returns null on success, or the compiler error output on failure.
     */
    private String compileJava(Path tempDir, String fileName) {
        try {
            ProcessBuilder pb = new ProcessBuilder(
                    "docker", "run", "--rm",
                    "-v", tempDir.toAbsolutePath() + ":/app",
                    "-w", "/app",
                    "eclipse-temurin:17-jdk-alpine",
                    "javac", fileName);
            pb.redirectErrorStream(true);
            Process process = pb.start();
            String output = readStream(process.getInputStream());
            boolean finished = process.waitFor(30, TimeUnit.SECONDS);
            if (!finished) {
                process.destroyForcibly();
                return "Compilation timed out";
            }
            if (process.exitValue() != 0)
                return output.trim();
            return null; // success
        } catch (Exception e) {
            return "Compilation failed: " + e.getMessage();
        }
    }

    // ── Single test-case execution ───────────────────────────────────────────────

    private JudgeResult.TestCaseResult runSingleTestCase(
            int id, String language, String input, String expectedOutput,
            Path tempDir, String fileName) {
        try {
            String runCommand = getRunCommand(language, fileName);

            ProcessBuilder pb = new ProcessBuilder(
                    "docker", "run", "--rm",
                    "-i", // keep stdin open
                    "-v", tempDir.toAbsolutePath() + ":/app",
                    "-w", "/app",
                    getDockerImage(language),
                    "sh", "-c", runCommand);
            pb.redirectErrorStream(true);

            Process process = pb.start();

            // Feed the test‑case input via stdin
            if (input != null && !input.isEmpty()) {
                try (BufferedWriter writer = new BufferedWriter(
                        new OutputStreamWriter(process.getOutputStream()))) {
                    writer.write(input);
                    writer.newLine();
                    writer.flush();
                }
            } else {
                process.getOutputStream().close();
            }

            String output = readStream(process.getInputStream());

            boolean finished = process.waitFor(10, TimeUnit.SECONDS);
            if (!finished) {
                process.destroyForcibly();
                return new JudgeResult.TestCaseResult(
                        id, input, expectedOutput, "TIMEOUT", false, "Time Limit Exceeded");
            }

            String actualOutput = output.trim();
            if (process.exitValue() != 0) {
                return new JudgeResult.TestCaseResult(
                        id, input, expectedOutput, actualOutput, false,
                        "Runtime Error: " + actualOutput);
            }

            boolean passed = actualOutput.equals(expectedOutput != null ? expectedOutput.trim() : "");
            return new JudgeResult.TestCaseResult(
                    id, input, expectedOutput, actualOutput, passed,
                    passed ? null : "Wrong Answer");

        } catch (Exception e) {
            return new JudgeResult.TestCaseResult(
                    id, input, expectedOutput, "ERROR", false, e.getMessage());
        }
    }

    // ── Helpers ──────────────────────────────────────────────────────────────────

    private String readStream(InputStream is) throws IOException {
        StringBuilder sb = new StringBuilder();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(is))) {
            String line;
            while ((line = reader.readLine()) != null) {
                sb.append(line).append("\n");
            }
        }
        return sb.toString();
    }

    private String getFileName(String language) {
        return switch (language.toLowerCase()) {
            case "python" -> "solution.py";
            case "javascript" -> "solution.js";
            case "java" -> "Solution.java";
            case "cpp" -> "solution.cpp";
            default -> "solution.txt";
        };
    }

    private String getDockerImage(String language) {
        return switch (language.toLowerCase()) {
            case "python" -> "python:3.9-alpine";
            case "javascript" -> "node:18-alpine";
            case "java" -> "eclipse-temurin:17-jdk-alpine";
            case "cpp" -> "gcc:latest";
            default -> "alpine:latest";
        };
    }

    /**
     * For Java, the class is already compiled; just run it.
     * For other languages, compile (if needed) and run in one shell command.
     */
    private String getRunCommand(String language, String fileName) {
        return switch (language.toLowerCase()) {
            case "python" -> "python3 " + fileName;
            case "javascript" -> "node " + fileName;
            // Class already compiled by compileJava(); just run the main class.
            case "java" -> "java Solution";
            case "cpp" -> "g++ " + fileName + " -o solution && ./solution";
            default -> "cat " + fileName;
        };
    }

    private void cleanupDir(Path dir) {
        try {
            Files.walk(dir)
                    .sorted(Comparator.reverseOrder())
                    .map(Path::toFile)
                    .forEach(File::delete);
        } catch (Exception e) {
            log.warn("Failed to clean up temp dir: {}", dir, e);
        }
    }
}
