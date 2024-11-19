package com.MOA.backend.domain.group.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UserInGroupDetailResponse {
    private Long userId;
    private String nickname;
    private String imageSrc;
}
