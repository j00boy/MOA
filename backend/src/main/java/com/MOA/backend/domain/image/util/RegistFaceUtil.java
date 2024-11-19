package com.MOA.backend.domain.image.util;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

@Component
@Slf4j
public class RegistFaceUtil {

    private WebClient webClient;

    @Value("${fast.url}")
    private String fastBaseUrl;

    private final WebClient.Builder webClientBuilder;

    public RegistFaceUtil(WebClient.Builder webClientBuilder) {
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


    //.FastAPI에 등록한 얼굴의 S3 URL을 보내고, BLOB 데이터(바이너리 데이터)를 받아오기
    public String GetFaceEmbeddingFromFast(String imgUrl) {
        return this.webClient.post()
                // fast로 보내는 url
                .uri("/fast/regist_face")
                // json으로 body에 담아서 url 전송
                .bodyValue(new ImageRequest(imgUrl))
                // fastAPI 응답 가져오는 메소드
                .retrieve()
                // 응답 데이터를 바이너리 배열(byte[])로 변환하고,
                // block() 메서드를 사용하여 비동기 응답을 동기 방식으로 처리해 최종적으로 바이너리 데이터를 반환
                .bodyToMono(String.class)
                .block();  // 동기 방식으로 처리

    }

    // 이미지 URL을 FastAPI로 보내기 위한 DTO
    public static class ImageRequest {
        @JsonProperty("image_url")
        private String image_url;

        public ImageRequest(String image_url) {
            this.image_url = image_url;
        }

        public String getImage_url() {
            return image_url;
        }

        public void setImage_url(String image_url) {
            this.image_url = image_url;
        }
    }

}
