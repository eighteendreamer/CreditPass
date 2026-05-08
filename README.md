# CreditPass 校园学分活动推送平台

面向学生的轻量级校园学分活动推送平台。学生通过邮箱验证码登录,维护自己的学校、学院、组织与缺少的学分类型;活动发布者发布活动;系统根据匹配规则向学生邮箱推送最新可参加的学分活动。

## 技术栈

**后端**:Spring Boot 4 · Java 21 · MyBatis-Flex · PostgreSQL · Redis · Sa-Token · MinIO · 阿里云邮件推送

**前端**:Vite · React · TypeScript · shadcn/ui · Tailwind CSS · React Router · Axios · Zustand

## 目录结构

```
.
├── backend          后端 Spring Boot 工程
├── frontend         前端 Vite + React 工程
├── db/init.sql      PostgreSQL 初始化脚本
└── README.md
```

## 环境要求

- JDK 21+
- Maven 3.9+
- Node.js 20+ 与 pnpm
- PostgreSQL 14+
- Redis 6+
- MinIO(本地可用 Docker 启动)

## 快速开始

### 1. 创建数据库

```sql
CREATE DATABASE creditpass;
```

连上 `creditpass` 后执行 `db/init.sql` 建表。

### 2. 启动 Redis

```bash
redis-server
```

### 3. 启动 MinIO

```bash
docker run -d \
  --name minio \
  -p 9000:9000 \
  -p 9001:9001 \
  -e MINIO_ROOT_USER=minioadmin \
  -e MINIO_ROOT_PASSWORD=minioadmin \
  minio/minio server /data --console-address ":9001"
```

登录 `http://localhost:9001` 创建 bucket `creditpass`,设置为 public 读。

### 4. 环境变量

创建环境变量或在启动命令中注入:

```env
ALIYUN_MAIL_API_KEY=your_aliyun_ak
ALIYUN_MAIL_SECRET_KEY=your_aliyun_sk
ALIYUN_MAIL_SENDER_EMAIL=aitest@mail.pantoria.cn

MINIO_ENDPOINT=http://localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=creditpass
MINIO_REGION=cn-beijing-1
MINIO_SECURE=false
```

### 5. 启动后端

```bash
cd backend
mvn spring-boot:run
```

默认端口 `8072`。

### 6. 启动前端

```bash
cd frontend
pnpm install
pnpm dev
```

默认端口 `5173`,API 代理到 `http://localhost:8072`。

## 核心页面

- `/` 首页活动列表(分割线列表,非卡片)
- `/activities/:id` 活动详情
- `/profile` 用户信息
- `/publish` 活动发布
- `/my-activities` 我的发布

登录使用弹窗,不单独路由。

## 安全提示

阿里云邮件密钥必须通过环境变量注入,切勿写死在代码、SQL、README 或提交到 Git。
