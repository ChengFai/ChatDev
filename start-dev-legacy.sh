#!/bin/bash

# ChatDev 2.0 - 一键启动前后端脚本 (Legacy 版本)
# 前端使用 Vue (frontend)
# 后端使用 Python FastAPI

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 项目根目录
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$PROJECT_ROOT"
FRONTEND_DIR="$PROJECT_ROOT/frontend"

# PID 文件
BACKEND_PID_FILE="$PROJECT_ROOT/.backend-legacy.pid"
FRONTEND_PID_FILE="$PROJECT_ROOT/.frontend-legacy.pid"

# 清理函数
cleanup() {
    echo -e "\n${YELLOW}正在关闭服务...${NC}"

    # 杀死后端进程
    if [ -f "$BACKEND_PID_FILE" ]; then
        BACKEND_PID=$(cat "$BACKEND_PID_FILE")
        if ps -p "$BACKEND_PID" > /dev/null 2>&1; then
            echo -e "${BLUE}关闭后端服务器 (PID: $BACKEND_PID)${NC}"
            kill "$BACKEND_PID" 2>/dev/null || true
        fi
        rm -f "$BACKEND_PID_FILE"
    fi

    # 杀死前端进程
    if [ -f "$FRONTEND_PID_FILE" ]; then
        FRONTEND_PID=$(cat "$FRONTEND_PID_FILE")
        if ps -p "$FRONTEND_PID" > /dev/null 2>&1; then
            echo -e "${BLUE}关闭前端服务器 (PID: $FRONTEND_PID)${NC}"
            kill "$FRONTEND_PID" 2>/dev/null || true
        fi
        rm -f "$FRONTEND_PID_FILE"
    fi

    # 清理所有相关进程
    pkill -f "python.*server_main.py" 2>/dev/null || true
    pkill -f "vite.*frontend" 2>/dev/null || true

    echo -e "${GREEN}清理完成${NC}"
    exit 0
}

# 注册清理函数
trap cleanup SIGINT SIGTERM EXIT

# 检查 Python 环境
check_python() {
    if ! command -v python3 &> /dev/null; then
        echo -e "${RED}错误: 未找到 python3${NC}"
        exit 1
    fi

    # 检查是否安装了依赖
    if ! python3 -c "import uvicorn" 2>/dev/null; then
        echo -e "${YELLOW}警告: 未检测到 uvicorn，尝试安装依赖...${NC}"
        pip install -r requirements.txt || {
            echo -e "${RED}错误: 无法安装 Python 依赖${NC}"
            exit 1
        }
    fi
}

# 检查 Node.js 环境
check_node() {
    if ! command -v node &> /dev/null; then
        echo -e "${RED}错误: 未找到 node${NC}"
        exit 1
    fi

    if ! command -v npm &> /dev/null; then
        echo -e "${RED}错误: 未找到 npm${NC}"
        exit 1
    fi

    # 检查前端目录是否存在
    if [ ! -d "$FRONTEND_DIR" ]; then
        echo -e "${RED}错误: 前端目录不存在: $FRONTEND_DIR${NC}"
        exit 1
    fi

    # 检查是否安装了前端依赖
    if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
        echo -e "${YELLOW}警告: 前端依赖未安装，正在安装...${NC}"
        cd "$FRONTEND_DIR"
        npm install || {
            echo -e "${RED}错误: 无法安装前端依赖${NC}"
            exit 1
        }
        cd "$PROJECT_ROOT"
    fi
}

# 启动后端服务器
start_backend() {
    echo -e "${BLUE}启动后端服务器...${NC}"
    cd "$BACKEND_DIR"

    python3 server_main.py --host 0.0.0.0 --port 8000 --reload > /dev/null 2>&1 &
    BACKEND_PID=$!
    echo "$BACKEND_PID" > "$BACKEND_PID_FILE"

    # 等待后端启动
    echo -e "${YELLOW}等待后端服务器启动...${NC}"
    for i in {1..30}; do
        if curl -s http://localhost:8000/api/workflows > /dev/null 2>&1; then
            echo -e "${GREEN}✓ 后端服务器已启动 (http://localhost:8000)${NC}"
            return 0
        fi
        sleep 1
    done

    echo -e "${RED}错误: 后端服务器启动超时${NC}"
    return 1
}

# 启动前端服务器 (Vue)
start_frontend() {
    echo -e "${BLUE}启动 Vue 前端服务器 (Legacy)...${NC}"
    cd "$FRONTEND_DIR"

    npm run dev > /dev/null 2>&1 &
    FRONTEND_PID=$!
    echo "$FRONTEND_PID" > "$FRONTEND_PID_FILE"

    # 等待前端启动
    echo -e "${YELLOW}等待前端服务器启动...${NC}"
    for i in {1..30}; do
        if curl -s http://localhost:5174 > /dev/null 2>&1; then
            echo -e "${GREEN}✓ Vue 前端服务器已启动 (http://localhost:5174)${NC}"
            return 0
        fi
        sleep 1
    done

    echo -e "${RED}错误: 前端服务器启动超时${NC}"
    return 1
}

# 主函数
main() {
    echo -e "${CYAN}"
    echo "=========================================="
    echo "  ChatDev 2.0 - Legacy 开发服务器"
    echo "  (Vue 前端 + FastAPI 后端)"
    echo "=========================================="
    echo -e "${NC}"

    # 检查环境
    check_python
    check_node

    # 启动服务
    start_backend || exit 1
    start_frontend || exit 1

    echo ""
    echo -e "${GREEN}=========================================="
    echo "  所有服务已启动成功！"
    echo "=========================================="
    echo -e "${NC}"
    echo -e "前端地址 (Vue):  ${CYAN}http://localhost:5174${NC}"
    echo -e "后端地址:        ${BLUE}http://localhost:8000${NC}"
    echo -e "API 文档:        ${BLUE}http://localhost:8000/docs${NC}"
    echo ""
    echo -e "${YELLOW}提示: 这是 Legacy 版本，使用 Vue 前端${NC}"
    echo -e "${YELLOW}如需使用新的 React 前端，请运行 ./start.sh${NC}"
    echo ""
    echo -e "${YELLOW}按 Ctrl+C 停止所有服务${NC}"
    echo ""

    # 保持脚本运行
    wait
}

# 运行主函数
main
