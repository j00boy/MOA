package com.MOA.backend.global.batch.scheduler;

import lombok.RequiredArgsConstructor;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.JobParameters;
import org.springframework.batch.core.JobParametersBuilder;
import org.springframework.batch.core.configuration.JobRegistry;
import org.springframework.batch.core.configuration.support.JobRegistryBeanPostProcessor;
import org.springframework.batch.core.launch.JobLauncher;
import org.springframework.batch.core.launch.NoSuchJobException;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import java.util.Date;

@Component
@RequiredArgsConstructor
public class BatchSchedulerImpl implements BatchScheduler {

    private final JobLauncher jobLauncher;
    private final JobRegistry jobRegistry;

    @Bean
    public JobRegistryBeanPostProcessor jobRegistryBeanPostProcessor() {
        JobRegistryBeanPostProcessor jobProcessor = new JobRegistryBeanPostProcessor();
        jobProcessor.setJobRegistry(jobRegistry);
        return jobProcessor;
    }

    @Override
    public void runJob(String jobName, JobParameters jobParameters) {
        try {
            Job job = jobRegistry.getJob(jobName);
            jobLauncher.run(job, jobParameters);
        } catch (NoSuchJobException e) {
            throw new RuntimeException("존재하지 않는 Job입니다: " + jobName, e);
        } catch (Exception e) {
            throw new RuntimeException("Batch 실행 중 오류가 발생했습니다.", e);
        }
    }

    @Scheduled(cron = "0 0 3 * * *")
    public void runScheduledJob() {
        Date expiredDate = new Date();
        JobParameters jobParameters = new JobParametersBuilder()
                .addDate("expiredDate", expiredDate)
                .toJobParameters();
        runJob("deleteS3ImagesJob", jobParameters);
    }
}
