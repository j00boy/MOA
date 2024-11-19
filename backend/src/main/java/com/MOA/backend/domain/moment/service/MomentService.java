package com.MOA.backend.domain.moment.service;

import com.MOA.backend.domain.member.dto.response.MemberInfoResponseDto;
import com.MOA.backend.domain.moment.dto.request.MomentCreateRequestDto;
import com.MOA.backend.domain.moment.dto.request.MomentUpdateRequestDto;
import com.MOA.backend.domain.moment.dto.response.MomentCreateResponseDto;
import com.MOA.backend.domain.moment.dto.response.MomentDetailResponseDto;
import com.MOA.backend.domain.moment.dto.response.MomentResponseDto;
import com.MOA.backend.domain.moment.dto.response.MomentUpdateResponseDto;
import com.MOA.backend.domain.moment.entity.DeletedMoment;
import com.MOA.backend.domain.moment.entity.Moment;
import com.MOA.backend.domain.moment.repository.DeletedMomentRepository;
import com.MOA.backend.domain.moment.repository.MomentRepository;
import com.MOA.backend.domain.moment.util.PinCodeUtil;
import com.MOA.backend.domain.user.entity.User;
import com.MOA.backend.domain.user.service.UserService;
import com.MOA.backend.global.auth.jwt.service.JwtUtil;
import com.MOA.backend.global.exception.ForbiddenAccessException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.bson.types.ObjectId;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
@Slf4j
public class MomentService {
    private final DeletedMomentRepository deletedMomentRepository;

    private final MomentRepository momentRepository;
    private final UserService userService;
    private final PinCodeUtil pinCodeUtil;
    private final MomentRedisService momentRedisService;
    private final JwtUtil jwtUtil;

    // 그룹에서 사진 업로드 시 바로 Moment 생성
    public String createMomentForGroup(String token, Long groupId, List<MultipartFile> images) {
        if (images == null || images.isEmpty()) {
            throw new RuntimeException("잘못된 요청입니다.");
        }

        Long userId = jwtUtil.extractUserId(token);
        User loginUser = userService.findByUserId(userId).orElseThrow(() -> new NoSuchElementException("회원이 없습니다."));

        Moment moment = Moment.builder()
                .groupId(groupId)
                .userIds(Stream.of(loginUser.getUserId()).collect(Collectors.toList()))
                .momentOwner(loginUser.getUserEmail())
                .uploadOption("ALL")
                .build();

        momentRepository.save(moment);

        // Spring Batch를 위한 DeletedMoment 생성
        // 시간 + 1 Day
        Date expiredDate = new Date(moment.getCreatedAt().getTime());
        Calendar calendar = Calendar.getInstance();
        calendar.setTime(expiredDate);
        calendar.add(Calendar.DAY_OF_MONTH, 1);

        deletedMomentRepository.save(DeletedMoment.builder()
                .momentId(moment.getId())
                .groupId(moment.getGroupId())
                .expiredAt(calendar.getTime()).build());

        log.info("Moment: {}, expiredAt: {}", moment, calendar.getTime());

        return moment.getId().toHexString();
    }

    // 순간 생성
    public MomentCreateResponseDto createMoment(String token, MomentCreateRequestDto momentCreateRequestDto) {
        Long userId = jwtUtil.extractUserId(token);
        User loginUser = userService.findByUserId(userId).orElseThrow(() -> new NoSuchElementException("회원이 없습니다."));

        Moment moment = Moment.builder()
                .groupId(momentCreateRequestDto.getGroupId() == null ? 602 : momentCreateRequestDto.getGroupId())
                .momentPin(pinCodeUtil.generatePinCode())
                .userIds(Stream.of(loginUser.getUserId()).collect(Collectors.toList()))
                .momentName(momentCreateRequestDto.getMomentName())
                .momentDescription(momentCreateRequestDto.getMomentDescription())
                .momentOwner(loginUser.getUserName())
                .momentOwnerEmail(loginUser.getUserEmail())
                .uploadOption(momentCreateRequestDto.getUploadOption())
                .build();

        momentRepository.save(moment);

        // Spring Batch를 위한 DeletedMoment 생성
        // 시간 + 1 Day
        Date expiredDate = new Date(moment.getCreatedAt().getTime());
        Calendar calendar = Calendar.getInstance();
        calendar.setTime(expiredDate);
        calendar.add(Calendar.DAY_OF_MONTH, 1);

        deletedMomentRepository.save(DeletedMoment.builder()
                .momentId(moment.getId())
                .groupId(moment.getGroupId())
                .expiredAt(calendar.getTime()).build());

        log.info("Moment: {}, expiredAt: {}", moment, calendar.getTime());
        String hexId = moment.getId().toHexString();

        momentRedisService.participateMoment(userId, hexId);

        return MomentCreateResponseDto.builder()
                .momentId(hexId)
                .message("순간 생성에 성공하였습니다.")
                .PIN(moment.getMomentPin())
                .build();
    }

    // 순간 삭제
    public void deleteMoment(String momentId) {
        // 1. Redis에서 유저가 참여한 관계 매핑 먼저 지우기
        momentRedisService.deleteMomentParticipation(momentId);

        // 2. MongoDB에서 해당 moment 삭제
        momentRepository.deleteById(momentId);

        // 삭제할 도큐먼트에서도 삭제
        deletedMomentRepository.deleteById(momentId);
    }

    // 순간 수정
    public MomentUpdateResponseDto updateMoment(String momentId, MomentUpdateRequestDto momentUpdateCreateDto) {
        Moment moment = momentRepository.findById(momentId).orElseThrow();
        moment.update(momentUpdateCreateDto);
        momentRepository.save(moment);

        return MomentUpdateResponseDto.builder()
                .momentId(moment.getId().toHexString())
                .message("순간 수정이 완료되었습니다.")
                .PIN(moment.getMomentPin())
                .build();
    }

    // 내 순간 가져오기
    public List<MomentResponseDto> getAllMoments(String token) {
        Long userId = jwtUtil.extractUserId(token);
        User loginUser = userService.findByUserId(userId).orElseThrow(() -> new NoSuchElementException("회원이 없습니다."));

        // 내가 참여한 방 목록 조회
        Set<String> myMomentsIds = momentRedisService.getMyMoments(loginUser.getUserId());
        log.info("myMomentsIds: {}", myMomentsIds);

        Set<ObjectId> objectIds = myMomentsIds.stream().map(ObjectId::new).collect(Collectors.toSet());

        return momentRepository.findAllByIdInOrderByCreatedAtAsc(objectIds)
                .stream()
                .map(moment -> MomentResponseDto.builder()
                        .momentId(moment.getId().toHexString())
                        .momentTitle(moment.getMomentName())
                        .momentDescription(moment.getMomentDescription())
                        .momentOwner(moment.getMomentOwner())
                        .createdAt(moment.getCreatedAt())
                        .build()).toList();
    }

    // 순간 상세 조회 == 내가 이미 참여한 순간에 입장
    public MomentDetailResponseDto getMoment(String token, String momentId) {
        Long userId = jwtUtil.extractUserId(token);
        User loginUser = userService.findByUserId(userId).orElseThrow(() -> new NoSuchElementException("회원이 없습니다."));

        Set<String> myMoments = momentRedisService.getMyMoments(loginUser.getUserId());
        if (!myMoments.contains(momentId)) {
            throw new ForbiddenAccessException("순간에 대해 유효하지 않은 접근입니다.");
        }

        // Moment 찾아오기
        Moment moment = momentRepository.findById(momentId).orElseThrow(() -> new NoSuchElementException("순간이 없습니다."));

        // 소유자 찾아오기
        User momentOwner = userService.findByUserEmail(moment.getMomentOwnerEmail())
                .orElseThrow(() -> new NoSuchElementException("소유자가 없습니다."));

        return MomentDetailResponseDto.builder()
                .id(moment.getId().toHexString())
                .groupId(moment.getGroupId())
                .momentPin(moment.getMomentPin())
                .members(getMomentMembers(momentId))
                .momentName(moment.getMomentName())
                .momentDescription(moment.getMomentDescription())
                .momentOwner(MemberInfoResponseDto.builder()
                        .userId(momentOwner.getUserId())
                        .nickname(momentOwner.getUserName())
                        .imageSrc(momentOwner.getUserImage())
                        .build())
                .uploadOption(moment.getUploadOption())
                .createdAt(moment.getCreatedAt())
                .build();
    }

    // 순간 참여하기
    public MomentDetailResponseDto participate(String token, String momentId, String pin) {
        Long userId = jwtUtil.extractUserId(token);
        User loginUser = userService.findByUserId(userId).orElseThrow(() -> new NoSuchElementException("회원이 없습니다."));

        // 입력한 PIN번호가 순간의 PIN번호와 일치하는 지를 검증
        // 1. 해당 Moment 가져오기
        Moment moment = momentRepository.findById(momentId).orElseThrow(NoSuchElementException::new);

        // 2. 해당 Moment의 PIN이 입력 PIN이랑 일치하는 지를 검증
        if (!pin.equals(moment.getMomentPin())) {
            throw new ForbiddenAccessException("PIN번호가 일치하지 않습니다.");
        }

        // 3. Moment에도 유저 정보 추가 반영
        List<Long> addedList = moment.getUserIds();
        addedList.add(loginUser.getUserId());
        moment.update(addedList);
        momentRepository.save(moment);

        // Redis 관계 매핑 반영
        momentRedisService.participateMoment(loginUser.getUserId(), momentId);
        log.info("유저 {}가 성공적으로 {} 순간 입장에 완료하였습니다.", loginUser.getUserEmail(), momentId);

        return MomentDetailResponseDto.builder()
                .id(moment.getId().toHexString())
                .groupId(moment.getGroupId())
                .momentPin(moment.getMomentPin())
                .momentName(moment.getMomentName())
                .momentDescription(moment.getMomentDescription())
                .uploadOption(moment.getUploadOption())
                .build();
    }

    // 순간 퇴장하기
    public void userExit(String token, String momentId) {
        Long userId = jwtUtil.extractUserId(token);
        User loginUser = userService.findByUserId(userId).orElseThrow(() -> new NoSuchElementException("회원이 없습니다."));

        // 1. 해당 Moment 가져오기
        Moment moment = momentRepository.findById(momentId).orElseThrow(NoSuchElementException::new);

        // 2. Redis에서 유저가 참여한 관계 매핑 먼저 지우기
        momentRedisService.exitMoment(loginUser.getUserId(), momentId);

        // 3. MongoDB에서 Moment 내 유저 아이디 변경을 위한 필터링
        log.info("originalList: {}", moment.getUserIds());
        List<Long> userIds = moment.getUserIds();
        List<Long> modifiedList = userIds.stream().filter(id -> !id.equals(loginUser.getUserId())).toList();
        log.info("modifiedList: {}", modifiedList);

        // 4. 유저가 퇴장한 수정사항 반영
        moment.update(modifiedList);
        momentRepository.save(moment);
    }

    public Moment getMomentEntity(String momentId) {
        return momentRepository.findById(momentId).orElseThrow(NoSuchElementException::new);
    }

    public List<String> getMomentIds(Long groupId) {
        List<Moment> moments = momentRepository.findAllByGroupIdOrderByCreatedAtAsc(groupId);

        if (moments.isEmpty()) {
            log.info("그룹 '{}'에 순간이 존재하지 않습니다.", groupId);
            return Collections.emptyList();
        }

        List<String> momentIds = moments.stream().map(moment -> moment.getId().toHexString()).toList();
        log.info("momentIds: {}", momentIds);

        return momentIds;
    }

    public List<MemberInfoResponseDto> getMomentMembers(String momentId) {
        Moment moment = momentRepository.findById(momentId).orElseThrow(NoSuchElementException::new);
        List<Long> userIds = moment.getUserIds();
        List<User> users = userService.getUsers(userIds);
        return users.stream().map(user -> MemberInfoResponseDto.builder()
                .userId(user.getUserId())
                .nickname(user.getUserName())
                .imageSrc(user.getUserImage())
                .build()).toList();
    }

    // 기간이 만료된 모든 DeletedMoment 삭제
    public Long deleteDeletedMoment(Date currDate) {
        return deletedMomentRepository.deleteByExpiredAtBefore(currDate);
    }

    // 그룹 내 moment들의 남은 시간 반환
    public Map<String, Date> getMomentExpireDate(List<String> momentIdList) {
        Map<String, Date> expireDateMap = new HashMap<>();
        for(String momentId : momentIdList) {
            Moment moment = momentRepository.findById(momentId).orElseThrow(NoSuchElementException::new);
            Instant instant = moment.getCreatedAt().toInstant();
            ZonedDateTime kst = ZonedDateTime.ofInstant(instant, ZoneId.of("Asia/Seoul")).plusDays(1);
            Date kstDate = Date.from(kst.toInstant());
            expireDateMap.put(momentId, kstDate);
        }

        return expireDateMap;
    }

    public Boolean validateUploadAuthority(String token, String momentId) {
        Long userId = jwtUtil.extractUserId(token);
        MomentDetailResponseDto moment = getMoment(token, momentId);
        String uploadOption = moment.getUploadOption();
        Boolean option = uploadOption.equals("ALL") ? Boolean.TRUE : Boolean.FALSE;
        if (option.equals(Boolean.TRUE)) {
            return Boolean.TRUE;
        } else {
            Optional<User> optionalUser = userService.findByUserId(userId);
            if (optionalUser.isPresent()) {
                Long loginUserId = optionalUser.get().getUserId();
                if (moment.getMomentOwner().getUserId().equals(loginUserId)) {
                    return Boolean.TRUE;
                } else {
                    return Boolean.FALSE;
                }
            }
        }
        return Boolean.FALSE;
    }
}
