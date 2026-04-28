@echo off
chcp 65001 >nul
title NFT Gift Hub - local server (no Telegram)
setlocal EnableDelayedExpansion

cd /d "%~dp0"

REM --- 1. Node.js -------------------------------------------------------------
where node >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Node.js не найден. Поставь Node.js 18+ с https://nodejs.org/ и перезапусти.
  pause
  exit /b 1
)

REM --- 2. npm install (always, idempotent) ------------------------------------
echo [1/2] Проверяю/доустанавливаю npm зависимости...
call npm install --no-audit --no-fund
if errorlevel 1 (
  echo [ERROR] npm install упал.
  pause
  exit /b 1
)

REM --- 3. Run server (no bot, no tunnel) --------------------------------------
echo [2/2] Запускаю сервер на http://localhost:3000
echo (Демо-режим без Telegram. Для бота используй start-telegram.bat)
echo.
call npm start
pause
endlocal
