# ChatDev Frontend (React)

这是 ChatDev 2.0 的前端应用，使用 React + Zustand + Vite + shadcn/ui 构建。

## 技术栈

- **React 18** - UI 框架
- **TypeScript** - 类型安全
- **Vite** - 构建工具
- **Zustand** - 状态管理
- **React Router** - 路由管理
- **shadcn/ui** - UI 组件库
- **Tailwind CSS** - 样式框架
- **ReactFlow** - 工作流可视化
- **js-yaml** - YAML 处理
- **markdown-it** - Markdown 渲染

## 开发

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

应用将在 `http://localhost:5173` 启动。

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

## 项目结构

```
new-frontend/
├── src/
│   ├── components/        # React 组件
│   │   ├── ui/            # shadcn/ui 组件
│   │   ├── Sidebar.tsx    # 侧边栏组件
│   │   └── SettingsModal.tsx  # 设置模态框
│   ├── pages/             # 页面组件
│   │   ├── HomeView.tsx   # 首页
│   │   ├── TutorialView.tsx  # 教程页
│   │   ├── LaunchView.tsx    # 启动页
│   │   ├── WorkflowWorkbench.tsx  # 工作流工作台
│   │   ├── WorkflowList.tsx  # 工作流列表
│   │   └── WorkflowView.tsx  # 工作流视图
│   ├── store/             # Zustand 状态管理
│   │   └── configStore.ts # 配置存储
│   ├── utils/             # 工具函数
│   │   └── apiFunctions.ts # API 调用函数
│   ├── lib/               # 库文件
│   │   └── utils.ts       # 工具函数
│   ├── App.tsx            # 主应用组件
│   ├── main.tsx           # 应用入口
│   └── index.css          # 全局样式
├── public/                # 静态资源
├── package.json
├── vite.config.ts         # Vite 配置
├── tsconfig.json          # TypeScript 配置
└── tailwind.config.js     # Tailwind 配置
```

## 环境变量

创建 `.env` 文件（可选）：

```env
VITE_API_BASE_URL=http://localhost:8000
```

## 功能特性

- ✅ 响应式设计
- ✅ 暗色主题支持
- ✅ 工作流管理和可视化
- ✅ YAML 文件编辑
- ✅ 设置管理
- ✅ 路由导航

## 从 Vue 版本迁移

这个 React 版本是从原有的 Vue 3 前端重写而来，保持了相同的功能和 UI 设计，但使用了现代化的 React 技术栈。

主要变化：
- Vue 3 → React 18
- Vue Router → React Router
- Vue Flow → ReactFlow
- Composition API → React Hooks
- Pinia/Reactive → Zustand
