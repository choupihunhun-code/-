# 教师端 UI 样式与组件库整理

本文档基于当前 React/Vite/Tailwind 实现整理，代码来源主要对应：

- `apps/web/src/App.tsx`
- `apps/web/src/styles.css`

适用产品：教师端教务系统，包含工作台、班级管理、作业管理、成绩管理、作业详情、批阅工作台、登录弹窗和账号资料入口。

## 1. UI 风格定位

整体风格是“轻量后台 + 教务工作台”：

- 背景使用浅紫蓝渐变，营造轻办公感。
- 内容容器以白色、浅描边、柔和阴影为主。
- 主色为紫蓝色，用于当前导航、主按钮、关键状态和高亮指标。
- 信息密度中等，适合教师快速扫读待办、班级状态和批阅进度。
- AI 相关信息只作为辅助建议呈现，不压过教师操作。

## 2. 设计 Token

### 颜色

```css
/* brand */
--color-primary: #635bff;
--color-primary-2: #7f43f1;
--color-primary-3: #8a2ff2;

/* text */
--color-text: #15213a;
--color-text-muted: #73809a;
--color-text-soft: #9aa6bd;

/* surface */
--color-bg-start: #fafbff;
--color-bg-end: #f4f2ff;
--color-surface: #ffffff;
--color-surface-soft: #f8faff;

/* border */
--color-border: #e6eafe;
--color-border-strong: #d9e0fb;

/* state */
--color-warning-bg: #fff4dc;
--color-warning-text: #e87905;
--color-danger-bg: #fff1f1;
--color-danger-text: #ef4444;
--color-success-bg: #eafbf0;
--color-success-text: #16a34a;
```

### 字体

```css
font-family: Inter, "PingFang SC", "Microsoft YaHei", Arial, sans-serif;
```

字号层级：

| 场景 | 字号 | 字重 |
| --- | --- | --- |
| 顶部系统名 | 17px | 800 |
| 页面标题 | 18px | 700 |
| 面板标题 | 16px | 700 |
| 卡片正文 | 13px-15px | 400-700 |
| 指标数字 | 25px | 800 |
| 辅助说明 | 12px-13px | 400 |

### 圆角与阴影

| 场景 | 圆角 | 阴影 |
| --- | --- | --- |
| 应用外框 | 18px | `0 24px 70px rgba(62,56,120,.16)` |
| 主面板 | 17px | `0 18px 44px rgba(80,70,150,.09)` |
| 指标卡片 | 15px | `0 16px 35px rgba(62,56,120,.05)` |
| 弹窗 | 16px | `0 28px 80px rgba(15,23,42,.35)` |
| 按钮/输入框 | 12px | 主按钮有轻阴影 |

## 3. 页面布局

当前页面是固定工作台框架：

```tsx
<div className="desktop-frame">
  <header className="top-header">...</header>
  <div className="workspace">
    <aside className="side-nav">...</aside>
    <main className="dashboard">...</main>
  </div>
</div>
```

核心 CSS：

```css
.desktop-frame {
  @apply mx-auto my-[5px] min-h-[min(878px,calc(100vh-10px))]
    w-[min(1108px,calc(100vw-10px))] overflow-hidden rounded-[18px]
    border border-[#dae0ff]/90 shadow-[0_24px_70px_rgba(62,56,120,0.16)];
}

.workspace {
  @apply grid min-h-[calc(min(878px,calc(100vh-10px))-64px)]
    grid-cols-[260px_minmax(0,1fr)];
}

.dashboard {
  @apply min-w-0 px-6 pb-7 pt-5;
}
```

移动端规则：

```css
@media (max-width: 900px) {
  .desktop-frame { @apply m-0 min-h-screen w-full rounded-none; }
  .workspace,
  .metric-grid,
  .dashboard-grid,
  .card-grid,
  .form-grid,
  .review-grid { @apply grid-cols-1; }
  .side-nav { @apply hidden; }
  .top-header { @apply px-4; }
  .dashboard { @apply p-4; }
}
```

## 4. 导航与顶部栏

### 顶部栏

顶部栏包含品牌、消息按钮、登录状态/账号入口。

```tsx
<header className="top-header">
  <button className="brand-button">
    <h1>教师端教务系统</h1>
    <p>AI 初评 · 教师复核 · 成绩归档</p>
  </button>
  <div className="header-actions">
    <button className="message-btn">消息</button>
    <button className="login-state">未登录</button>
  </div>
</header>
```

### 侧边栏导航

```tsx
const navItems = [
  { screen: "dashboard", label: "工作台", icon: LayoutDashboard },
  { screen: "classes", label: "班级管理", icon: BookOpen },
  { screen: "assignment-management", label: "作业管理", icon: ClipboardList },
  { screen: "grade-management", label: "成绩管理", icon: BarChart3 },
  { screen: "assignment-detail", label: "作业详情", icon: FileText },
  { screen: "review", label: "批阅工作台", icon: CheckSquare },
];
```

```css
.side-nav-card {
  @apply flex h-full flex-col rounded-[18px] border border-white/80 bg-white/90
    px-3 py-4 shadow-[0_18px_44px_rgba(80,70,150,0.08)];
}

.side-nav-card button {
  @apply flex h-[42px] items-center gap-3 rounded-xl bg-transparent px-4
    text-left text-[#758198];
}

.side-nav-card button.active {
  @apply bg-[#edf0ff] text-[#635bff];
}
```

## 5. 组件库代码

### PanelTitle

用于面板标题和右侧文字操作。

```tsx
function PanelTitle({
  title,
  action,
  onClick,
}: {
  title: string;
  action?: string;
  onClick?: () => void;
}) {
  return (
    <div className="panel-title">
      <h2>{title}</h2>
      {action && <button onClick={onClick}>{action}</button>}
    </div>
  );
}
```

```css
.panel-title {
  @apply mb-4 flex items-center justify-between gap-3;
}

.panel-title h2 {
  @apply m-0 text-base font-bold leading-tight;
}

.panel-title button,
.text-link {
  @apply bg-transparent font-bold text-[#635bff];
}
```

### Metric 指标卡片

用于工作台顶部指标。

```tsx
function Metric({
  label,
  value,
  pill,
  tone,
  highlight,
  onClick,
}: {
  label: string;
  value: number;
  pill: string;
  tone: string;
  highlight?: boolean;
  onClick?: () => void;
}) {
  return (
    <button className={`metric-card ${highlight ? "highlight" : ""}`} onClick={onClick}>
      <span>{label}</span>
      <strong>{value}</strong>
      <em className={`status-pill ${tone}`}>• {pill}</em>
    </button>
  );
}
```

```css
.metric-grid {
  @apply grid grid-cols-4 gap-3.5;
}

.metric-card {
  @apply min-h-28 rounded-[15px] border border-[#e6eafe] bg-white/90 p-4
    text-left shadow-[0_16px_35px_rgba(62,56,120,0.05)];
}

.metric-card strong {
  @apply my-1.5 block text-[25px] font-extrabold leading-none tracking-normal;
}

.metric-card.highlight {
  @apply border-transparent bg-gradient-to-br from-[#6b5cff] to-[#8a2ff2]
    text-white shadow-[0_18px_42px_rgba(102,80,236,0.28)];
}
```

### StatusPill 状态标签

当前代码使用 `status-pill` 类名组合。

```tsx
<em className={`status-pill ${tone}`}>• {pill}</em>
```

可选 tone：

- `amber`
- `orange`
- `red`
- `green`
- `purple`

```css
.status-pill {
  @apply inline-flex min-h-6 items-center rounded-full px-2.5 text-xs font-bold not-italic;
}

.status-pill.amber,
.status-pill.orange {
  @apply bg-[#fff4dc] text-[#e87905];
}

.status-pill.red {
  @apply bg-[#fff1f1] text-red-500;
}

.status-pill.green {
  @apply bg-[#eafbf0] text-green-600;
}

.status-pill.purple {
  @apply bg-white/20 text-[#f7f4ff];
}
```

### Todo 待办卡片

```tsx
function Todo({
  title,
  desc,
  action,
  primary,
  onClick,
}: {
  title: string;
  desc: string;
  action: string;
  primary?: boolean;
  onClick: () => void;
}) {
  return (
    <div className="todo-item">
      <div>
        <strong>{title}</strong>
        <p>{desc}</p>
      </div>
      <button className={primary ? "solid-action" : "outline-action"} onClick={onClick}>
        {action}
      </button>
    </div>
  );
}
```

```css
.todo-item {
  @apply grid min-h-[76px] grid-cols-[minmax(0,1fr)_auto] items-center gap-4
    rounded-[14px] border border-[#e6eafe] bg-white py-4 pl-4 pr-3.5;
}
```

### Button 按钮

当前有三类按钮：

- `solid-action`：主操作
- `outline-action`：次操作
- `text-link`：表格/面板内轻操作

```css
.solid-action,
.outline-action {
  @apply inline-flex min-h-10 min-w-[68px] items-center justify-center gap-2
    whitespace-nowrap rounded-xl px-3.5;
}

.solid-action {
  @apply bg-gradient-to-br from-[#6b5cff] to-[#7f43f1] text-white
    shadow-[0_12px_24px_rgba(99,91,255,0.24)];
}

.outline-action {
  @apply border border-[#d9e0fb] bg-white text-[#15213a];
}

.text-link {
  @apply mr-2.5 bg-transparent font-bold text-[#635bff];
}
```

使用规则：

- 主流程按钮用 `solid-action`，例如“去复核”“登录”“保存并发布”。
- 返回、提醒、查看示例等低风险操作用 `outline-action`。
- 表格行内操作用 `text-link`，避免按钮过重。

### LoginModal 登录弹窗

登录方式是弹窗，不是独立页面。弹窗头部和底部固定，中间表单区域滚动。

```tsx
function LoginModal({ onClose, onLogin }: { onClose: () => void; onLogin: () => void }) {
  return (
    <div className="modal-backdrop">
      <section className="login-modal">
        <header className="login-modal-head">
          <div>
            <h2>系统登录</h2>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="关闭登录弹窗">
            <X size={16} />
          </button>
        </header>

        <div className="login-tabs">...</div>
        <div className="login-form">...</div>

        <footer className="login-modal-foot">
          <button className="solid-action wide" onClick={onLogin}>登录</button>
        </footer>
      </section>
    </div>
  );
}
```

```css
.modal-backdrop {
  @apply fixed inset-0 z-50 grid place-items-center bg-slate-950/45 p-4 backdrop-blur-[2px];
}

.login-modal {
  @apply flex max-h-[86vh] w-[min(460px,calc(100vw-28px))] flex-col overflow-hidden
    rounded-2xl bg-white shadow-[0_28px_80px_rgba(15,23,42,0.35)];
}

.login-form {
  @apply grid min-h-0 flex-1 gap-3 overflow-y-auto px-6 py-4;
}

.login-modal-foot {
  @apply shrink-0 border-t border-[#eef1fb] bg-white px-6 pb-6 pt-4;
}
```

### AccountPanel 账号资料浮层

登录后右上角显示头像 + ID，点击展开账号资料。

```tsx
function AccountPanel({ onLogout }: { onLogout: () => void }) {
  return (
    <div className="account-panel">
      <div className="flex items-center gap-3 border-b border-[#e6eafe] pb-3">
        <span className="avatar large">王</span>
        <div>
          <strong className="block text-[#15213a]">王老师</strong>
          <span className="text-xs text-[#73809a]">教师 ID：T20260001</span>
        </div>
      </div>
      <div className="account-info">...</div>
      <button className="logout-button" onClick={onLogout}>退出登录</button>
    </div>
  );
}
```

```css
.account-panel {
  @apply absolute right-0 top-[48px] z-40 w-[320px] rounded-2xl border border-[#d9e0fb]
    bg-white p-4 text-sm shadow-[0_22px_60px_rgba(62,56,120,0.2)];
}

.avatar {
  @apply grid h-[34px] w-[34px] place-items-center rounded-full bg-gradient-to-br
    from-[#6b5cff] to-[#8a2ff2] text-sm font-extrabold text-white
    shadow-[0_10px_24px_rgba(99,91,255,0.25)];
}
```

### Progress 进度条

```tsx
function Progress({ value, tone }: { value: number; tone: string }) {
  return (
    <div className="progress-track">
      <span className={tone} style={{ width: `${value}%` }} />
    </div>
  );
}
```

```css
.progress-track {
  @apply my-3 h-2 overflow-hidden rounded-full bg-[#edf1f7];
}

.progress-track span {
  @apply block h-full rounded-full;
}

.progress-track span.green {
  @apply bg-green-600;
}

.progress-track span.orange {
  @apply bg-orange-500;
}
```

### Field 表单项

```tsx
function Field({ label, value }: { label: string; value: string }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input defaultValue={value} />
    </label>
  );
}
```

```css
.form-grid {
  @apply grid grid-cols-2 gap-3.5;
}

.field {
  @apply grid gap-2 text-[13px] text-[#73809a];
}

.field input {
  @apply h-[42px] rounded-xl border border-[#d9e0fb] bg-white px-3 text-[#15213a];
  font: inherit;
}
```

### Table 表格

```css
.table-wrap {
  @apply overflow-auto;
}

table {
  @apply w-full min-w-[760px] overflow-hidden rounded-[14px] border border-[#e6eafe] bg-white;
  border-collapse: collapse;
}

th,
td {
  @apply border-b border-[#e6eafe] px-3.5 py-3 text-left align-middle text-[13px];
}

th {
  @apply bg-[#fafbff] font-bold text-[#73809a];
}
```

## 6. 组件命名建议

如果后续要正式拆成组件库，建议目录如下：

```txt
apps/web/src/components/
  layout/
    AppFrame.tsx
    TopHeader.tsx
    SideNav.tsx
  feedback/
    LoginModal.tsx
    AccountPanel.tsx
    StatusPill.tsx
  data-display/
    MetricCard.tsx
    PanelTitle.tsx
    DataTable.tsx
    ProgressBar.tsx
  forms/
    Field.tsx
    LoginInput.tsx
  actions/
    Button.tsx
```

推荐先抽这些组件：

1. `Button`
2. `StatusPill`
3. `PanelTitle`
4. `MetricCard`
5. `ProgressBar`
6. `LoginModal`
7. `AccountPanel`
8. `SideNav`

## 7. 后续开发规范

- 新页面优先复用 `panel`、`page-panel`、`panel-title`、`solid-action`、`outline-action`。
- 页面主容器不要再嵌套多层卡片，主内容区用面板，重复项才用卡片。
- 每个操作区最多一个主按钮。
- 表格行内操作优先用 `text-link`。
- 状态必须有文字，不只依赖颜色。
- 登录和个人中心只从右上角账号入口进入，页面标题区不再放重复登录按钮。
- 登录弹窗保持固定头部、滚动表单、固定底部按钮结构。
- 移动端低于 `900px` 时主网格统一单列，侧边栏隐藏。
