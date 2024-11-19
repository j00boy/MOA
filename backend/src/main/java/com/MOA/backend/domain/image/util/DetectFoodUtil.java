package com.MOA.backend.domain.image.util;

import com.MOA.backend.domain.image.dto.response.MatchingUrlsDTO;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.ArrayList;
import java.util.List;

@Component
@Slf4j
public class DetectFoodUtil {

    private WebClient webClient;

    @Value("${fast.url}")
    private String fastBaseUrl;

    private final WebClient.Builder webClientBuilder;

    public DetectFoodUtil(WebClient.Builder webClientBuilder) {
        this.webClientBuilder = webClientBuilder;
    }

    @PostConstruct
    private void init() {
        // @PostConstruct 메서드에서 WebClient 초기화
        this.webClient = webClientBuilder.baseUrl(fastBaseUrl).build();
        log.info("FAST API Base URL 설정: {}", fastBaseUrl); // 설정 확인 로그
    }

    // WebClient를 사용할 메서드 정의
    public WebClient getWebClient() {
        return this.webClient;
    }

    //.FastAPI에 group_id와 moment_ids를 보내고 분류된 사진 리스트 받아오기
    public List<String> getDetectedFoodImgsFromFast(Long groupId, List<String> momentIds) {
        MatchingUrlsDTO response = this.webClient.post()
                .uri("/fast/detect_food")
                .header("Content-Type", "application/json")
                .bodyValue(new DetectFoodUtil.FoodDetectionRequest(groupId, momentIds))
                .retrieve()
                .bodyToMono(MatchingUrlsDTO.class)
                .block();

        log.info(response.getMatchingUrls().toString());
        // response가 null이 아니면 matching_urls를 반환, 아니면 빈 리스트 반환
        return response != null ? response.getMatchingUrls() : new ArrayList<>();
    }

    // FoodDetectionRequest를 위한 DTO 클래스
    public static class FoodDetectionRequest {
        private Long group_id;
        private List<String> moment_ids;

        public FoodDetectionRequest(Long group_id, List<String> moment_ids) {
            this.group_id = group_id;
            this.moment_ids = moment_ids;
        }

        public Long getGroup_id() {
            return group_id;
        }

        public void setGroup_id(Long group_id) {
            this.group_id = group_id;
        }

        public List<String> getMoment_ids() {
            return moment_ids;
        }

        public void setMoment_ids(List<String> moment_ids) {
            this.moment_ids = moment_ids;
        }
    }
}
