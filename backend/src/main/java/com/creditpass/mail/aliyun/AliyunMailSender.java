package com.creditpass.mail.aliyun;

import com.aliyuncs.DefaultAcsClient;
import com.aliyuncs.IAcsClient;
import com.aliyuncs.dm.model.v20151123.SingleSendMailRequest;
import com.aliyuncs.dm.model.v20151123.SingleSendMailResponse;
import com.aliyuncs.http.MethodType;
import com.aliyuncs.profile.DefaultProfile;
import com.aliyuncs.profile.IClientProfile;
import com.creditpass.mail.config.MailProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Slf4j
@Component
@RequiredArgsConstructor
public class AliyunMailSender {

    private final MailProperties props;

    /** 发送 HTML 邮件。无 AK/SK 时走 dry-run,把内容打到日志 */
    public boolean send(String toEmail, String subject, String htmlBody) {
        if (!StringUtils.hasText(props.getApiKey()) || !StringUtils.hasText(props.getSecretKey())) {
            log.warn("阿里云邮件密钥未配置,走 DRY-RUN 模式。收件人={}, 标题={}\n正文:\n{}", toEmail, subject, htmlBody);
            return true;
        }
        try {
            IClientProfile profile = DefaultProfile.getProfile(props.getRegionId(), props.getApiKey(), props.getSecretKey());
            IAcsClient client = new DefaultAcsClient(profile);
            SingleSendMailRequest req = new SingleSendMailRequest();
            req.setSysMethod(MethodType.POST);
            req.setAccountName(props.getAccountName());
            req.setFromAlias(props.getFromAlias());
            req.setAddressType(1);
            req.setTagName("creditpass");
            req.setReplyToAddress(true);
            req.setToAddress(toEmail);
            req.setSubject(subject);
            req.setHtmlBody(htmlBody);
            SingleSendMailResponse resp = client.getAcsResponse(req);
            log.info("阿里云邮件发送成功,RequestId={}, 收件人={}", resp.getRequestId(), toEmail);
            return true;
        } catch (Exception e) {
            log.error("阿里云邮件发送失败,收件人={}", toEmail, e);
            return false;
        }
    }
}
