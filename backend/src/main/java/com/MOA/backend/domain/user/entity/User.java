package com.MOA.backend.domain.user.entity;

import com.MOA.backend.domain.member.entity.Member;
import com.MOA.backend.global.entity.BaseEntity;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.transaction.Transactional;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;

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
        this.uploadCount = 0L;
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

    @Column(name = "register_image")
    private String registerImage;

    @Column(name = "upload_count")
    @ColumnDefault("0")
    private Long uploadCount;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @ToString.Exclude  // toString 메서드에서 무한 호출 방지
    private List<Member> memberships = new ArrayList<>();


    public void update(String nickname, String userImage) {
        this.userName = nickname;
        this.userImage = userImage;
    }

    public void update(String nickname) {
        this.userName = nickname;
    }

    public void updateRegisterImage(String registerImage) {
        this.registerImage = registerImage;
    }

    public void updateUploadCount(Long count) {
        this.uploadCount += count;
    }
}