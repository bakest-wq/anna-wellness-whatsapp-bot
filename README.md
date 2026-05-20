# WhatsApp AI-бот для wellness-мастера Анны Абдулрашидовны

Node.js backend для WhatsApp-бота, который:
- отвечает клиентам на русском/казахском языке;
- соблюдает мягкий премиальный стиль общения;
- собирает заявку на запись по шагам;
- отправляет заявку администратору в Telegram и/или WhatsApp;
- сохраняет заявки в Google Sheets и/или внешний CRM webhook;
- использует OpenAI API для диалогов.

## 1) Возможности

- Автоопределение языка клиента (русский/казахский).
- Диалоговый стиль: мягко, коротко, на "вы", без давления.
- Безопасные ограничения:
  - не ставит диагнозы;
  - не обещает лечение;
  - не дает медицинских гарантий.
- Логика записи:
  - имя;
  - телефон;
  - интересующая практика;
  - желаемый день;
  - желаемое время;
  - противопоказания.
- После сбора: бот отправляет клиенту:
  - `Благодарю вас 🌿 Я передам вашу заявку администратору. Вам напишут и подтвердят удобное время.`
- Формирует и отправляет администратору заявку формата:
  - `🌿 Новая заявка с WhatsApp ...`
- Улучшенный NLP-детектор намерения «хочу записаться» (RU/KZ + опционально OpenAI).
- Защита webhook по подписи (Meta `X-Hub-Signature-256`, Green token).
- Логирование событий в файл `logs/app.log`.
- FAQ-данные по:
  - массажу "5 континентов";
  - Mukaino M-Test;
  - Microcorn;
  - противопоказаниям;
  - подготовке;
  - ощущениям после сеанса.

## 2) Услуги и данные салона (вшиты в промпт)

- Адрес: `Актобе, район Батыс, Ораз Татеулы 15`
- График: `09:00-22:00`, последняя запись `20:00`
- Услуги:
  - Массаж "5 континентов" — 2-2,5 часа — 30 000 ₸
  - Массаж "5 континентов" с огнем — 2-2,5 часа — 35 000 ₸
  - Массаж "5 континентов" с бамбуковыми банками — 2-2,5 часа — 33 000 ₸
  - Mukaino M-Test — 30-40 минут — 10 000 ₸
  - Дыхательная практика — 1 час — 20 000 ₸
  - EarthFlow — 1 час — 20 000 ₸
  - Access Bars — 1 час — 15 000 ₸

## 3) Установка

```bash
npm install
```

Создайте `.env` на основе примера:

```bash
cp .env.example .env
```

Заполните ключи:
- `OPENAI_API_KEY`
- для WhatsApp:
  - либо Cloud API: `WHATSAPP_PROVIDER=cloud` + Meta-поля;
  - либо Green API: `WHATSAPP_PROVIDER=green` + Green-поля.
- для Telegram:
  - `TELEGRAM_BOT_TOKEN`
  - `TELEGRAM_CHAT_ID`

## 4) Запуск

```bash
npm run dev
```

или:

```bash
npm start
```

Сервер стартует на `PORT` (по умолчанию `3000`).

## 5) Интеграция WhatsApp

## Вариант A: WhatsApp Cloud API (Meta)

1. Установите в `.env`:
   - `WHATSAPP_PROVIDER=cloud`
   - `WHATSAPP_CLOUD_TOKEN`
   - `WHATSAPP_PHONE_NUMBER_ID`
   - `WHATSAPP_VERIFY_TOKEN`
2. Укажите webhook URL:
   - `GET /webhook/whatsapp` (верификация)
   - `POST /webhook/whatsapp` (входящие сообщения)
3. В Meta App Dashboard задайте verify token = `WHATSAPP_VERIFY_TOKEN`.

## Вариант B: Green API

1. Установите в `.env`:
   - `WHATSAPP_PROVIDER=green`
   - `GREEN_API_ID_INSTANCE`
   - `GREEN_API_TOKEN`
2. В Green API настройте webhook на:
   - `POST /webhook/whatsapp`

## 6) Google Sheets (CRM)

1. Создайте Google Sheet с вкладкой `Leads`.
2. В первой строке добавьте заголовки:

`createdAt | name | phone | language | service | day | time | contraindications | comment | source | userId`

3. Создайте Service Account в Google Cloud и включите Google Sheets API.
4. Скачайте JSON-ключ в `credentials/google-service-account.json`.
5. Дайте service account email доступ **Editor** к таблице.
6. В `.env` включите:

```env
GOOGLE_SHEETS_ENABLED=true
GOOGLE_SHEETS_SPREADSHEET_ID=...
GOOGLE_SHEETS_TAB=Leads
GOOGLE_APPLICATION_CREDENTIALS=./credentials/google-service-account.json
```

После каждой завершенной заявки бот добавляет новую строку.

## 7) Внешний CRM webhook (опционально)

Если у вас есть CRM с входящим webhook, укажите:

```env
CRM_WEBHOOK_URL=https://your-crm.example/hooks/leads
```

Бот отправит JSON:

```json
{
  "type": "whatsapp_lead",
  "createdAt": "...",
  "name": "...",
  "phone": "...",
  "language": "...",
  "service": "...",
  "day": "...",
  "time": "...",
  "contraindications": "...",
  "comment": "...",
  "source": "WhatsApp AI-бот",
  "userId": "..."
}
```

## 8) NLP-детектор записи

- Локальные правила: ключевые фразы RU/KZ + regex-паттерны + анти-фразы.
- Если фраза «пограничная», включается AI-классификация (`BOOKING_INTENT_AI=true`).
- Примеры, которые ловятся лучше:
  - `хочу записаться на завтра`
  - `можно забронировать массаж`
  - `жазылғым келеді`
  - `бос уақыт бар ма`

## 9) Безопасность webhook

### WhatsApp Cloud API

```env
WHATSAPP_APP_SECRET=your_meta_app_secret
WEBHOOK_REQUIRE_SIGNATURE=true
```

Проверяется заголовок `X-Hub-Signature-256` (HMAC SHA256 raw body).

### Green API

```env
GREEN_WEBHOOK_SECRET=your_secret
WEBHOOK_REQUIRE_SIGNATURE=true
```

Передавайте secret в webhook URL:

`https://your-domain/webhook/whatsapp?token=your_secret`

или в заголовке:

`X-Green-Webhook-Token: your_secret`

## 10) Логирование

Логи пишутся в `logs/app.log`:

- входящие сообщения;
- старт/завершение записи;
- ошибки webhook/интеграций;
- сохранение в Google Sheets/CRM.

Переменные:

```env
LOG_DIR=logs
LOG_FILE=logs/app.log
LOG_LEVEL=info
```

## 11) Интеграция Telegram

1. Создайте бота через BotFather.
2. Получите `TELEGRAM_BOT_TOKEN`.
3. Узнайте `TELEGRAM_CHAT_ID` (личный/группы).
4. После сбора заявки бот отправляет карточку в Telegram.

Также бот пытается отправить ту же заявку в WhatsApp администратору:
- номер: `+77711126089` (или `ADMIN_PHONE` из `.env`).

## 12) API эндпоинты

- `GET /` — health-check.
- `GET /services` — адрес, график, список услуг.
- `GET /faq` — FAQ JSON.
- `GET /webhook/whatsapp` — verify webhook (Cloud API).
- `POST /webhook/whatsapp` — входящие события от WhatsApp.

## 13) Структура проекта

- `src/server.js` — основной сервер и маршруты.
- `src/intent.js` — NLP-детектор намерения записи.
- `src/webhookAuth.js` — проверка подписи webhook.
- `src/sheets.js` — Google Sheets + CRM webhook.
- `src/logger.js` — файловое логирование.
- `.env.example` — пример переменных окружения.

## 14) Важно по безопасности и контенту

- Не храните реальные ключи в репозитории.
- Никогда не коммитьте файл `.env`.
- Бот не является медицинским сервисом и не дает медицинских обещаний.
