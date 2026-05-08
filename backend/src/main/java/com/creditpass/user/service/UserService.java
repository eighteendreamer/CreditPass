package com.creditpass.user.service;

import com.creditpass.common.exception.BizException;
import com.creditpass.common.utils.JsonUtil;
import com.creditpass.user.dto.UserUpdateDTO;
import com.creditpass.user.entity.CreditUser;
import com.creditpass.user.mapper.CreditUserMapper;
import com.mybatisflex.core.query.QueryWrapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

import static com.creditpass.user.entity.table.CreditUserTableDef.CREDIT_USER;

@Service
@RequiredArgsConstructor
public class UserService {

    private final CreditUserMapper userMapper;

    public CreditUser findByEmail(String email) {
        return userMapper.selectOneByQuery(
                QueryWrapper.create().where(CREDIT_USER.EMAIL.eq(email))
        );
    }

    public CreditUser getById(Long id) {
        return userMapper.selectOneById(id);
    }

    public List<Long> listIdsBySchoolAndOrganization(String schoolName, String organizationName) {
        if (!StringUtils.hasText(schoolName)) {
            return Collections.emptyList();
        }

        QueryWrapper query = QueryWrapper.create()
                .select(CREDIT_USER.ID)
                .where(CREDIT_USER.SCHOOL_NAME.eq(schoolName));

        if (StringUtils.hasText(organizationName)) {
            query.and(CREDIT_USER.ORGANIZATION_NAME.eq(organizationName));
        }

        return userMapper.selectListByQuery(query).stream()
                .map(CreditUser::getId)
                .filter(id -> id != null)
                .toList();
    }

    public CreditUser getByIdOrThrow(Long id) {
        CreditUser u = userMapper.selectOneById(id);
        if (u == null) {
            throw new BizException(404, "用户不存在");
        }
        return u;
    }

    /** 邮箱不存在则创建,存在则直接返回 */
    public CreditUser findOrCreate(String email) {
        CreditUser u = findByEmail(email);
        if (u != null) return u;
        u = new CreditUser();
        u.setEmail(email);
        u.setNickname(email.split("@")[0]);
        u.setPushEnabled(Boolean.TRUE);
        u.setPushOnlyAvailable(Boolean.TRUE);
        u.setPushOnlyNeededCredit(Boolean.TRUE);
        u.setPushFrequency("immediate");
        u.setProfileCompleted(Boolean.FALSE);
        u.setCreatedAt(LocalDateTime.now());
        u.setUpdatedAt(LocalDateTime.now());
        userMapper.insert(u);
        return u;
    }

    public CreditUser update(Long userId, UserUpdateDTO dto) {
        CreditUser u = getByIdOrThrow(userId);
        if (dto.getNickname() != null) u.setNickname(dto.getNickname());
        if (dto.getAvatarUrl() != null) u.setAvatarUrl(dto.getAvatarUrl());
        if (dto.getSchoolName() != null) u.setSchoolName(dto.getSchoolName());
        if (dto.getCampusName() != null) u.setCampusName(dto.getCampusName());
        if (dto.getCollegeName() != null) u.setCollegeName(dto.getCollegeName());
        if (dto.getMajorName() != null) u.setMajorName(dto.getMajorName());
        if (dto.getGrade() != null) u.setGrade(dto.getGrade());
        if (dto.getClassName() != null) u.setClassName(dto.getClassName());
        if (dto.getStudentNo() != null) u.setStudentNo(dto.getStudentNo());
        if (dto.getOrganizationName() != null) u.setOrganizationName(dto.getOrganizationName());
        if (dto.getBio() != null) u.setBio(dto.getBio());
        if (dto.getCreditNeeds() != null) u.setCreditNeeds(JsonUtil.toJson(dto.getCreditNeeds()));
        if (dto.getCreditObtained() != null) u.setCreditObtained(JsonUtil.toJson(dto.getCreditObtained()));
        if (dto.getPushEnabled() != null) u.setPushEnabled(dto.getPushEnabled());
        if (dto.getPushOnlyAvailable() != null) u.setPushOnlyAvailable(dto.getPushOnlyAvailable());
        if (dto.getPushOnlyNeededCredit() != null) u.setPushOnlyNeededCredit(dto.getPushOnlyNeededCredit());
        if (dto.getPushFrequency() != null) u.setPushFrequency(dto.getPushFrequency());

        u.setProfileCompleted(StringUtils.hasText(u.getSchoolName())
                && StringUtils.hasText(u.getCollegeName()));

        u.setUpdatedAt(LocalDateTime.now());
        userMapper.update(u);
        return u;
    }
}
