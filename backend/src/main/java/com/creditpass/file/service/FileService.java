package com.creditpass.file.service;

import com.creditpass.common.exception.BizException;
import com.creditpass.file.config.MinioProperties;
import io.minio.GetObjectArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.StatObjectArgs;
import io.minio.StatObjectResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.net.URI;
import java.time.LocalDate;
import java.util.Set;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class FileService {

    private static final long MAX_SIZE = 10L * 1024 * 1024;
    private static final Set<String> ALLOWED = Set.of("jpg", "jpeg", "png", "webp", "pdf");

    private final MinioClient minioClient;
    private final MinioProperties props;

    public record PreviewFile(byte[] bytes, String contentType) {}

    public String upload(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BizException("文件为空");
        }
        if (file.getSize() > MAX_SIZE) {
            throw new BizException("文件大小不能超过 10MB");
        }
        String original = file.getOriginalFilename();
        if (original == null || !original.contains(".")) {
            throw new BizException("文件名不合法");
        }
        String ext = original.substring(original.lastIndexOf('.') + 1).toLowerCase();
        if (!ALLOWED.contains(ext)) {
            throw new BizException("不支持的文件类型: " + ext);
        }

        String objectName = "upload/" + LocalDate.now() + "/" + UUID.randomUUID().toString().replace("-", "") + "." + ext;
        try (InputStream is = file.getInputStream()) {
            minioClient.putObject(PutObjectArgs.builder()
                    .bucket(props.getBucket())
                    .object(objectName)
                    .stream(is, file.getSize(), -1)
                    .contentType(file.getContentType())
                    .build());
        } catch (Exception e) {
            log.error("文件上传失败", e);
            throw new BizException("文件上传失败: " + e.getMessage());
        }

        String base = props.getPublicEndpoint() != null && !props.getPublicEndpoint().isBlank()
                ? props.getPublicEndpoint() : props.getEndpoint();
        return base.replaceAll("/$", "") + "/" + props.getBucket() + "/" + objectName;
    }

    public PreviewFile loadPreview(String rawUrl) {
        if (!StringUtils.hasText(rawUrl)) {
            throw new BizException("文件地址不能为空");
        }
        String[] bucketAndObject = parseBucketAndObject(rawUrl);
        String bucket = bucketAndObject[0];
        String objectName = bucketAndObject[1];

        try {
            StatObjectResponse stat = minioClient.statObject(
                    StatObjectArgs.builder().bucket(bucket).object(objectName).build()
            );
            try (InputStream is = minioClient.getObject(
                    GetObjectArgs.builder().bucket(bucket).object(objectName).build()
            )) {
                return new PreviewFile(is.readAllBytes(), resolveContentType(objectName, stat.contentType()));
            }
        } catch (Exception e) {
            log.error("文件预览读取失败: {}", rawUrl, e);
            throw new BizException("文件读取失败: " + e.getMessage());
        }
    }

    private String[] parseBucketAndObject(String rawUrl) {
        try {
            URI uri = URI.create(rawUrl);
            String path = uri.getPath();
            if (!StringUtils.hasText(path)) {
                throw new BizException("文件地址不合法");
            }
            String normalized = path.startsWith("/") ? path.substring(1) : path;
            int slashIndex = normalized.indexOf('/');
            if (slashIndex <= 0 || slashIndex >= normalized.length() - 1) {
                throw new BizException("文件地址不合法");
            }
            String bucket = normalized.substring(0, slashIndex);
            String objectName = normalized.substring(slashIndex + 1);
            return new String[]{bucket, objectName};
        } catch (IllegalArgumentException e) {
            throw new BizException("文件地址不合法");
        }
    }

    private String resolveContentType(String objectName, String contentType) {
        if (StringUtils.hasText(contentType) && !"application/octet-stream".equalsIgnoreCase(contentType)) {
            return contentType;
        }
        String lower = objectName.toLowerCase();
        if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) {
            return "image/jpeg";
        }
        if (lower.endsWith(".png")) {
            return "image/png";
        }
        if (lower.endsWith(".webp")) {
            return "image/webp";
        }
        if (lower.endsWith(".gif")) {
            return "image/gif";
        }
        if (lower.endsWith(".pdf")) {
            return "application/pdf";
        }
        return "application/octet-stream";
    }
}
