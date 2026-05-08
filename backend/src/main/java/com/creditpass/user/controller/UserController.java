package com.creditpass.user.controller;

import cn.dev33.satoken.stp.StpUtil;
import com.creditpass.common.result.R;
import com.creditpass.user.dto.UserUpdateDTO;
import com.creditpass.user.dto.UserVO;
import com.creditpass.user.entity.CreditUser;
import com.creditpass.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public R<UserVO> me() {
        Long userId = StpUtil.getLoginIdAsLong();
        CreditUser u = userService.getByIdOrThrow(userId);
        return R.ok(UserVO.from(u));
    }

    @PutMapping("/me")
    public R<UserVO> update(@RequestBody UserUpdateDTO dto) {
        Long userId = StpUtil.getLoginIdAsLong();
        CreditUser u = userService.update(userId, dto);
        return R.ok(UserVO.from(u));
    }
}
