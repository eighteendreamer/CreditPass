package com.creditpass.activity.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
public class ActivityPublishDTO {

    @NotBlank(message = "活动名称不能为空")
    private String title;

    private String summary;
    private String organizationStructure;
    private String content;

    @NotBlank(message = "学分类型不能为空")
    private String creditType;

    @NotNull(message = "学分数量不能为空")
    private BigDecimal creditAmount;

    /** fixed | staged */
    @NotBlank(message = "时间类型不能为空")
    private String timeType;

    private LocalDateTime signupStartTime;
    private LocalDateTime signupEndTime;
    private LocalDateTime activityStartTime;
    private LocalDateTime activityEndTime;

    private List<Map<String, Object>> stageTimes;

    /** all_school | college | major | organization | grade */
    private String scopeType;
    private String scopeDescription;

    private String awards;
    private String activityUrl;
    private List<String> proofImages;

    /** regular | limited */
    @NotBlank(message = "活动类别不能为空")
    private String category;
}
