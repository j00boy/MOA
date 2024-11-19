package com.MOA.backend.domain.member.dto.response;

import lombok.*;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MemberInfoResponseDto {
    private Long userId;
    private String nickname;
    private String imageSrc;
}
