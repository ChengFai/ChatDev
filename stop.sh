#!/bin/bash

# ChatDev 2.0 - 停止服务脚本

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 项目根目录
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# PID 文件
BACKEND_PID_FILE="$PROJECT_ROOT/.backend.pid"
FRONTEND_PID_FILE="$PROJECT_ROOT/.frontend.pid"

echo -e "${YELLOW}正在停止所有服务...${NC}"

# 停止后端
if [ -f "$BACKEND_PID_FILE" ]; then
    BACKEND_PID=$(cat "$BACKEND_PID_FILE")
    if ps -p "$BACKEND_PID" > /dev/null 2>&1; then
        echo -e "${BLUE}停止后端服务器 (PID: $BACKEND_PID)${NC}"
        kill "$BACKEND_PID" 2>/dev/null || true
        sleep 1
        # 如果还在运行，强制杀死
        if ps -p "$BACKEND_PID" > /dev/null 2>&1; then
            kill -9 "$BACKEND_PID" 2>/dev/null || true
        fi
    fi
    rm -f "$BACKEND_PID_FILE"
fi

# 停止前端
if [ -f "$FRONTEND_PID_FILE" ]; then
    FRONTEND_PID=$(cat "$FRONTEND_PID_FILE")
    if ps -p "$FRONTEND_PID" > /dev/null 2>&1; then
        echo -e "${BLUE}停止前端服务器 (PID: $FRONTEND_PID)${NC}"
        kill "$FRONTEND_PID" 2>/dev/null || true
        sleep 1
        # 如果还在运行，强制杀死
        if ps -p "$FRONTEND_PID" > /dev/null 2>&1; then
            kill -9 "$FRONTEND_PID" 2>/dev/null || true
        fi
    fi
    rm -f "$FRONTEND_PID_FILE"
fi

# 清理所有相关进程
echo -e "${BLUE}清理残留进程...${NC}"
pkill -f "python.*server_main.py" 2>/dev/null || true
pkill -f "vite.*new-frontend" 2>/dev/null || true

# 清理日志文件
rm -f "$PROJECT_ROOT/.backend.log" "$PROJECT_ROOT/.frontend.log"

echo -e "${GREEN}✓ 所有服务已停止${NC}"
