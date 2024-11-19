package com.MOA.backend.global.filter;

import com.MOA.backend.global.auth.jwt.service.JwtUtil;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        String token = jwtUtil.extractAccessToken(request).orElse(null);
        String path = request.getRequestURI();

        // swagger 관련 전부 열어주기
        if (path.startsWith("/api/swagger-ui") || path.startsWith("/api/v3/api-docs") || path.startsWith("/api/swagger-resources") || path.startsWith("/api/webjars")) {
            filterChain.doFilter(request, response);
            return; // 필터 체인에서 다음 필터로 넘김
        }

        // 로그인 및 refresh관련 전부
        if (path.startsWith("/api/kakao") || path.startsWith("/api/auth/refresh") || path.startsWith("/api/auth/login") || path.startsWith("/api/auth")) {
            filterChain.doFilter(request, response);
            return;
        }


        log.info("@@@@@@@ 필터 시작 @@@@@@@@@@");

        try {
            if (token != null && jwtUtil.verifyToken(token)) {
                Authentication authentication = jwtUtil.getAuthentication(token);
                SecurityContextHolder.getContext().setAuthentication(authentication);
            } else {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.getWriter().write("jwt 토큰이 만료되었거나 문제가 있습니다");
                return;
            }

        } catch (JwtException e) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("토큰에 문제가 있습니다");
            return;
        }

        filterChain.doFilter(request, response);
    }
}
