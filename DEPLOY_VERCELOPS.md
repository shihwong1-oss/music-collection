# Vercel 部署指南

本项目已配置为纯静态站点，非常适合部署到 Vercel。

## 准备工作（已完成）

✅ **Git 初始化**：已为您在本地初始化了 Git 仓库并提交了所有文件。
✅ **Vercel 配置**：已创建 `vercel.json` 配置文件。

## 步骤 1：推送到 GitHub

1. 登录 [GitHub](https://github.com) 并创建一个新仓库（例如命名为 `music-collection`）。
2. 在创建后的页面复制仓库地址（HTTPS 或 SSH）。
3. 在终端运行以下命令（将 `<URL>` 替换为你的仓库地址）：

```bash
git branch -M main
git remote add origin <URL>
git push -u origin main
```

## 步骤 2：在 Vercel 导入

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)。
2. 点击 **Add New...** -> **Project**。
3. 在 **Import Git Repository** 中选择你刚创建的 `music-collection` 仓库。
4. 点击 **Import**。
5. 在配置页面：
   - **Framework Preset**: 选择 `Other`。
   - **Root Directory**: 保持默认 `./`。
6. 点击 **Deploy**。

## 步骤 3：完成

部署完成后，Vercel 会提供一个 `https://<project-name>.vercel.app` 的访问地址。
该地址默认支持 HTTPS，可以直接在手机上访问并使用扫码功能。

---

## 备选方案：使用 Vercel CLI（无需 GitHub）

如果你安装了 Node.js，也可以直接使用命令部署：

1. 安装 Vercel CLI：
   ```bash
   npm install -g vercel
   ```

2. 登录并部署：
   ```bash
   vercel login
   vercel
   ```
   按照提示一路回车即可。
