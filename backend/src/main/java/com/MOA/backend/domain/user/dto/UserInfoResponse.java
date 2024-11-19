package com.MOA.backend.domain.user.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class UserInfoResponse {
    private Long userId;
    private String userName;
    private String userImage;
    private String role;
    private String deviceToken;
    // AI 등록 이미지 url
    private String registerImage;
}
