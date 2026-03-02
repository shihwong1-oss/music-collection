#!/bin/bash

# 唱片管理库 - 本地服务器启动脚本
# 使用 Python 内置 HTTP 服务器在本地运行应用

echo "🎵 唱片管理库 - 启动本地服务器"
echo "================================"

# 检查 Python 版本
if ! command -v python3 &> /dev/null; then
    if ! command -v python &> /dev/null; then
        echo "❌ 错误: 未找到 Python，请先安装 Python 3"
        exit 1
    fi
    PYTHON_CMD="python"
else
    PYTHON_CMD="python3"
fi

echo "✅ Python: $($PYTHON_CMD --version)"

# 获取当前脚本所在目录
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# 检查必要文件
if [ ! -f "index.html" ]; then
    echo "❌ 错误: 未找到 index.html"
    exit 1
fi

if [ ! -f "styles.css" ]; then
    echo "❌ 错误: 未找到 styles.css"
    exit 1
fi

if [ ! -f "app.js" ]; then
    echo "❌ 错误: 未找到 app.js"
    exit 1
fi

echo "✅ 所有文件检查通过"
echo ""

# 启动服务器
PORT=8000
echo "🚀 启动服务器在 http://localhost:$PORT"
echo "📱 在浏览器中打开: http://localhost:$PORT"
echo "⏹️  按 Ctrl+C 停止服务器"
echo ""

$PYTHON_CMD -m http.server $PORT --bind 127.0.0.1
