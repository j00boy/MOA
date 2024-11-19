package com.MOA.backend.global.auth.OAuth2.service;

import com.MOA.backend.global.auth.jwt.service.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthSerivce {

    private final JwtUtil jwtUtil;
    private final RedisTemplate<String, String> redisTemplate;

    public String refreshAccessToken(String refreshToken) {
        String token = refreshToken.replace("Bearer ", "");
        if (!jwtUtil.verifyRefreshToken(token)) {
            throw new IllegalArgumentException("리프레시 토큰에 문제가 있습니다");
        }
        String userId = jwtUtil.extractUserId(token).toString();

        String storedRefreshToken = redisTemplate.opsForValue().get(userId);
        if (!token.equals(storedRefreshToken)) {
            throw new IllegalArgumentException("일치하는 리프레시 토큰이 없습니다");
        }

        return jwtUtil.generateAccessToken(Long.parseLong(userId));

    }

}
