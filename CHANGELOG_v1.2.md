# 更新日志 v1.2.0

## 🎨 UI 主题变更

### 黑色主题
- **整体颜色** - 深色/黑色主题应用于全部界面
  - 背景色：`#0f0f0f`（纯黑）
  - 文字色：`#f5f5f5`（白色/浅灰）
  - 边框色：`#2d2d2d`（深灰）

### 视觉特性
- 更护眼的深色主题
- 更好的对比度
- 适合长时间使用

---

## 📥 新增：JSON 导入功能

### 功能说明
替换了**条形码/二维码扫描**功能，现在支持通过 JSON 文件导入唱片信息

### 添加唱片方式

**方式一：手动添加**（原有）
- 逐一填写表单
- 适合少量唱片

**方式二：导入 JSON**（新增）✨
- 批量导入唱片信息
- 支持下载模板
- 支持拖放上传

### 使用步骤

1. **下载模板**
   - 点击 ➕ 按钮
   - 选择 **导入JSON** 标签
   - 点击 **⬇️ 下载JSON模板** 按钮
   - 获得 `records_template.json` 文件

2. **编辑 JSON 文件**
   ```json
   {
     "records": [
       {
         "name": "唱片名称",
         "artist": "歌手名称",
         "releaseDate": "2022-01-01",
         "category": "流行",
         "rating": 9,
         "format": "cd",
         "purchaseChannel": "Amazon",
         "tracks": "1. 曲目1\n2. 曲目2",
         "notes": "备注信息",
         "cover": ""
       }
     ]
   }
   ```

3. **导入数据**
   - 选择 **导入JSON** 标签
   - 点击上传区域或拖动 JSON 文件
   - 点击 **导入唱片** 按钮
   - 自动返回唱片列表

### JSON 字段说明

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | 字符串 | ✅ | 唱片名称 |
| artist | 字符串 | ✅ | 歌手/艺术家 |
| releaseDate | 日期 | ❌ | 发行日期（格式：YYYY-MM-DD） |
| category | 字符串 | ❌ | 分类 |
| rating | 数字 | ❌ | 评分（0-10） |
| format | 字符串 | ❌ | 格式（vinyl/cd/cassette/digital） |
| purchaseChannel | 字符串 | ❌ | 购买渠道 |
| tracks | 字符串 | ❌ | 曲目列表（换行分隔） |
| notes | 字符串 | ❌ | 备注 |
| cover | 字符串 | ❌ | 封面图片（Base64 或 URL） |

### 导入示例

```json
{
  "records": [
    {
      "name": "Thriller",
      "artist": "Michael Jackson",
      "releaseDate": "1982-11-30",
      "category": "流行",
      "rating": 10,
      "format": "cd",
      "purchaseChannel": "Amazon",
      "tracks": "1. Billie Jean\n2. Beat It\n3. Thriller",
      "notes": "经典专辑，全球最畅销",
      "cover": ""
    },
    {
      "name": "OK Computer",
      "artist": "Radiohead",
      "releaseDate": "1997-06-16",
      "category": "摇滚",
      "rating": 9,
      "format": "cd",
      "purchaseChannel": "HMV",
      "tracks": "1. Paranoid Android\n2. Lucky",
      "notes": "90年代经典摇滚",
      "cover": ""
    }
  ]
}
```

---

## 🖼️ 唱片详情页改进

### 图片展示优化
- **满屏宽度** - 图片填充整个屏幕宽度
- **首屏占据** - 占据 45% 视口高度（手机友好）
- **无圆角** - 顶部贴切，更大气简洁
- **响应式** - 不同设备自适应调整

### 视觉效果
```
┌─────────────────────┐
│                     │
│   唱片封面（大）    │  ← 占据上半屏
│   满屏宽度          │
│                     │
└─────────────────────┤
│ 唱片名称             │
│ 歌手信息             │  ← 详细信息
│ 基本信息             │
│ 曲目列表             │
│ ...                  │
└─────────────────────┘
```

---

## 🚀 性能优化

### 文件大小
- 移除了二维码扫描库（jsQR）
- 减少了大约 50KB 的 JavaScript 代码
- 页面加载更快

### 功能更新
- 简化了扫码逻辑
- 提升了 JSON 解析性能
- 更好的错误处理

---

## 📋 更改清单

### HTML 变更
```html
<!-- 移除 -->
- 摄像头扫描接口
- 图片上传扫描功能

<!-- 新增 -->
+ JSON 文件上传
+ JSON 模板下载按钮
+ 拖放上传支持
```

### CSS 变更
```css
/* 颜色变量更新 */
--bg-light: #0f0f0f;        /* 原 #f9fafb */
--text-primary: #f5f5f5;    /* 原 #1f2937 */
--text-secondary: #b0b0b0;  /* 原 #6b7280 */
--border-color: #2d2d2d;    /* 原 #e5e7eb */

/* 新增样式 */
+ .json-import
+ .json-template-info
+ .json-result
+ .btn.secondary

/* 改进样式 */
~ .detail-cover (满屏宽度)
~ .detail-content (黑色主题)
```

### JavaScript 变更
```javascript
/* 移除函数 */
- startScanning()
- scanForBarcode()
- handleQRCodeDetected()
- stopScanner()
- scanBarcodeImage()
- handleImageUpload()
- clearBarcodeImage()

/* 新增函数 */
+ downloadJsonTemplate()      // 下载 JSON 模板
+ handleJsonFileUpload()      // 处理 JSON 文件
+ importJsonData()            // 导入 JSON 数据
+ showJsonError()             // 显示 JSON 错误
```

---

## ✅ 兼容性

- ✅ 所有浏览器（Chrome、Firefox、Safari、Edge）
- ✅ 所有设备（手机、平板、桌面）
- ✅ 无外部依赖（移除了 jsQR 库）

---

## 🤔 常见问题

### Q: 如何导入多张唱片？
A: 在 JSON 文件的 `records` 数组中添加多个对象，一次导入多条记录

### Q: 导入失败怎么办？
A: 检查 JSON 格式是否正确，必须包含 `records` 数组和必填字段

### Q: 可以导入图片吗？
A: 可以，将图片转换为 Base64 编码后放在 `cover` 字段中

### Q: 旧数据怎么办？
A: 之前手动添加的唱片会保留，新导入不会覆盖

### Q: 怎样导出数据？
A: 见本地文件系统中 localStorage 数据，或在开发者工具中查看

---

## 📞 技术支持

发现问题？请进行以下检查：
1. JSON 格式是否合法（使用在线 JSON 验证器）
2. 浏览器是否最新版本
3. 是否有足够的本地存储空间
4. 必填字段是否完整

---

**更新日期**：2026年2月27日  
**版本**：1.2.0  
**文件改动**：index.html、styles.css、app.js
