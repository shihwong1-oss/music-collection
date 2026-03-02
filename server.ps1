# 唱片管理库 - Windows 启动脚本
# 使用 Python 内置 HTTP 服务器在本地运行应用

Write-Host "🎵 唱片管理库 - 启动本地服务器" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# 检查 Python 版本
try {
    $pythonVersion = python --version 2>$null
    if ($null -eq $pythonVersion) {
        $pythonVersion = python3 --version 2>$null
    }
    Write-Host "✅ Python: $pythonVersion" -ForegroundColor Green
}
catch {
    Write-Host "❌ 错误: 未找到 Python，请先安装 Python 3" -ForegroundColor Red
    Write-Host "参考: https://www.python.org/" -ForegroundColor Yellow
    exit 1
}

# 检查必要文件
$requiredFiles = @("index.html", "styles.css", "app.js")
$allFilesExist = $true

foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "✅ 找到: $file" -ForegroundColor Green
    } else {
        Write-Host "❌ 缺少: $file" -ForegroundColor Red
        $allFilesExist = $false
    }
}

if (-not $allFilesExist) {
    Write-Host ""
    Write-Host "所有文件必须在同一文件夹中" -ForegroundColor Red
    exit 1
}

Write-Host ""

# 启动服务器
$PORT = 8000
Write-Host "🚀 启动服务器在 http://localhost:$PORT" -ForegroundColor Green
Write-Host "📱 在浏览器中打开: http://localhost:$PORT" -ForegroundColor Green
Write-Host "⏹️  按 Ctrl+C 停止服务器" -ForegroundColor Yellow
Write-Host ""

python -m http.server $PORT --bind 127.0.0.1
