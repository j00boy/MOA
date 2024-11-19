package com.MOA.backend.domain.group.service;

import com.MOA.backend.domain.group.dto.request.GroupCreateDto;
import com.MOA.backend.domain.group.dto.response.UserInGroupDetailResponse;
import com.MOA.backend.domain.group.entity.Group;
import com.MOA.backend.domain.group.repository.GroupRepository;
import com.MOA.backend.domain.member.entity.Member;
import com.MOA.backend.domain.member.repository.MemberRepository;
import com.MOA.backend.domain.moment.util.PinCodeUtil;
import com.MOA.backend.domain.user.entity.User;
import com.MOA.backend.domain.user.repository.UserRepository;
import com.MOA.backend.global.auth.jwt.service.JwtUtil;
import com.MOA.backend.global.exception.ForbiddenAccessException;
import jakarta.persistence.EntityNotFoundException;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
@Slf4j
public class GroupService {

    private final GroupRepository groupRepository;
    private final MemberRepository memberRepository;
    private final UserRepository userRepository;
    private final PinCodeUtil pinCodeUtil;
    private final JwtUtil jwtUtil;

    // 그룹 생성
    @Transactional
    public Group create(Long userId, GroupCreateDto groupDto) {
        // Group 엔티티를 생성하고 DTO의 값들을 설정합니다.
        Group group = new Group();
        group.setGroupName(groupDto.getGroupName());
        group.setGroupOwnerId(userId);
        group.setGroupDescription(groupDto.getGroupDescription());
        group.setGroupColor(groupDto.getColor());
        group.setGroupIcon(groupDto.getIcon());

        // 그룹을 저장하고 사용자 추가 로직을 수행합니다.
        Group savedGroup = groupRepository.save(group);
        addUserToGroup(userId, savedGroup);

        return savedGroup;
    }

    // 그룹 삭제
    @Transactional
    public void delete(Long groupId) {
        List<UserInGroupDetailResponse> users = getGroupUsers(groupId);
        // 연결된 멤버들의 그룹 해제
        for (UserInGroupDetailResponse u : users) {
            leaveGroup(u.getUserId(), groupId);
        }
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new EntityNotFoundException(groupId + "그런 그룹 없는데용?"));
        // 그룹 삭제
        groupRepository.delete(group);
    }


    public void updateGroupImagesCount(Long groupId, Long increase) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new EntityNotFoundException("Group not found with id: " + groupId));

        long updatedCount = group.getGroupTotalImages() + increase;
        group.setGroupTotalImages(updatedCount);

        // 변경 사항을 저장
        groupRepository.save(group);
    }

    // 그룹 업데이트
    public Group update(Long id, GroupCreateDto groupDto) {
        Group existingGroup = groupRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("해당 아이디의 그룹을 찾을 수 없습니다." + id));

        if (existingGroup.getGroupName() != null) existingGroup.setGroupName(groupDto.getGroupName());
        if (existingGroup.getGroupPin() != null) existingGroup.setGroupPin(pinCodeUtil.generatePinCode());
        if (existingGroup.getGroupDescription() != null)
            existingGroup.setGroupDescription(groupDto.getGroupDescription());
        if (existingGroup.getGroupColor() != null) existingGroup.setGroupColor(groupDto.getColor());
        if (existingGroup.getGroupIcon() != null) existingGroup.setGroupIcon(groupDto.getIcon());

        return groupRepository.save(existingGroup);
    }

    // 그룹 상세 조회
    public Group getGroupById(String token, Long groupId) {
        Long userId = jwtUtil.extractUserId(token);
        Group group = groupRepository.findByGroupId(groupId)
                .orElseThrow(() -> new NoSuchElementException("그룹이 없습니다."));
        List<Long> myGroupIds = memberRepository.findByUserUserId(userId)
                .stream().map(member -> member.getGroup().getGroupId()).toList();
        if (groupId.equals(602L)) {
            return group;
        } else if (myGroupIds.contains(groupId)) {
            return group;
        } else {
            throw new ForbiddenAccessException("가입된 그룹이 아닙니다.");
        }

    }

    // groupId에 해당하는 모든 유저
    public List<UserInGroupDetailResponse> getGroupUsers(Long groupId) {
        List<Member> memberships = memberRepository.findByGroupGroupId(groupId);
        return memberships.stream()
                .map(member -> new UserInGroupDetailResponse(member.getUser().getUserId(), member.getUser().getUserName(), member.getUser().getUserImage()))
                .collect(Collectors.toList());
    }

    public boolean isUserInGroup(Long groupId, Long userId) {
        return memberRepository.existsByGroupGroupIdAndUserUserId(groupId, userId);
    }

    @Transactional
    public void joinGroup(Long userId, Long groupId, String pin) {
        if (!isUserInGroup(groupId, userId)) {
            Group group = groupRepository.findById(groupId)
                    .orElseThrow(() -> new IllegalArgumentException("해당하는 그룹이 없습니다" + groupId));

            if (pin.equals(group.getGroupPin())) {
                addUserToGroup(userId, group);
            } else {
                throw new IllegalArgumentException("PIN번호가 일치하지 않습니다.");
            }
        } else {
            throw new IllegalArgumentException("이미 그룹에 속해 있습니다.");
        }

    }

    @Transactional
    public void leaveGroup(Long userId, Long groupId) {
        Member member = memberRepository.findByGroupGroupIdAndUserUserId(groupId, userId)
                .orElseThrow(() -> new EntityNotFoundException("Member not found in group"));

        // 그룹의 멤버 리스트에서 해당 멤버 제거
        Group group = member.getGroup();
        group.getMembers().remove(member);

        // 사용자의 멤버십 리스트에서 해당 멤버 제거
        User user = member.getUser();
        user.getMemberships().remove(member);

        // 멤버 엔티티 삭제
        memberRepository.delete(member);

        // 변경 사항을 영속성 컨텍스트에 반영
        groupRepository.save(group);
        userRepository.save(user);
    }


    private void addUserToGroup(Long userId, Group group) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다." + userId));

        Member member = new Member();
        member.setUser(user);
        member.setGroup(group);
        member.setNickname(user.getUserName());
        member.setJoinDate(LocalDateTime.now());

        memberRepository.save(member);
    }


}
