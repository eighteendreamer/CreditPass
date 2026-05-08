package com.creditpass.activity.controller;

import cn.dev33.satoken.stp.StpUtil;
import com.creditpass.activity.dto.ActivityPublishDTO;
import com.creditpass.activity.dto.ActivityVO;
import com.creditpass.activity.service.ActivityService;
import com.creditpass.common.result.R;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/activities")
@RequiredArgsConstructor
public class ActivityController {

    private final ActivityService activityService;

    @GetMapping
    public R<Map<String, Object>> list(@RequestParam(required = false) String keyword,
                                       @RequestParam(required = false) String creditType,
                                       @RequestParam(required = false) String category,
                                       @RequestParam(required = false) Boolean availableOnly,
                                       @RequestParam(defaultValue = "1") int page,
                                       @RequestParam(defaultValue = "15") int size) {
        Long userId = StpUtil.isLogin() ? StpUtil.getLoginIdAsLong() : null;
        return R.ok(activityService.list(userId, keyword, creditType, category, availableOnly, page, size));
    }

    @GetMapping("/{id}")
    public R<ActivityVO> detail(@PathVariable Long id,
                                @RequestParam(defaultValue = "true") boolean incView) {
        return R.ok(activityService.detail(id, incView));
    }

    @GetMapping("/credit-types")
    public R<List<String>> creditTypes() {
        Long userId = StpUtil.isLogin() ? StpUtil.getLoginIdAsLong() : null;
        return R.ok(activityService.listCreditTypes(userId));
    }

    @PostMapping
    public R<ActivityVO> publish(@Valid @RequestBody ActivityPublishDTO dto) {
        Long userId = StpUtil.getLoginIdAsLong();
        return R.ok(activityService.publish(userId, dto), "发布成功");
    }

    @PutMapping("/{id}")
    public R<ActivityVO> update(@PathVariable Long id, @Valid @RequestBody ActivityPublishDTO dto) {
        Long userId = StpUtil.getLoginIdAsLong();
        return R.ok(activityService.update(userId, id, dto));
    }

    @DeleteMapping("/{id}")
    public R<Void> delete(@PathVariable Long id) {
        Long userId = StpUtil.getLoginIdAsLong();
        activityService.delete(userId, id);
        return R.ok();
    }

    @GetMapping("/my")
    public R<List<ActivityVO>> my() {
        Long userId = StpUtil.getLoginIdAsLong();
        return R.ok(activityService.listMyPublish(userId));
    }

    @PostMapping("/{id}/push")
    public R<Void> push(@PathVariable Long id) {
        Long userId = StpUtil.getLoginIdAsLong();
        activityService.triggerPush(userId, id);
        return R.ok(null, "推送已触发");
    }
}
