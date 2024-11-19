package com.MOA.backend.domain.moment.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Set;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class MomentRedisService {

    private final RedisTemplate<String, String> redisTemplate;
    private final String USER_PREFIX = "user:";
    private final String MOMENT_PREFIX = "moment:";

    // 순간 참여
    public void participateMoment(Long userId, String momentId) {
        String key = USER_PREFIX + userId + ":" + MOMENT_PREFIX + momentId;
        redisTemplate.opsForSet().add(key, momentId);
        redisTemplate.expire(key, 86400, TimeUnit.SECONDS);       // 배포용
//        redisTemplate.expire(key, 300, TimeUnit.SECONDS);   // 테스트용
    }

    // 내가 참여한 순간 조회
    public Set<String> getMyMoments(Long userId) {
        String pattern = USER_PREFIX + userId + ":" + MOMENT_PREFIX + "*";

        Set<String> keys = (redisTemplate.keys(pattern) != null && !redisTemplate.keys(pattern).isEmpty()) ?
                redisTemplate.keys(pattern) : new HashSet<>();
        log.info("keys: {}", keys);

        if(keys.isEmpty()) {
            return new HashSet<>();
        }

        // 1단계 검증: Redis에서 TTL 살아 있는 참여 방 번호만 가져오기
        Set<String> momentIds = new HashSet<>();
        for (String key : keys) {
            String[] arr = key.split(":");
            momentIds.add(arr[arr.length - 1]);
        }

        return momentIds;
    }

    // 해당 방번호로 된 매핑관계 전부 삭제
    public void deleteMomentParticipation(String momentId) {
        Set<String> keys = redisTemplate.keys(USER_PREFIX + "*:" + MOMENT_PREFIX + momentId);
        if(keys != null && !keys.isEmpty()) {
            redisTemplate.delete(keys);
        }
    }

    // 로그인 유저가 해당 순간을 퇴장
    public void exitMoment(Long userId, String momentId) {
        String key = USER_PREFIX + userId + ":" + MOMENT_PREFIX + momentId;

        if(Boolean.TRUE.equals(redisTemplate.hasKey(key))) {
            redisTemplate.delete(key);
        }
    }

}
