package com.creditpass.file.service;

import com.creditpass.common.exception.BizException;
import com.creditpass.file.config.MinioProperties;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
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
}
