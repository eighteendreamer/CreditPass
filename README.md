# CreditPass 校园学分活动推送平台

面向学生的轻量级校园学分活动推送平台。

学生通过邮箱验证码登录，维护自己的学校信息、组织信息和学分需求；活动发布者发布活动；系统按照学校、学分类型、可参加状态等规则匹配用户，并通过邮件推送活动。

## 技术栈

后端：
- Spring Boot 3.3.4
- Java 21
- MyBatis-Flex
- PostgreSQL
- Redis
- Sa-Token
- MinIO
- 阿里云邮件

前端：
- Vite
- React
- TypeScript
- Tailwind CSS
- React Router
- Axios
- Zustand
- Radix UI

## 目录结构

```text
.
├─ backend                 后端 Spring Boot 工程
├─ frontend                前端 Vite + React 工程
├─ db/init.sql             PostgreSQL 初始化脚本
├─ docs/API.md             接口说明
└─ README.md
```

## 当前功能

### 1. 用户侧

- 邮箱验证码登录
- 维护学校、校区、学院、专业、年级、班级、组织等信息
- 维护“学分需求”，格式为“当前学分 / 满学分”
- 配置邮件推送开关
- 配置“只推送可参加活动”
- 配置“只推送我缺少的学分类型”

### 2. 活动侧

- 发布常规活动 / 限时活动
- 自定义学分类型
- 自定义活动时间节点
- 设置参与范围：全校 / 学院 / 专业 / 年级 / 组织
- 上传证明图片
- 查看活动详情
- 查看“我的发布”

### 3. 首页

- 同学校活动隔离
- 学分类型动态筛选
- 关键字搜索
- 只看可参加活动
- 无限滚动分页加载
- 默认每页 15 条

### 4. 系统能力

- 新活动自动邮件推送
- 右下角 Bug 反馈入口，直接发邮件给开发者
- 首次刷新显示使用说明弹窗

## 环境要求

- JDK 21+
- Maven 3.9+
- Node.js 20+
- pnpm 9+
- PostgreSQL 14+
- Redis 6+
- MinIO

## 快速开始

### 1. 创建数据库

```sql
CREATE DATABASE creditpass;
```

连接 `creditpass` 后执行 `db/init.sql`。

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

启动后访问 `http://localhost:9001`，创建 bucket：`creditpass`，并配置为可公开访问。

### 4. 配置后端环境变量

后端会自动读取：
- `backend/.env`
- 项目根目录 `.env`

可参考：

```env
DB_USERNAME=postgres
DB_PASSWORD=123456

REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0
REDIS_PASSWORD=

ALIYUN_MAIL_API_KEY=your_aliyun_ak
ALIYUN_MAIL_SECRET_KEY=your_aliyun_sk
ALIYUN_MAIL_SENDER_EMAIL=aitest@mail.pantoria.cn
ALIYUN_MAIL_REGION_ID=cn-hangzhou

MINIO_ENDPOINT=http://localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=creditpass
MINIO_REGION=cn-beijing-1
MINIO_SECURE=false
MINIO_PUBLIC_ENDPOINT=http://localhost:9000

API_CRYPTO_KEY=creditpass-api-envelope-key
```

### 5. 配置前端环境变量（可选）

如果你要自定义接口响应加密密钥，前后端必须保持一致。

在 `frontend/.env.local` 中配置：

```env
VITE_API_CRYPTO_KEY=creditpass-api-envelope-key
```

如果不配置，前端会使用默认值：

```env
creditpass-api-envelope-key
```

### 6. 启动后端

```bash
cd backend
mvn spring-boot:run
```

默认端口：

```text
8072
```

### 7. 启动前端

```bash
cd frontend
pnpm install
pnpm dev
```

默认端口：

```text
5173
```

## 页面路由

- `/` 首页活动列表
- `/activities/:id` 活动详情
- `/profile` 用户信息
- `/publish` 发布活动
- `/publish/:id` 编辑活动
- `/my-activities` 我的发布

登录采用弹窗，不单独占用登录路由。

## 主要行为说明

### 学分需求

- 用户自己填写缺哪些学分
- 使用“当前学分 / 满学分”格式录入，例如 `0.5/2`
- 只有缺口大于 0 的学分需求才会参与推送匹配

### 学分类型

- 首页筛选项和发布页推荐来源于“同学校已发布活动”的学分类型
- 如果学分类型填写不一致，可能导致匹配和推送失败

### 活动时间

- 固定时间模式支持用户自行添加“时间名称 + 时间”节点
- 不再强制预置“报名开始 / 报名结束 / 活动开始 / 活动结束”

### 活动列表

- 已登录用户看到的是“同学校”的活动
- 首页为分页接口，前端采用无限滚动方式继续请求下一页

## 安全说明

### 已落地

- 登录校验
- 基于 Redis 的接口限流
- 安全响应头
- 前端反调试阻断
- API 响应包加壳加密
- 接口响应禁缓存

### 当前限流规则

- 默认规则：单账号 / 单 IP、单接口、每分钟 3 次
- 浏览类公开接口单独放宽，否则会影响首页分页加载

### 关于“接口响应加密”

当前项目已经支持后端把 `data` 包装成密文包，前端自动解密。

但要明确：

- 这只能隐藏传输中的明文 JSON
- 不能阻止浏览器运行时看到解密后的数据
- 它不是 HTTPS 的替代品

如果你的目标是“真正保护敏感数据”，仍然需要：

- HTTPS
- 服务端最小化返回字段
- 敏感字段脱敏
- 服务端权限校验
- 数据库 / 备份加密

### 不能靠应用层解决的事

以下问题不属于 React / Spring Boot 应用本身能真正处理的范围：

- 禁止端口扫描
- 防止操作系统层面的抓包
- 防止浏览器运行时读取已解密数据

这些要依赖：

- 防火墙
- 安全组
- WAF
- HTTPS / 反向代理
- 主机安全策略

## 开发者信息

- 作者：程序员Eighteen
- 邮箱：`eighteenthstuai@gmail.com`

## 补充

- 接口说明见 [docs/API.md](docs/API.md)
- 数据库初始化脚本见 [db/init.sql](db/init.sql)
