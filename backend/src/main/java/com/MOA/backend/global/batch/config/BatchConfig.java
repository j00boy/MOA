package com.MOA.backend.global.batch.config;

import com.MOA.backend.domain.moment.entity.DeletedMoment;
import com.MOA.backend.domain.moment.repository.DeletedMomentRepository;
import com.MOA.backend.domain.moment.service.MomentService;
import com.MOA.backend.global.batch.processor.S3ImageDeleterProcessor;
import com.MOA.backend.global.batch.writer.S3ImageDeleterWriter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.Step;
import org.springframework.batch.core.configuration.support.DefaultBatchConfiguration;
import org.springframework.batch.core.job.builder.JobBuilder;
import org.springframework.batch.core.repository.JobRepository;
import org.springframework.batch.core.step.builder.StepBuilder;
import org.springframework.batch.item.data.RepositoryItemReader;
import org.springframework.batch.repeat.RepeatStatus;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.domain.Sort;
import org.springframework.transaction.PlatformTransactionManager;

import java.util.Collections;
import java.util.Date;

@Slf4j
@Configuration
@RequiredArgsConstructor
public class BatchConfig extends DefaultBatchConfiguration {

    private final S3ImageDeleterWriter s3ImageDeleterWriter;
    private final S3ImageDeleterProcessor deletedMomentProcessor;
    private final MomentService momentService;

    // 리포지토리 리더를 별도의 빈으로 정의하여 순환 참조 문제 해결
    private final DeletedMomentRepository deletedMomentRepository;

    @Bean
    public RepositoryItemReader<DeletedMoment> deletedMomentReader() {
        RepositoryItemReader<DeletedMoment> reader = new RepositoryItemReader<>();
        reader.setRepository(deletedMomentRepository);
        reader.setMethodName("findAllByExpiredAtBefore");
        reader.setPageSize(500);  // 청크 크기
        reader.setArguments(Collections.singletonList(new Date()));  // 만료일 인자 설정
        reader.setSort(Collections.singletonMap("expiredAt", Sort.Direction.ASC));  // 정렬 기준 설정
        return reader;
    }

    @Bean
    public Job deleteS3ImagesJob(JobRepository jobRepository, PlatformTransactionManager transactionManager) {
        return new JobBuilder("deleteS3ImagesJob", jobRepository)
                .start(deleteS3ImagesStep(jobRepository, transactionManager))   // 첫 번째: S3 이미지 삭제
                .next(deleteDeletedMomentsStep(jobRepository, transactionManager))  // 두 번째: Document DB 삭제
                .build();
    }

    @Bean
    public Step deleteS3ImagesStep(JobRepository jobRepository, PlatformTransactionManager transactionManager) {
        return new StepBuilder("deleteS3ImagesStep", jobRepository)
                .<DeletedMoment, String>chunk(500, transactionManager)  // 제네릭 타입 명시
                .reader(deletedMomentReader())  // 수정된 부분: 리더 메서드 호출
                .processor(deletedMomentProcessor)
                .writer(s3ImageDeleterWriter)
                .faultTolerant()
                .retry(Exception.class)     // 모든 예외에 대해 재시도
                .retryLimit(3)              // 3번 재시도
                .skip(Exception.class)      // 예외 발생 시 스킵 설정
                .skipLimit(500)             // 최대 500개까지 스킵 허용
                .transactionManager(transactionManager)
                .build();
    }

    @Bean
    public Step deleteDeletedMomentsStep(JobRepository jobRepository, PlatformTransactionManager transactionManager) {
        return new StepBuilder("deleteDeletedMomentStep", jobRepository)
                .tasklet((contribution, chunkContext) -> {
                    // JobParameters에서 기준 시간 가져오기: 시간 동기화
                    Date expiredDate = (Date) chunkContext.getStepContext()
                            .getJobParameters().get("expiredDate");
                    // 만료시간을 기준으로 MongoDB 도큐먼트 삭제
                    Long deletedMomentCount = momentService.deleteDeletedMoment(expiredDate);
                    log.info("<  {} 개의 순간이 삭제가 완료되었습니다.  >", deletedMomentCount);
                    return RepeatStatus.FINISHED;
                }, transactionManager)
                .build();
    }
}
