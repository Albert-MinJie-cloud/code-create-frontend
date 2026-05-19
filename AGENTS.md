# AGENTS.md

## 项目概览

这是一个基于以下技术栈的前端项目：

- React 19
- TypeScript 6
- Vite 8
- Ant Design 6
- React Router 7
- Zustand 5
- Axios
- Orval 8

项目入口位于 `src/index.tsx`，路由集中定义在 `src/router/index.tsx`，基础布局位于 `src/layouts/index.tsx`。

## 包管理与常用命令

本仓库当前使用 `npm`，锁文件为 `package-lock.json`。

常用命令：

```bash
npm run dev
npm run build
npm run lint
npm run format
npm run format:check
npm run preview
npm run api
```

补充说明：

- `build` 会先执行 `tsc -b`，再执行 `vite build`
- `format` / `format:check` 当前仅覆盖 `src/**/*.{ts,tsx,css}`
- 当前仓库未配置测试脚本；如需最小验证，优先运行 `npm run lint`，必要时补充 `npm run build`

## 目录结构

当前项目主要目录和职责如下：

```text
src/
  api/
    endpoints/      Orval 生成的请求函数
    models/         Orval 生成的类型定义
    index.ts        API 统一导出
  assets/           图片和静态资源
  components/       通用组件（错误边界、全局头尾、路由守卫、Suspense 包装等）
  layouts/          页面布局
  page/             业务页面
  router/           路由配置
  store/            Zustand 状态管理
  styles/           全局样式
  utils/            请求封装与基础工具
```

补充说明：

- 鉴权组件在 `src/components/ProtectedRoute/index.tsx`
- 登录态在 `src/store/authStore.ts`
- 主题状态在 `src/store/themeStore.ts`
- Axios 封装在 `src/utils/request.ts`
- Orval 配置在 `orval.config.ts`

## 代码风格与工程约定

请遵循仓库现有配置，不要额外引入新的代码风格工具。

### Prettier

以仓库根目录 `.prettierrc` 为准：

- 无分号
- 单引号
- 2 空格缩进
- `trailingComma: es5`
- `printWidth: 80`
- `arrowParens: avoid`
- `endOfLine: lf`

### ESLint

以 `eslint.config.js` 为准：

- 使用 TypeScript ESLint 推荐规则
- 使用 React Hooks 规则
- 使用 React Refresh Vite 规则
- 使用 `eslint-config-prettier` 消除冲突
- `dist` 目录被忽略

### TypeScript

以 `tsconfig.app.json` 为准：

- `target: es2023`
- `moduleResolution: bundler`
- `jsx: react-jsx`
- 路径别名 `@/* -> ./src/*`
- 开启 `noUnusedLocals`
- 开启 `noUnusedParameters`
- 开启 `noFallthroughCasesInSwitch`

## 开发时的实现约定

### 组件与页面

- 优先使用函数组件和 TypeScript 类型
- 保持现有目录组织，不要无关重排
- 页面目录当前采用 `src/page/<name>/index.tsx` 与可选 `index.module.css` 的组合
- 组件目录通常也采用 `index.tsx` 与 `index.module.css` 的组合
- 新增页面或组件时，优先延续这一模式

### 路由

- 路由集中定义在 `src/router/index.tsx`
- 页面默认通过 `lazy` 与 `WithSuspenseLocal` / `WithSuspenseGlobal` 懒加载
- 受保护页面通过 `ProtectedRoute` 包装
- 管理端页面当前通过 `requiredRole="admin"` 控制

### 状态管理

- 使用 Zustand
- `authStore` 和 `themeStore` 都通过 `persist` 持久化到本地存储
- 如需新增全局状态，优先复用现有 store 风格，不要无必要引入新的状态库

### 样式

- 页面和组件局部样式优先使用 CSS Modules
- 全局样式位于 `src/styles/global.css`
- 若调整 Ant Design 主题逻辑，先检查 `src/index.tsx` 中 `ConfigProvider` 的当前用法

## API 与后端联调

项目使用 Orval 根据 OpenAPI 文档生成接口代码。

### 生成来源

- OpenAPI 地址配置在 `orval.config.ts`
- 当前目标地址为 `http://localhost:8123/api/v3/api-docs`

### 生成产物

- `src/api/endpoints/*`
- `src/api/models/*`

### 重要约定

- 这两个目录下的文件默认视为生成代码
- 如需调整接口签名、生成模式、mutator 或输出位置，应优先修改 `orval.config.ts`
- 如需重新生成接口，执行 `npm run api`
- 不要手工大面积修改生成文件，除非是一次明确的临时修复，并且你确认后续会被生成流程覆盖或回收

### 请求封装

- 请求客户端封装在 `src/utils/request.ts`
- 默认 `baseURL` 来源于 `VITE_API_BASE_URL`
- 若环境变量缺失，回退到 `http://localhost:8123/api`
- 401 逻辑会在前端触发登录跳转，因此改动鉴权流程时要同时检查这里

## 环境变量

当前仓库内已有：

- `.env.development`
- `.env.production`

关键变量：

```bash
VITE_API_BASE_URL=...
```

修改 API 地址或环境行为时，优先保持与这两个文件及 `src/utils/request.ts` 一致。

## 文档参考

仓库内已有较完整的中文文档，可优先参考：

- `README.md`
- `doc/01-架构设计.md`
- `doc/02-认证系统.md`
- `doc/03-路由系统.md`
- `doc/05-API集成.md`
- `doc/06-开发规范.md`
- `doc/07-部署指南.md`

当代码与文档不一致时，以当前仓库代码和 `package.json` 脚本为准。

## 对后续 Agent 的工作要求

- 先阅读目标文件及其相邻模块，再动手修改
- 优先做最小改动，避免无关重构
- 不要覆盖或回滚你未创建的用户改动
- 修改接口相关逻辑时，先确认是否属于 Orval 生成代码
- 修改路由相关逻辑时，联动检查 `router`、`ProtectedRoute`、`authStore`
- 修改主题相关逻辑时，联动检查 `themeStore` 与 `src/index.tsx`
- 修改请求逻辑时，联动检查 `src/utils/request.ts` 和环境变量
- 提交前至少运行与改动相关的最小验证；在当前仓库里通常是 `npm run lint`，必要时再执行 `npm run build`

## 非目标

除非任务明确要求，否则不要主动做以下事情：

- 升级依赖版本
- 替换包管理器
- 改写整体路由结构
- 将 Zustand 替换为其他状态库
- 对 Orval 生成代码进行大规模手工重构
- 批量改写现有样式体系
