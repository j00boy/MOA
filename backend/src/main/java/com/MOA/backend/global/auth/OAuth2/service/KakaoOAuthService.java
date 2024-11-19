package com.MOA.backend.global.auth.OAuth2.service;

import com.MOA.backend.domain.user.entity.User;
import com.MOA.backend.domain.user.repository.UserRepository;
import com.MOA.backend.domain.user.service.UserService;
import com.MOA.backend.global.auth.jwt.service.JwtUtil;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;
import java.util.Optional;

@Service
@AllArgsConstructor
public class KakaoOAuthService {

    private final UserRepository userRepository;
    private final UserService userService;
    private final JwtUtil jwtUtil;
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Transactional
    public User processUser(String accessToken) {
        String userInfoEndpointUri = "https://kapi.kakao.com/v2/user/me";

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);
        HttpEntity<String> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    userInfoEndpointUri,
                    HttpMethod.GET,
                    entity,
                    String.class
            );
            Map<String, Object> userInfo = objectMapper.readValue(response.getBody(), Map.class);

            Map<String, Object> kakaoAccount = (Map<String, Object>) userInfo.get("kakao_account");

            if (kakaoAccount == null) {
                throw new RuntimeException("Kakao 계정 정보가 없습니다. 응답");
            }

            String email = (String) kakaoAccount.get("email");
            if (email == null) {
                throw new RuntimeException("사용자의 이메일 정보가 없습니다.");
            }

            Optional<User> optionalUser = userService.findByUserEmail(email);
            User user;

            if (optionalUser.isPresent()) {
                return optionalUser.get();
            } else {
                Map<String, Object> profile = (Map<String, Object>) kakaoAccount.get("profile");
                String nickname = (profile != null) ? (String) profile.get("nickname") : "Unknown";
                String image = (profile != null) ? (String) profile.get("thumbnail_image_url") : null;

                user = new User(nickname, email, image);
                return userRepository.save(user);
            }

        } catch (Exception e) {
            throw new RuntimeException("유저 프로필을 불러오는 것에 실패했습니다. 상세 오류: " + e.getMessage(), e);
        }
    }


}
