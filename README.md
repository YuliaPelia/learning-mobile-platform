# ITCodeCraft Mobile

Мобільний застосунок навчальної платформи [ITCodeCraft](../itcodecraft-platform) (IT-курси для дітей 9–17 років).
Expo SDK 58 · React Native · Expo Router · TypeScript.

Стиль: фіолетово-рожеві градієнти, м'які картки, заокруглені кути (токени в `src/theme`).

## Запуск

```bash
npm install --legacy-peer-deps   # peer-залежності react-dom конфліктують у npm
cp .env.example .env
npx expo start                   # i — iOS-симулятор, a — Android, або Expo Go
npm run typecheck
```

Потрібен Node 20+.

## Змінні середовища

| Змінна | Опис |
|---|---|
| `EXPO_PUBLIC_API_URL` | Адреса бекенду без `/` в кінці. Якщо не задана, береться `extra.apiUrl` з `app.json`. |

Усе з префіксом `EXPO_PUBLIC_` потрапляє в збірку відкрито — секрети сюди не кладемо.

## Статус API

Застосунок звертається до `GET {API_URL}/api/mobile/courses` і `/api/mobile/teachers` (`src/lib/api.ts`).
У `itcodecraft-platform` цих маршрутів ще немає (сесії там на cookie), тому при помилці показуються демо-дані з `src/data/mock.ts`.
Перед входом і прогресом потрібно додати в платформі токен-авторизацію для мобільного клієнта.

## Збірка через EAS

```bash
npx eas-cli@latest login
npx eas-cli@latest init                              # створить projectId в app.json
npx eas-cli@latest build --profile development --platform all
npx eas-cli@latest build --profile production --platform all
npx eas-cli@latest submit --platform ios             # потрібен Apple Developer ($99/рік)
npx eas-cli@latest submit --platform android         # потрібен Google Play Console ($25 одноразово)
```

`bundleIdentifier` / `package` — `tech.itcodecraft.app`; змініть у `app.json`, якщо потрібен інший.
Іконки й splash у `assets/` — стандартні шаблонні, замініть їх перед публікацією.

## Оплата

Рішення: **у застосунку оплати немає**. Підписка оформлюється й керується на сайті.
Не додавайте в застосунок кнопки «Купити», ціни чи посилання на оплату без окремого рішення: Apple (3.1.1, Kids Category 1.3) і Google Play (Payments, Families) вимагають для цифрових товарів нативні покупки, а для дитячої аудиторії обмежують зовнішні посилання. Перед змінами звіряйтеся з актуальними правилами.

## Чек-ліст публікації

Спільне:
- [ ] Політика приватності на публічному URL (на сайті) і посилання на неї в картках магазинів та в застосунку
- [ ] Оферта й політика узгоджені з юристом: зараз вони описують пакети занять, а платформа працює за підпискою
- [ ] Контакт підтримки та сторінка видалення акаунта (обов'язково для обох магазинів, якщо є реєстрація)
- [ ] Іконка, splash, скриншоти (iPhone 6.9″ і 6.5″, телефон Android), опис українською
- [ ] Тестовий акаунт для рев'юерів, якщо з'явиться вхід

App Store:
- [ ] Вікова категорія (age rating) заповнена; якщо обирається Kids Category — без сторонньої аналітики/реклами та з parental gate на зовнішніх посиланнях
- [ ] App Privacy («nutrition labels»): які дані збираються (email, ім'я, прогрес), чи пов'язані з користувачем
- [ ] Sign in with Apple, якщо додаєте вхід через Google
- [ ] Export compliance (шифрування): застосунок використовує лише стандартний HTTPS

Google Play:
- [ ] Data Safety: збір і передача даних, шифрування в дорозі, можливість видалення
- [ ] Target audience: вказати вікові групи; якщо є діти до 13 — політика Families
- [ ] Content rating (IARC) анкета
- [ ] Для нових особистих акаунтів розробника: закрите тестування (12+ тестувальників, 14 днів) перед production
