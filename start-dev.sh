#!/bin/bash

# ChatDev 2.0 - 开发模式启动脚本（显示日志）
# 前端使用 React (new-frontend)
# 后端使用 Python FastAPI

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 项目根目录
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$PROJECT_ROOT"
FRONTEND_DIR="$PROJECT_ROOT/new-frontend"

# PID 文件
BACKEND_PID_FILE="$PROJECT_ROOT/.backend.pid"
FRONTEND_PID_FILE="$PROJECT_ROOT/.frontend.pid"

# 日志文件
BACKEND_LOG="$PROJECT_ROOT/.backend.log"
FRONTEND_LOG="$PROJECT_ROOT/.frontend.log"

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
    pkill -f "vite.*new-frontend" 2>/dev/null || true
    
    # 清理日志文件
    rm -f "$BACKEND_LOG" "$FRONTEND_LOG"
    
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
}

# 检查 Node.js 环境
check_node() {
    if ! command -v node &> /dev/null; then
        echo -e "${RED}错误: 未找到 node${NC}"
        exit 1
    fi
    
    if [ ! -d "$FRONTEND_DIR" ]; then
        echo -e "${RED}错误: 前端目录不存在: $FRONTEND_DIR${NC}"
        exit 1
    fi
}

# 启动后端服务器（显示日志）
start_backend() {
    echo -e "${BLUE}启动后端服务器...${NC}"
    cd "$BACKEND_DIR"
    
    python3 server_main.py --host 0.0.0.0 --port 8000 --reload > "$BACKEND_LOG" 2>&1 &
    BACKEND_PID=$!
    echo "$BACKEND_PID" > "$BACKEND_PID_FILE"
    
    echo -e "${GREEN}后端服务器进程已启动 (PID: $BACKEND_PID)${NC}"
    echo -e "${YELLOW}后端日志: tail -f $BACKEND_LOG${NC}"
}

# 启动前端服务器（显示日志）
start_frontend() {
    echo -e "${BLUE}启动前端服务器...${NC}"
    cd "$FRONTEND_DIR"
    
    npm run dev > "$FRONTEND_LOG" 2>&1 &
    FRONTEND_PID=$!
    echo "$FRONTEND_PID" > "$FRONTEND_PID_FILE"
    
    echo -e "${GREEN}前端服务器进程已启动 (PID: $FRONTEND_PID)${NC}"
    echo -e "${YELLOW}前端日志: tail -f $FRONTEND_LOG${NC}"
}

# 主函数
main() {
    echo -e "${GREEN}"
    echo "=========================================="
    echo "  ChatDev 2.0 - 开发服务器启动脚本"
    echo "  (开发模式 - 日志输出到文件)"
    echo "=========================================="
    echo -e "${NC}"
    
    # 检查环境
    check_python
    check_node
    
    # 启动服务
    start_backend
    sleep 2
    start_frontend
    
    echo ""
    echo -e "${GREEN}=========================================="
    echo "  所有服务已启动！"
    echo "=========================================="
    echo -e "${NC}"
    echo -e "前端地址: ${BLUE}http://localhost:5173${NC}"
    echo -e "后端地址: ${BLUE}http://localhost:8000${NC}"
    echo -e "API 文档: ${BLUE}http://localhost:8000/docs${NC}"
    echo ""
    echo -e "${YELLOW}查看日志:${NC}"
    echo -e "  后端: ${BLUE}tail -f $BACKEND_LOG${NC}"
    echo -e "  前端: ${BLUE}tail -f $FRONTEND_LOG${NC}"
    echo ""
    echo -e "${YELLOW}按 Ctrl+C 停止所有服务${NC}"
    echo ""
    
    # 保持脚本运行
    wait
}

# 运行主函数
main
