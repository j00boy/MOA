package com.MOA.backend.domain.image.util;

import com.drew.imaging.ImageMetadataReader;
import com.drew.metadata.Metadata;
import com.drew.metadata.exif.ExifIFD0Directory;
import lombok.extern.slf4j.Slf4j;
import net.coobird.thumbnailator.Thumbnails;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.geom.AffineTransform;
import java.awt.image.AffineTransformOp;
import java.awt.image.BufferedImage;
import java.io.*;

@Slf4j
public class ThumbnailUtil {

    public static InputStream getThumbnail(MultipartFile multipartFile, double quality) {
        try {
            // 원본 이미지를 BufferedImage로 로드
            BufferedImage originalImage = ImageIO.read(multipartFile.getInputStream());
            // EXIF 데이터를 기반으로 이미지 회전
            BufferedImage rotatedImage = rotateImage(originalImage, multipartFile);

            // 썸네일 생성
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            Thumbnails.of(rotatedImage)
                    .scale(0.6) // 크기 조정
                    .outputQuality(quality) // 품질 설정
                    .outputFormat("jpg")
                    .toOutputStream(outputStream);

            return new ByteArrayInputStream(outputStream.toByteArray());
        } catch (IOException e) {
            throw new RuntimeException("썸네일 이미지 생성 실패 : ", e);
        }
    }

    private static BufferedImage rotateImage(BufferedImage image, MultipartFile multipartFile) {
        File tempFile = null;
        try {
            // MultipartFile을 임시 파일로 변환
            tempFile = File.createTempFile("temp", null);
            multipartFile.transferTo(tempFile);

            // EXIF 메타데이터 읽기
            Metadata metadata = ImageMetadataReader.readMetadata(tempFile);
            ExifIFD0Directory directory = metadata.getDirectory(ExifIFD0Directory.class);

            // EXIF 데이터가 없거나 ORIENTATION 태그가 없는 경우
            if (directory == null || !directory.containsTag(ExifIFD0Directory.TAG_ORIENTATION)) {
                log.info("관련 메타 데이터가 없으니 이미지를 그대로 반환합니다.");
                return image; // EXIF 데이터가 없으면 원본 이미지를 반환
            }

            if (directory.containsTag(ExifIFD0Directory.TAG_ORIENTATION)) {
                int orientation = directory.getInt(ExifIFD0Directory.TAG_ORIENTATION);
                switch (orientation) {
                    case 1: // 정상 (회전 없음)
                        return image;
                    case 2: // 좌우 반전
                        return flipHorizontally(image);
                    case 3: // 180도 회전
                        return Thumbnails.of(image).scale(1.0).rotate(180).asBufferedImage();
                    case 4: // 상하 반전
                        return flipVertically(image);
                    case 5: // 시계방향 90도 회전 후 좌우 반전
                        BufferedImage rotated90 = Thumbnails.of(image).scale(1.0).rotate(90).asBufferedImage();
                        return flipHorizontally(rotated90);
                    case 6: // 시계방향 90도 회전
                        return Thumbnails.of(image).scale(1.0).rotate(90).asBufferedImage();
                    case 7: // 반시계방향 90도 회전 후 좌우 반전
                        BufferedImage rotated270 = Thumbnails.of(image).scale(1.0).rotate(270).asBufferedImage();
                        return flipHorizontally(rotated270);
                    case 8: // 반시계방향 90도 회전
                        return Thumbnails.of(image).scale(1.0).rotate(270).asBufferedImage();
                    default:
                        return image;
                }
            }
        } catch (Exception e) {
            log.warn("EXIF 데이터를 읽는 중 오류 발생: 이미지가 회전되지 않았습니다.", e);
        } finally {
            // 임시 파일 삭제
            if (tempFile != null && tempFile.exists()) {
                tempFile.delete();
            }
        }
        return image;
    }

    // 좌우 반전
    private static BufferedImage flipHorizontally(BufferedImage image) {
        AffineTransform tx = AffineTransform.getScaleInstance(-1, 1);
        tx.translate(-image.getWidth(), 0);
        AffineTransformOp op = new AffineTransformOp(tx, AffineTransformOp.TYPE_NEAREST_NEIGHBOR);
        return op.filter(image, null);
    }

    // 상하 반전
    private static BufferedImage flipVertically(BufferedImage image) {
        AffineTransform tx = AffineTransform.getScaleInstance(1, -1);
        tx.translate(0, -image.getHeight());
        AffineTransformOp op = new AffineTransformOp(tx, AffineTransformOp.TYPE_NEAREST_NEIGHBOR);
        return op.filter(image, null);
    }
}
