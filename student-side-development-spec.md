# 学生端可开发规格说明

## 1. 文档目的

本文档用于把学生端从“页面原型和产品方案”推进到“可开发规格”。目标是让前端、后端、AI 服务、文件服务、测试和产品都能基于同一份规则拆任务、写接口、做联调和验收。

当前学生端只服务教务系统 MVP 的主闭环：

```text
教师发布作业 -> 学生查看作业 -> 学生提交作业 -> 教师复核 -> 教师发布结果 -> 学生查看结果
```

## 2. MVP 范围

### 2.1 MVP 必须上线能力

| 模块 | 必须能力 | 说明 |
| --- | --- | --- |
| 学生身份 | 学生登录或开发登录 | 第一版可先保留 `dev-login`，后续替换正式登录 |
| 作业列表 | 查看本人作业 | 只展示学生所属课程班下已发布作业 |
| 作业详情 | 查看作业说明、截止时间、提交要求 | 不展示教师内部 AI 评分标准 |
| 作业提交 | 文本、链接、附件至少一种 | 提交后生成提交记录 |
| 提交详情 | 查看本人提交内容和状态 | 包含提交时间、版本、迟交状态 |
| 退回重交 | 查看退回原因并重新提交 | 教师退回后开放重新提交 |
| 结果查看 | 查看教师发布后的最终分数和评语 | 不展示 AI 原始建议 |
| 权限控制 | 只能访问本人数据 | 防止通过 ID 访问他人数据 |

### 2.2 MVP 暂不做能力

| 功能 | 暂不做原因 |
| --- | --- |
| 学生讨论区 | 不影响作业提交闭环 |
| 学生互评 | 涉及复杂规则和权限 |
| 小组作业 | 会引入组队、成员提交、组内权限 |
| 成绩申诉 | 第一版先保证结果查看 |
| 学习分析 | 需要更长周期的数据积累 |
| 消息中心 | 第一版用页面状态提示替代 |
| 移动端原生 App | 第一版用 Web 端适配移动浏览器 |

### 2.3 MVP 验收闭环

MVP 必须能跑通以下验收链路：

1. 教师发布作业。
2. 学生登录后看到该作业。
3. 学生进入作业详情。
4. 学生提交文本、链接或附件。
5. 教师端看到提交统计变化。
6. 教师复核并发布结果。
7. 学生看到最终分数和教师评语。
8. 学生无法看到 AI 原始建议。

## 3. 页面交互规格

### 3.1 学生登录页

#### 页面目标

完成学生身份校验，并支持从作业链接进入后的回跳。

#### 页面元素

| 元素 | 类型 | 规则 |
| --- | --- | --- |
| 学号/手机号输入框 | 输入框 | 必填 |
| 验证码/密码输入框 | 输入框 | MVP 可用开发登录替代 |
| 登录按钮 | 按钮 | 校验通过后提交 |
| 作业链接提示 | 文本 | 从作业链接进入时显示目标作业名称 |

#### 交互规则

- 未登录访问学生端页面时跳转登录页。
- 若 URL 带 `redirect` 或 `assignment_id`，登录成功后回到目标作业。
- 普通登录成功后进入作业列表。
- 登录失败时展示明确错误，不清空账号输入。

#### 异常状态

| 异常 | 处理 |
| --- | --- |
| 账号不存在 | 提示联系教师确认学生名单 |
| 验证码错误 | 提示重新输入或重新获取 |
| 登录过期 | 回到登录页，登录后回跳原页面 |

### 3.2 作业列表页

#### 页面目标

让学生知道当前需要处理哪些作业，以及每个作业的下一步动作。

#### 页面元素

| 元素 | 规则 |
| --- | --- |
| 学生信息 | 展示姓名、学号 |
| 统计区 | 待提交、已提交、已退回、已发布结果 |
| 状态筛选 | 全部、待提交、已提交、已退回、已发布结果 |
| 作业卡片 | 标题、课程班、教师、截止时间、状态、按钮 |

#### 排序规则

1. 已退回。
2. 临近截止且未提交。
3. 待提交。
4. 已提交待批阅。
5. 已发布结果。
6. 历史或归档作业。

#### 操作按钮规则

| 学生视角状态 | 主按钮 | 次按钮 |
| --- | --- | --- |
| 待提交 | 去提交 | 查看详情 |
| 即将截止 | 去提交 | 查看详情 |
| 已提交 | 查看提交 | 查看详情 |
| 迟交 | 查看提交 | 查看详情 |
| 已退回 | 重新提交 | 查看退回原因 |
| 已发布结果 | 查看结果 | 查看提交 |
| 已截止不可提交 | 查看详情 | 无 |

#### 空状态

- 无作业：展示“暂无作业”。
- 筛选无结果：展示“当前筛选下暂无作业”。
- 加载失败：展示重试按钮。

### 3.3 作业详情页

#### 页面目标

让学生看清作业要求和提交限制。

#### 页面元素

| 元素 | 规则 |
| --- | --- |
| 作业标题 | 必须展示 |
| 课程班 | 必须展示 |
| 教师姓名 | 必须展示 |
| 截止时间 | 必须突出 |
| 作业说明 | 支持多段文本 |
| 作业附件 | 可下载或预览 |
| 提交方式 | 展示附件、文本、链接中的可用方式 |
| 当前状态 | 展示未提交、已提交、已退回、已发布结果等 |
| 主按钮 | 根据状态展示去提交、重新提交、查看结果 |

#### 关键规则

- 草稿作业学生不可见。
- 教师内部 AI 评分标准学生不可见。
- 教师未发布结果时，不出现分数和评语。
- 作业截止但允许迟交时，按钮显示“迟交提交”。

### 3.4 作业提交页

#### 页面目标

让学生完成一次有效提交。

#### 表单字段

| 字段 | 类型 | 校验 |
| --- | --- | --- |
| submit_text | 多行文本 | 可选，若无链接和附件则必填 |
| submit_link | URL 输入 | 可选，填写时必须是合法 URL |
| attachments | 文件数组 | 可选，上传完成后才可提交 |

#### 提交校验

- 文本、链接、附件至少有一种。
- 链接不合法时禁止提交。
- 附件上传中禁止提交。
- 附件上传失败时允许重试。
- 作业截止且不允许迟交时禁止提交。
- 迟交提交需要展示迟交提示。

#### 提交流程

```text
填写内容 -> 校验内容 -> 上传附件 -> 确认提交 -> 创建提交记录 -> 提交成功页
```

#### 按钮状态

| 状态 | 按钮表现 |
| --- | --- |
| 默认 | 提交作业 |
| 表单无效 | 禁用或点击后提示 |
| 上传中 | 显示上传中，不允许提交 |
| 提交中 | 显示提交中，防止重复点击 |
| 提交失败 | 恢复按钮，保留表单内容 |

### 3.5 提交成功页

#### 页面目标

让学生明确知道提交已成功。

#### 页面元素

- 成功状态。
- 提交时间。
- 提交版本。
- 是否迟交。
- 提交内容摘要。
- 查看提交按钮。
- 返回作业列表按钮。

### 3.6 提交详情页

#### 页面目标

让学生回看本人提交内容和状态。

#### 页面元素

- 提交状态。
- 提交时间。
- 提交版本。
- 文本内容。
- 链接。
- 附件列表。
- 退回原因。
- 重新提交入口。

#### 交互规则

- 已退回状态展示退回原因。
- 只有已退回状态默认开放重新提交。
- 如果后续允许主动覆盖提交，需要新增业务开关。

### 3.7 结果查看页

#### 页面目标

展示教师发布后的最终结果。

#### 页面元素

- 最终分数。
- 满分。
- 教师评语。
- 发布时间。
- 作业信息。
- 对应提交版本。

#### 可见性规则

- 结果未发布：展示“教师尚未发布结果”。
- 结果已发布：展示最终分数和教师评语。
- 结果已更正：展示最新结果，并标记已更正。
- 不展示 AI 建议分数、AI 原始评语、AI 评分依据。

## 4. 数据对象与字段结构

### 4.1 Student

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| id | string | 是 | 学生 ID |
| name | string | 是 | 姓名 |
| student_no | string | 是 | 学号 |
| phone | string | 否 | 手机号 |
| email | string | 否 | 邮箱 |
| status | enum | 是 | active / disabled |

### 4.2 StudentAssignmentView

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| assignment_id | string | 是 | 作业 ID |
| title | string | 是 | 作业标题 |
| course_class_id | string | 是 | 课程班 ID |
| course_class_name | string | 是 | 课程班名称 |
| teacher_name | string | 是 | 教师姓名 |
| due_at | datetime | 是 | 截止时间 |
| submit_modes | string[] | 是 | file / text / link |
| allow_late_submit | boolean | 是 | 是否允许迟交 |
| assignment_status | enum | 是 | published / closed / archived |
| submission_status | enum | 是 | not_submitted / submitted / late_submitted / returned / resubmitted |
| review_status | enum | 是 | unreviewed / pending_review / draft_saved / returned / published |
| result_visible | boolean | 是 | 学生是否可查看结果 |
| next_action | enum | 是 | submit / view_submission / resubmit / view_result / view_detail |

### 4.3 StudentAssignmentDetail

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| assignment_id | string | 是 | 作业 ID |
| title | string | 是 | 作业标题 |
| description | text | 是 | 作业说明 |
| public_attachments | array | 否 | 对学生公开的附件 |
| course_class_name | string | 是 | 课程班 |
| teacher_name | string | 是 | 教师 |
| due_at | datetime | 是 | 截止时间 |
| submit_modes | string[] | 是 | 可用提交方式 |
| max_score | number | 是 | 满分 |
| allow_late_submit | boolean | 是 | 是否允许迟交 |
| current_submission | object | 否 | 当前学生提交摘要 |
| result_visible | boolean | 是 | 结果是否可见 |

### 4.4 StudentSubmission

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| submission_id | string | 是 | 提交 ID |
| assignment_id | string | 是 | 作业 ID |
| student_id | string | 是 | 学生 ID |
| submit_text | text | 否 | 文本内容 |
| submit_link | string | 否 | 外部链接 |
| attachments | array | 否 | 附件列表 |
| submitted_at | datetime | 否 | 提交时间 |
| status | enum | 是 | not_submitted / submitted / late_submitted / returned / resubmitted |
| is_late | boolean | 是 | 是否迟交 |
| return_reason | text | 否 | 教师退回原因 |
| version | number | 是 | 提交版本 |

### 4.5 StudentResultView

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| assignment_id | string | 是 | 作业 ID |
| submission_id | string | 是 | 提交 ID |
| final_score | number | 条件必填 | 教师发布后返回 |
| max_score | number | 是 | 满分 |
| teacher_comment | text | 条件必填 | 教师发布后返回 |
| published_at | datetime | 条件必填 | 教师发布后返回 |
| correction_status | enum | 否 | none / corrected |
| visible | boolean | 是 | 结果是否可见 |

## 5. 关键状态与判断规则

### 5.1 作业可提交判断

```text
作业已发布
AND 学生属于该课程班
AND 当前学生有访问权限
AND (
  未截止
  OR 已截止但 allow_late_submit = true
)
AND 作业未归档
```

### 5.2 迟交判断

```text
submitted_at > due_at => is_late = true, status = late_submitted
submitted_at <= due_at => is_late = false, status = submitted
```

### 5.3 结果可见判断

```text
teacher_review.status = published
AND result_publication exists
AND result_publication.visibility in [student_visible, corrected]
```

### 5.4 重新提交判断

```text
submission.status = returned
AND return_reason exists
```

MVP 建议仅在教师退回后允许重新提交。是否允许学生主动覆盖提交，放入后续配置。

### 5.5 AI 可见性判断

```text
student_api_response MUST NOT include ai_review fields
```

学生端所有接口不得返回以下字段：

- AI 建议分数。
- AI 原始评语。
- AI 主要问题。
- AI 评分依据。
- AI 置信度。
- AI prompt 或模型响应。

## 6. 接口规格

### 6.1 学生开发登录

`POST /api/auth/student/dev-login`

请求：

```json
{
  "student_no": "20260001"
}
```

响应：

```json
{
  "token": "student_token",
  "student": {
    "id": "student_001",
    "name": "张同学",
    "student_no": "20260001"
  }
}
```

### 6.2 获取学生作业列表

`GET /api/student/assignments`

查询参数：

| 参数 | 说明 |
| --- | --- |
| status | all / todo / submitted / returned / result_published |
| page | 页码 |
| page_size | 每页数量 |

响应字段：

```json
{
  "items": [
    {
      "assignment_id": "assignment_001",
      "title": "课程论文：现代大学教育中的阅读与表达",
      "course_class_name": "大学语文 2026 春 A 班",
      "teacher_name": "陈老师",
      "due_at": "2026-06-20T20:00:00+08:00",
      "submit_modes": ["file", "text"],
      "submission_status": "not_submitted",
      "review_status": "unreviewed",
      "result_visible": false,
      "next_action": "submit"
    }
  ],
  "page": 1,
  "page_size": 20,
  "total": 1
}
```

### 6.3 获取学生作业详情

`GET /api/student/assignments/{assignment_id}`

规则：

- 校验学生是否属于该作业课程班。
- 只返回已发布或学生历史相关作业。
- 不返回 `ai_rubric` 中教师内部提示。

### 6.4 提交作业

`POST /api/student/assignments/{assignment_id}/submit`

请求：

```json
{
  "submit_text": "我的课程论文正文或说明",
  "submit_link": "https://example.com/work",
  "attachment_urls": ["https://cdn.example.com/file.docx"]
}
```

规则：

- `submit_text`、`submit_link`、`attachment_urls` 至少一种。
- 校验作业是否允许提交。
- 根据截止时间设置 `is_late`。
- 如果原状态为 `returned`，新状态为 `resubmitted`。
- 提交成功后教师端统计需要变化。

### 6.5 获取提交详情

`GET /api/student/submissions/{submission_id}`

规则：

- 只能访问当前学生自己的提交。
- 返回提交内容、附件、状态、版本、退回原因。

### 6.6 获取批阅结果

`GET /api/student/assignments/{assignment_id}/result`

未发布响应：

```json
{
  "visible": false,
  "status": "not_published",
  "message": "教师尚未发布结果"
}
```

已发布响应：

```json
{
  "visible": true,
  "final_score": 88,
  "max_score": 100,
  "teacher_comment": "整体完成较好，论证结构清晰。",
  "published_at": "2026-06-21T10:00:00+08:00",
  "correction_status": "none"
}
```

规则：

- 未发布时不返回 `final_score` 和 `teacher_comment`。
- 永远不返回 AI 原始建议。

### 6.7 创建上传凭证

`POST /api/files/upload-token`

请求：

```json
{
  "scene": "student_submission",
  "file_name": "课程论文.docx",
  "content_type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "file_size": 204800
}
```

规则：

- 校验文件大小和类型。
- 文件访问需绑定当前学生和提交场景。

## 7. 研发任务清单

### 7.1 前端任务

| 编号 | 任务 | 优先级 |
| --- | --- | --- |
| FE-01 | 学生端路由与页面框架 | P0 |
| FE-02 | 学生登录页和登录后回跳 | P0 |
| FE-03 | 作业列表页和状态筛选 | P0 |
| FE-04 | 作业详情页 | P0 |
| FE-05 | 作业提交页 | P0 |
| FE-06 | 提交成功页 | P0 |
| FE-07 | 提交详情页 | P0 |
| FE-08 | 结果查看页 | P0 |
| FE-09 | 上传进度、失败重试 | P1 |
| FE-10 | 移动端适配 | P1 |
| FE-11 | 空状态、异常状态和加载骨架 | P1 |

### 7.2 后端任务

| 编号 | 任务 | 优先级 |
| --- | --- | --- |
| BE-01 | 学生登录或开发登录接口 | P0 |
| BE-02 | 学生作业列表聚合接口 | P0 |
| BE-03 | 学生作业详情接口 | P0 |
| BE-04 | 学生提交接口 | P0 |
| BE-05 | 学生提交详情接口 | P0 |
| BE-06 | 学生结果查看接口 | P0 |
| BE-07 | 学生端权限守卫 | P0 |
| BE-08 | 迟交判断和提交版本递增 | P0 |
| BE-09 | 退回后重新提交状态流转 | P1 |
| BE-10 | 上传凭证与附件鉴权 | P1 |

### 7.3 AI 服务任务

| 编号 | 任务 | 优先级 |
| --- | --- | --- |
| AI-01 | 学生提交后触发 AI 初评任务 | P0 |
| AI-02 | AI 初评失败状态回写 | P0 |
| AI-03 | 确保 AI 结果仅教师端可见 | P0 |
| AI-04 | 重新提交后重新触发或标记需重评 | P1 |

### 7.4 文件服务任务

| 编号 | 任务 | 优先级 |
| --- | --- | --- |
| FILE-01 | 学生提交附件上传凭证 | P0 |
| FILE-02 | 附件大小和类型限制 | P0 |
| FILE-03 | 附件下载鉴权 | P0 |
| FILE-04 | 上传失败重试支持 | P1 |

### 7.5 权限与安全任务

| 编号 | 任务 | 优先级 |
| --- | --- | --- |
| SEC-01 | 学生接口鉴权 | P0 |
| SEC-02 | 学生只能访问本人提交和结果 | P0 |
| SEC-03 | 学生不能访问教师接口 | P0 |
| SEC-04 | 学生响应过滤 AI 字段 | P0 |
| SEC-05 | 附件访问鉴权 | P0 |

### 7.6 测试任务

| 编号 | 任务 | 优先级 |
| --- | --- | --- |
| QA-01 | 学生登录与回跳测试 | P0 |
| QA-02 | 作业列表状态测试 | P0 |
| QA-03 | 提交内容校验测试 | P0 |
| QA-04 | 迟交测试 | P0 |
| QA-05 | 教师退回与学生重交测试 | P0 |
| QA-06 | 教师发布结果后学生查看测试 | P0 |
| QA-07 | 未发布结果不可见测试 | P0 |
| QA-08 | AI 字段不外泄测试 | P0 |
| QA-09 | 越权访问测试 | P0 |
| QA-10 | 上传失败和网络失败测试 | P1 |

## 8. 技术路线建议

### 8.1 前端技术

如果继续沿用当前静态原型：

- 先在 `teacher-side-prototype-optimized.html` 中加入学生端页面。
- 继续使用统一 `mockData` 驱动双端状态。
- 优先完成演示闭环。

如果进入真实系统开发：

- 建议使用现有前端框架或新建 Web 前端应用。
- 学生端路由独立，例如 `/student/*`。
- 页面优先移动端适配，但桌面端也可用。
- 状态从接口聚合返回，前端少做跨对象拼装。

### 8.2 后端技术

现有后端为 `NestJS + Prisma`，学生端建议继续复用：

- 新增或完善 `student` 聚合接口。
- 复用 `assignment`、`submission`、`teacher-review` 数据。
- 增加学生身份守卫。
- 接口响应层过滤 AI 字段。

### 8.3 数据库

复用当前核心表：

- `Student`
- `CourseClass`
- `ClassStudent`
- `Assignment`
- `Submission`
- `AIReview`
- `TeacherReview`
- `ResultPublication`

学生端不需要单独创建大量新表，优先通过聚合查询满足页面展示。

### 8.4 文件存储

MVP 建议：

- 本地或对象存储均可。
- 统一使用上传凭证。
- 附件记录文件名、大小、类型、URL、上传人、场景。
- 下载时校验当前学生是否有权限访问。

### 8.5 AI 接入

MVP 阶段：

- 学生提交后可自动触发 AI 初评，或由教师批量触发。
- AI 失败不阻塞教师人工批阅。
- 学生端不展示任何 AI 字段。

### 8.6 部署方式

演示阶段：

- 静态 HTML 原型即可。
- 使用 mockData 跑通闭环。

联调阶段：

- 后端本地服务。
- 数据库本地或开发环境。
- 文件服务可先 mock，再接真实存储。

上线阶段：

- 前端 Web 部署。
- 后端 API 部署。
- 数据库迁移和备份。
- 文件存储和访问控制。
- 日志与错误监控。

## 9. 验收标准

### 9.1 功能验收

- 学生可以登录。
- 学生可以看到本人作业列表。
- 学生可以进入作业详情。
- 学生可以提交文本、链接或附件。
- 提交后教师端统计变化。
- 截止后提交标记迟交。
- 教师退回后学生可重新提交。
- 教师发布后学生可查看最终结果。
- 教师未发布前学生看不到成绩。
- 学生看不到 AI 原始建议。

### 9.2 权限验收

- 学生不能访问其他学生提交。
- 学生不能访问其他学生结果。
- 学生不能访问未加入课程班的作业。
- 学生不能访问教师端接口。
- 附件下载需要权限校验。

### 9.3 异常验收

- 登录失败有提示。
- 作业不可访问有提示。
- 内容为空不能提交。
- 附件上传失败可重试。
- 网络失败不清空表单。
- 结果未发布时不返回分数和评语。

### 9.4 成功指标

- 学生首次进入后 1 分钟内能找到待提交作业。
- 学生提交成功率达到 95% 以上。
- 因“不知道是否提交成功”产生的咨询减少。
- 教师端未提交提醒后，学生补交转化率可统计。
- 学生端结果查看不引发 AI 建议外泄。
