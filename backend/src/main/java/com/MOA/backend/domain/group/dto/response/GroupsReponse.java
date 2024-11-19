package com.MOA.backend.domain.group.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class GroupsReponse {
    private Long groupId;
    private String groupName;
    private String groupColor;
    private String groupIcon;
    private Long groupTotalImages;
    private Long memberCount;

}
