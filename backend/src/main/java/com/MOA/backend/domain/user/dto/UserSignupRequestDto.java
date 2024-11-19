package com.MOA.backend.domain.user.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.ToString;

@Data
@ToString
@AllArgsConstructor
public class UserSignupRequestDto {
    private String email;
    private String nickname;
    private String profile;
}
