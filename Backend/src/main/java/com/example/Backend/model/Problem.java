package com.example.Backend.model;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "problems")
public class Problem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String constraints;

    @Column(columnDefinition = "TEXT")
    private String examples;

    private String difficulty; // Easy, Medium, Hard

    @Column(columnDefinition = "TEXT")
    private String category; // Arrays, DP, etc.

    @Column(columnDefinition = "TEXT")
    private String testCases; // JSON string of [{input: "", output: ""}]

    @Column(columnDefinition = "TEXT")
    private String boilerplates; // JSON string of {lang: "code"}

    public Problem() {}

    public Problem(String title, String description, String constraints, String examples, String difficulty, String category) {
        this.title = title;
        this.description = description;
        this.constraints = constraints;
        this.examples = examples;
        this.difficulty = difficulty;
        this.category = category;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getConstraints() { return constraints; }
    public void setConstraints(String constraints) { this.constraints = constraints; }

    public String getExamples() { return examples; }
    public void setExamples(String examples) { this.examples = examples; }

    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getTestCases() { return testCases; }
    public void setTestCases(String testCases) { this.testCases = testCases; }

    public String getBoilerplates() { return boilerplates; }
    public void setBoilerplates(String boilerplates) { this.boilerplates = boilerplates; }
}
