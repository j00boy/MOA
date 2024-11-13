package com.MOA.backend.domain.user.entity;

import com.MOA.backend.domain.member.entity.Member;
import com.MOA.backend.global.entity.BaseEntity;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@EqualsAndHashCode(callSuper = true)
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
@JsonIgnoreProperties({"memberships"})
public class User extends BaseEntity {

    @Builder
    public User(String userName, String userEmail, String userImage) {
        this.userName = userName;
        this.userEmail = userEmail;
        this.userImage = userImage;
        this.role = "ROLE_USER";
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id", unique = true, nullable = false, updatable = false)
    private Long userId;

    @Column(name = "user_name", nullable = false)
    private String userName;

    @Column(name = "user_email", nullable = false, unique = true)
    private String userEmail;

    @Column(name = "user_image")
    private String userImage;

    @Column(name = "role", nullable = false)
    private String role = "ROLE_USER";

    @Column(name = "device_token")
    private String deviceToken;

    @Column(columnDefinition = "TEXT")
    private String faceEmbedding;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<Member> memberships = new ArrayList<>();


    public void update(String nickname, String userImage) {
        this.userName = nickname;
        this.userImage = userImage;
    }

    public void update(String nickname) {
        this.userName = nickname;
    }
}