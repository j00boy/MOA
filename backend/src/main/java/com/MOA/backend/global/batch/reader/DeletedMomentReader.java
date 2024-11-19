package com.MOA.backend.global.batch.reader;

import com.MOA.backend.domain.moment.repository.DeletedMomentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DeletedMomentReader {
    private final DeletedMomentRepository deletedMomentRepository;
}
