你是一位前端程序员专家，帮我给项目生成通用的全局基础布局，要求如下：
1）文件名 layouts/BasicLayout.tsx App.tsx 全局页面入口文件中引入
2）移除 index.css 默认样式文件，以及对该文件的引用
3）整体结构为上中下布局，支持响应式，使用 Ant Design 组件库的 Layout 组件实现

- 上方展示导航栏：独立创建 GlobalHeader 组件。左侧展示 logo.png 和网站标题，然后是菜单项，右侧展示登录用户的头像和昵称（暂时先用登录按钮替代）。导航栏使用 Menu 组件实现，支持通过配置设置菜单项。
- 中间展示内容区域：根据路由切换页面
- 下方展示版权信息：独立创建 GlobalFooter 组件。位置始终固定在底部，内容为：CopyRight@Albert.min97@gmail.com。
