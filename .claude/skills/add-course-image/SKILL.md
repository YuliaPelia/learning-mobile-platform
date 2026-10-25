---
name: add-course-image
description: Додати або замінити обкладинку курсу з картинки чи скриншота, який надіслав користувач. Використовувати, коли просять «додати картинку до курсу», «поміняти обкладинку» тощо.
---

# Обкладинка курсу

Обкладинки прив'язані до **slug курсу на бекенді** (`src/data/courseImages.ts`), бо категорії збірні (у «Код» — і Python, і Java).

1. Дізнайся slug: `curl -s https://learning-platform-alpha-jet.vercel.app/api/mobile/v1/courses` → поле `slug` (напр. `python`, `html-css-js`).
2. Розміри джерела: `sips -g pixelWidth -g pixelHeight <file>`.
3. Обріж зайве — кнопки переглядача, водяні знаки, «Visit site», «AI modified». Головний об'єкт має бути по центру: на сторінці курсу картинка 190 px заввишки з `cover`, у картці — квадрат 46 px.
   `sips -c <h> <w> --cropOffset <y> <x> -s format jpeg -s formatOptions 85 <src> --out assets/courses/<slug>.jpg`
4. Подивись результат (Read файлу картинки) і за потреби обріж ще раз.
5. Додай рядок у `src/data/courseImages.ts`: `'<slug>': require('../../assets/courses/<slug>.jpg'),`. Якщо курс є в `src/data/mock.ts`, дай йому `image: courseImages['<slug>']`.
6. `npx tsc --noEmit && npx eslint src`.

Нагадай користувачу перевірити права на зображення, якщо воно взяте з інтернету. Файл — до ~150 КБ.
