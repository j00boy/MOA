package com.MOA.backend.domain.moment.entity;

import com.MOA.backend.domain.moment.dto.request.MomentUpdateRequestDto;
import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Document(collection = "moment")
@Getter
@NoArgsConstructor
public class Moment {

    @Id // MongoDB에서 자동으로 생성하는 ID
    private ObjectId id;

    private Long groupId;
    private String momentPin;
    private List<Long> userIds;
    private String momentName;
    private String momentDescription;
    private String momentOwner;
    private String momentOwnerEmail;
    private String uploadOption;

    private Date createdAt;
    private Date updatedAt;

    @Builder
    public Moment(Long groupId, String momentPin, List<Long> userIds, String momentName, String momentDescription,
                  String momentOwner, String momentOwnerEmail, String uploadOption) {
        this.groupId = groupId;
        this.momentPin = momentPin;
        this.userIds = userIds == null ? new ArrayList<>() : userIds;
        this.momentName = momentName;
        this.momentDescription = momentDescription;
        this.momentOwner = momentOwner;
        this.uploadOption = uploadOption;
        this.momentOwnerEmail = momentOwnerEmail;
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }

    // Moment 내용을 수정할 때에는 updatedAt 수정 O
    public void update(MomentUpdateRequestDto momentUpdateRequestDto) {
        this.momentName = momentUpdateRequestDto.getMomentName();
        this.momentDescription = momentUpdateRequestDto.getMomentDescription();
        this.updatedAt = new Date();
    }

    // 순간에 참여하는 유저 정보를 변경할 때에는 updatedAt 반영 X
    public void update(List<Long> userIds) {
        this.userIds = userIds;
    }

    // 유저가 마이페이지에서 닉네임 변경 시 내가 만든 순간 (momentOwner)도 바꿔주기
    public void update(String momentOwner) {
        this.momentOwner = momentOwner;
    }
}
