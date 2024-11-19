package com.MOA.backend.domain.moment.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.util.Date;

@Builder
@Getter
public class MomentResponseDto {
    private String momentId;
    private String momentTitle;
    private String momentDescription;
    private String momentOwner;
    private Date createdAt;
}
