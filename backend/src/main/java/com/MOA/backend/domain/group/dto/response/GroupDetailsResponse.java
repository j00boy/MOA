package com.MOA.backend.domain.group.dto.response;

import com.MOA.backend.domain.group.entity.Group;
import lombok.Builder;
import lombok.Getter;

import java.util.*;

@Getter
public class GroupDetailsResponse {
    private Group group;
    private GroupOwnerResponse groupOwner;
    private List<UserInGroupDetailResponse> users;
    private Map<String, Map<String, List<String>>> images;
    private Map<String, Date> expiredAt;

    @Builder
    public GroupDetailsResponse(Group group, GroupOwnerResponse groupOwner, List<UserInGroupDetailResponse> users,
                                Map<String, Map<String, List<String>>> images, Map<String, Date> expiredAt) {
        this.group = group;
        this.groupOwner = groupOwner;
        this.users = users.isEmpty() ? new ArrayList<>() : users;
        this.images = images.isEmpty() ? new HashMap<>() : images;
        this.expiredAt = expiredAt.isEmpty() ? new HashMap<>() : expiredAt;
    }
}
