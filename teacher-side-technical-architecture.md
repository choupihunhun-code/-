# 教师端教务系统技术选型与第一版工程架构方案

## 1. 文档目的

本文档用于确定教师端教务系统 MVP 的第一版技术路线和工程架构，帮助后续进入真实开发阶段。

设计目标：

- 优先支持 MVP 快速落地。
- 架构简单、清晰、可维护。
- 支持后续扩展学生端、AI 批阅、文件预览和教务系统对接。
- 避免第一版过度工程化。

## 2. 技术选型建议

## 2.1 前端

建议：

- 框架：React + TypeScript
- 构建工具：Vite
- 路由：React Router
- UI 实现：自定义业务组件 + CSS Modules 或普通 CSS
- 表格：先用自定义表格，后续再引入成熟表格库
- 状态管理：React Query + 局部状态
- 表单：React Hook Form

选择理由：

- React 生态成熟，适合后台管理系统。
- TypeScript 有利于接口和状态枚举约束。
- Vite 启动快，适合 MVP 快速迭代。
- React Query 适合处理列表、详情、提交、批阅这类接口状态。

暂不建议第一版引入：

- 复杂低代码框架
- 重型全家桶后台模板
- 微前端
- 复杂全局状态管理

## 2.2 后端

建议：

- 语言：Node.js + TypeScript
- 框架：NestJS
- API 风格：REST API
- ORM：Prisma
- 鉴权：JWT
- 文件处理：Multer 或对象存储直传适配层

选择理由：

- 前后端都使用 TypeScript，降低协作和类型转换成本。
- NestJS 结构清晰，适合按模块拆分业务。
- Prisma 对数据模型、迁移和类型提示友好。
- REST API 足够覆盖 MVP，不需要一开始上 GraphQL。

## 2.3 数据库

建议：

- 开发环境：PostgreSQL 或 SQLite
- 生产环境：PostgreSQL

选择理由：

- PostgreSQL 适合结构化业务数据和复杂查询。
- 后续可扩展 JSON 字段保存 AI 原始结果、评分细则等半结构化数据。
- 如果本地开发希望简单，可先用 SQLite，但正式开发建议直接 PostgreSQL。

## 2.4 文件存储

MVP 建议分两阶段：

第一阶段：

- 本地文件存储
- 文件元数据存数据库
- 支持上传、下载、基础类型校验

第二阶段：

- 对象存储，如阿里云 OSS、腾讯云 COS、S3 兼容服务
- 上传凭证直传
- CDN 或私有下载链接

第一版不要把文件服务做得太复杂，但接口层要预留 `file_url`、`storage_key`、`content_type`、`file_size` 字段。

## 2.5 AI 服务

建议：

- 后端封装独立 AIReviewService
- AI 调用采用异步任务模式
- AI 输出必须结构化 JSON
- 保存 AI 状态、失败原因、模型名称、prompt 版本

第一版可以先支持两种模式：

- Mock AI：用于开发和演示闭环
- Real AI：接入真实大模型 API

AI 结果必须经过教师复核后才能发布给学生。

## 2.6 异步任务

MVP 简化建议：

- 开发阶段：后端进程内任务队列
- 稳定后：BullMQ + Redis

适用场景：

- AI 初评
- 批量 AI 初评
- 成绩导出
- 文件内容抽取

第一版如果不想引入 Redis，可以先实现任务表 + 轮询处理，但要把任务状态设计好。

## 2.7 文件内容抽取

建议：

- PDF：pdf-parse 或后端工具服务
- Word：mammoth
- 纯文本：直接读取
- PPT/Excel：MVP 可先不做深度抽取，只支持附件下载或提示人工处理

MVP 优先支持：

- 文本提交
- PDF
- Word

文件无法解析时，AI 初评状态进入失败或需人工处理。

## 2.8 成绩导出

建议：

- 后端生成 Excel
- 库：exceljs
- 导出结果保存为文件
- 前端轮询导出任务状态并下载

第一版导出字段固定，后续再支持自定义模板。

## 3. 第一版工程结构

## 3.1 推荐仓库结构

```text
edu-teacher-system/
  apps/
    web/
      src/
        app/
        pages/
        components/
        features/
        services/
        styles/
    api/
      src/
        modules/
        common/
        jobs/
        prisma/
  packages/
    shared/
      src/
        types/
        constants/
  docs/
    product/
    api/
  uploads/
```

说明：

- `apps/web`：教师端和学生端前端。
- `apps/api`：后端 API 服务。
- `packages/shared`：共享类型、枚举、接口 DTO。
- `docs`：产品、接口、开发文档。
- `uploads`：本地开发文件存储目录。

如果希望更简单，也可以第一版不做 monorepo：

```text
edu-teacher-system/
  frontend/
  backend/
  docs/
  uploads/
```

建议：如果一开始就确定前后端都用 TypeScript，推荐 monorepo。

## 3.2 前端目录建议

```text
apps/web/src/
  app/
    router.tsx
    query-client.ts
  pages/
    teacher/
      LoginPage.tsx
      DashboardPage.tsx
      CourseClassListPage.tsx
      CourseClassDetailPage.tsx
      AssignmentCreatePage.tsx
      AssignmentDetailPage.tsx
      ReviewWorkbenchPage.tsx
      ProfilePage.tsx
    student/
      StudentAssignmentListPage.tsx
      StudentAssignmentDetailPage.tsx
      StudentSubmitPage.tsx
      StudentResultPage.tsx
  components/
    layout/
    ui/
    table/
    form/
  features/
    auth/
    dashboard/
    course-class/
    assignment/
    submission/
    review/
    export/
  services/
    api-client.ts
    auth-api.ts
    course-class-api.ts
    assignment-api.ts
    review-api.ts
```

## 3.3 后端目录建议

```text
apps/api/src/
  main.ts
  app.module.ts
  common/
    guards/
    decorators/
    filters/
    pipes/
    response/
  modules/
    auth/
    teacher/
    course-class/
    student/
    assignment/
    submission/
    ai-review/
    teacher-review/
    export/
    file/
  jobs/
    ai-review.job.ts
    export.job.ts
    file-extract.job.ts
  prisma/
    schema.prisma
    migrations/
```

## 4. 后端模块拆分

### 4.1 AuthModule

职责：

- 教师登录
- 学生访问身份
- JWT 签发与校验
- 当前用户上下文

### 4.2 TeacherModule

职责：

- 教师资料
- 教师默认偏好
- 工作台数据聚合

### 4.3 CourseClassModule

职责：

- 课程班 CRUD
- 课程班归档
- 学生列表
- 学生导入

### 4.4 AssignmentModule

职责：

- 作业草稿
- 作业发布
- 作业状态
- 作业统计

### 4.5 SubmissionModule

职责：

- 学生提交
- 提交列表
- 迟交规则
- 退回后重新提交

### 4.6 AIReviewModule

职责：

- AI 初评任务
- 单个和批量触发
- AI 结果保存
- AI 失败处理
- 重新生成

### 4.7 TeacherReviewModule

职责：

- 批阅工作台聚合数据
- 保存批阅草稿
- 发布结果
- 退回修改
- 更正结果

### 4.8 ExportModule

职责：

- 成绩导出任务
- Excel 文件生成
- 导出文件下载

### 4.9 FileModule

职责：

- 文件上传
- 文件下载
- 文件类型校验
- 文件内容抽取

## 5. 数据库表建议

第一版建议建立以下表：

- teachers
- students
- course_classes
- class_students
- assignments
- submissions
- files
- ai_reviews
- teacher_reviews
- result_publications
- export_tasks
- operation_logs

可后置：

- notifications
- sms_codes
- ai_review_histories
- assignment_change_logs

## 6. API 分层建议

建议使用以下分层：

- Controller：处理 HTTP 请求和参数校验。
- Service：业务逻辑。
- Repository 或 PrismaService：数据访问。
- Job：异步任务处理。
- DTO：请求与响应结构。

示例：

```text
AssignmentController
  -> AssignmentService
    -> PrismaService
    -> SubmissionService
```

## 7. 前端页面与接口映射

| 页面 | 主要接口 |
| --- | --- |
| 登录页 | POST /api/auth/sms-code, POST /api/auth/teacher/login |
| 工作台 | GET /api/teacher/dashboard |
| 课程班列表 | GET /api/course-classes, POST /api/course-classes |
| 课程班详情 | GET /api/course-classes/{id}, GET /api/course-classes/{id}/students |
| 学生导入 | POST /api/course-classes/{id}/students/import |
| 作业创建 | POST /api/assignments, PATCH /api/assignments/{id}, POST /api/assignments/{id}/publish |
| 作业详情 | GET /api/assignments/{id}, GET /api/assignments/{id}/stats |
| 提交列表 | GET /api/assignments/{id}/submissions |
| 批阅工作台 | GET /api/assignments/{id}/review-workbench, PUT /api/submissions/{id}/teacher-review |
| AI 初评 | POST /api/submissions/{id}/ai-review, POST /api/assignments/{id}/ai-reviews/batch |
| 成绩发布 | POST /api/submissions/{id}/teacher-review/publish |
| 成绩导出 | POST /api/assignments/{id}/exports, GET /api/exports/{id}, GET /api/exports/{id}/download |
| 学生作业列表 | GET /api/student/assignments |
| 学生提交 | POST /api/student/assignments/{id}/submit |
| 学生结果 | GET /api/student/assignments/{id}/result |

## 8. 第一版部署建议

## 8.1 开发环境

建议：

- 前端：Vite dev server
- 后端：NestJS dev server
- 数据库：本地 PostgreSQL 或 Docker PostgreSQL
- 文件：本地 uploads 目录
- AI：Mock 服务 + 可选真实 AI 配置

## 8.2 测试环境

建议：

- 前端和后端部署在同一台云服务器或测试环境容器中。
- PostgreSQL 独立服务。
- 文件存储可先本地挂载，后续迁移对象存储。
- AI 接口配置通过环境变量管理。

## 8.3 生产环境

建议后续采用：

- 前端静态资源部署到 CDN 或 Web 服务。
- 后端 API 独立部署。
- PostgreSQL 托管数据库。
- 对象存储保存上传文件和导出文件。
- Redis 作为异步任务队列。
- 日志和错误监控。

## 9. 环境变量建议

```text
DATABASE_URL=
JWT_SECRET=
UPLOAD_ROOT=
PUBLIC_FILE_BASE_URL=
AI_PROVIDER=
AI_API_KEY=
AI_MODEL=
AI_MOCK_ENABLED=
EXPORT_ROOT=
```

后续接入短信时增加：

```text
SMS_PROVIDER=
SMS_ACCESS_KEY=
SMS_SECRET_KEY=
```

## 10. 安全与权限原则

### 10.1 教师权限

- 教师只能访问自己创建或被授权的课程班。
- 教师只能批阅自己课程班下的提交。
- 教师可以查看 AI 初评。
- 教师可以发布最终结果。

### 10.2 学生权限

- 学生只能查看自己的作业和提交。
- 学生不能查看 AI 原始建议。
- 学生只能查看教师已发布结果。

### 10.3 文件权限

- 学生提交文件仅该学生和对应教师可访问。
- 导出成绩文件仅教师可访问。
- 文件下载链接应具备过期或鉴权机制。

## 11. 第一版开发策略

建议先做“可跑通闭环”的纵切版本，而不是先把所有页面做完整。

第一条纵切链路：

1. 教师登录。
2. 创建课程班。
3. 手动添加或导入少量学生。
4. 发布作业。
5. 学生提交文本作业。
6. Mock AI 生成建议。
7. 教师复核并发布。
8. 学生查看结果。
9. 教师导出 Excel。

这条链路跑通后，再补文件上传、批量 AI、复杂筛选、文件预览等增强能力。

## 12. 风险与应对

| 风险 | 影响 | 应对 |
| --- | --- | --- |
| AI 输出不稳定 | 教师无法信任建议 | 强制结构化输出，保存失败原因，允许人工批阅 |
| 文件解析困难 | AI 无法读取附件 | MVP 优先支持文本/PDF/Word，其他格式转人工 |
| 学生身份复杂 | 学生端开发变重 | 第一版可用课程班邀请链接或简化登录 |
| 导出模板多样 | 开发成本增加 | 第一版固定模板，后续支持模板配置 |
| 状态流转混乱 | 批阅结果可见性出错 | 严格使用状态枚举和权限测试 |

## 13. 下一步建议

建议继续产出：

- 数据库表结构 SQL 或 Prisma Schema 草案。
- AI 初评 Prompt 模板。
- 第一条纵切版本开发计划。
- 前端原型到 React 页面拆分方案。
