# ======================================
# ANKH STORE - DOCKER DEPLOYMENT SCRIPT
# ======================================

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  DOCKER DEPLOYMENT" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is installed
$dockerInstalled = Get-Command docker -ErrorAction SilentlyContinue

if (-not $dockerInstalled) {
    Write-Host "❌ Docker chưa được cài đặt!" -ForegroundColor Red
    Write-Host "📥 Download Docker Desktop: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    exit 1
}

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  File .env không tồn tại!" -ForegroundColor Yellow
    Write-Host "📋 Copy env.production -> .env" -ForegroundColor Green
    Copy-Item "env.production" ".env"
}

Write-Host ""
Write-Host "Chọn deployment option:" -ForegroundColor Green
Write-Host "1. Build Docker image" -ForegroundColor White
Write-Host "2. Run Docker container" -ForegroundColor White
Write-Host "3. Docker Compose (Build + Run)" -ForegroundColor White
Write-Host "4. Push to Docker Hub" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Nhập lựa chọn (1/2/3/4)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "🔨 Building Docker image..." -ForegroundColor Cyan
        docker build -t ankh-store:latest .
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Docker image built successfully!" -ForegroundColor Green
        } else {
            Write-Host "❌ Build failed!" -ForegroundColor Red
            exit 1
        }
    }
    "2" {
        Write-Host ""
        Write-Host "🚀 Running Docker container..." -ForegroundColor Cyan
        docker run -d --name ankh-store -p 80:80 ankh-store:latest
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Container is running!" -ForegroundColor Green
            Write-Host "🌐 Access at: http://localhost" -ForegroundColor Yellow
        } else {
            Write-Host "❌ Failed to start container!" -ForegroundColor Red
            exit 1
        }
    }
    "3" {
        Write-Host ""
        Write-Host "🐳 Starting Docker Compose..." -ForegroundColor Cyan
        docker-compose up -d --build
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Docker Compose is running!" -ForegroundColor Green
            Write-Host "🌐 Access at: http://localhost" -ForegroundColor Yellow
        } else {
            Write-Host "❌ Docker Compose failed!" -ForegroundColor Red
            exit 1
        }
    }
    "4" {
        Write-Host ""
        $username = Read-Host "Docker Hub username"
        
        Write-Host "🔨 Building image..." -ForegroundColor Cyan
        docker build -t ankh-store:latest .
        
        Write-Host "🏷️  Tagging image..." -ForegroundColor Cyan
        docker tag ankh-store:latest "$username/ankh-store:latest"
        
        Write-Host "📤 Pushing to Docker Hub..." -ForegroundColor Cyan
        docker push "$username/ankh-store:latest"
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Image pushed successfully!" -ForegroundColor Green
        } else {
            Write-Host "❌ Push failed!" -ForegroundColor Red
            exit 1
        }
    }
    default {
        Write-Host "❌ Lựa chọn không hợp lệ!" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "✅ Operation complete!" -ForegroundColor Green
Write-Host ""

