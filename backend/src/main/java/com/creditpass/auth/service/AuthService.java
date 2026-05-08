package com.creditpass.auth.service;

import cn.dev33.satoken.stp.StpUtil;
import cn.hutool.core.util.RandomUtil;
import com.creditpass.common.exception.BizException;
import com.creditpass.mail.service.MailService;
import com.creditpass.user.dto.UserVO;
import com.creditpass.user.entity.CreditUser;
import com.creditpass.user.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private static final String CODE_KEY = "creditpass:auth:email-code:";
    private static final String RATE_KEY = "creditpass:auth:email-rate:";
    private static final Duration CODE_TTL = Duration.ofMinutes(5);
    private static final Duration RATE_TTL = Duration.ofSeconds(60);

    private final StringRedisTemplate redis;
    private final MailService mailService;
    private final UserService userService;

    public void sendCode(String email) {
        String rateKey = RATE_KEY + email;
        Boolean limited = redis.hasKey(rateKey);
        if (Boolean.TRUE.equals(limited)) {
            throw new BizException("请求过于频繁,请 60 秒后再试");
        }
        String code = RandomUtil.randomNumbers(6);
        redis.opsForValue().set(CODE_KEY + email, code, CODE_TTL);
        redis.opsForValue().set(rateKey, "1", RATE_TTL);

        String subject = "【CreditPass】你的登录验证码";
        String html = """
                <div style="font-family:-apple-system,Segoe UI,Arial;padding:24px;background:#F9FAFB;">
                  <div style="max-width:520px;margin:0 auto;background:#fff;border:1px solid #E5E7EB;border-radius:8px;padding:32px;">
                    <h2 style="color:#16A34A;margin:0 0 16px;">CreditPass 登录验证码</h2>
                    <p style="color:#1F2937;">你好,你的登录验证码为:</p>
                    <div style="font-size:28px;font-weight:700;letter-spacing:4px;color:#16A34A;margin:16px 0;">%s</div>
                    <p style="color:#6B7280;font-size:13px;">验证码 5 分钟内有效,请勿告诉他人。</p>
                  </div>
                </div>
                """.formatted(code);
        mailService.sendAsync("login_code", email, subject, html, null, null);
        log.info("发送验证码到 {},验证码={}(生产环境请勿打印)", email, code);
    }

    public Map<String, Object> emailLogin(String email, String code) {
        String key = CODE_KEY + email;
        String saved = redis.opsForValue().get(key);
        if (saved == null) {
            throw new BizException("验证码已过期,请重新获取");
        }
        if (!saved.equals(code)) {
            throw new BizException("验证码不正确");
        }
        redis.delete(key);

        CreditUser user = userService.findOrCreate(email);
        StpUtil.login(user.getId());
        String token = StpUtil.getTokenValue();

        Map<String, Object> data = new HashMap<>();
        data.put("token", token);
        data.put("user", UserVO.from(user));
        return data;
    }

    public void logout() {
        StpUtil.logout();
    }
}
