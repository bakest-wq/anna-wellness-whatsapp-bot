# Sakina Wellness 🌿 — WhatsApp AI-бот

**wellness · body care · relaxation · Aktobe**

Node.js backend для WhatsApp-бота premium wellness studio **Sakina Wellness** (мастер Анна Абдулрашидовна).

Бот ведёт диалог в мягком премиальном тоне wellness/spa-пространства — глубокое расслабление, восстановление тела и внутреннего состояния (не салон красоты).

## Возможности

- Автоопределение языка (русский / казахский).
- Приветствие бренда Sakina Wellness с предложением узнать о практиках или записаться на сеанс.
- Контекстные меню после **каждого** ответа (кнопки / текстовый fallback): главное, после цен, адреса, противопоказаний и т.д.
- Во время записи — только текст (без меню), после записи — снова меню.
- Пауза «печатает…» 1–2 сек перед ответом.
- Адрес: текст + Google Maps + 2GIS + фото кабинета (опционально).
- Запись: практика → день → время → телефон (номер — в конце, без спешки).
- Эмоционально бережный тон: поддержка при усталости/тревоге без продаж (см. `docs/emotional-conversation-examples.md`).
- Точная маршрутизация: цены, запись, адрес, противопоказания.
- Сбор заявки на сеанс по шагам (имя, телефон, практика, день, время, противопоказания).
- Уведомления администратору в Telegram и WhatsApp.
- Сохранение заявок в Google Sheets / CRM webhook.
- OpenAI для свободных вопросов с system prompt в стиле wellness studio.
- Подробные описания по запросу: «5 континентов» (огонь vs бамбук), «Дыхание Жизни», Gaya Touch + EarthFlow.
- **Интеграция с сайтом** [sakinawellness.kz](https://sakinawellness.kz/): кнопки ведут в WhatsApp с готовым текстом; бот распознаёт deep links и сразу запускает запись, concierge или карточку практики.

### Сайт + бот (единый конфиг)

- Общие данные: `shared/sakina-wellness.config.js` (услуги, цены, пакеты, `wa.me`-тексты).
- Сайт: `sakina-wellness/` (Next.js).
- Инструкция по связке: [docs/WHATSAPP-SITE-INTEGRATION.md](docs/WHATSAPP-SITE-INTEGRATION.md).

## Практики и студия

| Практика | Длительность | Цена |
|----------|--------------|------|
| Массаж «5 континентов» | 2–2,5 ч | 30 000 ₸ |
| «5 континентов» с огнём | 2–2,5 ч | 35 000 ₸ |
| «5 континентов» с бамбуковыми банками | 2–2,5 ч | 33 000 ₸ |
| Mukaino M-Test | 30–40 мин | 10 000 ₸ |
| Дыхательная практика «Дыхание Жизни» | 60–90 мин | 20 000 ₸ |
| EarthFlow | 1 ч | 20 000 ₸ |
| Access Bars | 1 ч | 15 000 ₸ |

- **Адрес:** Актобе, район Батыс, Ораз Татеулы 15  
- **График:** 09:00–22:00, последняя запись 20:00  
- **Мастер:** Анна Абдулрашидовна  

## Установка

```bash
npm install
cp .env.example .env
```

Заполните `.env`: OpenAI, WhatsApp (Green API или Cloud API), Telegram, при необходимости Google Sheets.

## Запуск

```bash
npm run dev
# или
npm start
```

Сервер: `http://localhost:3000` (порт из `PORT`).

## Webhook (Green API)

В кабинете Green API укажите URL:

```
POST https://your-domain/webhook
```

Также поддерживается `POST /webhook/whatsapp`.

## Переменные окружения

См. `.env.example`. Основные:

- `OPENAI_API_KEY`, `OPENAI_MODEL`
- `WHATSAPP_PROVIDER=green` или `cloud`
- `GREEN_API_ID_INSTANCE`, `GREEN_API_TOKEN`
- `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`
- `ADMIN_PHONE` — WhatsApp администратора

## API

| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/` | Health-check, brand metadata |
| GET | `/services` | Практики, адрес, график |
| GET | `/faq` | FAQ JSON |
| POST | `/webhook` | Входящие сообщения (Green) |

## Структура

- `src/brand.js` — бренд Sakina Wellness, приветствия, tagline
- `src/knowledge.js` — практики, адрес, данные для промпта
- `src/prompt.js` — system prompt (wellness studio)
- `src/buttons.js` — меню и кнопки WhatsApp
- `src/responses.js` — сценарии ответов
- `src/router.js` — маршрутизация кнопок
- `src/conversation.js` — диалог и запись
- `src/content/` — длинные описания практик
- `shared/sakina-wellness.config.js` — единый конфиг с сайтом
- `src/deepLinks.js` — распознавание сообщений с сайта
- `src/sessionStore.js` — session memory (Map, готово к Redis/Postgres)
- `src/sessionMemory.js` — логика flow, resume, expiry 24ч

## Тон бренда

- Премиальный, мягкий, спокойный, женственный.
- Wellness studio · body & soul care · relaxation rituals.
- Без медицинских обещаний и диагнозов.

## Безопасность

- Не коммитьте `.env` и ключи.
- Опционально: `WEBHOOK_REQUIRE_SIGNATURE=true` для проверки подписи webhook.
