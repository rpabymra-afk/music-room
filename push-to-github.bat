@echo off
echo.
echo ============================================
echo   Music Room - GitHub Push Script
echo ============================================
echo.
echo Please enter your GitHub username:
set /p username="Username: "
echo.
echo.
echo Run these commands in PowerShell:
echo.
echo git remote add origin https://github.com/%username%/music-room.git
echo git branch -M main  
echo git push -u origin main
echo.
echo.
echo After pushing, go to Render and connect this repository!
echo.
pause
