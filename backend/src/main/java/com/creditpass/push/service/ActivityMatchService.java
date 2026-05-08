package com.creditpass.push.service;

import com.creditpass.activity.entity.CreditActivity;
import com.creditpass.activity.dto.ActivityVO;
import com.creditpass.user.dto.CreditNeedItem;
import com.creditpass.user.entity.CreditUser;
import com.creditpass.user.mapper.CreditUserMapper;
import com.mybatisflex.core.query.QueryWrapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.List;

import static com.creditpass.user.entity.table.CreditUserTableDef.CREDIT_USER;

/**
 * 活动匹配服务:根据活动特性查找符合条件的学生。
 */
@Service
@RequiredArgsConstructor
public class ActivityMatchService {

    private final CreditUserMapper userMapper;

    public List<CreditUser> matchUsersForActivity(CreditActivity a) {
        // 基础校验
        if (!"published".equals(a.getStatus())) return List.of();
        if (a.getActivityEndTime() != null && a.getActivityEndTime().isBefore(LocalDateTime.now())) {
            return List.of();
        }

        QueryWrapper qw = QueryWrapper.create()
                .where(CREDIT_USER.PUSH_ENABLED.eq(true));

        // scope_type 粗过滤
        if ("college".equals(a.getScopeType()) && StringUtils.hasText(a.getScopeDescription())) {
            qw.and(CREDIT_USER.COLLEGE_NAME.eq(a.getScopeDescription()));
        } else if ("major".equals(a.getScopeType()) && StringUtils.hasText(a.getScopeDescription())) {
            qw.and(CREDIT_USER.MAJOR_NAME.eq(a.getScopeDescription()));
        } else if ("grade".equals(a.getScopeType()) && StringUtils.hasText(a.getScopeDescription())) {
            qw.and(CREDIT_USER.GRADE.eq(a.getScopeDescription()));
        } else if ("organization".equals(a.getScopeType()) && StringUtils.hasText(a.getScopeDescription())) {
            qw.and(CREDIT_USER.ORGANIZATION_NAME.eq(a.getScopeDescription()));
        }

        List<CreditUser> candidates = userMapper.selectListByQuery(qw);

        return candidates.stream().filter(u -> matches(u, a)).toList();
    }

    private boolean matches(CreditUser u, CreditActivity a) {
        if (!Boolean.TRUE.equals(u.getPushEnabled())) return false;

        if (Boolean.TRUE.equals(u.getPushOnlyAvailable())) {
            ActivityVO activity = ActivityVO.from(a);
            if (!Boolean.TRUE.equals(activity.getAvailable())) {
                return false;
            }
        }

        // 学分需求匹配
        if (Boolean.TRUE.equals(u.getPushOnlyNeededCredit())) {
            List<CreditNeedItem> needs = CreditNeedItem.parseList(u.getCreditNeeds());
            boolean matched = needs != null && needs.stream().anyMatch(item ->
                    item != null
                            && item.isEffective()
                            && a.getCreditType().equals(item.getType()));
            if (!matched) {
                return false;
            }
        }
        return true;
    }
}
