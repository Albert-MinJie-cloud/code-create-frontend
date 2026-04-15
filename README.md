# Code Create Frontend

基于 React 19 + TypeScript + Vite 构建的现代化前端应用，启用了 React Compiler 进行自动优化。

## 技术栈

- **React 19** - 最新版本的 React
- **TypeScript 6** - 类型安全的 JavaScript
- **Vite 8** - 快速的构建工具和开发服务器
- **Zustand** - 轻量级状态管理
- **React Compiler** - 自动优化 React 组件性能
- **ESLint** - 代码质量检查
- **Prettier** - 代码格式化工具

## 开发命令

```bash
# 启动开发服务器（支持热更新）
npm run dev

# 构建生产版本（先进行 TypeScript 类型检查）
npm run build

# 运行代码检查
npm run lint

# 格式化代码
npm run format

# 检查代码格式（不修改文件）
npm run format:check

# 预览生产构建
npm run preview
```

## 项目架构

### React Compiler

本项目启用了 React Compiler，通过 `@rolldown/plugin-babel` 和 `reactCompilerPreset` 实现。React Compiler 会自动优化组件，减少手动使用 `useMemo`、`useCallback` 和 `React.memo` 的需求。

**注意**：React Compiler 会影响 Vite 的开发和构建性能。

### 构建配置

- 使用 **Vite 8** 配合 `@vitejs/plugin-react` 实现快速热更新
- 通过 **Rolldown Babel 插件** 支持 React Compiler
- 构建流程：先运行 TypeScript 类型检查，再进行 Vite 打包

### TypeScript 配置

项目使用 TypeScript 项目引用，分为两个配置文件：
- `tsconfig.app.json` - 应用代码配置（`src/` 目录）
- `tsconfig.node.json` - Vite 配置和 Node.js 工具配置

编译目标：ES2023，使用 bundler 模块解析策略

严格的代码检查：
- `noUnusedLocals` - 禁止未使用的局部变量
- `noUnusedParameters` - 禁止未使用的参数
- `noFallthroughCasesInSwitch` - 禁止 switch 语句贯穿

### 状态管理

使用 Zustand 进行状态管理。创建 store 时，请遵循 Zustand 的最佳实践，确保与 React Compiler 兼容（避免在选择器中内联创建对象）。

## 代码规范

### ESLint

ESLint 配置包含：
- TypeScript ESLint 推荐规则
- React Hooks 规则（flat config）
- React Refresh 规则（Vite）
- 浏览器全局变量
- Prettier 规则（避免冲突）

项目使用新的 ESLint flat config 格式（`eslint.config.js`）。

### Prettier

代码格式化配置（`.prettierrc`）：
- 不使用分号
- 使用单引号
- 2 空格缩进
- ES5 风格的尾逗号
- 每行 80 字符限制
- 箭头函数参数省略括号（单参数时）

建议在编辑器中安装 Prettier 插件，实现保存时自动格式化。

## 项目结构

```
src/
├── App.tsx          # 主应用组件
├── main.tsx         # React 入口文件（包含 StrictMode）
├── assets/          # 静态资源（图片、SVG）
├── App.css          # 组件样式
└── index.css        # 全局样式
```

## 重要说明

- 使用 React 19，注意与 React 18 的破坏性变更
- React Compiler 会自动优化组件，除非性能分析显示需要，否则避免手动添加记忆化
- 热更新（HMR）已配置，组件修改会自动刷新
- 构建过程会在打包前进行 TypeScript 类型检查
