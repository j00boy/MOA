package com.MOA.backend.global.auth.jwt.service;

import com.MOA.backend.domain.user.entity.User;
import com.MOA.backend.domain.user.service.UserService;
import com.MOA.backend.global.auth.jwt.dto.JwtProperties;
import io.jsonwebtoken.*;
import jakarta.annotation.PostConstruct;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class JwtUtil {

    private final JwtProperties jwtProperties;
    private String secretKey;
    private final UserService userService;
    private final RedisTemplate<String, String> redisTemplate;

    @PostConstruct
    protected void init() {
        secretKey = Base64.getEncoder().encodeToString(jwtProperties.getSecret().getBytes());
    }

    public String generateAccessToken(Long userId) {
        long tokenPeriod = 1000L * 60L * 60L * 6L;
        Claims claims = Jwts.claims();
        claims.put("userId", userId);

        Date now = new Date();
        return Jwts.builder()
                .setClaims(claims)
                .setIssuedAt(now)
                .setExpiration(new Date(now.getTime() + tokenPeriod))
                .signWith(SignatureAlgorithm.HS256, secretKey)
                .compact();
    }

    public String generateRefreshToken(Long userId) {
        Date now = new Date();
        long refreshTokenValidateTime = 7 * 24 * 60 * 60 * 1000L;

        return Jwts.builder()
                .setId(String.valueOf(userId))
                .setIssuedAt(now)
                .setExpiration(new Date(now.getTime() + refreshTokenValidateTime))
                .signWith(SignatureAlgorithm.HS256, secretKey)
                .compact();
    }

    public void storeRefreshToken(Long userId, String refreshToken) {
        Optional<User> user = userService.findByUserId(userId);
        if (user.isPresent()) {
            redisTemplate.opsForValue().set(
                    String.valueOf(userId),
                    refreshToken,
                    7 * 24 * 60 * 60 * 1000L,
                    TimeUnit.MILLISECONDS
            );
        }
    }

    public String remove(String token) {
        return token.replace("Bearer ", "");
    }

    // accessToken 유효성 검증
    public boolean verifyToken(String token) {
        try {
            String pureToken = remove(token);
            Jws<Claims> claims = Jwts.parser()
                    .setSigningKey(secretKey)
                    .parseClaimsJws(pureToken);

            return claims.getBody()
                    .getExpiration()
                    .after(new Date());
        } catch (ExpiredJwtException e) {
            log.error("Token has expired");
            return false;
        } catch (UnsupportedJwtException e) {
            log.error("Unsupported JWT token");
            return false;
        } catch (MalformedJwtException e) {
            log.error("Malformed JWT token");
            return false;
        } catch (SignatureException e) {
            log.error("Invalid JWT signature");
            return false;
        } catch (IllegalArgumentException e) {
            log.error("JWT token compact of handler are invalid");
            return false;
        }
    }

    public boolean verifyRefreshToken(String token) {
        try {
            Jws<Claims> claims = Jwts.parser()
                    .setSigningKey(secretKey)
                    .parseClaimsJws(remove(token));

            return claims.getBody()
                    .getExpiration()
                    .after(new Date());
        } catch (ExpiredJwtException e) {
            log.error("리프레시 토큰 만료");
            return false;
        } catch (JwtException e) {
            log.error("리프레시 토큰에 문제 있는거 같아요");
            return false;
        }
    }


    public Long extractUserId(String token) {
        // 'Bearer ' 접두사 제거
        String pureToken = remove(token);

        if (!verifyToken(pureToken)) {
            throw new MalformedJwtException("JWT Token is not valid.");
        }

        Claims claims = Jwts.parser().setSigningKey(secretKey).parseClaimsJws(pureToken).getBody();
        return claims.get("userId", Long.class);
    }

    public Optional<String> extractAccessToken(HttpServletRequest request) {
        return Optional.ofNullable(request.getHeader("Authorization"));
    }

    public Authentication getAuthentication(String token) {
        Optional<User> user = userService.findByUserId(extractUserId(token));
        List<GrantedAuthority> authorities = Collections.emptyList();
        return new UsernamePasswordAuthenticationToken(user, token, authorities);
    }
}
