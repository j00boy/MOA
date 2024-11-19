package com.MOA.backend.domain.group.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class GroupOwnerResponse {
    //userId, nickname, imageSrc
    private long userId;
    private String nickName;
    private String imageSrc;
}
