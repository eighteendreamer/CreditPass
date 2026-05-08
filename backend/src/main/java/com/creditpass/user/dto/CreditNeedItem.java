package com.creditpass.user.dto;

import com.creditpass.common.utils.JsonUtil;
import com.fasterxml.jackson.core.type.TypeReference;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreditNeedItem {
    private String type;
    private BigDecimal currentAmount;
    private BigDecimal targetAmount;
    private BigDecimal missingAmount;

    public boolean isEffective() {
        if (!StringUtils.hasText(type)) {
            return false;
        }
        if (currentAmount != null && targetAmount != null) {
            return targetAmount.compareTo(currentAmount) > 0;
        }
        return missingAmount != null && missingAmount.compareTo(BigDecimal.ZERO) > 0;
    }

    public static List<CreditNeedItem> parseList(String json) {
        List<Object> raw = JsonUtil.fromJson(json, new TypeReference<>() {});
        if (raw == null) {
            return null;
        }

        List<CreditNeedItem> items = new ArrayList<>();
        for (Object obj : raw) {
            CreditNeedItem item = parseOne(obj);
            if (item != null && StringUtils.hasText(item.getType())) {
                items.add(item);
            }
        }
        return items;
    }

    private static CreditNeedItem parseOne(Object obj) {
        if (obj instanceof String s) {
            return new CreditNeedItem(s, BigDecimal.ZERO, BigDecimal.ONE, BigDecimal.ONE);
        }
        if (obj instanceof Map<?, ?> map) {
            String type = stringify(map.get("type"));
            if (!StringUtils.hasText(type)) {
                return null;
            }

            BigDecimal currentAmount = toBigDecimal(map.get("currentAmount"));
            BigDecimal targetAmount = toBigDecimal(map.get("targetAmount"));
            BigDecimal missingAmount = toBigDecimal(map.get("missingAmount"));
            if (missingAmount == null) {
                missingAmount = toBigDecimal(map.get("amount"));
            }

            if (currentAmount != null && targetAmount != null) {
                if (missingAmount == null) {
                    missingAmount = targetAmount.subtract(currentAmount);
                }
                return new CreditNeedItem(type, currentAmount, targetAmount, missingAmount);
            }

            if (missingAmount == null) {
                missingAmount = BigDecimal.ONE;
            }
            return new CreditNeedItem(type, BigDecimal.ZERO, missingAmount, missingAmount);
        }
        return null;
    }

    private static String stringify(Object value) {
        return value == null ? null : String.valueOf(value).trim();
    }

    private static BigDecimal toBigDecimal(Object value) {
        if (value == null) {
            return null;
        }
        if (value instanceof BigDecimal decimal) {
            return decimal;
        }
        if (value instanceof Number number) {
            return BigDecimal.valueOf(number.doubleValue());
        }
        String text = stringify(value);
        if (!StringUtils.hasText(text)) {
            return null;
        }
        try {
            return new BigDecimal(text);
        } catch (NumberFormatException e) {
            return null;
        }
    }
}
