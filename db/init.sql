-- CreditPass 校园学分活动推送平台 初始化脚本
-- PostgreSQL 14+

-- 1. 用户表
CREATE TABLE IF NOT EXISTS credit_user (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    nickname VARCHAR(100),
    avatar_url TEXT,

    school_name VARCHAR(100),
    campus_name VARCHAR(100),
    college_name VARCHAR(100),
    major_name VARCHAR(100),
    grade VARCHAR(50),
    class_name VARCHAR(100),
    student_no VARCHAR(100),
    organization_name VARCHAR(255),

    credit_needs JSONB,
    credit_obtained JSONB,
    bio TEXT,

    push_enabled BOOLEAN DEFAULT TRUE,
    push_only_available BOOLEAN DEFAULT TRUE,
    push_only_needed_credit BOOLEAN DEFAULT TRUE,
    push_frequency VARCHAR(50) DEFAULT 'immediate',

    profile_completed BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_email ON credit_user(email);
CREATE INDEX IF NOT EXISTS idx_user_school ON credit_user(school_name);

-- 2. 活动表
CREATE TABLE IF NOT EXISTS credit_activity (
    id BIGSERIAL PRIMARY KEY,

    title VARCHAR(255) NOT NULL,
    summary TEXT,
    organization_structure TEXT,
    content TEXT,

    credit_type VARCHAR(100) NOT NULL,
    credit_amount NUMERIC(6,2) NOT NULL DEFAULT 0,

    time_type VARCHAR(50) NOT NULL,
    signup_start_time TIMESTAMP,
    signup_end_time TIMESTAMP,
    activity_start_time TIMESTAMP,
    activity_end_time TIMESTAMP,
    stage_times JSONB,

    scope_type VARCHAR(50),
    scope_description TEXT,

    awards TEXT,
    activity_url TEXT,
    proof_images JSONB,

    category VARCHAR(50) NOT NULL,

    publisher_id BIGINT NOT NULL,
    publisher_email VARCHAR(255) NOT NULL,

    status VARCHAR(50) DEFAULT 'published',
    view_count BIGINT DEFAULT 0,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_activity_publisher ON credit_activity(publisher_id);
CREATE INDEX IF NOT EXISTS idx_activity_status ON credit_activity(status);
CREATE INDEX IF NOT EXISTS idx_activity_credit_type ON credit_activity(credit_type);
CREATE INDEX IF NOT EXISTS idx_activity_end_time ON credit_activity(activity_end_time);

-- 3. 邮件配置表(仅作信息记录,真实密钥通过环境变量注入)
CREATE TABLE IF NOT EXISTS email_config (
    id BIGSERIAL PRIMARY KEY,
    config_name VARCHAR(100) NOT NULL,
    provider VARCHAR(50) NOT NULL,
    api_key TEXT,
    secret_key TEXT,
    sender_email VARCHAR(255),
    test_email VARCHAR(255),
    test_mode BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    description TEXT,
    smtp_host VARCHAR(255),
    smtp_port INTEGER,
    smtp_username VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. 邮件发送记录表
CREATE TABLE IF NOT EXISTS email_send_log (
    id BIGSERIAL PRIMARY KEY,
    email_type VARCHAR(50) NOT NULL,
    receiver_email VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    content TEXT,
    send_status VARCHAR(50) NOT NULL,
    error_message TEXT,
    related_activity_id BIGINT,
    related_user_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_email_log_receiver ON email_send_log(receiver_email);
CREATE INDEX IF NOT EXISTS idx_email_log_type ON email_send_log(email_type);

-- 5. 用户活动推送记录表
CREATE TABLE IF NOT EXISTS activity_push_record (
    id BIGSERIAL PRIMARY KEY,
    activity_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    matched_credit_type VARCHAR(100),
    push_status VARCHAR(50) NOT NULL,
    pushed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(activity_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_push_activity ON activity_push_record(activity_id);
CREATE INDEX IF NOT EXISTS idx_push_user ON activity_push_record(user_id);
