# Vercel 部署指南

## 准备
- 需要 GitHub 账号（Vercel 通过仓库导入）
- 本项目是纯静态站点，无需构建步骤，支持 HTTPS（摄像头权限）

## 步骤（推荐：通过 GitHub）
1. 在 GitHub 创建一个新仓库（例如 `music`）
2. 将当前目录所有文件推送到该仓库（包含 `index.html`、`styles.css`、`app.js`、`assets/`、`vercel.json`）
3. 打开 https://vercel.com → New Project → Import Git Repository
4. 选择刚创建的仓库，Framework 选择 “Other”，Root 选择仓库根目录
5. 点击 Deploy，完成后得到 `https://<project>.vercel.app/` 地址

## 更新
- 之后每次推送到默认分支（如 `main`），Vercel 会自动重新部署

## 注意
- 若摄像头权限未弹出，确保在 HTTPS 环境访问，并在浏览器设置里允许摄像头
- 资源路径已使用相对路径，vercel.json 提供基础路由，静态文件可直接访问

