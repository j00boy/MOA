package com.MOA.backend.domain.moment.dto.response;

import com.MOA.backend.domain.member.dto.response.MemberInfoResponseDto;
import lombok.Builder;
import lombok.Getter;

import java.util.Date;
import java.util.List;
import java.util.Map;

@Builder
@Getter
public class MomentDetailResponseDto {
    private String id;
    private Long groupId;
    private String momentPin;
    private List<MemberInfoResponseDto> members;
    private String momentName;
    private String momentDescription;
    private MemberInfoResponseDto momentOwner;
    private Map<String, List<String>> images;
    private String uploadOption;
    private Date createdAt;
}
