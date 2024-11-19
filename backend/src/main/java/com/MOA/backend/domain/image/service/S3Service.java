package com.MOA.backend.domain.image.service;

import com.MOA.backend.domain.image.dto.FaceEmbeddingDTO;
import com.MOA.backend.domain.image.util.CompareFaceUtil;
import com.MOA.backend.domain.image.util.DetectFoodUtil;
import com.MOA.backend.domain.image.util.RegistFaceUtil;
import com.MOA.backend.domain.image.util.ThumbnailUtil;
import com.MOA.backend.domain.moment.entity.Moment;
import com.MOA.backend.domain.moment.service.MomentService;
import com.MOA.backend.domain.user.entity.User;
import com.MOA.backend.domain.user.repository.UserRepository;
import com.MOA.backend.domain.user.service.UserService;
import com.MOA.backend.global.auth.jwt.service.JwtUtil;
import com.amazonaws.AmazonServiceException;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import software.amazon.awssdk.core.exception.SdkClientException;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.*;
import java.util.concurrent.CompletableFuture;

@Service
@RequiredArgsConstructor
@Slf4j
public class S3Service {

    private static final List<String> ALLOWED_EXTENSIONS = List.of(
            ".jpg", ".jpeg", ".png", ".webp", ".svg", ".heic", ".bmp", ".tiff", ".tif", ".jfif"
    );

    private final UserService userService;
    private final MomentService momentService;
    private final AmazonS3 amazonS3;
    private final JwtUtil jwtUtil;
    private final RegistFaceUtil registFaceUtil;
    private final CompareFaceUtil compareFaceUtil;
    private final DetectFoodUtil detectFoodUtil;
    private final UserRepository userRepository;

    @Value("${cloud.s3.bucket}")
    private String bucket;

    // 이미지 업로드
    public List<String> uploadImages(String token, String momentId, List<MultipartFile> images) {
        Moment moment = momentService.getMomentEntity(momentId);
        Long groupId = moment.getGroupId();

        List<String> imageUrls = new ArrayList<>();

        // 1. 썸네일 이미지를 먼저 업로드하여 클라이언트에 응답
        images.forEach(image -> {
            if (image.isEmpty()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "빈 파일은 업로드할 수 없습니다.");
            }

            String imageName = createImageName(image.getOriginalFilename());
            String thumbnailPath = createThumbnailImagePath(groupId, momentId);
            String originalImagePath = createOriginalImagePath(groupId, momentId);

            // 썸네일 이미지 업로드 및 URL 추가
            uploadOriginalImage(image, originalImagePath + imageName);

            uploadThumbnailImage(image, thumbnailPath + imageName);
            imageUrls.add(amazonS3.getUrl(bucket, thumbnailPath + imageName).toString());
        });

        Long userId = jwtUtil.extractUserId(token);
        Optional<User> optionalUser = userService.findByUserId(userId);
        if (optionalUser.isPresent()) {
            User user = optionalUser.get();
            user.updateUploadCount((long) imageUrls.size());
            userRepository.save(user);
        }

        return imageUrls;
    }

    // 원본 파일 경로 생성
    // https://moa-s3-bucket.s3.amazonaws.com/group/{groupId}/moment/{momentId}/{imageName}
    public String createOriginalImagePath(Long groupId, String momentId) {
        return "group/" + groupId + "/moment/" + momentId + "/original/";
    }

    // 썸네일 파일 경로 생성
    public String createThumbnailImagePath(Long groupId, String momentId) {
        return "group/" + groupId + "/moment/" + momentId + "/thumbnail/";
    }

    // 이미지 파일 이름(UUID) 생성
    public String createImageName(String imageName) {
        return UUID.randomUUID().toString().concat(getFileExtension(imageName));
    }

    // 회원 프로필 사진 업로드
    public String uploadUserImg(String token, MultipartFile image) {
        Long userId = jwtUtil.extractUserId(token);
        User loginUser = userService.findByUserId(userId).orElseThrow(() -> new NoSuchElementException("회원이 없습니다."));

        if (image.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "빈 파일은 업로드할 수 없습니다.");
        }

        String imageName = "user/" + loginUser.getUserEmail()
                + "/userImg".concat(getFileExtension(Objects.requireNonNull(image.getOriginalFilename())));

        uploadThumbnailImage(image, imageName);
        log.info("유저 이미지가 성공적으로 저장되었습니다. {} / {}", imageName, amazonS3.getUrl(bucket, imageName).toString());

        return amazonS3.getUrl(bucket, imageName).toString();
    }

    // 원본 이미지 업로드
    private void uploadOriginalImage(MultipartFile image, String imagePath) {
        try (InputStream inputStream = image.getInputStream()) {
            ObjectMetadata objectMetadata = new ObjectMetadata();
            objectMetadata.setContentLength(image.getSize());
            objectMetadata.setContentType(image.getContentType());

            amazonS3.putObject(new PutObjectRequest(bucket, imagePath, inputStream, objectMetadata)
                    .withCannedAcl(CannedAccessControlList.PublicRead));

        } catch (AmazonServiceException e) {
            log.error("S3 Service Exception: Error Code - {}, Status Code - {}, AWS Error Message - {}",
                    e.getErrorCode(), e.getStatusCode(), e.getErrorMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "S3 업로드 실패", e);

        } catch (SdkClientException e) {
            log.error("S3 Client Exception: {}", e.getMessage());
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "S3 클라이언트 연결 실패", e);

        } catch (IOException e) {
            log.error("IOException: {}", e.getMessage());
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "잘못된 입력 스트림", e);
        }
    }

    // 썸네일 이미지 업로드 (quality: 0.5배)
    private void uploadThumbnailImage(MultipartFile image, String imagePath) {
        try (InputStream originalStream = ThumbnailUtil.getThumbnail(image, 0.5)) {
            // InputStream 크기를 계산하기 위해 데이터 읽기
            byte[] thumbnailBytes = originalStream.readAllBytes();
            InputStream inputStream = new ByteArrayInputStream(thumbnailBytes);

            ObjectMetadata objectMetadata = new ObjectMetadata();
            objectMetadata.setContentLength(thumbnailBytes.length); // 정확한 크기 설정
            objectMetadata.setContentType("image/jpeg");

            amazonS3.putObject(new PutObjectRequest(bucket, imagePath, inputStream, objectMetadata)
                    .withCannedAcl(CannedAccessControlList.PublicRead));

        } catch (IOException e) {
            // IOException 처리
            log.error("썸네일 생성 또는 업로드 실패: {}", e.getMessage(), e);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "썸네일 업로드 실패", e);

        } catch (AmazonServiceException e) {
            // AWS S3 관련 서비스 오류
            log.error("AWS S3 서비스 오류: Error Code - {}, Status Code - {}, Message - {}",
                    e.getErrorCode(), e.getStatusCode(), e.getErrorMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "S3 업로드 실패", e);

        } catch (SdkClientException e) {
            // AWS SDK 클라이언트 연결 오류
            log.error("AWS SDK 클라이언트 오류: {}", e.getMessage(), e);
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "S3 클라이언트 연결 실패", e);
        }
    }


    // 확장자 구하기
    private String getFileExtension(String imageName) {
        try {
            String extension = imageName.substring(imageName.lastIndexOf(".")).toLowerCase();

            if(!ALLOWED_EXTENSIONS.contains(extension)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "허용되지 않는 파일 확장자입니다.");
            }

            return extension;
        } catch(StringIndexOutOfBoundsException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "잘못된 형식의 파일입니다.");
        }
    }

    // 유저 AI 분류용 사진 업로드
    // https://moa-s3-bucket.s3.amazonaws.com/user/{userEmail}/profile.{확장자}
    public String uploadUserProfile(String token, MultipartFile image) {
        Long userId = jwtUtil.extractUserId(token);
        User loginUser = userService.findByUserId(userId).orElseThrow(() -> new NoSuchElementException("회원이 없습니다."));

        if(image.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "빈 파일은 업로드할 수 없습니다.");
        }

        String imageName = "user/" + loginUser.getUserEmail()
                + "/profile".concat(getFileExtension(Objects.requireNonNull(image.getOriginalFilename())));

        uploadOriginalImage(image, imageName);
        String fileUrl = amazonS3.getUrl(bucket, imageName).toString();

        log.info("파일={}", fileUrl);

        // 유저 정보 업데이트
        loginUser.updateRegisterImage(fileUrl);

        // fast에서 임베딩 값 받아오기
        String faceEmbedding = registFaceUtil.GetFaceEmbeddingFromFast(fileUrl);
        log.info("임베딩={}", faceEmbedding);

        // FaceEmbeddingDTO에 값 설정
        FaceEmbeddingDTO faceEmbeddingDTO = FaceEmbeddingDTO.builder()
                .userId(loginUser.getUserId())
                .faceEmbedding(faceEmbedding)
                .build();

        userService.updateFaceEmbedding(faceEmbeddingDTO);

        return fileUrl;
    }

    // S3에서 사진 삭제
    public List<String> deleteImages(List<String> imageUrls) {
        List<String> removedImages = new ArrayList<>();
        imageUrls.forEach(imageUrl -> {
            try {
                if (amazonS3.doesObjectExist(bucket, imageUrl)) {
                    amazonS3.deleteObject(new DeleteObjectRequest(bucket, imageUrl));
                    removedImages.add(imageUrl);
                } else {
                    throw new ResponseStatusException(HttpStatus.NOT_FOUND, "이미지를 찾을 수 없습니다.");
                }
            } catch (AmazonS3Exception e) {
                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "이미지를 삭제하는 중 오류가 발생했습니다.", e);
            }
        });

        return removedImages;
    }

    // S3에 저장된 회원 AI용 사진 찾아오기
    public String getUserProfile(String userEmail) {
        String prefix = "user/" + userEmail + "/profile";
        try {
            ListObjectsV2Request request = new ListObjectsV2Request()
                    .withBucketName(bucket)
                    .withPrefix(prefix)
                    .withMaxKeys(1);

            ListObjectsV2Result response = amazonS3.listObjectsV2(request);

            if (!response.getObjectSummaries().isEmpty()) {
                String imageUrl = response.getObjectSummaries().get(0).getKey();
                return amazonS3.getUrl(bucket, imageUrl).toString();
            } else {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "이미지를 찾을 수 없습니다.");
            }
        } catch (AmazonS3Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "이미지를 가져오는 중 오류가 발생했습니다.", e);
        }
    }

    // Moment 안의 모든 사진 URL 경로 조회
    public Map<String, List<String>> getImagesInMoment(String momentId) {
        Map<String, List<String>> images = new HashMap<>();

        List<String> thumbImgs = new ArrayList<>();

        try {
            ListObjectsV2Request thumbRequest = new ListObjectsV2Request()
                    .withBucketName(bucket)
                    .withPrefix("group/602/moment/" + momentId + "/thumbnail");

            ListObjectsV2Result thumbResult = amazonS3.listObjectsV2(thumbRequest);

            if(thumbResult.getObjectSummaries().isEmpty()) {
                images.put("thumbImgs", new ArrayList<>());
                return images;
            }

            for(S3ObjectSummary summary : thumbResult.getObjectSummaries()) {
                thumbImgs.add(String.valueOf(amazonS3.getUrl(bucket, summary.getKey())));
            }

            images.put("thumbImgs", thumbImgs);

        } catch (AmazonS3Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "이미지 목록을 조회하는 중 오류가 발생했습니다.");
        }

        return images;
    }

    // Group 안의 모든 사진 URL 경로 조회
    public Map<String, Map<String, List<String>>> getImagesInGroup(Long groupId, List<String> momentIds) {
        Map<String, Map<String, List<String>>> imagesByMoment = new HashMap<>();
        imagesByMoment.put("thumbImgs", new HashMap<>());
        imagesByMoment.put("expiredAt", new HashMap<>());

        if(momentIds.isEmpty()) {
            return imagesByMoment;
        }
        for(String momentId : momentIds) {
            List<String> thumbImgs = new ArrayList<>();
            try {
                ListObjectsV2Request thumbRequest = new ListObjectsV2Request()
                        .withBucketName(bucket)
                        .withPrefix("group/" + groupId + "/moment/" + momentId + "/thumbnail");

                ListObjectsV2Result thumbResult = amazonS3.listObjectsV2(thumbRequest);

                if(thumbResult.getObjectSummaries().isEmpty()) {
                    continue;
                }

                for(S3ObjectSummary summary : thumbResult.getObjectSummaries()) {
                    thumbImgs.add(String.valueOf(amazonS3.getUrl(bucket, summary.getKey())));
                }

                imagesByMoment.get("thumbImgs").put(momentId, thumbImgs);

            } catch (AmazonS3Exception e) {
                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                        "이미지 목록을 조회하는 중 오류가 발생했습니다.");
            }
        }

        return imagesByMoment;
    }

    // 유저 프로필 사진 조회
    public String getUserImg(String userEmail) {
        String prefix = "user/" + userEmail + "/userImg";
        try {
            ListObjectsV2Request request = new ListObjectsV2Request()
                    .withBucketName(bucket)
                    .withPrefix(prefix)
                    .withMaxKeys(1);

            ListObjectsV2Result response = amazonS3.listObjectsV2(request);

            if(!response.getObjectSummaries().isEmpty()) {
                String imageUrl = response.getObjectSummaries().get(0).getKey();
                return amazonS3.getUrl(bucket, imageUrl).toString();
            } else {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "이미지를 찾을 수 없습니다.");
            }
        } catch(AmazonS3Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "이미지를 가져오는 중 오류가 발생했습니다.", e);
        }
    }

    // 얼굴 비교하여 분류 (그룹)
    public List<String> compareFace(String token, Long groupId) {
        Long userId = jwtUtil.extractUserId(token);
        User loginUser = userService.findByUserId(userId).orElseThrow(() -> new NoSuchElementException("회원이 없습니다."));

        // groupId로 momentId들 가져오기
        List<String> momentIds = momentService.getMomentIds(groupId);

        String embedding = userService.getEmbedding(userId);

        if (embedding == null || embedding.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "등록된 임베딩 값(사진)이 없습니다.");
        }


        // fast에서 분류된 사진 url 리스트 받아오기
        List<String> classifiedImgList = compareFaceUtil.getClassifiedImgsFromFast(groupId, momentIds, embedding);

//        log.info(classifiedImgList.toString());
        return classifiedImgList;
    }

    // 얼굴 비교하여 분류 (순간)
    public List<String> compareFaceInMoment(String token, Long groupId, ObjectId momentId) {
        Long userId = jwtUtil.extractUserId(token);
        User loginUser = userService.findByUserId(userId).orElseThrow(() -> new NoSuchElementException("회원이 없습니다."));

        List<String> momentIds = new ArrayList<>();
        momentIds.add(momentId.toHexString());

        String embedding = userService.getEmbedding(userId);

        if (embedding == null || embedding.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "등록된 임베딩 값(사진)이 없습니다.");
        }

        // fast에서 분류된 사진 url 리스트 받아오기
        List<String> classifiedImgList = compareFaceUtil.getClassifiedImgsFromFast(groupId, momentIds, embedding);

//        log.info(classifiedImgList.toString());
        return classifiedImgList;
    }

    // 음식 사진 분류 (그룹)
    public List<String> detectFood(String token, Long groupId) {
        Long userId = jwtUtil.extractUserId(token);
        User loginUser = userService.findByUserId(userId).orElseThrow(() -> new NoSuchElementException("회원이 없습니다."));

        // groupId로 momentId들 가져오기
        List<String> momentIds = momentService.getMomentIds(groupId);

        // fast에서 분류된 이미지 url 리스트 받아오기
        List<String> classifiedFoodImgList = detectFoodUtil.getDetectedFoodImgsFromFast(groupId, momentIds);

        log.info(classifiedFoodImgList.toString());
        return classifiedFoodImgList;
    }

    // 음식 사진 분류 (순간)
    public List<String> detectFoodInMoment(String token, Long groupId, ObjectId momentId) {
        Long userId = jwtUtil.extractUserId(token);
        User loginUser = userService.findByUserId(userId).orElseThrow(() -> new NoSuchElementException("회원이 없습니다."));

        // 순간 아이디 리스트에 해당 순간 아이디 추가
        List<String> momentIds = new ArrayList<>();
        momentIds.add(momentId.toHexString());

        // fast에서 분류된 이미지 url 리스트 받아오기
        List<String> classifiedFoodImgList = detectFoodUtil.getDetectedFoodImgsFromFast(groupId, momentIds);

        log.info(classifiedFoodImgList.toString());
        return classifiedFoodImgList;
    }
}