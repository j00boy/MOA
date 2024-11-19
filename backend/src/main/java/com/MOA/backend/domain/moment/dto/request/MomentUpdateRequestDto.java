package com.MOA.backend.domain.moment.dto.request;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class MomentUpdateRequestDto {
    private String momentName;
    private String momentDescription;
}
