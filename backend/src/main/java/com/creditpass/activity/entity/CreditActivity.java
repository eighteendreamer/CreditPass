package com.creditpass.activity.entity;

import com.creditpass.common.handler.JsonbStringTypeHandler;
import com.mybatisflex.annotation.Column;
import com.mybatisflex.annotation.Id;
import com.mybatisflex.annotation.KeyType;
import com.mybatisflex.annotation.Table;
import lombok.Data;
import org.apache.ibatis.type.JdbcType;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Table("credit_activity")
public class CreditActivity {

    @Id(keyType = KeyType.Auto)
    private Long id;

    private String title;
    private String summary;

    @Column("organization_structure")
    private String organizationStructure;

    private String content;

    @Column("credit_type")
    private String creditType;

    @Column("credit_amount")
    private BigDecimal creditAmount;

    /** fixed | staged */
    @Column("time_type")
    private String timeType;

    @Column("signup_start_time")
    private LocalDateTime signupStartTime;

    @Column("signup_end_time")
    private LocalDateTime signupEndTime;

    @Column("activity_start_time")
    private LocalDateTime activityStartTime;

    @Column("activity_end_time")
    private LocalDateTime activityEndTime;

    /** JSON 字符串,例如 [{"name":"初赛","start":"...","end":"...","desc":"..."}] */
    @Column(value = "stage_times", jdbcType = JdbcType.OTHER, typeHandler = JsonbStringTypeHandler.class)
    private String stageTimes;

    /** all_school | college | major | organization | grade */
    @Column("scope_type")
    private String scopeType;

    @Column("scope_description")
    private String scopeDescription;

    private String awards;

    @Column("activity_url")
    private String activityUrl;

    /** JSON 数组,图片 URL */
    @Column(value = "proof_images", jdbcType = JdbcType.OTHER, typeHandler = JsonbStringTypeHandler.class)
    private String proofImages;

    /** regular | limited */
    private String category;

    @Column("publisher_id")
    private Long publisherId;

    @Column("publisher_email")
    private String publisherEmail;

    private String status;

    @Column("view_count")
    private Long viewCount;

    @Column("created_at")
    private LocalDateTime createdAt;

    @Column("updated_at")
    private LocalDateTime updatedAt;
}
