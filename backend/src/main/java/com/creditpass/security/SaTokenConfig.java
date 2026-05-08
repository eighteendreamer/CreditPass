package com.creditpass.security;

import cn.dev33.satoken.stp.StpUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.regex.Pattern;

@Configuration
@RequiredArgsConstructor
public class SaTokenConfig implements WebMvcConfigurer {

    private static final Pattern PUBLIC_ACTIVITY_PATTERN =
            Pattern.compile("^/api/activities(?:/(\\d+|credit-types))?$");

    private final RateLimitInterceptor rateLimitInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(rateLimitInterceptor).addPathPatterns("/api/**");

        registry.addInterceptor(new HandlerInterceptor() {
            @Override
            public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
                String path = request.getRequestURI();
                String method = request.getMethod();

                if (path.startsWith("/api/auth/")) {
                    return true;
                }
                if ("GET".equalsIgnoreCase(method) && PUBLIC_ACTIVITY_PATTERN.matcher(path).matches()) {
                    return true;
                }
                if ("OPTIONS".equalsIgnoreCase(method)) {
                    return true;
                }

                StpUtil.checkLogin();
                return true;
            }
        }).addPathPatterns("/api/**");
    }
}
