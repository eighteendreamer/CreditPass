package com.creditpass.push.service;

import com.creditpass.activity.entity.CreditActivity;
import com.creditpass.activity.mapper.CreditActivityMapper;
import com.creditpass.mail.service.MailService;
import com.creditpass.push.entity.ActivityPushRecord;
import com.creditpass.push.mapper.ActivityPushRecordMapper;
import com.creditpass.user.entity.CreditUser;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ActivityPushService {

    private static final String PUSH_KEY = "creditpass:push:activity:%d:user:%d";
    private static final Duration DEDUP_TTL = Duration.ofDays(30);
    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    private final CreditActivityMapper activityMapper;
    private final ActivityMatchService matchService;
    private final ActivityPushRecordMapper pushRecordMapper;
    private final MailService mailService;
    private final StringRedisTemplate redis;

    @Async
    public void pushForNewActivity(Long activityId) {
        CreditActivity a = activityMapper.selectOneById(activityId);
        if (a == null) return;
        List<CreditUser> users = matchService.matchUsersForActivity(a);
        log.info("活动[{}] 匹配到 {} 位待推送用户", a.getTitle(), users.size());
        for (CreditUser u : users) {
            pushOne(a, u);
        }
    }

    private void pushOne(CreditActivity a, CreditUser u) {
        String key = String.format(PUSH_KEY, a.getId(), u.getId());
        Boolean exists = redis.hasKey(key);
        if (Boolean.TRUE.equals(exists)) return;

        String subject = "【CreditPass】有新的学分活动:" + a.getTitle();
        String endTime = a.getActivityEndTime() != null ? a.getActivityEndTime().format(FMT) : "未指定";
        String html = """
                <div style="font-family:-apple-system,Segoe UI,Arial;padding:24px;background:#F9FAFB;">
                  <div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #E5E7EB;border-radius:8px;padding:28px;">
                    <h2 style="color:#16A34A;margin:0 0 12px;">%s</h2>
                    <p style="color:#6B7280;font-size:13px;margin:0 0 16px;">学分类型:%s · 学分:+%s · 活动结束:%s</p>
                    <p style="color:#1F2937;line-height:1.6;">%s</p>
                    <p style="color:#6B7280;font-size:13px;margin-top:24px;">你因为缺少「%s」学分,收到此活动推送。如需关闭推送,可在用户信息页面设置。</p>
                  </div>
                </div>
                """.formatted(
                safe(a.getTitle()),
                safe(a.getCreditType()),
                a.getCreditAmount() == null ? "0" : a.getCreditAmount().toPlainString(),
                endTime,
                safe(a.getSummary() == null ? (a.getContent() == null ? "" : a.getContent()) : a.getSummary()),
                safe(a.getCreditType())
        );

        boolean ok = mailService.send("activity_push", u.getEmail(), subject, html, a.getId(), u.getId());

        ActivityPushRecord rec = new ActivityPushRecord();
        rec.setActivityId(a.getId());
        rec.setUserId(u.getId());
        rec.setUserEmail(u.getEmail());
        rec.setMatchedCreditType(a.getCreditType());
        rec.setPushStatus(ok ? "success" : "failed");
        rec.setPushedAt(LocalDateTime.now());
        try {
            pushRecordMapper.insert(rec);
        } catch (Exception e) {
            log.warn("推送记录写入失败(可能唯一约束冲突,视为已推送): {}", e.getMessage());
        }
        if (ok) {
            redis.opsForValue().set(String.format(PUSH_KEY, a.getId(), u.getId()), "1", DEDUP_TTL);
        }
    }

    private String safe(String s) {
        if (s == null) return "";
        return s.replace("<", "&lt;").replace(">", "&gt;");
    }
}
