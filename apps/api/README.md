# 教师端教务系统 API

NestJS + Prisma 后端工程骨架。

## 本地启动

```bash
npm install
cp .env.example .env
npm run prisma:generate
npm run prisma:migrate
npm run start:dev
```

默认服务端口：`3001`。

## 当前已搭建模块

- `AuthModule`：短信验证码占位、教师登录
- `TeacherModule`：当前教师信息、工作台概览
- `CourseClassModule`：课程班列表、创建、详情、更新、归档
- `PrismaModule`：PrismaService

## 说明

当前登录验证码为 MVP 开发占位：`123456`。接真实短信服务前不要用于生产。
