package com.creditpass.mail.controller;

import cn.dev33.satoken.stp.StpUtil;
import com.creditpass.activity.entity.CreditActivity;
import com.creditpass.activity.mapper.CreditActivityMapper;
import com.creditpass.common.exception.BizException;
import com.creditpass.common.result.R;
import com.creditpass.mail.dto.ContactDeveloperDTO;
import com.creditpass.mail.dto.ContactPublisherDTO;
import com.creditpass.mail.service.MailService;
import com.creditpass.user.entity.CreditUser;
import com.creditpass.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/mail")
@RequiredArgsConstructor
public class MailController {

    private static final String DEVELOPER_NAME = "Programmer Eighteen";
    private static final String DEVELOPER_EMAIL = "eighteenthstuai@gmail.com";

    private final CreditActivityMapper activityMapper;
    private final UserService userService;
    private final MailService mailService;

    @PostMapping("/contact-publisher")
    public R<Void> contactPublisher(@Valid @RequestBody ContactPublisherDTO dto) {
        Long userId = StpUtil.getLoginIdAsLong();
        CreditUser user = userService.getByIdOrThrow(userId);
        CreditActivity activity = activityMapper.selectOneById(dto.getActivityId());
        if (activity == null) throw new BizException(404, "Activity not found");

        String subject = "CreditPass student inquiry: " + activity.getTitle();
        String html = """
                <div style="font-family:-apple-system,Segoe UI,Arial;padding:24px;background:#F9FAFB;">
                  <div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #E5E7EB;border-radius:8px;padding:28px;">
                    <h2 style="color:#16A34A;margin:0 0 12px;">Your activity has received a student inquiry</h2>
                    <p style="color:#1F2937;"><strong>Activity:</strong> %s</p>
                    <p style="color:#1F2937;"><strong>Student email:</strong> %s</p>
                    <p style="color:#1F2937;"><strong>Message:</strong></p>
                    <div style="background:#F0FDF4;padding:16px;border-left:3px solid #16A34A;white-space:pre-wrap;color:#1F2937;">%s</div>
                    <p style="color:#6B7280;font-size:13px;margin-top:24px;">You can reply to this email directly to contact the student.</p>
                  </div>
                </div>
                """.formatted(
                escape(activity.getTitle()),
                escape(user.getEmail()),
                escape(dto.getMessage())
        );

        boolean ok = mailService.send(
                "contact_publisher",
                activity.getPublisherEmail(),
                subject,
                html,
                activity.getId(),
                userId
        );
        if (!ok) throw new BizException("Email sending failed, please try again later");
        return R.ok(null, "The inquiry has been sent to the publisher");
    }

    @PostMapping("/contact-developer")
    public R<Void> contactDeveloper(@Valid @RequestBody ContactDeveloperDTO dto) {
        Long userId = StpUtil.getLoginIdAsLong();
        CreditUser user = userService.getByIdOrThrow(userId);

        String subject = "CreditPass Bug Report: " + dto.getSubject().trim();
        String html = """
                <div style="font-family:-apple-system,Segoe UI,Arial;padding:24px;background:#F9FAFB;">
                  <div style="max-width:620px;margin:0 auto;background:#fff;border:1px solid #E5E7EB;border-radius:8px;padding:28px;">
                    <h2 style="color:#16A34A;margin:0 0 12px;">A new bug report has arrived</h2>
                    <p style="color:#1F2937;"><strong>Developer:</strong> %s (%s)</p>
                    <p style="color:#1F2937;"><strong>Reporter:</strong> %s (%s)</p>
                    <p style="color:#1F2937;"><strong>School:</strong> %s</p>
                    <p style="color:#1F2937;"><strong>Organization:</strong> %s</p>
                    <p style="color:#1F2937;"><strong>Page:</strong> %s</p>
                    <p style="color:#1F2937;"><strong>Subject:</strong> %s</p>
                    <p style="color:#1F2937;"><strong>Details:</strong></p>
                    <div style="background:#F0FDF4;padding:16px;border-left:3px solid #16A34A;white-space:pre-wrap;color:#1F2937;">%s</div>
                    <p style="color:#6B7280;font-size:13px;margin-top:24px;">This email was sent automatically by CreditPass.</p>
                  </div>
                </div>
                """.formatted(
                escape(DEVELOPER_NAME),
                escape(DEVELOPER_EMAIL),
                escape(user.getNickname()),
                escape(user.getEmail()),
                escape(user.getSchoolName()),
                escape(user.getOrganizationName()),
                escape(dto.getPagePath()),
                escape(dto.getSubject()),
                escape(dto.getMessage())
        );

        boolean ok = mailService.send("contact_developer", DEVELOPER_EMAIL, subject, html, null, userId);
        if (!ok) throw new BizException("Bug report sending failed, please try again later");
        return R.ok(null, "Bug report sent to the developer");
    }

    private String escape(String s) {
        if (s == null) return "";
        return s.replace("<", "&lt;").replace(">", "&gt;");
    }
}
