package com.creditpass.user.dto;

import com.creditpass.common.utils.JsonUtil;
import com.creditpass.user.entity.CreditUser;
import com.fasterxml.jackson.core.type.TypeReference;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
public class UserVO {
    private Long id;
    private String email;
    private String nickname;
    private String avatarUrl;
    private String schoolName;
    private String campusName;
    private String collegeName;
    private String majorName;
    private String grade;
    private String className;
    private String studentNo;
    private String organizationName;
    private List<CreditNeedItem> creditNeeds;
    private List<Map<String, Object>> creditObtained;
    private String bio;
    private Boolean pushEnabled;
    private Boolean pushOnlyAvailable;
    private Boolean pushOnlyNeededCredit;
    private String pushFrequency;
    private Boolean profileCompleted;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static UserVO from(CreditUser u) {
        if (u == null) return null;
        UserVO v = new UserVO();
        v.setId(u.getId());
        v.setEmail(u.getEmail());
        v.setNickname(u.getNickname());
        v.setAvatarUrl(u.getAvatarUrl());
        v.setSchoolName(u.getSchoolName());
        v.setCampusName(u.getCampusName());
        v.setCollegeName(u.getCollegeName());
        v.setMajorName(u.getMajorName());
        v.setGrade(u.getGrade());
        v.setClassName(u.getClassName());
        v.setStudentNo(u.getStudentNo());
        v.setOrganizationName(u.getOrganizationName());
        v.setCreditNeeds(CreditNeedItem.parseList(u.getCreditNeeds()));
        v.setCreditObtained(JsonUtil.fromJson(u.getCreditObtained(), new TypeReference<>() {}));
        v.setBio(u.getBio());
        v.setPushEnabled(u.getPushEnabled());
        v.setPushOnlyAvailable(u.getPushOnlyAvailable());
        v.setPushOnlyNeededCredit(u.getPushOnlyNeededCredit());
        v.setPushFrequency(u.getPushFrequency());
        v.setProfileCompleted(u.getProfileCompleted());
        v.setCreatedAt(u.getCreatedAt());
        v.setUpdatedAt(u.getUpdatedAt());
        return v;
    }
}
