package com.creditpass.auth.controller;

import com.creditpass.auth.dto.EmailCodeDTO;
import com.creditpass.auth.dto.EmailLoginDTO;
import com.creditpass.auth.service.AuthService;
import com.creditpass.common.result.R;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/email-code")
    public R<Void> sendCode(@Valid @RequestBody EmailCodeDTO dto) {
        authService.sendCode(dto.getEmail());
        return R.ok(null, "验证码已发送");
    }

    @PostMapping("/email-login")
    public R<Map<String, Object>> login(@Valid @RequestBody EmailLoginDTO dto) {
        return R.ok(authService.emailLogin(dto.getEmail(), dto.getCode()), "登录成功");
    }

    @PostMapping("/logout")
    public R<Void> logout() {
        authService.logout();
        return R.ok();
    }
}
