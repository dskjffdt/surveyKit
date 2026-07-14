# SurveyKit

在线问卷系统 — React + TypeScript 前端，Node + Express + MySQL 后端，JWT httpOnly Cookie 鉴权，多角色权限。

## 功能

- 问卷创建 / 编辑 / 发布 / 撤回
- 四种题型：单选、多选、填空、评分
- 填答页（公开访问，必填校验 + 防重复提交）
- 答卷统计（CSS 柱状图）+ CSV 导出
- 问卷预览：编辑页弹窗预览、草稿新窗口预览、预览模式不提交
- 题目拖拽排序、填答链接复制
- 首页答卷数据概览
- 多角色：管理员只读查看全平台数据，创建者负责问卷业务操作
- JWT 存 httpOnly Cookie，axios 二次封装 + CORS 跨域

## 技术栈

**前端：** React 19 · TypeScript · Vite · TanStack React Query · Zustand（鉴权）· React Router · Axios

**后端：** Node.js · Express · JWT · bcrypt · MySQL

**工程：** 路由懒加载 · Vendor 分包 · PageGate 延迟加载

## 演示账号

| 角色 | 用户名 | 密码 |
|------|--------|------|
| 管理员 | admin | admin123 |
| 创建者 | creator | creator123 |

## 项目结构

```
src/
  api/                    # axios 封装 + 接口
  queries/                # React Query hooks
  types/                  # 类型定义
  store/                  # Zustand（登录会话）
  services/               # 业务工具函数
  components/             # 组件
  pages/                  # 页面
server/
  src/
    index.js              # Express 入口
    db.js                 # MySQL 连接与数据访问
    middleware/auth.js      # JWT + 角色鉴权
    routes/               # auth / surveys / public
  sql/schema.sql          # 表结构参考
```

## 路由

| 路径 | 说明 | 权限 |
|------|------|------|
| `/login` | 登录 | 公开 |
| `/register` | 注册 | 公开 |
| `/` | 问卷列表 | 需登录 |
| `/editor/:id` | 编辑问卷 | creator |
| `/preview/:id` | 填答预览（草稿可预览，不提交） | admin / creator |
| `/fill/:id` | 公开填答 | 公开（需已发布） |
| `/stats/:id` | 答卷统计 | admin / creator |

## 本地开发

需要本机已安装并启动 **MySQL**（5.7+ 或 8.x）。首次启动会自动建库、建表并写入演示数据。

```bash
npm install

# 复制环境变量并按需修改 MySQL 账号
cp .env.example .env

# 终端 1：API 服务（默认 3001）
npm run dev:server

# 终端 2：前端（默认 5173，/api 代理到后端）
npm run dev
```

访问 http://localhost:5173 ，用演示账号登录即可。

```bash
npm run build    # 生产构建
npm run preview  # 预览构建结果
```

## API 概览

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/auth/register` | 注册（默认 creator 角色，自动登录） |
| POST | `/api/auth/login` | 登录，写入 Cookie |
| POST | `/api/auth/logout` | 退出 |
| GET | `/api/auth/me` | 当前用户 |
| GET | `/api/surveys` | 问卷列表（按角色过滤） |
| GET | `/api/surveys/:id` | 问卷详情（含草稿，需权限） |
| POST | `/api/surveys` | 创建问卷 |
| PUT | `/api/surveys/:id` | 更新问卷 |
| DELETE | `/api/surveys/:id` | 删除问卷 |
| GET | `/api/surveys/:id/responses` | 答卷列表 |
| GET | `/api/public/surveys/:id` | 公开填答问卷（仅已发布） |
| POST | `/api/public/surveys/:id/responses` | 提交答卷 |

## 环境变量

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `PORT` | 3001 | 后端端口 |
| `CLIENT_ORIGIN` | http://localhost:5173 | CORS 允许的前端地址 |
| `JWT_SECRET` | surveykit-dev-secret | JWT 密钥（生产务必修改） |
| `MYSQL_HOST` | localhost | MySQL 主机 |
| `MYSQL_PORT` | 3306 | MySQL 端口 |
| `MYSQL_USER` | root | MySQL 用户名 |
| `MYSQL_PASSWORD` | （空） | MySQL 密码 |
| `MYSQL_DATABASE` | surveykit | 数据库名 |
| `VITE_API_URL` | /api | 前端 API 基址（生产填后端地址） |

## 部署说明

- **前端**：可部署到 Vercel（`vercel.json` 已配置 SPA 回退）
- **后端**：需单独部署（Railway、Render 等），并设置 `CLIENT_ORIGIN` 为前端域名
- 生产环境前端设置 `VITE_API_URL=https://你的后端域名/api`

## 扩展题型

1. 在 `types/question.ts` 新增题型 interface，并入 `Question` 联合类型
2. 在 `QuestionRenderer.tsx` 补充编辑 / 填答 UI
3. 在 `services/questionUtils.ts` 的 `createDefaultQuestion`、`validateAnswer`、`aggregateStats`、`formatCSVCell` 各加一个 `case`
4. 在 `QUESTION_TYPE_LABELS` 添加中文名
