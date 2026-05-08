package com.creditpass.mail.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "creditpass.mail")
public class MailProperties {
    private String provider = "aliyun";
    private String apiKey;
    private String secretKey;
    private String senderEmail;
    private String regionId = "cn-hangzhou";
    private String accountName;
    private String fromAlias = "CreditPass";
}
