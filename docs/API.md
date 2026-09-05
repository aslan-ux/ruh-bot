# Ruh API

Сервер отдаёт **только JSON**. HTML нигде не собирается на сервере — вся вёрстка живёт в клиенте,
поэтому Flutter-приложение подключается к этим же эндпоинтам без изменений на бэкенде.

База: `https://ruhtybot.onrender.com`

## Авторизация

| Тип | Как передаётся | Кто проверяет |
|---|---|---|
| `tg` | `initData` в теле запроса или заголовок `X-Init-Data` | HMAC-подпись Telegram по токену бота |
| `admin` | заголовок `X-Admin-Key` | сравнение с `ADMIN_KEY` |
| `token` | параметр `token` в URL | для iOS-команды «Қадам» |
| `none` | — | публичные данные |

Ограничение: **90 запросов в минуту** на пользователя. При превышении — `429`.

Все ответы имеют поле `ok: true|false`. При ошибке — `error` со строкой.

## Эндпоинты

### Аккаунт

| Метод | Путь | Авторизация | Принимает | Возвращает |
|---|---|---|---|---|
| `POST` | `/api/register` | tg | `form` | `ok`, `status` |
| `POST` | `/api/me` | tg | — | `ok`, `registered` |
| `POST` | `/api/avatar/save` | tg | — | `ok`, `error`, `avatar` |
| `POST` | `/api/avatars` | tg | — | `ok`, `map`, `error` |
| `POST` | `/api/profile/save` | tg | — | `ok`, `error`, `user`, `firstName`, `lastName`, `patronymic` |
| `POST` | `/api/me/delete` | tg | — | `ok`, `error` |

### Книга и чтение

| Метод | Путь | Авторизация | Принимает | Возвращает |
|---|---|---|---|---|
| `POST` | `/api/book` | tg | — | `ok` |
| `GET` | `/api/book/file` | tg | — | — |
| `POST` | `/api/book/read/get` | tg | — | `ok`, `reading` |
| `POST` | `/api/book/read/save` | tg | — | `ok`, `reading` |
| `POST` | `/api/book/quote/add` | tg | `text`, `ch`, `color` | `ok`, `quote` |
| `POST` | `/api/book/quote/list` | tg | — | `ok`, `quotes`, `id`, `name`, `book`, `text`, `ch`, `color`, `createdAt`, `likes`, `liked` |
| `POST` | `/api/book/quote/like` | tg | `id` | `ok` |
| `POST` | `/api/book/quote/delete` | tg | `id` | `ok` |
| `POST` | `/api/book/comment/add` | tg | `text`, `ch` | `ok`, `comment` |
| `POST` | `/api/book/comment/list` | tg | `ch` | `ok`, `comments`, `id`, `name`, `text`, `ch`, `createdAt`, `mine` |
| `POST` | `/api/book/comment/delete` | tg | `id` | `ok` |
| `POST` | `/api/book/stats/ping` | tg | `seconds`, `pages` | `ok`, `day` |
| `POST` | `/api/book/stats/me` | tg | — | `ok`, `totalMin`, `totalPages`, `rule`, `minutes`, `pages` |
| `POST` | `/api/book/room` | tg | — | `ok`, `count`, `book`, `title`, `author`, `cover` |
| `POST` | `/api/book/board` | tg | — | `ok` |

### Қадам (шаги)

| Метод | Путь | Авторизация | Принимает | Возвращает |
|---|---|---|---|---|
| `POST` | `/api/steps/me` | tg | — | `ok`, `registered`, `goal`, `steps`, `leaderboard`, `day`, `week`, `month` |
| `POST` | `/api/steps/push` | none | — | `ok` |

### Қаржы (финансы)

| Метод | Путь | Авторизация | Принимает | Возвращает |
|---|---|---|---|---|
| `POST` | `/api/fin/list` | tg | — | `ok` |
| `POST` | `/api/fin/add` | tg | — | `ok` |
| `POST` | `/api/fin/delete` | tg | — | — |
| `POST` | `/api/fin/debt/list` | tg | — | `ok` |
| `POST` | `/api/fin/debt/add` | tg | — | `ok` |
| `POST` | `/api/fin/debt/pay` | tg | — | `ok`, `debt`, `paid` |
| `POST` | `/api/fin/debt/delete` | tg | — | — |
| `POST` | `/api/fin/asset/list` | tg | — | `ok` |
| `POST` | `/api/fin/asset/add` | tg | — | `ok` |
| `GET` | `/api/fin/prices` | none | `symbols` | `ok`, `prices`, `ts` |
| `GET` | `/api/fin/config` | none | — | — |
| `POST` | `/api/fin/market/list` | tg | `force`, `syms`, `q` | `ok`, `at`, `quotes`, `total`, `src`, `aix`, `kase`, `list`, `error` |

### Достар (друзья)

| Метод | Путь | Авторизация | Принимает | Возвращает |
|---|---|---|---|---|
| `POST` | `/api/friends/me` | tg | — | `ok`, `registered` |
| `POST` | `/api/friends/add` | tg | — | `ok`, `error`, `accepted` |
| `POST` | `/api/friends/accept` | tg | — | — |
| `POST` | `/api/friends/remove` | tg | — | — |
| `POST` | `/api/friends/search` | tg | `q` | `ok`, `users`, `error` |
| `POST` | `/api/friends/invite` | tg | `id` | `ok`, `error` |

### Админка

| Метод | Путь | Авторизация | Принимает | Возвращает |
|---|---|---|---|---|
| `GET` | `/api/admin/data` | admin | — | `ok`, `book`, `books`, `activeBookId`, `users`, `goal`, `fin` |
| `GET` | `/api/admin/books` | admin | — | `ok`, `books`, `activeId` |
| `POST` | `/api/admin/book/update` | admin | — | `ok`, `book` |
| `POST` | `/api/admin/book/delete` | admin | — | `ok`, `books`, `activeId` |
| `POST` | `/api/admin/book/active` | admin | — | `ok`, `books`, `activeId` |
| `POST` | `/api/admin/goal` | admin | `goal` | `ok` |
| `GET` | `/api/admin/steps` | admin | — | `ok`, `goal` |
| `POST` | `/api/admin/book` | admin | — | `ok` |
| `POST` | `/api/admin/assign` | admin | — | `ok` |
| `POST` | `/api/admin/status` | admin | — | `ok` |
| `POST` | `/api/admin/user/delete` | admin | `telegramId` | `ok` |
| `POST` | `/api/admin/steps/set` | admin | `telegramId`, `steps`, `date` | `ok` |
| `POST` | `/api/admin/fin` | admin | — | `ok`, `fin` |
| `POST` | `/api/admin/book/upload` | admin | — | `ok`, `books`, `activeId` |

## Модели

```
User {
  telegramId: string        // основной ключ, не меняется при смене бота
  firstName, lastName, patronymic: string
  email, phone, birthDate: string
  status: "pending" | "active"
  avatar: string            // data:image/jpeg;base64,... либо null
  stepsToken: string        // для iOS-команды
  reading: { chapter, page, percent, highlights[], bookmarks[] }
}

Book {
  id, title, author: string
  format: "epub" | "pdf"
  fileId: string            // GridFS
  words: number             // считается клиентом при первом открытии
  createdAt: number
}

Tx {                        // Қаржы: доход или расход
  id, kind: "income"|"expense", cat: string
  amount: number, note: string, date: "YYYY-MM-DD"
}

Debt {
  id, kind: "qaryz"|"kredit"|"bolip"
  title: string, total, paid: number
  dueDate: "YYYY-MM-DD", monthly: number
}

Asset {                     // бумаги и металлы
  id, kind: "qujat"|"tas"
  name, symbol: string
  market: "aix"|"us"|"metal"|"manual"
  qty, buyPrice, curManual: number
  unit: "share"|"gram"|"piece"
}
```

## Внешние источники

| Что | Откуда | Ключ |
|---|---|---|
| Бумаги AIX (340 шт.) | `data-feed.aix.kz/api/table/mw-main-records` | не нужен |
| Металлы XAU/XAG/XPT/XPD | `api.gold-api.com/price/{код}` | не нужен |
| Курс USD → KZT | `open.er-api.com/v6/latest/USD` | не нужен |

Yahoo Finance и stooq **не работают** с серверов Render — блокируют дата-центры.
Кэш котировок — 15 минут, прогревается при старте сервера.

## Что учесть при переезде на Flutter

1. Ключ пользователя — `telegramId`. Вне Telegram нужен другой способ входа (Sign in with Apple).
2. `initData` подписывается токеном бота. Для App Store-версии понадобится своя схема токенов.
3. Файл книги отдаётся целиком; для больших книг стоит добавить Range-запросы.
4. Аватары хранятся как base64 в документе пользователя — при росте базы вынести в GridFS.
