package com.Capstone.capstonebackend;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserAccountRepository extends JpaRepository<UserAccount, Long> {

    Optional<UserAccount> findByNormalizedUsername(String normalizedUsername);

    boolean existsByNormalizedUsername(String normalizedUsername);
}
