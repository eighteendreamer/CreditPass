package com.creditpass.security;

import cn.dev33.satoken.stp.StpUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import org.springframework.web.servlet.HandlerInterceptor;

import java.io.IOException;
import java.time.Duration;
import java.util.regex.Pattern;

@Component
@RequiredArgsConstructor
public class RateLimitInterceptor implements HandlerInterceptor {

    private static final Duration WINDOW = Duration.ofMinutes(1);
    private static final Pattern PUBLIC_ACTIVITY_PATTERN =
            Pattern.compile("^/api/activities(?:/(\\d+|credit-types))?$");

    private final StringRedisTemplate stringRedisTemplate;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws IOException {
        String method = request.getMethod();
        String path = request.getRequestURI();

        if ("OPTIONS".equalsIgnoreCase(method) || !path.startsWith("/api/")) {
            return true;
        }

        int limit = resolveLimit(path, method);
        if (limit <= 0) {
            return true;
        }

        String actor = resolveActor(request);
        String key = "rate_limit:%s:%s:%s".formatted(method.toUpperCase(), path, actor);
        Long current = stringRedisTemplate.opsForValue().increment(key);
        if (current != null && current == 1) {
            stringRedisTemplate.expire(key, WINDOW);
        }

        if (current != null && current > limit) {
            response.setStatus(429);
            response.setCharacterEncoding("UTF-8");
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write("""
                    {"code":429,"message":"请求过于频繁，请稍后再试","data":null}
                    """.trim());
            return false;
        }
        return true;
    }

    private int resolveLimit(String path, String method) {
        if ("GET".equalsIgnoreCase(method) && PUBLIC_ACTIVITY_PATTERN.matcher(path).matches()) {
            return 60;
        }
        return 3;
    }

    private String resolveActor(HttpServletRequest request) {
        if (StpUtil.isLogin()) {
            return "user:" + StpUtil.getLoginIdAsString();
        }

        String forwardedFor = request.getHeader("X-Forwarded-For");
        if (forwardedFor != null && !forwardedFor.isBlank()) {
            return "ip:" + forwardedFor.split(",")[0].trim();
        }

        String realIp = request.getHeader("X-Real-IP");
        if (realIp != null && !realIp.isBlank()) {
            return "ip:" + realIp.trim();
        }

        return "ip:" + request.getRemoteAddr();
    }
}
