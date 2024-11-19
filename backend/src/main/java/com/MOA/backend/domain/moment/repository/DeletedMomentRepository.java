package com.MOA.backend.domain.moment.repository;

import com.MOA.backend.domain.moment.entity.DeletedMoment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Date;

@Repository("mongoDeletedMomentRepository")
public interface DeletedMomentRepository extends MongoRepository<DeletedMoment, String> {

    /**
     * 현재 시간 이전의 expiredAt에 해당하는 도큐먼트를 페이지 단위로 조회
     * @param currentDate
     * @param pageable
     * @return
     */
    Page<DeletedMoment> findAllByExpiredAtBefore(Date currentDate, Pageable pageable);

    /**
     * 현재 시간 이전의 expiredAt에 해당하는 도큐먼트 삭제
     * @param currentDate
     * @return
     */
    Long deleteByExpiredAtBefore(Date currentDate);
}
