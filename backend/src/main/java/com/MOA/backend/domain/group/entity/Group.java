package com.MOA.backend.domain.group.entity;

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
@Data
@Table(name = "`group`")
//@JsonIgnoreProperties({"memberships"})
@JsonIgnoreProperties({"members"})
public class Group extends BaseEntity {


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "group_id")
    private Long groupId;

    @Column(name = "group_owner_id")
    private Long groupOwnerId;

    @Column(name = "group_pin")
    private String groupPin;

    @Column(name = "group_name", nullable = false)
    private String groupName;

    @Column(name = "group_description")
    private String groupDescription;

    @Column(name = "group_icon")
    private String groupIcon;

    @Column(name = "group_color")
    private String groupColor;

    @Column(name = "group_total_images", columnDefinition = "BIGINT DEFAULT 0")
    private long groupTotalImages;

    @OneToMany(mappedBy = "group", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @ToString.Exclude  // toString 메서드에서 무한 호출 방지
    private List<Member> members = new ArrayList<>();

}
