package com.MOA.backend.global.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;

@Slf4j
@Configuration
public class FCMConfig {

    @Value("${spring.fcm.key.path}")
    private String SERVICE_ACCOUNT_JSON;

    @PostConstruct
    public void init() {
        try (InputStream serviceAccount = getServiceAccountStream()) {
            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                    .build();

            FirebaseApp.initializeApp(options);
            log.info("파이어베이스 서버와의 연결에 성공했습니다.");
        } catch (IOException e) {
            log.error("파이어베이스 서버와의 연결에 실패했습니다. 환경 변수 또는 기본 경로에서 인증 파일을 확인하세요.", e);
        }
    }


    private InputStream getServiceAccountStream() throws IOException {
        String serviceAccountPath = SERVICE_ACCOUNT_JSON;

        if (serviceAccountPath != null && !serviceAccountPath.isEmpty()) {
            log.info("환경 변수로 지정된 Firebase 인증 파일 경로: {}", serviceAccountPath);
            return new FileInputStream(serviceAccountPath);
        } else {
            // 환경 변수가 없을 경우 기본 경로 사용
            String defaultPath = "/home/ubuntu/config/firebase-adminsdk.json";
            log.warn("환경 변수가 설정되지 않았습니다. 기본 경로를 사용합니다: {}", defaultPath);

            if (new File(defaultPath).exists()) {
                return new FileInputStream(defaultPath);
            } else {
                throw new IOException("Firebase 인증 파일을 찾을 수 없습니다: " + defaultPath);
            }
        }
    }


}
