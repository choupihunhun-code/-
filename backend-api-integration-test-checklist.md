# 后端联调 API 测试清单

## 1. 文档目的

本文档用于后端工程启动后进行 MVP 主链路接口联调，帮助验证：

- 登录鉴权是否可用
- 课程班和学生数据是否可用
- 作业发布是否能生成提交占位
- 学生提交是否能进入教师提交列表
- AI 初评是否能生成教师可见建议
- 教师复核和发布是否能生成学生可见结果
- 成绩导出是否能生成并下载 Excel

默认后端地址：

```text
http://localhost:3001/api
```

默认开发验证码：

```text
123456
```

## 2. 联调前准备

### 2.1 启动后端

进入后端目录：

```bash
cd apps/api
```

安装依赖：

```bash
npm install
```

复制环境变量：

```bash
cp .env.example .env
```

生成 Prisma Client：

```bash
npm run prisma:generate
```

执行数据库迁移：

```bash
npm run prisma:migrate
```

启动服务：

```bash
npm run start:dev
```

### 2.2 准备变量

联调过程中建议在 Apifox/Postman 中维护以下变量：

| 变量 | 说明 |
| --- | --- |
| baseUrl | http://localhost:3001/api |
| teacherToken | 教师登录 token |
| studentToken | 学生开发期登录 token |
| classId | 课程班 ID |
| assignmentId | 作业 ID |
| studentId | 学生 ID |
| submissionId | 提交 ID |
| aiReviewId | AI 初评 ID |
| exportTaskId | 导出任务 ID |

## 3. 教师登录链路

### 3.1 发送验证码

请求：

```http
POST {{baseUrl}}/auth/sms-code
Content-Type: application/json
```

Body：

```json
{
  "phone": "13800000000"
}
```

期望：

- HTTP 200
- `code = 0`
- 返回 `cooldownSeconds`
- 开发环境返回 `devCode = 123456`

### 3.2 教师登录

请求：

```http
POST {{baseUrl}}/auth/teacher/login
Content-Type: application/json
```

Body：

```json
{
  "phone": "13800000000",
  "smsCode": "123456"
}
```

期望：

- HTTP 200
- 返回 `token`
- 返回 `teacher.id`
- 保存 `token` 为 `teacherToken`

### 3.3 获取当前教师信息

请求：

```http
GET {{baseUrl}}/teacher/me
Authorization: Bearer {{teacherToken}}
```

期望：

- HTTP 200
- 返回当前教师信息

## 4. 课程班链路

### 4.1 创建课程班

请求：

```http
POST {{baseUrl}}/course-classes
Authorization: Bearer {{teacherToken}}
Content-Type: application/json
```

Body：

```json
{
  "courseName": "大学语文",
  "className": "2026 春 A 班",
  "term": "2026 春",
  "courseType": "public",
  "description": "公共课大班"
}
```

期望：

- HTTP 200
- 返回课程班 ID
- 保存 `id` 为 `classId`

### 4.2 获取课程班列表

请求：

```http
GET {{baseUrl}}/course-classes?page=1&pageSize=20
Authorization: Bearer {{teacherToken}}
```

期望：

- 返回列表
- 列表中包含刚创建的课程班

### 4.3 获取课程班详情

请求：

```http
GET {{baseUrl}}/course-classes/{{classId}}
Authorization: Bearer {{teacherToken}}
```

期望：

- 返回课程班详情
- `_count.classStudents` 当前可能为 0

## 5. 学生数据准备

当前后端已提供 JSON 学生导入接口。为了跑通后续链路，可以先用接口导入，或使用 seed 脚本生成测试数据。

### 方式 A：使用 JSON 导入接口

请求：

```http
POST {{baseUrl}}/course-classes/{{classId}}/students/import-json
Authorization: Bearer {{teacherToken}}
Content-Type: application/json
```

Body：

```json
{
  "students": [
    {
      "name": "张同学",
      "studentNo": "20260001",
      "displayClassName": "汉语言文学 1 班"
    },
    {
      "name": "李同学",
      "studentNo": "20260002",
      "displayClassName": "汉语言文学 1 班"
    }
  ]
}
```

期望：

- 返回 `importedCount`
- 返回重复学号错误行

### 方式 B：使用 seed 脚本

执行：

```bash
npm run prisma:seed
```

会创建：

- 教师：`13800000000`
- 开发验证码：`123456`
- 课程班：大学语文 2026 春 A 班
- 学生：`20260001`、`20260002`、`20260003`

### 方式 C：开发期用 Prisma Studio 手动创建

启动：

```bash
npm run prisma:studio
```

手动创建：

1. 在 `students` 表创建学生。
2. 在 `class_students` 表关联 `classId` 和 `studentId`。
3. 保存一个学生 ID 为 `studentId`。

建议测试学生：

```text
姓名：张同学
学号：20260001
```

## 6. 学生开发期登录

### 6.1 学生临时登录

请求：

```http
POST {{baseUrl}}/auth/student/dev-login
Content-Type: application/json
```

Body：

```json
{
  "studentNo": "20260001"
}
```

期望：

- HTTP 200
- 返回 `token`
- 保存为 `studentToken`

## 7. 作业链路

### 6.1 创建作业草稿

请求：

```http
POST {{baseUrl}}/assignments
Authorization: Bearer {{teacherToken}}
Content-Type: application/json
```

Body：

```json
{
  "classId": "{{classId}}",
  "title": "课程论文：现代大学教育中的阅读与表达",
  "description": "请提交 1500-2500 字课程论文，要求观点明确、结构完整、引用规范。",
  "dueAt": "2026-06-20T20:00:00+08:00",
  "submitModes": ["text", "file"],
  "scoreType": "percentage",
  "maxScore": 100,
  "aiEnabled": true,
  "aiRubric": "内容完整性 30 分，论证逻辑 30 分，资料引用 20 分，表达规范 20 分。",
  "aiCommentStyle": "detailed_constructive",
  "allowLateSubmit": true
}
```

期望：

- HTTP 200
- 返回作业 ID
- 状态为 `draft`
- 保存 `id` 为 `assignmentId`

### 6.2 发布作业

请求：

```http
POST {{baseUrl}}/assignments/{{assignmentId}}/publish
Authorization: Bearer {{teacherToken}}
```

期望：

- HTTP 200
- 作业状态变为 `published`
- 返回 `createdSubmissionCount`
- 如果课程班已有学生，应生成提交占位记录

### 6.3 获取作业统计

请求：

```http
GET {{baseUrl}}/assignments/{{assignmentId}}/stats
Authorization: Bearer {{teacherToken}}
```

期望：

- `studentCount` 等于课程班学生数
- `notSubmittedCount` 等于未提交学生数

### 6.4 获取提交列表

请求：

```http
GET {{baseUrl}}/assignments/{{assignmentId}}/submissions
Authorization: Bearer {{teacherToken}}
```

期望：

- 返回提交占位记录
- 保存一条 `submission.id` 为 `submissionId`
- 初始状态为 `not_submitted`

## 8. 学生提交链路

### 8.1 学生提交作业

请求：

```http
POST {{baseUrl}}/student/assignments/{{assignmentId}}/submit
Authorization: Bearer {{studentToken}}
Content-Type: application/json
```

Body：

```json
{
  "submitText": "本文围绕现代大学教育中的阅读与表达展开讨论。首先，阅读能力是大学通识教育的重要基础，它帮助学生理解复杂文本并建立知识结构。其次，表达能力是学术训练和公共交流的重要工具，能够帮助学生清晰呈现观点。最后，大学教育应当通过课程论文、课堂讨论和项目作业等方式，将阅读与表达结合起来，形成持续训练。",
  "submitLink": "https://example.com/work"
}
```

期望：

- HTTP 200
- 提交状态变为 `submitted` 或 `late_submitted`
- `submittedAt` 有值

### 8.2 教师查看提交详情

请求：

```http
GET {{baseUrl}}/submissions/{{submissionId}}
Authorization: Bearer {{teacherToken}}
```

期望：

- 教师可以看到学生提交内容
- `submitText` 有值

## 9. AI 初评链路

### 9.1 单个提交触发 AI 初评

请求：

```http
POST {{baseUrl}}/submissions/{{submissionId}}/ai-review
Authorization: Bearer {{teacherToken}}
```

期望：

- HTTP 200
- 返回 AI 初评记录
- 文本足够长时，状态为 `completed`
- 返回 `suggestedScore`
- 返回 `suggestedComment`
- 保存 `id` 为 `aiReviewId`
- 自动创建或更新教师批阅记录为 `pending_review`

### 9.2 查看 AI 初评详情

请求：

```http
GET {{baseUrl}}/ai-reviews/{{aiReviewId}}
Authorization: Bearer {{teacherToken}}
```

期望：

- 教师可查看 AI 初评
- 学生不应拥有该接口访问权限

### 9.3 AI 初评失败场景

让学生提交短文本：

```json
{
  "submitText": "太短"
}
```

再触发 AI 初评。

期望：

- AI 状态为 `failed`
- `errorCode = CONTENT_TOO_SHORT`
- 可转人工处理

### 9.4 标记转人工处理

请求：

```http
POST {{baseUrl}}/ai-reviews/{{aiReviewId}}/manual-required
Authorization: Bearer {{teacherToken}}
```

期望：

- AI 状态变为 `manual_required`
- 教师批阅状态变为 `manual_review`

## 10. 教师批阅链路

### 10.1 获取批阅工作台

请求：

```http
GET {{baseUrl}}/assignments/{{assignmentId}}/review-workbench
Authorization: Bearer {{teacherToken}}
```

期望：

- 返回作业信息
- 返回提交队列
- 返回当前提交、AI 初评、教师批阅信息

### 10.2 获取单个提交批阅详情

请求：

```http
GET {{baseUrl}}/submissions/{{submissionId}}/review
Authorization: Bearer {{teacherToken}}
```

期望：

- 返回学生、作业、提交内容、AI 初评、教师批阅草稿

### 10.3 保存教师批阅草稿

请求：

```http
PUT {{baseUrl}}/submissions/{{submissionId}}/teacher-review
Authorization: Bearer {{teacherToken}}
Content-Type: application/json
```

Body：

```json
{
  "finalScore": 88,
  "teacherComment": "整体完成较好，论证结构清晰。建议进一步加强结论部分与课程主题的关联。",
  "adoptedAiScore": false,
  "adoptedAiComment": true,
  "status": "draft_saved"
}
```

期望：

- HTTP 200
- 教师批阅状态为 `draft_saved`
- 学生端仍不可见结果

### 10.4 发布教师批阅结果

请求：

```http
POST {{baseUrl}}/submissions/{{submissionId}}/teacher-review/publish
Authorization: Bearer {{teacherToken}}
Content-Type: application/json
```

Body：

```json
{
  "finalScore": 88,
  "teacherComment": "整体完成较好，论证结构清晰。建议进一步加强结论部分与课程主题的关联。"
}
```

期望：

- HTTP 200
- 教师批阅状态为 `published`
- 生成 `resultPublication`
- 学生端结果可见

### 10.5 退回修改

请求：

```http
POST {{baseUrl}}/submissions/{{submissionId}}/return
Authorization: Bearer {{teacherToken}}
Content-Type: application/json
```

Body：

```json
{
  "returnReason": "请补充结论部分，并统一参考文献格式。"
}
```

期望：

- 提交状态变为 `returned`
- 教师批阅状态变为 `returned`
- 学生可重新提交

## 11. 学生查看结果

当前已有：

```http
GET {{baseUrl}}/student/submissions/{{submissionId}}
Authorization: Bearer {{studentToken}}
```

期望：

- 未发布前：`teacherReview = null`
- 发布后：返回最终分数和教师评语
- 不返回 AI 原始建议

## 12. 成绩导出链路

### 12.1 创建导出任务

请求：

```http
POST {{baseUrl}}/assignments/{{assignmentId}}/exports
Authorization: Bearer {{teacherToken}}
Content-Type: application/json
```

Body：

```json
{
  "exportFormat": "xlsx",
  "fields": [
    "student_no",
    "student_name",
    "submission_status",
    "final_score",
    "teacher_comment",
    "published_at"
  ]
}
```

期望：

- HTTP 200
- 任务状态为 `completed`
- 返回 `fileUrl`
- 保存 `id` 为 `exportTaskId`

### 12.2 查询导出任务

请求：

```http
GET {{baseUrl}}/exports/{{exportTaskId}}
Authorization: Bearer {{teacherToken}}
```

期望：

- 状态为 `completed`

### 12.3 下载导出文件

请求：

```http
GET {{baseUrl}}/exports/{{exportTaskId}}/download
Authorization: Bearer {{teacherToken}}
```

期望：

- 下载 Excel 文件
- 文件可打开
- 包含学生、提交状态、最终分数、教师评语、发布时间

## 13. 文件接口链路

### 13.1 创建上传凭证

请求：

```http
POST {{baseUrl}}/files/upload-token
Authorization: Bearer {{teacherToken}}
Content-Type: application/json
```

Body：

```json
{
  "scene": "assignment_attachment",
  "fileName": "评分标准.pdf",
  "contentType": "application/pdf",
  "fileSize": 204800,
  "assignmentId": "{{assignmentId}}"
}
```

期望：

- HTTP 200
- 返回文件记录
- 返回 `uploadUrl`
- 当前 MVP 为本地存储占位，不是真实对象存储直传

### 13.2 下载文件

请求：

```http
GET {{baseUrl}}/files/{{fileId}}/download
Authorization: Bearer {{teacherToken}}
```

期望：

- 有权限时可下载
- 无权限时返回资源不存在

## 14. 权限测试

### 14.1 未登录访问教师接口

请求：

```http
GET {{baseUrl}}/teacher/me
```

期望：

- HTTP 401
- `code = 401001`

### 14.2 学生访问 AI 初评接口

请求：

```http
GET {{baseUrl}}/ai-reviews/{{aiReviewId}}
Authorization: Bearer {{studentToken}}
```

期望：

- HTTP 403
- `code = 403001`
- 不返回 AI 初评

### 14.3 其他教师访问课程班

使用另一个教师登录后访问：

```http
GET {{baseUrl}}/course-classes/{{classId}}
Authorization: Bearer {{otherTeacherToken}}
```

期望：

- HTTP 404
- 不泄露资源存在性

## 15. 当前已知缺口

以下能力尚未完成，联调时需要注意：

- 学生正式登录接口尚未实现，目前只有开发期登录。
- Excel/CSV 学生导入接口尚未实现，目前只有 JSON 导入。
- 真实文件 multipart 上传尚未实现。
- 文件内容抽取尚未实现。
- 真实 AI 接入尚未实现，目前为 Mock AI。
- 操作日志尚未写入。
- 导出任务当前同步生成，后续应改为异步队列。

## 16. 建议下一步补齐

建议后续开发顺序：

1. 真实文件上传。
2. Excel/CSV 学生导入。
3. 后端编译运行与 Prisma schema 校验。
4. 操作日志写入。
