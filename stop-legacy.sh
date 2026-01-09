#!/bin/bash

# ChatDev 2.0 - 停止 Legacy 开发服务器

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 项目根目录
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_PID_FILE="$PROJECT_ROOT/.backend-legacy.pid"
FRONTEND_PID_FILE="$PROJECT_ROOT/.frontend-legacy.pid"

echo -e "${BLUE}停止 Legacy 开发服务器...${NC}"

# 停止后端
if [ -f "$BACKEND_PID_FILE" ]; then
    BACKEND_PID=$(cat "$BACKEND_PID_FILE")
    if ps -p "$BACKEND_PID" > /dev/null 2>&1; then
        echo -e "${YELLOW}停止后端服务器 (PID: $BACKEND_PID)${NC}"
        kill "$BACKEND_PID" 2>/dev/null || true
        echo -e "${GREEN}✓ 后端服务器已停止${NC}"
    else
        echo -e "${YELLOW}后端服务器未运行${NC}"
    fi
    rm -f "$BACKEND_PID_FILE"
else
    echo -e "${YELLOW}未找到后端 PID 文件${NC}"
fi

# 停止前端
if [ -f "$FRONTEND_PID_FILE" ]; then
    FRONTEND_PID=$(cat "$FRONTEND_PID_FILE")
    if ps -p "$FRONTEND_PID" > /dev/null 2>&1; then
        echo -e "${YELLOW}停止 Vue 前端服务器 (PID: $FRONTEND_PID)${NC}"
        kill "$FRONTEND_PID" 2>/dev/null || true
        echo -e "${GREEN}✓ 前端服务器已停止${NC}"
    else
        echo -e "${YELLOW}前端服务器未运行${NC}"
    fi
    rm -f "$FRONTEND_PID_FILE"
else
    echo -e "${YELLOW}未找到前端 PID 文件${NC}"
fi

# 清理残留进程
echo -e "${BLUE}清理残留进程...${NC}"
pkill -f "python.*server_main.py" 2>/dev/null && echo -e "${GREEN}✓ 清理了残留的 Python 进程${NC}" || true
pkill -f "vite.*frontend" 2>/dev/null && echo -e "${GREEN}✓ 清理了残留的 Vite 进程${NC}" || true

echo -e "${GREEN}所有 Legacy 服务已停止${NC}"
