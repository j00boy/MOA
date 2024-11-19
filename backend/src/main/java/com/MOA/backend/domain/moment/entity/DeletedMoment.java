package com.MOA.backend.domain.moment.entity;

import jakarta.persistence.Id;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@Document(collection = "DeletedMoment")
@Getter
@NoArgsConstructor
public class DeletedMoment {

    @Id
    private ObjectId momentId;

    private Long groupId;
    private Date expiredAt;

    @Builder
    public DeletedMoment(ObjectId momentId, Long groupId, Date expiredAt) {
        this.momentId = momentId;
        this.groupId = groupId;
        this.expiredAt = expiredAt;
    }

}
