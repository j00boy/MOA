package com.MOA.backend.global.batch.scheduler;

import org.springframework.batch.core.JobParameters;

public interface BatchScheduler {
    void runJob(String jobName, JobParameters jobParameters);
}
