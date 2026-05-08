package com.creditpass.mail.service;

import com.creditpass.mail.aliyun.AliyunMailSender;
import com.creditpass.mail.entity.EmailSendLog;
import com.creditpass.mail.mapper.EmailSendLogMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class MailService {

    private final AliyunMailSender aliyunMailSender;
    private final EmailSendLogMapper logMapper;

    public boolean send(String emailType, String to, String subject, String html,
                        Long relatedActivityId, Long relatedUserId) {
        boolean ok = aliyunMailSender.send(to, subject, html);
        EmailSendLog logEntity = new EmailSendLog();
        logEntity.setEmailType(emailType);
        logEntity.setReceiverEmail(to);
        logEntity.setSubject(subject);
        logEntity.setContent(html);
        logEntity.setSendStatus(ok ? "success" : "failed");
        logEntity.setRelatedActivityId(relatedActivityId);
        logEntity.setRelatedUserId(relatedUserId);
        logEntity.setCreatedAt(LocalDateTime.now());
        try {
            logMapper.insert(logEntity);
        } catch (Exception e) {
            log.warn("邮件日志写入失败", e);
        }
        return ok;
    }

    @Async
    public void sendAsync(String emailType, String to, String subject, String html,
                          Long relatedActivityId, Long relatedUserId) {
        send(emailType, to, subject, html, relatedActivityId, relatedUserId);
    }
}
