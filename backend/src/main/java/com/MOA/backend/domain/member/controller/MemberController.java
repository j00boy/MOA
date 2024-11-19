package com.MOA.backend.domain.member.controller;

import com.MOA.backend.domain.member.entity.Member;
import com.MOA.backend.domain.member.service.MemberService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/member")
@RequiredArgsConstructor
public class MemberController {
    private final MemberService memberService;

    @GetMapping
    public List<Long> getAllMembers(@RequestHeader("Authorization" +
            "") String token) {
        return memberService.findAllGroupIdByUserId(token);
    }
}
