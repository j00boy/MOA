package com.MOA.backend.domain.member.repository;

import com.MOA.backend.domain.member.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface MemberRepository extends JpaRepository<Member, Long> {

    @Query()
    List<Member> findByGroupGroupId(Long groupId);

    List<Member> findByUserUserId(Long userId);

    Optional<Member> findByGroupGroupIdAndUserUserId(Long groupId, Long userId);

    Boolean existsByGroupGroupIdAndUserUserId(Long groupId, Long userId);

    List<Member> findAllByUserUserId(Long userId);

    @Query("select m.user.userId, m.nickname, m.user.userImage from Member m join m.user where m.group = :groupId")
    List<Object[]> findUsersByGroupId(@Param("groupId") Long groupId);

    long countByGroupGroupId(Long groupId);
}
