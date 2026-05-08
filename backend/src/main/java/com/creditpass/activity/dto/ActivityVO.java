package com.creditpass.activity.dto;

import com.creditpass.activity.entity.CreditActivity;
import com.creditpass.common.utils.JsonUtil;
import com.fasterxml.jackson.core.type.TypeReference;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
public class ActivityVO {
    private Long id;
    private String title;
    private String summary;
    private String organizationStructure;
    private String content;
    private String creditType;
    private BigDecimal creditAmount;
    private String timeType;
    private LocalDateTime signupStartTime;
    private LocalDateTime signupEndTime;
    private LocalDateTime activityStartTime;
    private LocalDateTime activityEndTime;
    private List<Map<String, Object>> stageTimes;
    private String scopeType;
    private String scopeDescription;
    private String awards;
    private String activityUrl;
    private List<String> proofImages;
    private String category;
    private Long publisherId;
    private String publisherEmail;
    private String status;
    private Long viewCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    /** 衍生字段 */
    private Boolean available;
    private String availableText;

    public static ActivityVO from(CreditActivity a) {
        if (a == null) return null;
        ActivityVO v = new ActivityVO();
        v.setId(a.getId());
        v.setTitle(a.getTitle());
        v.setSummary(a.getSummary());
        v.setOrganizationStructure(a.getOrganizationStructure());
        v.setContent(a.getContent());
        v.setCreditType(a.getCreditType());
        v.setCreditAmount(a.getCreditAmount());
        v.setTimeType(a.getTimeType());
        v.setSignupStartTime(a.getSignupStartTime());
        v.setSignupEndTime(a.getSignupEndTime());
        v.setActivityStartTime(a.getActivityStartTime());
        v.setActivityEndTime(a.getActivityEndTime());
        v.setStageTimes(JsonUtil.fromJson(a.getStageTimes(), new TypeReference<>() {}));
        v.setScopeType(a.getScopeType());
        v.setScopeDescription(a.getScopeDescription());
        v.setAwards(a.getAwards());
        v.setActivityUrl(a.getActivityUrl());
        v.setProofImages(JsonUtil.fromJson(a.getProofImages(), new TypeReference<>() {}));
        v.setCategory(a.getCategory());
        v.setPublisherId(a.getPublisherId());
        v.setPublisherEmail(a.getPublisherEmail());
        v.setStatus(a.getStatus());
        v.setViewCount(a.getViewCount());
        v.setCreatedAt(a.getCreatedAt());
        v.setUpdatedAt(a.getUpdatedAt());

        // 计算状态
        LocalDateTime now = LocalDateTime.now();
        if (!"published".equals(a.getStatus())) {
            v.setAvailable(false);
            v.setAvailableText("已下架");
        } else if (a.getActivityEndTime() != null && a.getActivityEndTime().isBefore(now)) {
            v.setAvailable(false);
            v.setAvailableText("已结束");
        } else if (a.getSignupStartTime() != null && a.getSignupStartTime().isAfter(now)) {
            v.setAvailable(false);
            v.setAvailableText("即将开始");
        } else if (a.getSignupEndTime() != null && a.getSignupEndTime().isBefore(now)
                && a.getActivityStartTime() != null && a.getActivityStartTime().isAfter(now)) {
            v.setAvailable(false);
            v.setAvailableText("报名已截止");
        } else if (a.getSignupStartTime() != null && a.getSignupEndTime() != null
                && !a.getSignupStartTime().isAfter(now) && !a.getSignupEndTime().isBefore(now)) {
            v.setAvailable(true);
            v.setAvailableText("报名中");
        } else {
            v.setAvailable(true);
            v.setAvailableText("可参加");
        }
        return v;
    }
}
