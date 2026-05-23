# Связка сайта sakinawellness.kz и WhatsApp-бота

Сайт и бот используют **один конфиг**: [`shared/sakina-wellness.config.js`](../shared/sakina-wellness.config.js).

Там заданы: бренд, адрес, график, услуги, пакеты, номер WhatsApp и **готовые тексты** для `wa.me`.

## Номер WhatsApp

В конфиге: `WHATSAPP_PHONE` (по умолчанию `77754368680`).

Переменная окружения (бот и при сборке сайта):

```env
WHATSAPP_PHONE=77754368680
```

Формат: код страны + номер, **без** `+` и пробелов.

## Формат ссылки wa.me

```
https://wa.me/77754368680?text=ТЕКСТ_СООБЩЕНИЯ
```

`ТЕКСТ_СООБЩЕНИЯ` должен быть в `encodeURIComponent` (в коде это делает `buildWaMeUrl`).

### Примеры

| Действие на сайте | Текст в WhatsApp |
|-------------------|------------------|
| Запись на «5 континентов» | `Здравствуйте, хочу записаться на массаж «5 континентов»` |
| Подробнее Mukaino | `Здравствуйте, хочу узнать подробнее про Mukaino M-Test` |
| Подобрать практику | `Здравствуйте, хочу подобрать практику 🌿` |
| Пакет Sakina Relax | `Здравствуйте, хочу записаться на пакет Sakina Relax` |

Полный список — в `shared/sakina-wellness.config.js` → `SERVICES[].waBook`, `waLearn`, `WA_MESSAGES`.

## Как это работает на сайте (Next.js)

Файл [`sakina-wellness/src/lib/whatsapp.ts`](../sakina-wellness/src/lib/whatsapp.ts):

- `buildWhatsAppBookServiceUrl(siteId)` — запись
- `buildWhatsAppLearnServiceUrl(siteId)` — подробнее
- `buildWhatsAppConciergeUrl()` — AI Wellness Concierge
- `buildWhatsAppPackageUrl(packageId)` — пакет

Кнопки «Записаться», «Выбрать сеанс», sticky CTA и пакеты уже ведут на эти ссылки.

## Как бот понимает сообщение с сайта

Модуль [`src/deepLinks.js`](../src/deepLinks.js) сравнивает входящий текст с шаблонами из конфига:

| Сообщение | Действие бота |
|-----------|----------------|
| «хочу подобрать практику» | Concierge flow (эмоция → исход → рекомендация) |
| «хочу записаться на …» | Запись, практика уже выбрана |
| «хочу узнать подробнее про …» | Карточка практики |
| «хочу узнать цены» | Прайс |
| «пакет Sakina …» | Запись с пометкой пакета |

## Обновление услуг или цен

1. Отредактируйте `shared/sakina-wellness.config.js`
2. Перезапустите бота: `npm run dev`
3. Пересоберите сайт: `cd sakina-wellness && npm run build`

Не дублируйте цены в боте и на сайте вручную — только в `shared/`.

## Проверка вручную

1. Откройте [sakinawellness.kz](https://sakinawellness.kz/)
2. Нажмите «Записаться» у любой услуги
3. В WhatsApp должно появиться **готовое** сообщение
4. Отправьте — бот должен сразу спросить **день** (практика уже выбрана)

## Архитектура

```
shared/sakina-wellness.config.js   ← единый источник данных
        ├── sakina-wellness (сайт, wa.me ссылки)
        └── src/ (бот, deep links, booking, concierge)
```
