package com.MOA.backend.domain.moment.controller;

import com.MOA.backend.domain.image.service.S3Service;
import com.MOA.backend.domain.moment.dto.request.MomentCreateRequestDto;
import com.MOA.backend.domain.moment.dto.request.MomentUpdateRequestDto;
import com.MOA.backend.domain.moment.dto.response.MomentCreateResponseDto;
import com.MOA.backend.domain.moment.dto.response.MomentDetailResponseDto;
import com.MOA.backend.domain.moment.dto.response.MomentResponseDto;
import com.MOA.backend.domain.moment.dto.response.MomentUpdateResponseDto;
import com.MOA.backend.domain.moment.service.MomentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.bson.types.ObjectId;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/moment")
@Slf4j
public class MomentController {

    private final MomentService momentService;
    private final S3Service s3Service;

    // 순간 생성
    @PostMapping
    public ResponseEntity<MomentCreateResponseDto> createMoment(
            @RequestHeader("Authorization") String token,
            @RequestBody MomentCreateRequestDto momentCreateRequestDto
    ) {
        MomentCreateResponseDto momentDto = momentService.createMoment(token, momentCreateRequestDto);
        return ResponseEntity.ok(momentDto);
    }

    // 순간 삭제
    @DeleteMapping("/{moment_id}")
    public ResponseEntity<?> deleteMoment(
            @PathVariable(name = "moment_id") String momentId
    ) {
        momentService.deleteMoment(momentId);
        return ResponseEntity.ok().body(ObjectId.get().toHexString() + "번 순간이 삭제가 완료되었습니다.");
    }

    // 순간 수정(제목, 설명)
    @PatchMapping("/{moment_id}")
    public ResponseEntity<MomentUpdateResponseDto> updateMoment(
            @PathVariable(name = "moment_id") String momentId,
            @RequestBody MomentUpdateRequestDto momentUpdateRequestDto
    ) {
        MomentUpdateResponseDto momentUpdateResponseDto =
                momentService.updateMoment(momentId, momentUpdateRequestDto);
        return ResponseEntity.ok(momentUpdateResponseDto);
    }

    // 순간 목록 조회
    @GetMapping
    public ResponseEntity<List<MomentResponseDto>> getAllMoments(
            @RequestHeader("Authorization") String token
    ) {
        List<MomentResponseDto> myMoments = momentService.getAllMoments(token);
        return ResponseEntity.ok(myMoments);
    }

    // 순간 상세 조회
    @GetMapping("/{moment_id}")
    public ResponseEntity<MomentDetailResponseDto> getMoment(
            @RequestHeader("Authorization") String token,
            @PathVariable(name = "moment_id") String momentId
    ) {
        MomentDetailResponseDto moment = momentService.getMoment(token, momentId);
        Map<String, List<String>> images = s3Service.getImagesInMoment(momentId);

        return ResponseEntity.ok(MomentDetailResponseDto.builder()
                .id(moment.getId())
                .groupId(moment.getGroupId())
                .momentPin(moment.getMomentPin())
                .members(moment.getMembers())
                .momentName(moment.getMomentName())
                .momentDescription(moment.getMomentDescription())
                .momentOwner(moment.getMomentOwner())
                .images(images)
                .uploadOption(moment.getUploadOption())
                .createdAt(moment.getCreatedAt())
                .build());
    }

    // 순간 참여
    @PostMapping("/{moment_id}")
    public ResponseEntity<?> participate(
            @RequestHeader("Authorization") String token,
            @PathVariable(name = "moment_id") String momentId,
            @RequestParam(name = "PIN") String pin
    ) {
        MomentDetailResponseDto moment = momentService.participate(token, momentId, pin);
        return ResponseEntity.ok().body(moment);
    }

    // 순간 퇴장
    @PutMapping("/{moment_id}")
    public ResponseEntity<?> exit(
            @RequestHeader("Authorization") String token,
            @PathVariable(name = "moment_id") String momentId
    ) {
        momentService.userExit(token, momentId);
        return ResponseEntity.ok().body("성공적으로 퇴장되었습니다.");
    }

    // 업로드할 수 있는 사람인지 검증
    @GetMapping("{moment_id}/upload")
    public ResponseEntity<Boolean> validateUploadOption(
            @RequestHeader("Authorization") String token,
            @PathVariable(name = "moment_id") String momentId
    ) {
        return ResponseEntity.ok().body(momentService.validateUploadAuthority(token, momentId));
    }
}
