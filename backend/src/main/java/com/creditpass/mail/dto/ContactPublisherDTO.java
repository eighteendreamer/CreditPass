package com.creditpass.mail.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ContactPublisherDTO {
    @NotNull(message = "活动ID不能为空")
    private Long activityId;

    @NotBlank(message = "联系内容不能为空")
    private String message;
}
