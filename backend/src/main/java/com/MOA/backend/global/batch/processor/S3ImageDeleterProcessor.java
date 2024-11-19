package com.MOA.backend.global.batch.processor;

import com.MOA.backend.domain.moment.entity.DeletedMoment;
import org.springframework.batch.item.ItemProcessor;
import org.springframework.stereotype.Component;

@Component
public class S3ImageDeleterProcessor implements ItemProcessor<DeletedMoment, String> {

    @Override
    public String process(DeletedMoment deletedMoment) {
        // S3 경로 추출
        return "group/" + deletedMoment.getGroupId() + "/moment/" + deletedMoment.getMomentId() + "/";
    }
}