package com.creditpass.user.entity;

import com.creditpass.common.handler.JsonbStringTypeHandler;
import com.mybatisflex.annotation.Column;
import com.mybatisflex.annotation.Id;
import com.mybatisflex.annotation.KeyType;
import com.mybatisflex.annotation.Table;
import lombok.Data;
import org.apache.ibatis.type.JdbcType;

import java.time.LocalDateTime;

@Data
@Table("credit_user")
public class CreditUser {

    @Id(keyType = KeyType.Auto)
    private Long id;

    private String email;
    private String nickname;

    @Column("avatar_url")
    private String avatarUrl;

    @Column("school_name")
    private String schoolName;

    @Column("campus_name")
    private String campusName;

    @Column("college_name")
    private String collegeName;

    @Column("major_name")
    private String majorName;

    private String grade;

    @Column("class_name")
    private String className;

    @Column("student_no")
    private String studentNo;

    @Column("organization_name")
    private String organizationName;

    /** JSON 字符串,前端传数组,例如 ["志愿服务学分","创新创业学分"] */
    @Column(value = "credit_needs", jdbcType = JdbcType.OTHER, typeHandler = JsonbStringTypeHandler.class)
    private String creditNeeds;

    /** JSON 字符串,前端传数组,例如 [{"type":"志愿服务学分","amount":1}] */
    @Column(value = "credit_obtained", jdbcType = JdbcType.OTHER, typeHandler = JsonbStringTypeHandler.class)
    private String creditObtained;

    private String bio;

    @Column("push_enabled")
    private Boolean pushEnabled;

    @Column("push_only_available")
    private Boolean pushOnlyAvailable;

    @Column("push_only_needed_credit")
    private Boolean pushOnlyNeededCredit;

    @Column("push_frequency")
    private String pushFrequency;

    @Column("profile_completed")
    private Boolean profileCompleted;

    @Column("created_at")
    private LocalDateTime createdAt;

    @Column("updated_at")
    private LocalDateTime updatedAt;
}
