package com.example.Backend.repository;

import com.example.Backend.model.Battle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BattleRepository extends JpaRepository<Battle, Long> {
    List<Battle> findByStatusAndPlayer2IsNull(String status);
}
