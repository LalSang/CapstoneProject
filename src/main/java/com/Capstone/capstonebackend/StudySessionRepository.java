package com.Capstone.capstonebackend;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StudySessionRepository extends JpaRepository<StudySession, Long> {
    
    List<StudySession> findAllByOrderByIdDesc();
    
    List<StudySession> findByOwnerUsername(String username);
}
