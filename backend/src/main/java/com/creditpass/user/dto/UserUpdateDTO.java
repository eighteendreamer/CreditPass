package com.creditpass.user.dto;

import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class UserUpdateDTO {
    private String nickname;
    private String avatarUrl;
    private String schoolName;
    private String campusName;
    private String collegeName;
    private String majorName;
    private String grade;
    private String className;
    private String studentNo;
    private String organizationName;
    private List<CreditNeedItem> creditNeeds;
    private List<Map<String, Object>> creditObtained;
    private String bio;
    private Boolean pushEnabled;
    private Boolean pushOnlyAvailable;
    private Boolean pushOnlyNeededCredit;
    private String pushFrequency;
}
