@echo off
chcp 65001 >nul
title NFT Gift Hub - Telegram bot
setlocal EnableDelayedExpansion

cd /d "%~dp0"

REM ============================================================================
REM Запуск NFT Gift Hub в Telegram (через ngrok):
REM   1) проверка Node.js
REM   2) npm install (всегда, идемпотентно)
REM   3) проверка TELEGRAM_BOT_TOKEN и NGROK_AUTHTOKEN в .env
REM   4) запуск сервера — он сам поднимает ngrok и устанавливает Menu Button
REM ============================================================================

REM --- 1. Node.js -------------------------------------------------------------
where node >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Node.js не найден. Установи с https://nodejs.org/ ^(LTS^) и перезапусти.
  pause
  exit /b 1
)
echo [1/3] Node.js OK.

REM --- 2. npm install ---------------------------------------------------------
echo [2/3] Проверяю/доустанавливаю npm зависимости...
call npm install --no-audit --no-fund
if errorlevel 1 (
  echo [ERROR] npm install упал.
  pause
  exit /b 1
)

REM --- 3. .env checks ---------------------------------------------------------
if not exist ".env" (
  copy /Y ".env.example" ".env" >nul
)

call :check_env_var TELEGRAM_BOT_TOKEN "Получи токен у @BotFather (/newbot)" "https://t.me/BotFather"
if errorlevel 1 exit /b 1

call :check_env_var NGROK_AUTHTOKEN "Зарегайся на ngrok.com и скопируй authtoken" "https://dashboard.ngrok.com/get-started/your-authtoken"
if errorlevel 1 exit /b 1

echo [3/3] .env заполнен.
echo.

REM --- 4. Run server (it handles ngrok + bot itself) --------------------------
echo ════════════════════════════════════════════════════════════════════════
echo  Запускаю сервер. После строки "Публичный URL: ..."
echo  открой Telegram, найди своего бота и нажми /start.
echo ════════════════════════════════════════════════════════════════════════
echo.
call npm start
pause
endlocal
exit /b 0


REM ============================================================================
REM :check_env_var VAR_NAME "что это" "URL для пользователя"
REM Открывает .env в блокноте если переменная пустая.
REM ============================================================================
:check_env_var
set "VAR=%~1"
set "DESC=%~2"
set "URL=%~3"

findstr /R /B /C:"%VAR%=." ".env" >nul
if not errorlevel 1 goto :eof

echo.
echo [!] В .env пустой %VAR%.
echo     %DESC%
echo     Страница: %URL%
echo     Сейчас открою .env в блокноте — впиши строку:
echo         %VAR%=твоё_значение_здесь
echo     Сохрани файл ^(Ctrl+S^), закрой блокнот.
echo.
pause
start /wait notepad ".env"

findstr /R /B /C:"%VAR%=." ".env" >nul
if errorlevel 1 (
  echo [ERROR] %VAR% всё ещё пустой. Выхожу.
  pause
  exit /b 1
)
goto :eof
