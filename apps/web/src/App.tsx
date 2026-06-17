import { useMemo, useState } from "react";
import {
  BarChart3,
  BookOpen,
  CheckSquare,
  ClipboardList,
  FileText,
  HelpCircle,
  LayoutDashboard,
  LogIn,
  Plus,
  UserRound,
} from "lucide-react";

type Screen =
  | "dashboard"
  | "classes"
  | "course-detail"
  | "assignment-management"
  | "grade-management"
  | "assignment-create"
  | "assignment-detail"
  | "review"
  | "student-entry"
  | "student-assignments"
  | "student-assignment-detail"
  | "student-submit-success"
  | "student-result"
  | "login"
  | "profile";

type Assignment = {
  title: string;
  course: string;
  status: "草稿" | "已发布" | "批阅中" | "已完成";
  submitted: number;
  total: number;
  pending: number;
  aiDone: number;
  due: string;
};

const assignments: Assignment[] = [
  { title: "课程论文：现代大学教育中的阅读与表达", course: "大学语文 2026 春 A 班", status: "批阅中", submitted: 145, total: 168, pending: 38, aiDone: 145, due: "06-20 20:00" },
  { title: "实验报告：观察与记录", course: "实验心理学 2 班", status: "批阅中", submitted: 47, total: 64, pending: 19, aiDone: 41, due: "今晚 23:00" },
  { title: "课程小论文", course: "专业导论", status: "草稿", submitted: 0, total: 92, pending: 0, aiDone: 0, due: "未发布" },
  { title: "阅读札记 01", course: "大学写作 B 班", status: "已完成", submitted: 74, total: 74, pending: 0, aiDone: 74, due: "已结束" },
];

const courses = [
  { name: "大学语文 2026 春 A 班", students: 168, assignments: 4, pending: 38, progress: 86 },
  { name: "实验心理学 2 班", students: 64, assignments: 2, pending: 19, progress: 73 },
  { name: "专业导论", students: 92, assignments: 3, pending: 0, progress: 94 },
];

const navItems: Array<{ screen: Screen; label: string; icon: typeof LayoutDashboard }> = [
  { screen: "dashboard", label: "工作台", icon: LayoutDashboard },
  { screen: "classes", label: "课程班", icon: BookOpen },
  { screen: "assignment-management", label: "作业管理", icon: ClipboardList },
  { screen: "grade-management", label: "成绩管理", icon: BarChart3 },
  { screen: "assignment-detail", label: "作业详情", icon: FileText },
  { screen: "review", label: "批阅工作台", icon: CheckSquare },
];

const screenMeta: Record<Screen, { title: string; desc: string }> = {
  dashboard: { title: "教师工作台", desc: "用数据看板快速了解课程、提交、AI 初评和教师复核进展。" },
  classes: { title: "课程班", desc: "管理课程班、学生名单、作业数量和班级提交进度。" },
  "course-detail": { title: "课程班详情", desc: "查看课程班基本信息、学生名单、作业列表和当前待处理事项。" },
  "assignment-management": { title: "作业管理", desc: "按课程班查看作业列表、发布状态、提交进度和批阅入口。" },
  "grade-management": { title: "成绩管理", desc: "查看成绩发布状态、复核完成度和成绩导出记录。" },
  "assignment-create": { title: "发布作业", desc: "配置作业说明、提交方式、AI 初评标准和发布范围。" },
  "assignment-detail": { title: "作业详情", desc: "查看提交状态、AI 初评进度、复核状态和成绩导出入口。" },
  review: { title: "批阅工作台", desc: "对照学生原文、AI 初评建议和教师最终复核结果。" },
  "student-entry": { title: "学生端入口", desc: "学生通过课程链接或临时身份进入作业提交页面。" },
  "student-assignments": { title: "学生作业列表", desc: "学生查看需要完成的作业和已发布结果。" },
  "student-assignment-detail": { title: "学生作业详情", desc: "学生查看作业要求并提交文本、链接或附件。" },
  "student-submit-success": { title: "提交成功", desc: "提交成功后查看提交状态，并等待教师批阅发布。" },
  "student-result": { title: "学生查看结果", desc: "学生只能查看教师发布后的最终分数和教师评语。" },
  login: { title: "登录", desc: "教师通过手机号、验证码或账号密码进入工作台。" },
  profile: { title: "个人中心", desc: "维护教师资料、学校院系、AI 偏好和成绩导出模板。" },
};

function App() {
  const [screen, setScreen] = useState<Screen>("dashboard");
  const current = screenMeta[screen];
  const totals = useMemo(() => ({
    pending: assignments.reduce((sum, item) => sum + item.pending, 0),
    unsubmitted: assignments.reduce((sum, item) => sum + Math.max(item.total - item.submitted, 0), 0),
    active: assignments.filter((item) => item.status === "批阅中").length,
    drafts: assignments.filter((item) => item.status === "草稿").length,
  }), []);

  return (
    <div className="desktop-frame">
      <header className="top-header">
        <button className="brand-button" onClick={() => setScreen("dashboard")}>
          <h1>教师端教务系统</h1>
          <p>AI 初评 · 教师复核 · 成绩归档</p>
        </button>
        <div className="header-actions">
          <button className="message-btn">消息</button>
          <button className="login-state" onClick={() => setScreen("login")}>
            <HelpCircle size={17} />
            <strong>未登录</strong>
          </button>
        </div>
      </header>

      <div className="workspace">
        <aside className="side-nav">
          <nav>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  className={screen === item.screen ? "active" : ""}
                  key={item.screen}
                  onClick={() => setScreen(item.screen)}
                >
                  <Icon size={15} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
          <button className="student-link" onClick={() => setScreen("student-entry")}>学生端入口</button>
          <div className="ai-note">AI 仅提供初评建议，最终结果必须由教师复核发布。</div>
        </aside>

        <main className="dashboard">
          <div className="page-heading">
            <div>
              <h2>{current.title}</h2>
              <p>{current.desc}</p>
            </div>
            <button className="outline-action" onClick={() => setScreen("profile")}>
              <UserRound size={15} />
              个人中心
            </button>
          </div>

          {screen === "dashboard" && <DashboardScreen totals={totals} go={setScreen} />}
          {screen === "classes" && <ClassesScreen go={setScreen} />}
          {screen === "course-detail" && <CourseDetailScreen go={setScreen} />}
          {screen === "assignment-management" && <AssignmentManagementScreen go={setScreen} />}
          {screen === "grade-management" && <GradeManagementScreen go={setScreen} />}
          {screen === "assignment-create" && <AssignmentCreateScreen go={setScreen} />}
          {screen === "assignment-detail" && <AssignmentDetailScreen go={setScreen} />}
          {screen === "review" && <ReviewScreen go={setScreen} />}
          {screen === "student-entry" && <StudentEntryScreen go={setScreen} />}
          {screen === "student-assignments" && <StudentAssignmentsScreen go={setScreen} />}
          {screen === "student-assignment-detail" && <StudentAssignmentDetailScreen go={setScreen} />}
          {screen === "student-submit-success" && <StudentSubmitSuccessScreen go={setScreen} />}
          {screen === "student-result" && <StudentResultScreen go={setScreen} />}
          {screen === "login" && <LoginScreen go={setScreen} />}
          {screen === "profile" && <ProfileScreen />}
        </main>
      </div>
    </div>
  );
}

function DashboardScreen({ totals, go }: { totals: { pending: number; unsubmitted: number; active: number; drafts: number }; go: (screen: Screen) => void }) {
  return (
    <>
      <section className="metric-grid">
        <Metric label="待教师复核" value={totals.pending} pill="所有作业" tone="amber" onClick={() => go("review")} />
        <Metric label="未提交学生" value={totals.unsubmitted} pill="所有作业" tone="red" onClick={() => go("assignment-detail")} />
        <Metric label="待处理作业" value={totals.active} pill="需处理" tone="green" onClick={() => go("assignment-management")} />
        <Metric label="待发布作业" value={totals.drafts} pill="常用" tone="purple" highlight onClick={() => go("assignment-create")} />
      </section>
      <section className="dashboard-grid">
        <article className="panel todo-panel">
          <PanelTitle title="今日待办" action="查看全部" onClick={() => go("assignment-management")} />
          <div className="todo-list">
            <Todo title="《大学语文》课程论文待复核" desc="38 份 AI 已完成，12 份评分置信度偏低" action="去复核" primary onClick={() => go("review")} />
            <Todo title="《实验心理学》实验报告今晚截止" desc="未提交 21 人，可发送班级提醒" action="提醒" onClick={() => go("assignment-detail")} />
            <Todo title="《专业导论》小组项目草稿未发布" desc="草稿保存于 2 天前" action="继续编辑" onClick={() => go("assignment-create")} />
          </div>
        </article>
        <CourseStatusPanel go={go} />
      </section>
    </>
  );
}

function ClassesScreen({ go }: { go: (screen: Screen) => void }) {
  return (
    <section className="panel page-panel">
      <PanelTitle title="课程班列表" action="创建课程班" onClick={() => go("course-detail")} />
      <div className="card-grid">
        {courses.map((course) => (
          <button className="course-card clickable" key={course.name} onClick={() => go("course-detail")}>
            <div className="course-head">
              <div><strong>{course.name}</strong><p>{course.students} 人 · {course.assignments} 个作业</p></div>
              <em className={course.pending ? "status-pill orange" : "status-pill green"}>{course.pending ? `${course.pending} 待复核` : "已完成"}</em>
            </div>
            <Progress value={course.progress} tone={course.pending ? "orange" : "green"} />
            <div className="course-foot"><span>提交率 {course.progress}%</span><span>查看详情</span></div>
          </button>
        ))}
      </div>
    </section>
  );
}

function CourseDetailScreen({ go }: { go: (screen: Screen) => void }) {
  return (
    <section className="panel page-panel">
      <PanelTitle title="大学语文 2026 春 A 班" action="发布新作业" onClick={() => go("assignment-create")} />
      <section className="metric-grid compact">
        <Metric label="学生人数" value={168} pill="名单完整" tone="green" />
        <Metric label="已发布作业" value={4} pill="进行中" tone="amber" />
        <Metric label="待复核提交" value={38} pill="需处理" tone="orange" onClick={() => go("review")} />
        <Metric label="未提交学生" value={23} pill="可提醒" tone="red" />
      </section>
      <AssignmentTable go={go} />
    </section>
  );
}

function AssignmentManagementScreen({ go }: { go: (screen: Screen) => void }) {
  return (
    <section className="panel page-panel">
      <PanelTitle title="作业列表" action="新建作业" onClick={() => go("assignment-create")} />
      <AssignmentTable go={go} />
    </section>
  );
}

function GradeManagementScreen({ go }: { go: (screen: Screen) => void }) {
  return (
    <section className="panel page-panel">
      <PanelTitle title="成绩发布与导出" action="导出成绩" onClick={() => go("assignment-detail")} />
      <section className="metric-grid compact">
        <Metric label="可导出结果" value={198} pill="已发布" tone="green" />
        <Metric label="待发布结果" value={57} pill="需复核" tone="amber" onClick={() => go("review")} />
        <Metric label="导出记录" value={6} pill="近 7 天" tone="purple" />
        <Metric label="异常提交" value={2} pill="需人工" tone="red" />
      </section>
      <SimpleTable rows={[
        ["大学语文 A 班", "145 / 168", "38 待复核", "91 已发布", "详情 / 复核 / 导出"],
        ["实验心理学 2 班", "47 / 64", "19 待复核", "28 已发布", "详情 / 复核 / 导出"],
        ["专业导论", "86 / 92", "已完成", "86 已发布", "详情 / 查看 / 导出"],
      ]} />
    </section>
  );
}

function AssignmentCreateScreen({ go }: { go: (screen: Screen) => void }) {
  return (
    <section className="panel page-panel">
      <PanelTitle title="配置作业" action="保存并发布" onClick={() => go("assignment-detail")} />
      <div className="form-grid">
        <Field label="作业标题" value="课程论文：现代大学教育中的阅读与表达" />
        <Field label="发布范围" value="大学语文 2026 春 A 班" />
        <Field label="截止时间" value="2026-06-20 20:00" />
        <Field label="提交方式" value="附件 + 文本说明" />
      </div>
      <div className="text-block">
        <strong>AI 初评标准</strong>
        <p>主题完整性 30%，论证结构 30%，语言表达 20%，格式规范 20%。AI 只生成建议分和建议评语，教师确认后才发布。</p>
      </div>
    </section>
  );
}

function AssignmentDetailScreen({ go }: { go: (screen: Screen) => void }) {
  return (
    <section className="panel page-panel">
      <PanelTitle title="课程论文：现代大学教育中的阅读与表达" action="去复核" onClick={() => go("review")} />
      <section className="metric-grid compact">
        <Metric label="已提交" value={145} pill="168 人" tone="green" />
        <Metric label="AI 已完成" value={145} pill="可复核" tone="purple" />
        <Metric label="待复核" value={38} pill="需处理" tone="amber" />
        <Metric label="未提交" value={23} pill="可提醒" tone="red" />
      </section>
      <SimpleTable rows={[
        ["张同学", "已提交 06-18 21:12", "AI 已完成", "待复核", "86 建议分"],
        ["李同学", "迟交 2 小时", "AI 失败", "待人工", "-"],
        ["赵同学", "已提交", "AI 已完成", "已发布", "91 最终分"],
      ]} actionLabel="复核" onAction={() => go("review")} />
    </section>
  );
}

function ReviewScreen({ go }: { go: (screen: Screen) => void }) {
  return (
    <section className="review-grid">
      <article className="panel page-panel">
        <PanelTitle title="学生原文" action="下一份" onClick={() => go("review")} />
        <div className="paper-preview">
          <strong>张同学 · 20260001</strong>
          <p>本文围绕现代大学教育中的阅读与表达展开，讨论通识教育、课堂讨论和写作训练之间的关系...</p>
        </div>
      </article>
      <aside className="panel page-panel">
        <PanelTitle title="AI 初评建议" />
        <div className="score-ring">86</div>
        <div className="text-block"><strong>主要问题</strong><p>论证结构基本完整，但结尾收束略弱，个别引用格式不统一。</p></div>
        <button className="solid-action wide" onClick={() => go("assignment-detail")}>保存并发布结果</button>
      </aside>
    </section>
  );
}

function StudentEntryScreen({ go }: { go: (screen: Screen) => void }) {
  return (
    <section className="panel page-panel centered">
      <LogIn size={34} />
      <h3>学生端入口</h3>
      <p>学生通过课程链接或临时身份进入作业提交页面。</p>
      <button className="solid-action" onClick={() => go("student-assignments")}>确认身份并进入</button>
      <button className="outline-action" onClick={() => go("dashboard")}>返回教师端</button>
    </section>
  );
}

function StudentAssignmentsScreen({ go }: { go: (screen: Screen) => void }) {
  return (
    <section className="panel page-panel">
      <PanelTitle title="我的作业" action="切换身份" onClick={() => go("student-entry")} />
      <Todo title="课程论文：现代大学教育中的阅读与表达" desc="截止 2026-06-20 20:00 / 可提交" action="去提交" primary onClick={() => go("student-assignment-detail")} />
      <Todo title="阅读札记 01：文本细读与观点提炼" desc="教师已发布结果" action="查看结果" onClick={() => go("student-result")} />
    </section>
  );
}

function StudentAssignmentDetailScreen({ go }: { go: (screen: Screen) => void }) {
  return (
    <section className="panel page-panel">
      <PanelTitle title="作业要求与提交" action="提交作业" onClick={() => go("student-submit-success")} />
      <div className="text-block"><strong>提交要求</strong><p>上传 PDF 或 Word，并补充 100 字以内说明。提交后等待教师复核发布结果。</p></div>
      <Field label="附件" value="未选择文件" />
    </section>
  );
}

function StudentSubmitSuccessScreen({ go }: { go: (screen: Screen) => void }) {
  return (
    <section className="panel page-panel centered">
      <h3>提交成功</h3>
      <p>作业已提交，等待教师批阅发布。</p>
      <button className="solid-action" onClick={() => go("student-assignments")}>返回作业列表</button>
      <button className="outline-action" onClick={() => go("student-result")}>查看发布后结果示例</button>
    </section>
  );
}

function StudentResultScreen({ go }: { go: (screen: Screen) => void }) {
  return (
    <section className="panel page-panel">
      <PanelTitle title="已发布结果" action="返回列表" onClick={() => go("student-assignments")} />
      <div className="score-ring">91</div>
      <div className="text-block"><strong>教师评语</strong><p>观点明确，材料使用较充分。建议继续加强结尾的归纳力度。</p></div>
    </section>
  );
}

function LoginScreen({ go }: { go: (screen: Screen) => void }) {
  return (
    <section className="panel page-panel centered">
      <h3>登录</h3>
      <Field label="手机号" value="13800000000" />
      <Field label="验证码" value="123456" />
      <button className="solid-action wide" onClick={() => go("dashboard")}>登录进入</button>
    </section>
  );
}

function ProfileScreen() {
  return (
    <section className="panel page-panel">
      <PanelTitle title="个人中心" />
      <div className="form-grid">
        <Field label="教师姓名" value="王老师" />
        <Field label="学校院系" value="文学院 / 公共课教学部" />
        <Field label="AI 评语风格" value="详细、建设性" />
        <Field label="成绩导出模板" value="教务系统标准模板" />
      </div>
    </section>
  );
}

function CourseStatusPanel({ go }: { go: (screen: Screen) => void }) {
  return (
    <article className="panel course-panel">
      <PanelTitle title="课程状态" action="管理课程班" onClick={() => go("classes")} />
      <div className="course-list">
        {courses.slice(0, 2).map((course) => (
          <button className="course-card clickable" key={course.name} onClick={() => go("course-detail")}>
            <div className="course-head">
              <div><strong>{course.name}</strong><p>{course.students} 人 · {course.assignments} 个作业进行中</p></div>
              <em className={course.pending ? "status-pill orange" : "status-pill green"}>• {course.pending || 0} 待处理</em>
            </div>
            <Progress value={course.progress} tone={course.pending ? "orange" : "green"} />
            <div className="course-foot"><span>提交率 {course.progress}%</span><span>{Math.round(course.students * course.progress / 100)} / {course.students}</span></div>
          </button>
        ))}
      </div>
      <div className="course-tip">AI 只显示为“建议”。最终成绩、评语和发布动作都由教师确认。</div>
    </article>
  );
}

function AssignmentTable({ go }: { go: (screen: Screen) => void }) {
  return (
    <div className="table-wrap">
      <table>
        <thead><tr><th>作业</th><th>课程班</th><th>状态</th><th>提交</th><th>AI 初评</th><th>操作</th></tr></thead>
        <tbody>
          {assignments.map((item) => (
            <tr key={item.title}>
              <td>{item.title}<br /><span>{item.due}</span></td>
              <td>{item.course}</td>
              <td><em className={`status-pill ${item.status === "已完成" ? "green" : item.status === "草稿" ? "purple" : "orange"}`}>{item.status}</em></td>
              <td>{item.submitted} / {item.total}</td>
              <td>{item.aiDone ? `${item.aiDone} 已完成` : "未开始"}</td>
              <td><button className="text-link" onClick={() => go(item.status === "草稿" ? "assignment-create" : "assignment-detail")}>详情</button><button className="text-link" onClick={() => go("review")}>复核</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SimpleTable({ rows, actionLabel, onAction }: { rows: string[][]; actionLabel?: string; onAction?: () => void }) {
  return (
    <div className="table-wrap">
      <table>
        <tbody>
          {rows.map((row) => (
            <tr key={row.join("-")}>
              {row.map((cell) => <td key={cell}>{cell}</td>)}
              {actionLabel && <td><button className="text-link" onClick={onAction}>{actionLabel}</button></td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Metric({ label, value, pill, tone, highlight, onClick }: { label: string; value: number; pill: string; tone: string; highlight?: boolean; onClick?: () => void }) {
  return (
    <button className={`metric-card ${highlight ? "highlight" : ""}`} onClick={onClick}>
      <span>{label}</span>
      <strong>{value}</strong>
      <em className={`status-pill ${tone}`}>• {pill}</em>
    </button>
  );
}

function PanelTitle({ title, action, onClick }: { title: string; action?: string; onClick?: () => void }) {
  return (
    <div className="panel-title">
      <h2>{title}</h2>
      {action && <button onClick={onClick}>{action}</button>}
    </div>
  );
}

function Todo({ title, desc, action, primary, onClick }: { title: string; desc: string; action: string; primary?: boolean; onClick: () => void }) {
  return (
    <div className="todo-item">
      <div><strong>{title}</strong><p>{desc}</p></div>
      <button className={primary ? "solid-action" : "outline-action"} onClick={onClick}>{action}</button>
    </div>
  );
}

function Progress({ value, tone }: { value: number; tone: string }) {
  return <div className="progress-track"><span className={tone} style={{ width: `${value}%` }} /></div>;
}

function Field({ label, value }: { label: string; value: string }) {
  return <label className="field"><span>{label}</span><input defaultValue={value} /></label>;
}

export default App;
