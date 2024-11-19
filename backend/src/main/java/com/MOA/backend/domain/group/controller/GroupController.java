package com.MOA.backend.domain.group.controller;

import com.MOA.backend.domain.group.dto.request.GroupCreateDto;
import com.MOA.backend.domain.group.dto.response.GroupDetailsResponse;
import com.MOA.backend.domain.group.dto.response.GroupOwnerResponse;
import com.MOA.backend.domain.group.dto.response.UserInGroupDetailResponse;
import com.MOA.backend.domain.group.entity.Group;
import com.MOA.backend.domain.group.service.GroupService;
import com.MOA.backend.domain.image.service.S3Service;
import com.MOA.backend.domain.member.dto.response.MemberResponseDto;
import com.MOA.backend.domain.member.service.MemberService;
import com.MOA.backend.domain.moment.service.MomentService;
import com.MOA.backend.domain.moment.util.PinCodeUtil;
import com.MOA.backend.domain.notification.service.FCMService;
import com.MOA.backend.domain.user.service.UserService;
import com.MOA.backend.global.auth.jwt.service.JwtUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.List;
import java.util.Map;

@Tag(name = "Group", description = "유저 관련 API")
@RestController
@RequiredArgsConstructor
@RequestMapping("/group")
public class GroupController {

    private final GroupService groupService;
    private final UserService userService;
    private final JwtUtil jwtUtil;
    private final MomentService momentService;
    private final S3Service s3Service;
    private final MemberService memberService;
    private final FCMService fcmService;
    private final PinCodeUtil pinCodeUtil;

    @Operation(summary = "그룹 생성", description = "JWT 토큰을 통해 새로운 그룹을 생성합니다.")
    @PostMapping
    public ResponseEntity<Group> createGroup(
            @Parameter(description = "JWT 토큰", required = true) @RequestHeader("Authorization") String token,
            @RequestBody GroupCreateDto groupDto) {
        Long userId = jwtUtil.extractUserId(token);
        Group createdGroup = groupService.create(userId, groupDto);
        createdGroup.setGroupPin(pinCodeUtil.generatePinCode());
        fcmService.subscribeToGroups(userService.findByUserId(userId).get().getDeviceToken(), createdGroup.getGroupId());
        return ResponseEntity.ok(createdGroup);
    }

    @Operation(summary = "그룹 상세 조회", description = "그룹 ID를 통해 특정 그룹의 상세 정보를 조회합니다.")
    @GetMapping("/{groupId}")
    public ResponseEntity<?> getGroupDetails(
            @RequestHeader("Authorization") String token,
            @Parameter(description = "그룹 ID", required = true) @PathVariable(name = "groupId") Long groupId) {
        Group group = groupService.getGroupById(token, groupId);
        long groupOwnerId = group.getGroupOwnerId();
        GroupOwnerResponse groupOwnerResponse = new GroupOwnerResponse(groupOwnerId, userService.findByUserId(groupOwnerId).get().getUserName(), userService.findByUserId(groupOwnerId).get().getUserImage());
        List<UserInGroupDetailResponse> users = groupService.getGroupUsers(groupId);
        Map<String, Map<String, List<String>>> imagesInGroup =
                s3Service.getImagesInGroup(groupId, momentService.getMomentIds(groupId));
        Map<String, Date> momentExpireDate = momentService.getMomentExpireDate(momentService.getMomentIds(groupId));

        return ResponseEntity.ok().body(GroupDetailsResponse.builder()
                .group(group)
                .groupOwner(groupOwnerResponse)
                .users(users)
                .images(imagesInGroup)
                .expiredAt(momentExpireDate)
                .build());
    }

    @Operation(summary = "그룹 수정", description = "그룹 ID를 통해 특정 그룹의 정보를 수정합니다.")
    @PutMapping("/{id}")
    public ResponseEntity<Group> updateGroup(
            @Parameter(description = "그룹 ID", required = true) @PathVariable long id,
            @RequestBody GroupCreateDto groupDto) {
        Group updatedGroup = groupService.update(id, groupDto);
        return ResponseEntity.ok(updatedGroup);
    }

    @Operation(summary = "그룹 삭제", description = "그룹 ID를 통해 특정 그룹을 삭제합니다.")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGroup(
            @Parameter(description = "그룹 ID", required = true) @PathVariable Long id) {
        groupService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "그룹 나가기", description = "JWT 토큰을 통해 사용자가 특정 그룹에서 나갑니다.")
    @DeleteMapping("/{id}/leave")
    public ResponseEntity<Void> leaveGroup(
            @Parameter(description = "JWT 토큰", required = true) @RequestHeader("Authorization") String token,
            @Parameter(description = "그룹 ID", required = true) @PathVariable Long id) {
        Long userId = jwtUtil.extractUserId(token);
        groupService.leaveGroup(userId, id);
        fcmService.unsubscribeFromGroups(userService.findByUserId(userId).get().getDeviceToken(), id);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "그룹 가입", description = "JWT 토큰을 통해 사용자가 특정 그룹에 가입합니다.")
    @PostMapping("{id}/join")
    public ResponseEntity<String> joinGroup(
            @Parameter(description = "JWT 토큰", required = true) @RequestHeader("Authorization") String token,
            @Parameter(description = "그룹 ID", required = true) @PathVariable Long id,
            @RequestParam(name = "PIN") String pin) {
        try {
            Long userId = jwtUtil.extractUserId(token);
            groupService.joinGroup(userId, id, pin);
            fcmService.subscribeToGroups(userService.findByUserId(userId).get().getDeviceToken(), id);
            return ResponseEntity.ok("그룹에 가입되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("이미 가입된 그룹이거나, PIN번호가 잘못되었습니다.");
        }
    }

    @PatchMapping("/{groupId}")
    public ResponseEntity<MemberResponseDto> modifyMemberNickname(
            @RequestHeader("Authorization") String token,
            @RequestParam(name = "nickname") String nickname) {
        return ResponseEntity.ok(memberService.modifyMemberNickname(jwtUtil.extractUserId(token), nickname));
    }
}
