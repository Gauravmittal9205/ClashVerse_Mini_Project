package com.example.Backend.service;

import com.example.Backend.model.Battle;
import com.example.Backend.model.Problem;
import com.example.Backend.model.User;
import com.example.Backend.repository.BattleRepository;
import com.example.Backend.repository.ProblemRepository;
import com.example.Backend.repository.UserRepository;
import com.example.Backend.dto.BattleEvent;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

@Service
public class ArenaService {

    private static final Logger log = LoggerFactory.getLogger(ArenaService.class);

    @Autowired
    private BattleRepository battleRepository;

    @Autowired
    private ProblemRepository problemRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Transactional
    public synchronized Battle initiateBattle(String firebaseUid) {
        log.info("Initiating battle for user: {}", firebaseUid);

        User player = userRepository.findByFirebaseUid(firebaseUid)
                .orElseThrow(() -> new RuntimeException("User profile not synced to PostgreSQL. Please try again."));

        // Upsert problems so boilerplate changes always take effect.
        // We update in-place by title so existing battle FK references are preserved.
        seedProblems();

        List<Problem> problems = problemRepository.findAll();
        if (problems.isEmpty()) {
            throw new RuntimeException("No problems available in the database.");
        }

        Problem randomProblem = problems.get(new Random().nextInt(problems.size()));

        // Check for WAITING battles not created by this user
        List<Battle> waitingBattles = battleRepository.findByStatusAndPlayer2IsNull("WAITING");

        // First, check if this user already has an active WAITING battle
        Battle existingWaiting = waitingBattles.stream()
                .filter(b -> b.getPlayer1().getFirebaseUid().equals(firebaseUid))
                .findFirst()
                .orElse(null);

        if (existingWaiting != null) {
            log.info("User already has a waiting battle: {}", existingWaiting.getId());
            return existingWaiting;
        }

        // Try to match with someone else's waiting battle
        Battle match = waitingBattles.stream()
                .filter(b -> !b.getPlayer1().getFirebaseUid().equals(firebaseUid))
                .findFirst()
                .orElse(null);

        if (match != null) {
            log.info("Matching user {} with existing battle {}", firebaseUid, match.getId());
            match.setPlayer2(player);
            match.setStatus("ACTIVE");
            Battle savedBattle = battleRepository.save(match);

            // Notify player 1 that opponent found
            try {
                messagingTemplate.convertAndSend("/topic/battle/" + savedBattle.getId(),
                        new BattleEvent("PLAYER_JOINED", firebaseUid, player.getDisplayName() + " joined!"));
            } catch (Exception e) {
                log.warn("Failed to send PLAYER_JOINED websocket notification: {}", e.getMessage());
            }

            return savedBattle;
        } else {
            log.info("No match found for user {}, creating new WAITING battle", firebaseUid);
            Battle newBattle = new Battle();
            newBattle.setPlayer1(player);
            newBattle.setProblem(randomProblem);
            newBattle.setStatus("WAITING");
            return battleRepository.save(newBattle);
        }
    }

    public void forfeit(Long battleId, String forfeitingUid) {
        Battle battle = battleRepository.findById(battleId)
                .orElseThrow(() -> new RuntimeException("Battle not found"));

        // Only forfeit active battles
        if (!"ACTIVE".equals(battle.getStatus()))
            return;

        // The winner is the OTHER player
        String winnerUid;
        if (battle.getPlayer1().getFirebaseUid().equals(forfeitingUid)) {
            winnerUid = battle.getPlayer2() != null ? battle.getPlayer2().getFirebaseUid() : null;
        } else {
            winnerUid = battle.getPlayer1().getFirebaseUid();
        }

        if (winnerUid == null)
            return; // No opponent to win

        battle.setStatus("COMPLETED");
        battle.setWinnerId(winnerUid);
        battleRepository.save(battle);

        // Broadcast to both players
        messagingTemplate.convertAndSend("/topic/battle/" + battleId,
                new BattleEvent("BATTLE_END", winnerUid, "Opponent left. You win!"));
    }

    @jakarta.annotation.PostConstruct
    private void seedProblems() {
        // ── Problem 1: Two Sum ────────────────────────────────────────────────────
        Problem p1 = new Problem(
                "Two Sum",
                "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
                "2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\nOnly one valid answer exists.",
                "Input: nums = [2,7,11,15], target = 9\nOutput: [0,1]",
                "Easy", "Arrays");
        // Input format: "[2,7,11,15], 9" Output format: "[0,1]"
        p1.setTestCases(
                "[{\"id\":1,\"input\":\"[2,7,11,15], 9\",\"output\":\"[0,1]\"},{\"id\":2,\"input\":\"[3,2,4], 6\",\"output\":\"[1,2]\"}]");
        p1.setBoilerplates(buildBoilerplates(
                // ── JavaScript ──
                "function twoSum(nums, target) {\n  // Your code here\n}\n\n" +
                        "// --- I/O harness (do not modify) ---\n" +
                        "const line = require('fs').readFileSync('/dev/stdin','utf8').trim();\n" +
                        "const match = line.match(/^(\\[.*?\\]),\\s*(\\d+)$/);\n" +
                        "const nums = JSON.parse(match[1]);\n" +
                        "const target = parseInt(match[2]);\n" +
                        "console.log(JSON.stringify(twoSum(nums, target)));",

                // ── Python ──
                "def twoSum(nums, target):\n    # Your code here\n    pass\n\n" +
                        "# --- I/O harness (do not modify) ---\n" +
                        "import sys, json, re\n" +
                        "line = sys.stdin.read().strip()\n" +
                        "m = re.match(r'^(\\[.*?\\]),\\s*(\\d+)$', line)\n" +
                        "nums = json.loads(m.group(1))\n" +
                        "target = int(m.group(2))\n" +
                        "print(json.dumps(twoSum(nums, target)))",

                // ── Java ──
                "import java.util.*;\n\n" +
                        "public class Solution {\n\n" +
                        "    public int[] twoSum(int[] nums, int target) {\n" +
                        "        // Your code here\n" +
                        "        return new int[]{};\n" +
                        "    }\n\n" +
                        "    // --- I/O harness (do not modify) ---\n" +
                        "    public static void main(String[] args) {\n" +
                        "        Scanner sc = new Scanner(System.in);\n" +
                        "        String line = sc.nextLine().trim();        // e.g. \"[2,7,11,15], 9\"\n" +
                        "        int bracket = line.lastIndexOf(']');\n" +
                        "        String arrPart = line.substring(0, bracket + 1).trim();  // \"[2,7,11,15]\"\n" +
                        "        int target = Integer.parseInt(line.substring(bracket + 2).trim()); // \"9\"\n" +
                        "        arrPart = arrPart.substring(1, arrPart.length() - 1);   // \"2,7,11,15\"\n" +
                        "        String[] tokens = arrPart.split(\",\");\n" +
                        "        int[] nums = new int[tokens.length];\n" +
                        "        for (int i = 0; i < tokens.length; i++) nums[i] = Integer.parseInt(tokens[i].trim());\n"
                        +
                        "        int[] result = new Solution().twoSum(nums, target);\n" +
                        "        System.out.println(Arrays.toString(result).replace(\" \", \"\"));\n" +
                        "    }\n" +
                        "}",

                // ── C++ ──
                "#include <bits/stdc++.h>\nusing namespace std;\n\n" +
                        "vector<int> twoSum(vector<int>& nums, int target) {\n" +
                        "    // Your code here\n" +
                        "    return {};\n" +
                        "}\n\n" +
                        "// --- I/O harness (do not modify) ---\n" +
                        "int main() {\n" +
                        "    string line;\n" +
                        "    getline(cin, line);\n" +
                        "    int bracket = line.rfind(']');\n" +
                        "    string arrPart = line.substr(1, bracket - 1);\n" +
                        "    int target = stoi(line.substr(bracket + 2));\n" +
                        "    vector<int> nums;\n" +
                        "    stringstream ss(arrPart);\n" +
                        "    string tok;\n" +
                        "    while(getline(ss, tok, ',')) nums.push_back(stoi(tok));\n" +
                        "    vector<int> res = twoSum(nums, target);\n" +
                        "    cout << '[' << res[0] << ',' << res[1] << ']' << endl;\n" +
                        "    return 0;\n" +
                        "}"));

        // ── Problem 2: Reverse String ─────────────────────────────────────────────
        Problem p2 = new Problem(
                "Reverse String",
                "Write a function that reverses a string.",
                "1 <= s.length <= 10^5",
                "Input: hello\nOutput: olleh",
                "Easy", "String");
        p2.setTestCases(
                "[{\"id\":1,\"input\":\"hello\",\"output\":\"olleh\"},{\"id\":2,\"input\":\"Hannah\",\"output\":\"hannaH\"}]");
        p2.setBoilerplates(buildBoilerplates(
                // ── JavaScript ──
                "function reverseString(s) {\n  // Your code here\n}\n\n" +
                        "// --- I/O harness (do not modify) ---\n" +
                        "const s = require('fs').readFileSync('/dev/stdin','utf8').trim();\n" +
                        "console.log(reverseString(s));",

                // ── Python ──
                "def reverseString(s):\n    # Your code here\n    pass\n\n" +
                        "# --- I/O harness (do not modify) ---\n" +
                        "import sys\n" +
                        "s = sys.stdin.read().strip()\n" +
                        "print(reverseString(s))",

                // ── Java ──
                "import java.util.*;\n\n" +
                        "public class Solution {\n\n" +
                        "    public String reverseString(String s) {\n" +
                        "        // Your code here\n" +
                        "        return \"\";\n" +
                        "    }\n\n" +
                        "    // --- I/O harness (do not modify) ---\n" +
                        "    public static void main(String[] args) {\n" +
                        "        Scanner sc = new Scanner(System.in);\n" +
                        "        String s = sc.nextLine().trim();\n" +
                        "        System.out.println(new Solution().reverseString(s));\n" +
                        "    }\n" +
                        "}",

                // ── C++ ──
                "#include <bits/stdc++.h>\nusing namespace std;\n\n" +
                        "string reverseString(string s) {\n" +
                        "    // Your code here\n" +
                        "    return \"\";\n" +
                        "}\n\n" +
                        "// --- I/O harness (do not modify) ---\n" +
                        "int main() {\n" +
                        "    string s;\n" +
                        "    getline(cin, s);\n" +
                        "    cout << reverseString(s) << endl;\n" +
                        "    return 0;\n" +
                        "}"));

        // Upsert each problem by title so existing battle FK references are preserved
        upsertProblem(p1);
        upsertProblem(p2);
    }

    /**
     * Insert the problem if it doesn't exist yet, otherwise update its fields
     * in-place
     * (keeping the same DB id so that existing battles FK references remain valid).
     */
    private void upsertProblem(Problem incoming) {
        problemRepository.findByTitle(incoming.getTitle())
                .ifPresentOrElse(existing -> {
                    existing.setDescription(incoming.getDescription());
                    existing.setConstraints(incoming.getConstraints());
                    existing.setExamples(incoming.getExamples());
                    existing.setDifficulty(incoming.getDifficulty());
                    existing.setCategory(incoming.getCategory());
                    existing.setTestCases(incoming.getTestCases());
                    existing.setBoilerplates(incoming.getBoilerplates());
                    problemRepository.save(existing);
                    log.info("Updated problem: {}", existing.getTitle());
                }, () -> {
                    problemRepository.save(incoming);
                    log.info("Inserted problem: {}", incoming.getTitle());
                });
    }

    /**
     * Builds the boilerplates JSON string for all four supported languages.
     */
    private String buildBoilerplates(String js, String python, String java, String cpp) {
        try {
            Map<String, String> map = new LinkedHashMap<>();
            map.put("javascript", js);
            map.put("python", python);
            map.put("java", java);
            map.put("cpp", cpp);
            return new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(map);
        } catch (Exception e) {
            return "{}";
        }
    }
}
