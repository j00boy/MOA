package com.MOA.backend.domain.user.dto;

import com.MOA.backend.domain.user.entity.User;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UserResponse {
    private User user;
    private String userProfileImage;
}
