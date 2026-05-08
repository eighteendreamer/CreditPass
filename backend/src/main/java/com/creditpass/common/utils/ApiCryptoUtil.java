package com.creditpass.common.utils;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class ApiCryptoUtil {

    private static final String AES_TRANSFORM = "AES/GCM/NoPadding";
    private static final int GCM_TAG_LENGTH = 128;
    private static final int IV_LENGTH = 12;

    private final ObjectMapper objectMapper;

    @Value("${creditpass.api-crypto-key:creditpass-api-envelope-key}")
    private String apiCryptoKey;

    public Map<String, Object> encryptEnvelope(Object data) {
        if (data == null) {
            return null;
        }

        try {
            String json = objectMapper.writeValueAsString(data);
            byte[] iv = new byte[IV_LENGTH];
            new SecureRandom().nextBytes(iv);

            Cipher cipher = Cipher.getInstance(AES_TRANSFORM);
            cipher.init(Cipher.ENCRYPT_MODE, buildSecretKey(), new GCMParameterSpec(GCM_TAG_LENGTH, iv));
            byte[] encrypted = cipher.doFinal(json.getBytes(StandardCharsets.UTF_8));

            Map<String, Object> envelope = new LinkedHashMap<>();
            envelope.put("encrypted", true);
            envelope.put("alg", "AES-GCM");
            envelope.put("payload", Base64.getEncoder().encodeToString(iv) + "." + Base64.getEncoder().encodeToString(encrypted));
            return envelope;
        } catch (Exception e) {
            throw new RuntimeException("API response encryption failed", e);
        }
    }

    private SecretKeySpec buildSecretKey() throws Exception {
        byte[] source = apiCryptoKey.getBytes(StandardCharsets.UTF_8);
        byte[] digest = MessageDigest.getInstance("SHA-256").digest(source);
        return new SecretKeySpec(digest, "AES");
    }
}
