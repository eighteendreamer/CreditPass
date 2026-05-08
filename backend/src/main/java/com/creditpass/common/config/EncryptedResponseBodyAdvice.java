package com.creditpass.common.config;

import com.creditpass.common.result.R;
import com.creditpass.common.utils.ApiCryptoUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.core.MethodParameter;
import org.springframework.http.MediaType;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.mvc.method.annotation.ResponseBodyAdvice;

@RestControllerAdvice
@RequiredArgsConstructor
public class EncryptedResponseBodyAdvice implements ResponseBodyAdvice<Object> {

    private final ApiCryptoUtil apiCryptoUtil;

    @Override
    public boolean supports(MethodParameter returnType, Class<? extends HttpMessageConverter<?>> converterType) {
        return R.class.isAssignableFrom(returnType.getParameterType());
    }

    @Override
    @SuppressWarnings({"rawtypes", "unchecked"})
    public Object beforeBodyWrite(
            Object body,
            MethodParameter returnType,
            MediaType selectedContentType,
            Class<? extends HttpMessageConverter<?>> selectedConverterType,
            ServerHttpRequest request,
            ServerHttpResponse response
    ) {
        if (!(body instanceof R result) || result.getData() == null) {
            return body;
        }

        result.setData(apiCryptoUtil.encryptEnvelope(result.getData()));
        return result;
    }
}
