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

import java.util.List;
import java.util.Random;

@Service
public class ArenaService {

    @Autowired
    private BattleRepository battleRepository;

    @Autowired
    private ProblemRepository problemRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    public Battle initiateBattle(String firebaseUid) {
        User player = userRepository.findByFirebaseUid(firebaseUid)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Seeding mock problems if none exist
        if (problemRepository.count() == 0) {
            seedProblems();
        }

        List<Problem> problems = problemRepository.findAll();
        Problem randomProblem = problems.get(new Random().nextInt(problems.size()));

        List<Battle> waitingBattles = battleRepository.findByStatusAndPlayer2IsNull("WAITING");

        // See if player already has a waiting battle
        Battle existingWaiting = waitingBattles.stream()
                .filter(b -> b.getPlayer1().getFirebaseUid().equals(firebaseUid))
                .findFirst()
                .orElse(null);

        if (existingWaiting != null) {
            return existingWaiting;
        }

        // Try to match with someone else
        Battle battle = waitingBattles.stream()
                .filter(b -> !b.getPlayer1().getFirebaseUid().equals(firebaseUid))
                .findFirst()
                .orElse(null);

        if (battle != null) {
            battle.setPlayer2(player);
            battle.setStatus("ACTIVE");
            Battle savedBattle = battleRepository.save(battle);
            
            // Notify player 1 that opponent found
            messagingTemplate.convertAndSend("/topic/battle/" + savedBattle.getId(), 
                new BattleEvent("PLAYER_JOINED", firebaseUid, player.getDisplayName() + " joined!"));
                
            return savedBattle;
        } else {
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
        if (!"ACTIVE".equals(battle.getStatus())) return;

        // The winner is the OTHER player
        String winnerUid;
        if (battle.getPlayer1().getFirebaseUid().equals(forfeitingUid)) {
            winnerUid = battle.getPlayer2() != null ? battle.getPlayer2().getFirebaseUid() : null;
        } else {
            winnerUid = battle.getPlayer1().getFirebaseUid();
        }

        if (winnerUid == null) return; // No opponent to win

        battle.setStatus("COMPLETED");
        battle.setWinnerId(winnerUid);
        battleRepository.save(battle);

        // Broadcast to both players
        messagingTemplate.convertAndSend("/topic/battle/" + battleId,
                new BattleEvent("BATTLE_END", winnerUid, "Opponent left. You win!"));
    }

    private void seedProblems() {
        Problem p1 = new Problem("Two Sum", "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.", "2 <= nums.length <= 10^4", "Input: nums = [2,7,11,15], target = 9 \nOutput: [0,1]", "Easy", "Arrays");
        Problem p2 = new Problem("Reverse String", "Write a function that reverses a string. The input string is given as an array of characters s.", "1 <= s.length <= 10^5", "Input: s = [\"h\",\"e\",\"l\",\"l\",\"o\"] \nOutput: [\"o\",\"l\",\"l\",\"e\",\"h\"]", "Easy", "String");
        problemRepository.saveAll(List.of(p1, p2));
    }
}
