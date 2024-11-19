package com.MOA.backend.domain.group.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class GroupCreateDto {
    private String groupName;
    private String groupDescription;
    private String color;
    private String icon;
}
