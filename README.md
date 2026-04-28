# NFT Gift Hub — Telegram Mini App

Express-бэкенд + статичный фронт + Telegram-бот. Деплоится на Render бесплатно за ~5 минут, после чего любой может открыть Mini App в Telegram.

## TL;DR — как запустить (Render, рекомендуется)

1. Создать GitHub-аккаунт (если нет) → https://github.com/signup
2. Создать новый репозиторий → https://github.com/new (имя любое, public)
3. Загрузить туда содержимое архива (Add file → Upload files → перетащить все файлы)
4. Создать бота в [@BotFather](https://t.me/BotFather): `/newbot` → имя → юзернейм-заканчивающийся-на-bot → копируй токен
5. Зарегистрироваться на https://render.com → Sign in with GitHub
6. New → Blueprint → выбрать только что созданный репо → Apply
7. После деплоя: Dashboard → твой сервис → Environment → Add Environment Variable:
   - Key: `TELEGRAM_BOT_TOKEN`
   - Value: твой токен из BotFather
   - Save → сервис автоматически перезапустится
8. Открой бота в Telegram → `/start` → жми «🎮 Открыть NFT Gift Hub»

Готово. Постоянный URL вида `https://nft-gift-hub-XXXX.onrender.com`, работает 24/7, любой может открыть.

> **⚠️ Особенности Render Free:**
> - Сервис **засыпает после 15 минут без HTTP-запросов**. Первое открытие после простоя = пробуждение ~30 сек. Чтобы не засыпал — настрой [UptimeRobot](https://uptimerobot.com/) пинговать `/health` раз в 10 минут (бесплатно).
> - **БД (data.json) сбрасывается** при каждом перезапуске контейнера. Для теста ок, для продакшна → переезжай на Postgres.

---

## 1. Создание бота через BotFather

1. В Telegram открой [@BotFather](https://t.me/BotFather)
2. `/newbot` → введи **отображаемое имя** (любое)
3. Введи **username** — должен быть уникальным и заканчиваться на `bot` (напр. `nft_gift_hub_bot`)
4. BotFather пришлёт строку вида `123456789:AAFkBNvQ-mEhPDeJ...` — это `TELEGRAM_BOT_TOKEN`

### Опционально (бот-аватар, описание)
- `/setdescription` — описание бота (видно в инфо-карточке)
- `/setabouttext` — текст «О боте»
- `/setuserpic` — аватар (квадрат, 512×512)

### Menu Button — бот сделает сам
Скрипт `bot.js` автоматически через Bot API:
- ставит **Menu Button** (кнопка слева от поля ввода) с web_app, ведущим на твой URL Render
- регистрирует команды `/start` и `/help`

---

## 2. Деплой на Render — пошагово

### Шаг 2.1. Загрузить код на GitHub

**Если у тебя ещё нет GitHub:**
1. https://github.com/signup → email + пароль + username
2. Подтверди email

**Создать репозиторий:**
1. https://github.com/new
2. Repository name: `nft-gift-hub` (или любое)
3. Public ✓
4. Initialize with README — **не ставь**
5. Create repository

**Залить файлы:**
1. На странице репо → `uploading an existing file`
2. Перетащи **все файлы из распакованного архива** (включая папку `backend/` и всё внутри). 
   - Кроме `node_modules/`, `.env`, `*.log` — этих не должно быть
3. Внизу страницы → Commit changes → Commit changes

### Шаг 2.2. Подключить Render

1. https://render.com → Get Started → Sign in with GitHub
2. Авторизуй Render иметь доступ к твоим репо (минимум — к репо `nft-gift-hub`)
3. Dashboard → New → **Blueprint**
4. Выбери репо `nft-gift-hub` → Connect
5. Render найдёт `render.yaml` и предложит создать сервис → Apply
6. Жди пока сборка завершится (~3 минуты на первый деплой). Логи можно смотреть в реальном времени.

### Шаг 2.3. Добавить токен бота

После того как deploy зелёный (Status: Live):

1. Открой свой сервис → Environment (в левой панели)
2. Add Environment Variable:
   - Key: `TELEGRAM_BOT_TOKEN`
   - Value: токен из BotFather
3. Save Changes
4. Render автоматически рестартанёт сервис (~30 сек)

В логах увидишь:
```
🚀 NFT Gift Hub backend: http://localhost:10000
🤖 Telegram бот запущен (polling)
✅ Menu button установлена на WebApp: https://nft-gift-hub-XXXX.onrender.com
```

`WEBAPP_URL` подхватится автоматически — Render выставляет переменную `RENDER_EXTERNAL_URL` и наш `server.js` её использует.

### Шаг 2.4. Проверить в Telegram

1. Найди своего бота в Telegram (по юзернейму, который указал в BotFather)
2. `/start` → должно прийти приветственное сообщение с кнопкой
3. Жми кнопку — откроется Mini App

---

## 3. Если хочется обновить код

После того как ты push'нёшь любой коммит в этот репо — Render автоматически передеплоится (можно отключить в Settings → Auto-Deploy).

Для редактирования через GitHub UI: открой файл → значок карандаша → правки → Commit.

Для локального редактирования через git (опционально):
```cmd
git clone https://github.com/<твой-username>/nft-gift-hub.git
cd nft-gift-hub
:: правки...
git add .
git commit -m "тут что поменял"
git push
```

---

## 4. Структура

```
nft-gift-hub/
├── index.html              # Фронт (Telegram WebApp SDK + наш API)
├── render.yaml             # Blueprint для one-click деплоя на Render
├── start-server.bat        # Локально: только сервер (без бота, для теста в браузере)
├── start-telegram.bat      # Локально через ngrok (требует authtoken и не-RU IP)
├── server.js               # Express + статика + /api + ngrok/Render + старт бота
├── api.js                  # API эндпоинты + опциональная проверка initData
├── bot.js                  # node-telegram-bot-api: /start, Menu Button, /help
├── db.js                   # JSON-файловая БД (data.json)
├── gameLogic.js            # Хелперы (редкости, ранги)
├── validateInitData.js     # HMAC-проверка Telegram initData
├── package.json
└── .env.example            # Шаблон для локального запуска
```

Все файлы в плоской структуре (без `backend/`/`routes/`/`utils/`) — это сделано специально, чтобы при загрузке файлов в GitHub через web UI не было проблем со структурой папок.

---

## 5. API

| Метод | Путь | Описание |
|-------|------|----------|
| GET   | `/health` | Health-check для UptimeRobot |
| POST  | `/api/init` | Создать/получить пользователя |
| GET   | `/api/user/:tid` | Данные юзера |
| POST  | `/api/daily` | Ежедневная награда +20⭐ |
| GET   | `/api/gifts/:tid` | Коллекция NFT |
| GET   | `/api/farm/:tid` | Слоты + семена |
| POST  | `/api/farm/plant` | Посадить семя |
| POST  | `/api/farm/harvest` | Собрать NFT |
| GET   | `/api/market` | Активные лоты |
| POST  | `/api/market/list` | Выставить NFT |
| POST  | `/api/market/buy` | Купить лот |
| POST  | `/api/market/cancel` | Снять свой лот |
| POST  | `/api/craft` | Скрафтить (3 одинаковой редкости → 1 выше) |
| GET   | `/api/leaderboard` | Топ-10 |

### Безопасность: проверка initData

Если задан `TELEGRAM_BOT_TOKEN` и фронт шлёт заголовок `X-Telegram-Init-Data: <Telegram.WebApp.initData>`, сервер сверяет HMAC-подпись и блокирует запросы, где `body.telegram_id ≠ id из подписи`. По умолчанию фронт это **не делает** — добавь сам, если нужна защита от подмены `telegram_id`.

См. `backend/utils/validateInitData.js`.

---

## 6. Локальный запуск (только для разработки)

> ⚠️ Telegram не сможет открыть твой `localhost`. Локальный запуск — только для проверки кода/UI в браузере. Для бота нужен публичный URL (Render или ngrok с не-RU/BY IP).

### Только сервер (без бота, без туннеля)
```cmd
start-server.bat
```
Открой http://localhost:3000 в браузере → демо-режим (тестовый юзер `Demo`).

### Через ngrok (если у тебя не-RU/BY IP или системный VPN)
1. https://dashboard.ngrok.com/signup → копируй authtoken
2. `start-telegram.bat` → впиши `TELEGRAM_BOT_TOKEN` и `NGROK_AUTHTOKEN` в `.env`

> 🚫 **Не сработает с провайдером РФ/РБ:** ngrok и Cloudflare банят эти подсети. Используй Render или системный VPN.

---

## 7. FAQ / типичные ошибки

**Q: На Render билд падает с `Cannot find module 'X'`.** Не загрузил `package.json` или загрузил `node_modules` (которые в .gitignore). Удали `node_modules` из репо, оставь только `package.json` — Render сам поставит.

**Q: Бот не реагирует на /start.** Проверь `TELEGRAM_BOT_TOKEN` в Environment на Render (без пробелов/кавычек). В логах должна быть строка `🤖 Telegram бот запущен (polling)`.

**Q: Кнопка «Открыть NFT Gift Hub» не появляется.** В логах ищи строку `✅ Menu button установлена на WebApp`. Если её нет — значит `RENDER_EXTERNAL_URL` не пробросился. Проверь что `render.yaml` лежит в корне репо.

**Q: Mini App открывается, но «Демо режим».** Это значит `Telegram.WebApp.initDataUnsafe.user` пустой → ты открыл URL в обычном браузере, а не через бота. Открой через `/start` → кнопку.

**Q: Сервис на Render засыпает.** Free tier: после 15 мин неактивности. Решения: (1) UptimeRobot пинг каждые 10 мин на `/health`, (2) платный план Starter $7/мес = always-on, (3) перейти на Railway/Fly.io.

**Q: Данные пропали после рестарта.** Free Render = ephemeral filesystem. Для продакшна нужен Postgres. На free Render можно прикрутить SQLite на Render Disk ($1/мес).

**Q: ngrok / cloudflared не работают.** Известная проблема: оба сервиса банят подсети РФ/РБ. Используй Render (этот гайд) или системный VPN.

---

## Лицензия

MIT
