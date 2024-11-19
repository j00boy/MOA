package com.MOA.backend.global.batch.writer;

import lombok.RequiredArgsConstructor;
import org.springframework.batch.item.Chunk;
import org.springframework.batch.item.ItemWriter;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.ListObjectsV2Request;
import com.amazonaws.services.s3.model.ListObjectsV2Result;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class S3ImageDeleterWriter implements ItemWriter<String> {

    private final AmazonS3 amazonS3;

    @Value("${cloud.s3.bucket}")
    private String bucket;

    @Override
    public void write(Chunk<? extends String> chunk) throws Exception {
        for (String prefix : chunk) {
            ListObjectsV2Request req = new ListObjectsV2Request().withBucketName(bucket).withPrefix(prefix);
            ListObjectsV2Result result;
            do {
                result = amazonS3.listObjectsV2(req);
                result.getObjectSummaries().forEach(s -> amazonS3.deleteObject(bucket, s.getKey()));
                req.setContinuationToken(result.getNextContinuationToken());
            } while (result.isTruncated());
        }
    }
}