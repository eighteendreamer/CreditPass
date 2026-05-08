package com.creditpass.activity.service;

import com.creditpass.activity.dto.ActivityPublishDTO;
import com.creditpass.activity.dto.ActivityVO;
import com.creditpass.activity.entity.CreditActivity;
import com.creditpass.activity.mapper.CreditActivityMapper;
import com.creditpass.common.exception.BizException;
import com.creditpass.common.utils.JsonUtil;
import com.creditpass.push.service.ActivityPushService;
import com.creditpass.user.entity.CreditUser;
import com.creditpass.user.service.UserService;
import com.mybatisflex.core.paginate.Page;
import com.mybatisflex.core.query.QueryWrapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;

import static com.creditpass.activity.entity.table.CreditActivityTableDef.CREDIT_ACTIVITY;

@Service
@RequiredArgsConstructor
public class ActivityService {

    private final CreditActivityMapper activityMapper;
    private final UserService userService;
    private final ActivityPushService pushService;

    public ActivityVO publish(Long userId, ActivityPublishDTO dto) {
        CreditUser user = userService.getByIdOrThrow(userId);
        CreditActivity a = new CreditActivity();
        fill(a, dto);
        a.setPublisherId(user.getId());
        a.setPublisherEmail(user.getEmail());
        a.setStatus("published");
        a.setViewCount(0L);
        a.setCreatedAt(LocalDateTime.now());
        a.setUpdatedAt(LocalDateTime.now());
        activityMapper.insert(a);

        // 发布后异步推送
        pushService.pushForNewActivity(a.getId());
        return ActivityVO.from(a);
    }

    public ActivityVO update(Long userId, Long activityId, ActivityPublishDTO dto) {
        CreditActivity a = activityMapper.selectOneById(activityId);
        if (a == null) throw new BizException(404, "活动不存在");
        if (!a.getPublisherId().equals(userId)) throw new BizException(403, "无权编辑此活动");
        fill(a, dto);
        a.setUpdatedAt(LocalDateTime.now());
        activityMapper.update(a);
        return ActivityVO.from(a);
    }

    public void delete(Long userId, Long activityId) {
        CreditActivity a = activityMapper.selectOneById(activityId);
        if (a == null) throw new BizException(404, "活动不存在");
        if (!a.getPublisherId().equals(userId)) throw new BizException(403, "无权删除此活动");
        activityMapper.deleteById(activityId);
    }

    public ActivityVO detail(Long activityId, boolean incView) {
        CreditActivity a = activityMapper.selectOneById(activityId);
        if (a == null) throw new BizException(404, "活动不存在");
        if (incView) {
            a.setViewCount((a.getViewCount() == null ? 0L : a.getViewCount()) + 1);
            activityMapper.update(a);
        }
        return ActivityVO.from(a);
    }

    public Map<String, Object> list(Long userId, String keyword, String creditType, String category,
                                     Boolean availableOnly, int page, int size) {
        QueryWrapper qw = QueryWrapper.create()
                .where(CREDIT_ACTIVITY.STATUS.eq("published"));
        LocalDateTime now = LocalDateTime.now();

        if (userId != null) {
            CreditUser user = userService.getById(userId);
            if (user != null && StringUtils.hasText(user.getSchoolName())) {
                List<Long> publisherIds = userService.listIdsBySchoolAndOrganization(user.getSchoolName(), null);
                if (publisherIds.isEmpty()) {
                    Map<String, Object> emptyRes = new HashMap<>();
                    emptyRes.put("records", List.of());
                    emptyRes.put("total", 0L);
                    emptyRes.put("page", page);
                    emptyRes.put("size", size);
                    return emptyRes;
                }
                qw.and(CREDIT_ACTIVITY.PUBLISHER_ID.in(publisherIds));
            }
        }

        if (StringUtils.hasText(keyword)) {
            qw.and(CREDIT_ACTIVITY.TITLE.like(keyword).or(CREDIT_ACTIVITY.SUMMARY.like(keyword)));
        }
        if (StringUtils.hasText(creditType)) {
            qw.and(CREDIT_ACTIVITY.CREDIT_TYPE.eq(creditType));
        }
        if (StringUtils.hasText(category)) {
            qw.and(CREDIT_ACTIVITY.CATEGORY.eq(category));
        }
        if (Boolean.TRUE.equals(availableOnly)) {
            qw.and(CREDIT_ACTIVITY.ACTIVITY_END_TIME.isNull().or(CREDIT_ACTIVITY.ACTIVITY_END_TIME.ge(now)));
            qw.and(CREDIT_ACTIVITY.SIGNUP_START_TIME.isNull().or(CREDIT_ACTIVITY.SIGNUP_START_TIME.le(now)));
            qw.and(
                    CREDIT_ACTIVITY.SIGNUP_END_TIME.isNull()
                            .or(CREDIT_ACTIVITY.SIGNUP_END_TIME.ge(now))
                            .or(CREDIT_ACTIVITY.ACTIVITY_START_TIME.isNull())
                            .or(CREDIT_ACTIVITY.ACTIVITY_START_TIME.le(now))
            );
        }
        qw.orderBy(CREDIT_ACTIVITY.CREATED_AT.desc());

        Page<CreditActivity> p = activityMapper.paginate(Page.of(page, size), qw);
        List<ActivityVO> records = p.getRecords().stream().map(ActivityVO::from).toList();
        Map<String, Object> res = new HashMap<>();
        res.put("records", records);
        res.put("total", p.getTotalRow());
        res.put("page", page);
        res.put("size", size);
        return res;
    }

    public List<ActivityVO> listMyPublish(Long userId) {
        QueryWrapper qw = QueryWrapper.create()
                .where(CREDIT_ACTIVITY.PUBLISHER_ID.eq(userId))
                .orderBy(CREDIT_ACTIVITY.CREATED_AT.desc());
        return activityMapper.selectListByQuery(qw).stream().map(ActivityVO::from).toList();
    }

    public List<String> listCreditTypes(Long userId) {
        QueryWrapper query = QueryWrapper.create()
                .where(CREDIT_ACTIVITY.STATUS.eq("published"))
                .orderBy(CREDIT_ACTIVITY.CREATED_AT.desc());

        if (userId != null) {
            CreditUser user = userService.getById(userId);
            if (user != null && StringUtils.hasText(user.getSchoolName())) {
                List<Long> publisherIds = userService.listIdsBySchoolAndOrganization(
                        user.getSchoolName(),
                        null
                );
                if (!publisherIds.isEmpty()) {
                    query.and(CREDIT_ACTIVITY.PUBLISHER_ID.in(publisherIds));
                } else {
                    return List.of();
                }
            }
        }

        LinkedHashSet<String> creditTypes = activityMapper.selectListByQuery(query).stream()
                .map(CreditActivity::getCreditType)
                .filter(StringUtils::hasText)
                .map(String::trim)
                .collect(LinkedHashSet::new, LinkedHashSet::add, LinkedHashSet::addAll);

        return new ArrayList<>(creditTypes);
    }

    public void triggerPush(Long userId, Long activityId) {
        CreditActivity a = activityMapper.selectOneById(activityId);
        if (a == null) throw new BizException(404, "活动不存在");
        if (!a.getPublisherId().equals(userId)) throw new BizException(403, "无权推送此活动");
        pushService.pushForNewActivity(activityId);
    }

    private void fill(CreditActivity a, ActivityPublishDTO dto) {
        a.setTitle(dto.getTitle());
        a.setSummary(dto.getSummary());
        a.setOrganizationStructure(dto.getOrganizationStructure());
        a.setContent(dto.getContent());
        a.setCreditType(dto.getCreditType());
        a.setCreditAmount(dto.getCreditAmount());
        a.setTimeType(dto.getTimeType());
        a.setSignupStartTime(dto.getSignupStartTime());
        a.setSignupEndTime(dto.getSignupEndTime());
        a.setActivityStartTime(dto.getActivityStartTime());
        a.setActivityEndTime(dto.getActivityEndTime());
        a.setStageTimes(dto.getStageTimes() == null ? null : JsonUtil.toJson(dto.getStageTimes()));
        a.setScopeType(dto.getScopeType());
        a.setScopeDescription(dto.getScopeDescription());
        a.setAwards(dto.getAwards());
        a.setActivityUrl(dto.getActivityUrl());
        a.setProofImages(dto.getProofImages() == null ? null : JsonUtil.toJson(dto.getProofImages()));
        a.setCategory(dto.getCategory());
    }
}
