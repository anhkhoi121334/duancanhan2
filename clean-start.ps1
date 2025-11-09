# Clean Start Script for Shoe Store
# Run this script if you encounter dependency or cache issues

Write-Host "🧹 Cleaning Vite cache..." -ForegroundColor Cyan
Remove-Item -Recurse -Force .vite -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force node_modules\.vite -ErrorAction SilentlyContinue

Write-Host "🧹 Cleaning dist folder..." -ForegroundColor Cyan
Remove-Item -Recurse -Force dist -ErrorAction SilentlyContinue

Write-Host "✅ All caches cleared!" -ForegroundColor Green

Write-Host "🚀 Starting dev server..." -ForegroundColor Cyan
npm run dev

