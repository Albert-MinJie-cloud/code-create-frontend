# 🎉 Code Create Frontend v1.0.0

> 基于 React 19 + TypeScript 6 + Vite 8 的企业级前端应用模版

## ✨ 核心特性

### 🔐 完整的认证系统
- ✅ 用户登录/登出功能
- ✅ JWT Token 管理（自动添加到请求头）
- ✅ Token 持久化存储（localStorage）
- ✅ 登录状态自动检测
- ✅ 未登录自动跳转登录页
- ✅ 登录成功返回原页面

### 🛣️ 智能路由管理
- ✅ React Router 7 声明式路由
- ✅ 路由懒加载（代码分割）
- ✅ 路由守卫（ProtectedRoute）
- ✅ 404 页面（路由不存在）
- ✅ 403 页面（权限不足）
- ✅ 加载中状态（Suspense + LoadingFallback）

### 📦 轻量级状态管理
- ✅ Zustand 状态管理（比 Redux 更简单）
- ✅ 认证状态管理（AuthStore）
- ✅ 主题状态管理（ThemeStore）
- ✅ 状态持久化（localStorage）
- ✅ TypeScript 类型安全

### 📡 API 自动生成
- ✅ Orval 集成（从 OpenAPI 自动生成）
- ✅ TypeScript 类型定义自动生成
- ✅ Axios 请求封装
- ✅ 请求/响应拦截器
- ✅ 统一错误处理
- ✅ 自动添加 Token

### 🎨 主题切换
- ✅ 亮色/暗色模式切换
- ✅ Ant Design ConfigProvider 集成
- ✅ 主题持久化存储
- ✅ 一键切换主题

### 🛡️ 错误处理
- ✅ 全局错误边界（ErrorBoundary）
- ✅ 401 自动登出并跳转登录页
- ✅ 403 权限不足提示
- ✅ 404 资源不存在提示
- ✅ 500+ 服务器错误提示
- ✅ 网络错误提示

## 📚 完善的文档

### 技术文档（7 份详细文档）
- 📄 **01-架构设计.md** - 技术栈、分层架构、模块依赖、性能优化
- 📄 **02-认证系统.md** - 登录流程、Token 管理、路由守卫实现
- 📄 **03-路由系统.md** - 路由配置、懒加载、导航管理
- 📄 **04-状态管理.md** - Zustand 使用、持久化、性能优化
- 📄 **05-API集成.md** - Orval 配置、请求封装、错误处理
- 📄 **06-开发规范.md** - 代码规范、命名规范、Git 规范
- 📄 **07-部署指南.md** - 构建流程、环境配置、CI/CD 配置

### 文档特色
- ✅ 所有文档均包含 Mermaid 图表（时序图、流程图、状态图）
- ✅ 详细的代码示例和最佳实践
- ✅ 常见问题解答（Q&A）
- ✅ 完整的目录结构

## 🚀 技术栈

| 技术 | 版本 | 说明 |
|------|------|------|
| React | 19.2.4 | 最新版本，支持 React Compiler |
| TypeScript | 6.0 | 类型安全的 JavaScript |
| Vite | 8.0 | 下一代前端构建工具 |
| Ant Design | 6.3 | 企业级 UI 组件库 |
| React Router | 7.14 | 声明式路由管理 |
| Zustand | 5.0 | 轻量级状态管理 |
| Axios | 1.15 | HTTP 请求库 |
| Orval | 8.8 | OpenAPI 代码生成器 |

## 📦 快速开始

```bash
# 1. 克隆项目
git clone --branch v1.0.0 https://github.com/Albert-MinJie-cloud/code-create-frontend.git my-project

# 2. 进入项目目录
cd my-project

# 3. 安装依赖
npm install

# 4. 启动开发服务器
npm run dev

# 5. 访问应用
# 浏览器打开 http://localhost:5173
```

## 🎯 开箱即用

### 已实现的页面
- ✅ 首页（Home）
- ✅ 关于页（About）
- ✅ 仪表盘（Dashboard - 需要登录）
- ✅ 登录页（Login）
- ✅ 404 页面
- ✅ 403 页面

### 已实现的组件
- ✅ GlobalHeader（全局头部 - 包含主题切换、登录状态）
- ✅ GlobalFooter（全局底部）
- ✅ ProtectedRoute（路由守卫）
- ✅ ErrorBoundary（错误边界）
- ✅ LoadingFallback（加载中组件）
- ✅ WithSuspense（Suspense 包装器）

### 已配置的工具
- ✅ ESLint（代码检查）
- ✅ Prettier（代码格式化）
- ✅ TypeScript（类型检查）
- ✅ Orval（API 代码生成）

## 📝 开发命令

```bash
# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview

# 代码检查
npm run lint

# 代码格式化
npm run format

# 格式检查（不修改文件）
npm run format:check

# 生成 API 代码
npm run api
```

## 🎨 代码规范

### ESLint 配置
- TypeScript ESLint 推荐规则
- React Hooks 规则
- React Refresh 规则
- Prettier 集成（避免冲突）

### Prettier 配置
```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 80,
  "arrowParens": "avoid"
}
```

## 🏗️ 项目结构

```
src/
├── api/                    # API 接口（Orval 自动生成）
├── components/            # 公共组件
├── layouts/               # 布局组件
├── page/                  # 页面组件
├── router/                # 路由配置
├── store/                 # 状态管理
├── utils/                 # 工具函数
└── index.tsx              # 应用入口
```

## 🔧 环境配置

### 开发环境
```bash
VITE_API_BASE_URL=http://localhost:8123/api
```

### 生产环境
```bash
VITE_API_BASE_URL=https://api.yourdomain.com
```

## 📊 构建产物

- ✅ 代码分割（React、Ant Design、工具库分离）
- ✅ 资源压缩（Terser）
- ✅ CSS 代码分割
- ✅ 资源内联（小于 4kb）
- ✅ 构建成功，无错误

## 🎯 适用场景

- ✅ 企业级后台管理系统
- ✅ SaaS 平台前端
- ✅ 需要认证的 Web 应用
- ✅ 中后台应用快速开发
- ✅ React 项目脚手架

## 🌟 为什么选择这个模版？

1. **开箱即用** - 无需配置，克隆即可开发
2. **最佳实践** - 遵循 React 和 TypeScript 最佳实践
3. **完善文档** - 7 份详细技术文档，图文并茂
4. **类型安全** - 完整的 TypeScript 类型支持
5. **现代化** - 使用最新的技术栈和工具
6. **可扩展** - 清晰的架构，易于扩展
7. **高性能** - Vite 构建，React Compiler 优化

## 📖 文档链接

- [架构设计](./doc/01-架构设计.md)
- [认证系统](./doc/02-认证系统.md)
- [路由系统](./doc/03-路由系统.md)
- [状态管理](./doc/04-状态管理.md)
- [API集成](./doc/05-API集成.md)
- [开发规范](./doc/06-开发规范.md)
- [部署指南](./doc/07-部署指南.md)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 License

MIT

---

## 🙏 致谢

感谢以下开源项目：
- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [Ant Design](https://ant.design/)
- [Zustand](https://github.com/pmndrs/zustand)
- [Orval](https://orval.dev/)

---

<div align="center">

**⭐ 如果这个项目对你有帮助，请给一个 Star！**

Made with ❤️ by [Albert-MinJie-cloud](https://github.com/Albert-MinJie-cloud)

</div>
