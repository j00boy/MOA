package com.MOA.backend.domain.notification.controller;

import com.MOA.backend.domain.notification.service.FCMService;
import com.MOA.backend.domain.user.service.UserService;
import com.MOA.backend.global.auth.jwt.service.JwtUtil;
import com.fasterxml.jackson.core.JsonProcessingException;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

@Slf4j
@RestController
@AllArgsConstructor
@RequestMapping("/alarm")
public class FCMController {

    private final FCMService fcmService;
    private final JwtUtil jwtUtil;
    private final UserService userService;

    @PostMapping
    public Mono<ResponseEntity<Integer>> pushFcmMessageToGroup(@RequestHeader("Authorization") String jwtToken, @RequestBody Long groupId) throws JsonProcessingException {
        log.debug("[+] 푸시 메세지를 전송합니다.");
        Long userId = jwtUtil.extractUserId(jwtToken);
        return fcmService.sendMessageToGroup(userId, groupId)
                .map(result -> new ResponseEntity<>(result, HttpStatus.OK))
                .doOnError(e -> log.error("푸시 메세지 전송 중 에러 발생: {}", e.getMessage()))
                .onErrorResume(e -> Mono.just(new ResponseEntity<>(0, HttpStatus.INTERNAL_SERVER_ERROR)));
    }
}
