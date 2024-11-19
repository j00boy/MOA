package com.MOA.backend.domain.moment.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class MomentUpdateResponseDto {
    private String momentId;
    private String message;
    private String PIN;
}
