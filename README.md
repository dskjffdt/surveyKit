# SurveyKit

在线问卷系统 — React + TypeScript + Zustand，纯前端，数据存 localStorage。

## 功能

- 问卷创建 / 编辑 / 发布 / 撤回
- 四种题型：单选、多选、填空、评分
- 填答页（必填校验 + 防重复提交）
- 答卷统计 + CSV 导出
- 编辑自动保存提示、离开未保存确认

## 技术栈

React 19 · TypeScript · Vite · Zustand (persist) · React Router

## 项目结构

```
src/
  types/question.ts              # 题型 / 问卷 / 答卷类型定义
  services/questionUtils.ts      # 创建题目、校验、统计、CSV 导出
  store/surveyStore.ts           # Zustand 状态 + localStorage 持久化
  components/
    questions/QuestionRenderer.tsx  # 题目编辑 / 填答渲染
    stats/StatsResult.tsx           # 统计结果展示
    layout/AppLayout.tsx
  pages/
    HomePage.tsx                 # 问卷列表
    EditorPage.tsx               # 编辑问卷
    FillPage.tsx                 # 填答
    StatsPage.tsx                # 统计
  hooks/useLeaveConfirm.ts
```

## 路由

| 路径 | 说明 |
|------|------|
| `/` | 问卷列表 |
| `/editor/:id` | 编辑问卷 |
| `/fill/:id` | 填答（需已发布） |
| `/stats/:id` | 答卷统计 |

## 开发

```bash
npm install
npm run dev      # 本地开发
npm run build    # 生产构建
npm run preview  # 预览构建结果
```

## 类型设计

题目用**联合类型**区分题型，填答时用 `switch (question.type)` 收窄类型：

```ts
export type Question =
  | SingleQuestion
  | MultipleQuestion
  | TextQuestion
  | RatingQuestion
```

## 扩展题型

1. 在 `types/question.ts` 新增题型 interface，并入 `Question` 联合类型
2. 在 `QuestionRenderer.tsx` 补充编辑 / 填答 UI
3. 在 `services/questionUtils.ts` 的 `createDefaultQuestion`、`validateAnswer`、`aggregateStats`、`formatCSVCell` 各加一个 `case`
4. 在 `QUESTION_TYPE_LABELS` 添加中文名

`switch` 末尾用 `never` 做穷尽检查，漏改时 TypeScript 会报错。

## 部署（Vercel）

项目已包含 `vercel.json`，用于 SPA 路由回退（`/editor/:id` 等路径刷新不 404）。

### 方式一：网页导入

1. 将代码推送到 GitHub
2. 打开 [vercel.com](https://vercel.com) → **Add New Project** → 导入仓库
3. Vercel 会自动识别 Vite，保持默认即可：
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. 点击 Deploy

### 方式二：CLI

```bash
npm i -g vercel
vercel          # 首次部署，按提示登录并关联项目
vercel --prod   # 部署到生产环境
```

部署完成后，把线上地址填进 README 或简历即可。
