package com.MOA.backend.domain.moment.repository;

import com.MOA.backend.domain.moment.entity.Moment;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Set;


@Repository("mongoMomentRepository")
public interface MomentRepository extends MongoRepository<Moment, String> {

    /**
     * momentIds로 Moment들을 조회
     * @param momentIds
     * @return
     */
    List<Moment> findAllByIdInOrderByCreatedAtAsc(Set<ObjectId> momentIds);

    List<Moment> findAllByGroupIdOrderByCreatedAtAsc(Long groupId);

    List<Moment> findAllByMomentOwner(String momentOwner);
}
