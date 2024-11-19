package com.MOA.backend.domain.image.controller;

import com.MOA.backend.domain.group.service.GroupService;
import com.MOA.backend.domain.image.service.S3Service;
import com.MOA.backend.domain.moment.service.MomentService;
import lombok.RequiredArgsConstructor;
import org.bson.types.ObjectId;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping
@RequiredArgsConstructor
public class S3Controller {

    private final S3Service s3Service;
    private final MomentService momentService;
    private final GroupService groupService;

    @PostMapping("/moment/{moment_id}/upload")
    ResponseEntity<List<String>> uploadImages(
            @RequestHeader("Authorization") String token,
            @PathVariable("moment_id") String momentId,
            @RequestPart("images") List<MultipartFile> images
    ) {
        return ResponseEntity.ok(s3Service.uploadImages(token, momentId, images));
    }

    @PostMapping("/group/{groupId}/upload")
    ResponseEntity<?> uploadImagesInGroup(
            @RequestHeader("Authorization") String token,
            @PathVariable("groupId") Long groupId,
            @RequestPart List<MultipartFile> images
    ) {
        List<String> urls =
                s3Service.uploadImages(token, momentService.createMomentForGroup(token, groupId, images), images);
        groupService.updateGroupImagesCount(groupId, (long) images.size());
        return ResponseEntity.ok(urls);
    }

    @PostMapping("/user/upload")
    ResponseEntity<Map<String, String>> uploadAIImage(
            @RequestHeader("Authorization") String token,
            @RequestPart("image") MultipartFile image
    ) {
        return ResponseEntity.ok(Map.of("url", s3Service.uploadUserProfile(token, image)));
    }

    @DeleteMapping("/moment/{moment_id}/delete")
    ResponseEntity<List<String>> deleteImage(
            @RequestBody List<String> imageUrls
    ) {
        return ResponseEntity.ok(s3Service.deleteImages(imageUrls));
    }

    @PostMapping("/user/img")
    ResponseEntity<Map<String, String>> uploadUserImage(
            @RequestHeader("Authorization") String token,
            @RequestPart("image") MultipartFile image
    ) {
        return ResponseEntity.ok(Map.of("url", s3Service.uploadUserImg(token, image)));
    }

    // 얼굴 분류 (그룹에서)
    @PostMapping("/img/{group_id}/compare")
    ResponseEntity<List<String>> compareImage(
            @RequestHeader("Authorization") String token,
            @PathVariable("group_id") Long groupId
    ) {
        List<String> imgUrls = s3Service.compareFace(token, groupId);
        return ResponseEntity.ok(imgUrls);
    }

    // 얼굴 분류 (순간에서)
    @PostMapping("/img/{group_id}/{moment_id}/compare")
    ResponseEntity<List<String>> compareImageInMoment(
            @RequestHeader("Authorization") String token,
            @PathVariable("group_id") Long groupId,
            @PathVariable("moment_id") ObjectId momentId
    ) {
        List<String> imgUrls = s3Service.compareFaceInMoment(token, groupId, momentId);
        return ResponseEntity.ok(imgUrls);
    }

    // 음식 사진 분류 (그룹에서)
    @PostMapping("/img/{group_id}/food")
    ResponseEntity<List<String>> detectFoodImage(
            @RequestHeader("Authorization") String token,
            @PathVariable("group_id") Long groupId
    ) {
        List<String> imgUrls = s3Service.detectFood(token, groupId);
        return ResponseEntity.ok(imgUrls);
    }

    // 음식 사진 분류 (순간에서)
    @PostMapping("/img/{group_id}/{moment_id}/food")
    ResponseEntity<List<String>> detectFoodImageInMoment(
            @RequestHeader("Authorization") String token,
            @PathVariable("group_id") Long groupId,
            @PathVariable("moment_id") ObjectId momentId
    ) {
        List<String> imgUrls = s3Service.detectFoodInMoment(token, groupId, momentId);
        return ResponseEntity.ok(imgUrls);
    }

}