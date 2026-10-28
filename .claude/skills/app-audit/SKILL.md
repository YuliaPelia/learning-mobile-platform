---
name: app-audit
description: Повний аудит ITCodeCraft Mobile — статичні перевірки, залежності, контраст, дані на пристрої, відповідність магазинам, контракт з бекендом, тести. Використовувати перед релізом, після великих змін і коли просять «зроби аудит», «перевір застосунок».
---

# Повний аудит

Результат — `docs/AUDIT-<дата>.md` у форматі `docs/AUDIT.md` (таблиці High / Medium / Low, «що в порядку», порядок виправлень). Не виправляй знахідки мовчки: спершу звіт, виправлення — за згодою.

## 1. Автоматичні перевірки (паралельно)
```bash
npx tsc --noEmit
npx expo lint
npx expo-doctor                 # патч-версії SDK, конфіг
npm audit --omit=dev            # зазвичай транзитивні залежності Expo — не код
grep -rnE "#[0-9A-Fa-f]{6}|rgba\(" src | grep -v src/theme | wc -l   # кольори поза токенами
grep -rnE "console\.(log|warn)|TODO|FIXME" src
grep -rn "mock" src/data src/app | head   # демо-дані в продакшені
```

## 2. Спеціалісти (запускай окремо, дай кожному завдання «перевір і звітуй»)
| Агент | Що перевіряє |
|-------|--------------|
| `ui-a11y-auditor` | контраст, цілі натискання, labels, великий шрифт |
| `data-privacy-auditor` | що лежить у SecureStore/AsyncStorage, чи чиститься при виході |
| `store-compliance-reviewer` | правила App Store / Google Play Kids, COPPA, видалення акаунта, оплата |
| `api-contract-keeper` | типи клієнта проти `/api/mobile/v1` бекенду |
| `expo-sdk-guardian` | API Expo за версійною документацією, нативні модулі й dev-збірка |
| `logic-test-writer` | покриття логіки тестами |

## 3. Ручні/симуляторні
- Відкрий екрани: `xcrun simctl openurl booted "exp://127.0.0.1:8081/--/<маршрут>"`, знімок — `xcrun simctl io booted screenshot <файл>`. Мінімум: `/`, `/courses`, `/today`, `/profile`, `/course/<slug>`, `/timer`, `/analytics`, `/quiz/review`.
- Сценарії гість / дитина / батьки — за списком `mobile-qa`.

## 4. Звіт
Кожна знахідка: де (`файл:рядок`), чому важливо, мінімальне виправлення. Окремо — що НЕ перевірялось (пристрій, Android, бекенд, вхід Google/Apple).
