#!/bin/bash

# Vercel 一键部署脚本
echo "🚀 正在启动 Vercel 部署流程..."

# 检查 npm 环境
if ! command -v npm &> /dev/null; then
    echo "❌ 错误: 未检测到 npm，请确保已安装 Node.js"
    exit 1
fi

echo "📦 正在准备部署环境..."

# 1. 登录 Vercel
echo "🔑 第一步：请登录 Vercel (如果已登录会自动跳过)"
echo "👉 请在浏览器弹出的窗口中完成授权..."
npx vercel login

if [ $? -ne 0 ]; then
    echo "❌ 登录失败或取消，部署终止"
    exit 1
fi

# 2. 部署到生产环境
echo "🚀 第二步：开始部署到生产环境..."
echo "👉 接下来的提示中，请一路按回车键 (Enter) 保持默认设置即可"
npx vercel --prod --yes --confirm

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 部署成功！"
    echo "🔗 请复制上方显示的 Production 链接 (https://...) 在浏览器打开"
else
    echo "❌ 部署过程中出现错误"
fi
