package com.MOA.backend.domain.user.repository;

import com.MOA.backend.domain.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUserEmail(String userEmail);

    Optional<User> findById(Long userId);

    List<User> findAllByUserIdIn(List<Long> userIds);

    String findUserNameByUserId(Long userId);
}
