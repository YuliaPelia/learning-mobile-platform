---
name: new-mobile-endpoint
description: Додати новий мобільний API-ендпоінт наскрізно — маршрут у ../itcodecraft-platform, тест, тип і функція в мобільному клієнті. Використовувати, коли мобільному додатку потрібні дані чи дія, якої ще немає в /api/mobile/v1.
---

# Новий ендпоінт /api/mobile/v1

## Бекенд (`../itcodecraft-platform`)
1. Спершу пошукай готову логіку в `src/lib/` (`learning.ts`, `dal.ts`, `access.ts`) — веб-кабінети часто вже рахують потрібне. Перевикористовуй, не дублюй.
2. Маршрут `src/app/api/mobile/v1/<name>/route.ts` за зразком `me/route.ts` і `stats/route.ts`:
   - захищений: `const auth = await requireMobileUser(request); if (!auth.user) return auth.response;`
   - необов'язкова авторизація: `getMobileUser(request)`;
   - помилки лише через `apiError(status, code, message)` українською;
   - віддавай тільки потрібні поля (дані дітей!), користувача — через `publicUser`.
   - ролі: `parent` бачить своїх дітей (`getChildren`), `student` — лише себе.
3. Тест у `src/lib/__tests__/` для нової чистої логіки.
4. `npx tsc --noEmit && npx vitest run && npx eslint <змінені файли>`.

## Мобільний клієнт
5. Тип відповіді в `src/lib/types.ts` (з коментарем, що означає null/порожнє).
6. Функція в `src/lib/api.ts` через `apiRequest(path, { auth })`; для екранів, які мають працювати без мережі, — повертай `null` у `catch`, як `getStats`.
7. `npx tsc --noEmit && npx eslint src`.

## Наостанок
Скажи користувачу, що бекенд треба задеплоїти на Vercel; до того прод відповідає 404. Перевір: `curl -s -o /dev/null -w "%{http_code}" https://learning-platform-alpha-jet.vercel.app/api/mobile/v1/<name>` (для захищеного очікуй 401, не 404).
