package com.MOA.backend.global.auth.OAuth2.controller;

import com.MOA.backend.domain.user.entity.User;
import com.MOA.backend.global.auth.OAuth2.service.KakaoOAuthService;
import com.MOA.backend.global.auth.jwt.service.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/kakao")
@RequiredArgsConstructor
public class KakaoOAuthController {
    private final KakaoOAuthService kakaoOAuthService;
    private final JwtUtil jwtUtil;

    @PostMapping
    public ResponseEntity<Map<String, String>> kakaoLogin(@RequestHeader("Authorization") String accessToken) {
        String token = accessToken.replace("Bearer ", "");
        User user = kakaoOAuthService.processUser(token);

        String jwtToken = jwtUtil.generateAccessToken(user.getUserId());
        String refreshToken = jwtUtil.generateRefreshToken(user.getUserId());

        jwtUtil.storeRefreshToken(user.getUserId(), refreshToken);

        Map<String, String> responseBody = new HashMap<>();
        responseBody.put("accessToken", jwtToken);
        responseBody.put("refreshToken", refreshToken);

        return ResponseEntity.ok(responseBody);
    }

}
