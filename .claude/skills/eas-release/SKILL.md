---
name: eas-release
description: Чекліст і команди для збірки та публікації через EAS — dev-збірка для тестування, реліз у магазини, OTA-оновлення. Використовувати, коли просять «зібрати», «викласти», «оновити додаток у магазині».
---

# Реліз через EAS

Проєкт: `@itcodecraft/itcodecraft-mobile`, bundle/package `tech.itcodecraft.app`. EAS CLI — `npx eas-cli@latest` (npm-проєкт).

## 1. Перевірки (блокують реліз)
- `npx eas-cli@latest whoami` — увійдено; якщо ні, користувач сам: `! npx eas-cli@latest login`.
- `eas.json`: у профілі є `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`, `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`; `EXPO_PUBLIC_API_URL` (якщо є) = `https://learning-platform-alpha-jet.vercel.app`. `.env` у збірку НЕ потрапляє.
- Жодних секретів з `EXPO_PUBLIC_`.
- `npx tsc --noEmit`, `npx expo lint` — чисто; `git status` — закомічено.
- Потрібні ендпоінти бекенду є на проді (не 404).
- Для магазину — пройдено агента `store-compliance-reviewer`.

## 2. Збірка (підтвердь профіль і платформу з користувачем — це витрачає ліміти)
- Тестова: `npx eas-cli@latest build --profile development -p android` (iOS потребує Apple Developer акаунта).
- Реліз: `npx eas-cli@latest build --profile production -p <android|ios>` — версія збільшується автоматично (`appVersionSource: remote`).

## 3. Публікація
- `npx eas-cli@latest submit -p <android|ios> --latest`.
- Android: після першого релізу в Google Play додай Android OAuth-клієнт з SHA-1 ключа Play App Signing (Play Console → Protected with Play → Manage Play app signing).

## 4. Після
Повідом посилання на збірку/сабміт і результат. Ключ Android зберігається в EAS (SHA-1 `8B:A0:C1:6E:67:09:A2:7F:94:24:F7:8B:86:0B:EC:42:36:56:44:5C`); не генеруй новий без потреби — це зламає вхід через Google.
