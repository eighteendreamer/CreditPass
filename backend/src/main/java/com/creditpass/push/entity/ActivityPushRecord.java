package com.creditpass.push.entity;

import com.mybatisflex.annotation.Column;
import com.mybatisflex.annotation.Id;
import com.mybatisflex.annotation.KeyType;
import com.mybatisflex.annotation.Table;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Table("activity_push_record")
public class ActivityPushRecord {
    @Id(keyType = KeyType.Auto)
    private Long id;

    @Column("activity_id")
    private Long activityId;

    @Column("user_id")
    private Long userId;

    @Column("user_email")
    private String userEmail;

    @Column("matched_credit_type")
    private String matchedCreditType;

    @Column("push_status")
    private String pushStatus;

    @Column("pushed_at")
    private LocalDateTime pushedAt;
}
