# 🚀 快速启动指南

## 一、直接打开（推荐新手）

### macOS / Linux
双击打开 `index.html` 即可在浏览器中运行

### Windows
双击打开 `index.html` 即可在浏览器中运行

**优点**：无需额外步骤  
**缺点**：某些高级功能（如扫码）可能受限

---

## 二、使用本地服务器（推荐）

### macOS / Linux 用户

#### 方式 1：运行启动脚本
```bash
cd /Users/shihwang/Documents/music
chmod +x server.sh
./server.sh
```

#### 方式 2：手动启动 Python 服务器
```bash
cd /Users/shihwang/Documents/music
python3 -m http.server 8000
```

然后在浏览器中访问：[http://localhost:8000](http://localhost:8000)

### Windows 用户

#### 方式 1：运行启动脚本
右键点击 `server.ps1`，选择 "使用 PowerShell 运行"

或在 PowerShell 中执行：
```powershell
cd "C:\path\to\music"
.\server.ps1
```

#### 方式 2：手动启动 Python 服务器
打开命令行，输入：
```cmd
cd C:\path\to\music
python -m http.server 8000
```

然后在浏览器中访问：[http://localhost:8000](http://localhost:8000)

---

## 三、VS Code 用户

### 使用 Live Server 扩展

1. 安装 "Live Server" 扩展
```
搜索: ritwickdey.LiveServer
```

2. 在 `index.html` 上右键
3. 选择 "Open with Live Server"

---

## 四、故障排除

### 问題：端口 8000 已被占用
```bash
# 使用其他端口
python3 -m http.server 8080

# 或者，查看占用端口的进程
lsof -i :8000  # macOS/Linux
```

### 问题：无法访问摄像头
- 检查浏览器权限设置
- 确保 HTTPS（某些浏览器要求）
- 本地测试可以使用 HTTP

### 问题：脚本无法执行
```bash
# 赋予执行权限
chmod +x server.sh
```

### 问题：找不到 Python
- Windows：下载 Python 3 - [python.org](https://www.python.org/)
- macOS：`brew install python3`
- Linux：`sudo apt-get install python3`

---

## 五、更新检查

**当前版本**：1.0.0  
**需要**：现代浏览器（Chrome、Firefox、Safari、Edge）

---

## 六、数据备份

### 导出数据
1. 打开浏览器开发者工具（F12）
2. 进入 Console 标签
3. 输入以下命令复制数据：
```javascript
copy(localStorage.getItem('musicRecords'))
```

### 恢复数据
1. 打开开发者工具 Console
2. 输入：
```javascript
localStorage.setItem('musicRecords', '粘贴的数据')
```

---

## 七、首次使用建议

1. 🎵 **添加唱片**
   - 点击右上角 ➕ 按钮
   - 选择 "手动添加"
   - 填写基本信息

2. 🔎 **浏览和搜索**
   - 点击 🔍 按钮搜索
   - 使用分类筛选
   - 排序显示

3. 📸 **尝试扫码功能**
   - 点击 ➕ 按钮
   - 选择 "扫描二维码"
   - 对准条形码

4. 📁 **管理分类**
   - 点击底部 🏷️ 标签
   - 创建自定义分类
   - 批量整理

---

## 八、联系支持

遇到问题？

```
环境：macOS / Windows / Linux
浏览器：Chrome / Firefox / Safari / Edge
描述问题...
```

---

**祝您使用愉快！🎉**
