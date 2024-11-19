package com.MOA.backend.domain.user.controller;

import com.MOA.backend.domain.group.dto.response.GroupsReponse;
import com.MOA.backend.domain.image.service.S3Service;
import com.MOA.backend.domain.user.dto.DeviceTokenRequest;
import com.MOA.backend.domain.user.dto.UserInfoResponse;
import com.MOA.backend.domain.user.entity.User;
import com.MOA.backend.domain.user.service.UserService;
import com.MOA.backend.global.auth.jwt.service.JwtUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Tag(name = "User", description = "유저 관련 API")
@RestController
@AllArgsConstructor
@RequestMapping("/user")
@Slf4j
public class UserController {

    private final UserService userService;
    private final S3Service s3Service;
    private final JwtUtil jwtUtil;

    @Operation(summary = "유저 정보 수정", description = "JWT 토큰을 통해 유저 정보를 수정합니다.")
    @PutMapping
    public ResponseEntity<User> updateUser(
            @Parameter(description = "JWT 토큰", required = true)
            @RequestHeader("Authorization") String token,
            @RequestParam(name = "nickname") String nickname,
            @RequestPart(name = "image", required = false) MultipartFile image) {
        User updatedUser;
        if (image == null || image.isEmpty()) {
            updatedUser = userService.updateUser(jwtUtil.extractUserId(token), nickname);
        } else {
            String imageUrl = s3Service.uploadUserImg(token, image);
            updatedUser = userService.updateUser(jwtUtil.extractUserId(token), nickname, imageUrl);
        }
        return ResponseEntity.ok(updatedUser);
    }

    @Operation(summary = "유저 정보 상세조회", description = "JWT 토큰을 통해 유저 정보를 조회합니다.")
    @GetMapping
    public ResponseEntity<UserInfoResponse> getUserById(
            @Parameter(description = "JWT 토큰", required = true)
            @RequestHeader("Authorization") String token) {

        UserInfoResponse userInfo = userService.getUserInfo(jwtUtil.extractUserId(token));
        return ResponseEntity.ok(userInfo);
    }

    @Operation(summary = "유저가 포함된 그룹들 조회", description = "유저가 속한 그룹 목록을 조회합니다.")
    @GetMapping("/groups")
    public List<GroupsReponse> getMyGroups(
            @Parameter(description = "JWT 토큰", required = true)
            @RequestHeader("Authorization") String token) {
        return userService.getUserGroups(jwtUtil.extractUserId(token));
    }

    @PutMapping("/device-token")
    public ResponseEntity<?> updateDeviceToken(@RequestHeader("Authorization") String jwtToken, @RequestBody DeviceTokenRequest deviceTokenRequest) {
        userService.updateDeviceToken(jwtUtil.extractUserId(jwtToken), deviceTokenRequest.getDeviceToken());
        log.info("@@@@@@@@@@@@여기가 디바이스토큰이야" + deviceTokenRequest.getDeviceToken());
        return ResponseEntity.ok("디바이스 토큰이 등록되었습니다.");
    }
}
