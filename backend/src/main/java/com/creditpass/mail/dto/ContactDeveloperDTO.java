package com.creditpass.mail.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ContactDeveloperDTO {

    @NotBlank(message = "问题标题不能为空")
    private String subject;

    @NotBlank(message = "Bug 说明不能为空")
    private String message;

    private String pagePath;
}
