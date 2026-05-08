package com.creditpass.mail.entity;

import com.mybatisflex.annotation.Column;
import com.mybatisflex.annotation.Id;
import com.mybatisflex.annotation.KeyType;
import com.mybatisflex.annotation.Table;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Table("email_send_log")
public class EmailSendLog {
    @Id(keyType = KeyType.Auto)
    private Long id;

    @Column("email_type")
    private String emailType;

    @Column("receiver_email")
    private String receiverEmail;

    private String subject;
    private String content;

    @Column("send_status")
    private String sendStatus;

    @Column("error_message")
    private String errorMessage;

    @Column("related_activity_id")
    private Long relatedActivityId;

    @Column("related_user_id")
    private Long relatedUserId;

    @Column("created_at")
    private LocalDateTime createdAt;
}
