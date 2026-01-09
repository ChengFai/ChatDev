# ChatDev 2.0 - 启动指南

## 快速开始

### 一键启动（推荐）

使用 `start.sh` 脚本一键启动前后端：

```bash
./start.sh
```

这个脚本会：
- ✅ 自动检查 Python 和 Node.js 环境
- ✅ 自动安装缺失的依赖（如果需要）
- ✅ 启动后端服务器（端口 8000）
- ✅ 启动前端服务器（端口 5173）
- ✅ 等待服务就绪后显示访问地址

启动成功后，你可以访问：
- **前端**: http://localhost:5173
- **后端 API**: http://localhost:8000
- **API 文档**: http://localhost:8000/docs

按 `Ctrl+C` 可以停止所有服务。

### 开发模式启动

如果你需要查看详细的日志输出，可以使用开发模式：

```bash
./start-dev.sh
```

这个脚本会将日志输出到文件：
- 后端日志: `.backend.log`
- 前端日志: `.frontend.log`

查看日志：
```bash
# 查看后端日志
tail -f .backend.log

# 查看前端日志
tail -f .frontend.log
```

### 停止服务

使用 `stop.sh` 脚本停止所有服务：

```bash
./stop.sh
```

## 手动启动

如果你更喜欢手动启动，可以分别启动前后端：

### 启动后端

```bash
# 在项目根目录
python3 server_main.py --host 0.0.0.0 --port 8000 --reload
```

### 启动前端

```bash
# 进入前端目录
cd new-frontend

# 安装依赖（首次运行）
npm install

# 启动开发服务器
npm run dev
```

## 环境要求

- **Python 3.8+**: 用于运行后端服务器
- **Node.js 16+**: 用于运行前端开发服务器
- **npm**: Node.js 包管理器

## 常见问题

### 端口被占用

如果 8000 或 5173 端口被占用，你可以：

1. **修改后端端口**：
   ```bash
   python3 server_main.py --port 8001
   ```

2. **修改前端端口**：
   编辑 `new-frontend/vite.config.ts`，修改 server 配置

### 依赖安装失败

如果自动安装依赖失败，请手动安装：

```bash
# 安装 Python 依赖
pip install -r requirements.txt

# 安装前端依赖
cd new-frontend
npm install
```

### 权限问题

如果脚本无法执行，请添加执行权限：

```bash
chmod +x start.sh start-dev.sh stop.sh
```

## 脚本说明

### start.sh
- 静默模式启动（日志输出到 /dev/null）
- 自动检查并安装依赖
- 等待服务就绪
- 适合日常开发使用

### start-dev.sh
- 开发模式启动（日志输出到文件）
- 显示进程 PID
- 适合调试和问题排查

### stop.sh
- 停止所有服务
- 清理进程和日志文件
- 安全退出

## 注意事项

1. 首次运行前，确保已安装所有依赖
2. 确保端口 8000 和 5173 未被占用
3. 如果修改了后端代码，后端会自动重载（--reload 选项）
4. 前端代码修改后会自动热更新
