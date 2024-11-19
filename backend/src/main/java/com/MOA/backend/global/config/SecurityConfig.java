package com.MOA.backend.global.config;

import com.MOA.backend.global.auth.jwt.service.JwtUtil;
import com.MOA.backend.global.filter.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtUtil jwtUtil;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .httpBasic(AbstractHttpConfigurer::disable) // HTTP 기본 인증 비활성화
                .cors(AbstractHttpConfigurer::disable)
                .csrf(AbstractHttpConfigurer::disable) // CSRF 보호 기능 비활성화
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
//                                "/api/auth/refresh",
//                                "/api/kakao",
//                                "/api/swagger-ui/**",
//                                "/api/v3/api-docs/**"
                                "**"
                        ).permitAll()
                        .anyRequest().authenticated() // 그 외 모든 요청은 인증 필요
                );
        http.addFilterBefore( new JwtAuthenticationFilter(jwtUtil), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}

