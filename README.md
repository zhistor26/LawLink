# LawLink

LawLink 是一个开源、自部署的律师案件/项目管理系统，面向独立律师、小团队和小型律所。

第一版围绕律师日常办案主线：

`收案登记 -> 冲突检索 -> 转正式案件 -> 持续跟进 -> 财务记录 -> 结案归档 -> 数据导出`

## 技术栈

- Next.js App Router + TypeScript
- Ant Design
- PostgreSQL + Prisma
- NextAuth.js
- Docker Compose

## 本地开发

```bash
npm install
npm run dev
```

## 验证

```bash
npm run lint
npm run typecheck
npm run prisma:validate
npm run build
```

## 部署方向

项目预留 Docker Compose 自部署方案。第一版默认单个律师、团队或律所独立部署，不做共享 SaaS 多租户。
