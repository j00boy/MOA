package com.MOA.backend.domain.user.dto;

import lombok.Builder;
import lombok.Getter;
import org.springframework.web.multipart.MultipartFile;

@Getter
@Builder
public class UserUpdateRequestDto {
    private String nickname;
    private MultipartFile image;
}
