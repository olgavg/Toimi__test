# ReadMe

Для работы сборки вам понадобится скачать и установить node.js.

Также установите систему контроля версии Git. Для работы сборки Git не обязателен, но для удобства установки и дальнейшей разработки лучше все же установить.

Для установки (клонирования репозитория) в текущую папку из консоли введите команду: git clone https://github.com/olgavg/Toimi__test.git .

Все команды пишутся от корня проекта!

После того как все исходники будут скачаны из удаленного репозитория, введите в консоли команду npm install для установки проекта. Все зависимости установятся автоматически.

Для сборки проекта наберите в консоли команду npm run dev.  
Если нет ошибок, то для запуска проекта нужно набрать в консоли npm run start, в браузере по умолчанию откроется домен http://localhost:3030 с тестовым заданием.


# Некоторые комментарии по верстке и дизайну:

Фреймворк не использовала специально, показать, что могу верстать самостоятельно, как всю сетку страницы, так и кастомизированные элементы формы (всплывающие лейблы сделаны на чистом css), радиобатоны, ну и мобильное меню (тут пришлось без дизайна самой придумать UI) в хедере также сделано полностью через свой Jscript и стили.  Фреймворки бы очень ускорили процесс верстки безусловно, но мне кажется, что тестовые задания должны показывать личные навыки.

Есть ощущение, что для таблеточной версии нарушена логика - в хедере исчезают пункты меню, а также значок (три точки) левого меню, но не появляется никакой возможности открыть выпадающее мобильное меню, как в мобильной версии, например. Т.о. пользователь не может перейти на другие страницы сайта. Видимо, дизайнер, не предусмотрел этот случай или какие-то другие соображения были. Cверстала как есть на данный момент.

Под формой дизайнерами указан радио-батон для согласия с политикой конфеденциальности, что неверно, в данном случае нет выбора из двух и более вариантов, где используют радио-батоны.  Тут необходимо использовать чекбокс, обеспечивающий пользователю возможность отменить свой выбор.  Оставила как есть, реализовала радио-батон, но считаю это неточностью дизайнера.

Основной шрифт Gilroy мне удалось найти бесплатный в интернете, его подключила (но есть ощущения, что бесплатный он какой-то немного левый, bold 800 выглядит не таким жирным как на макете), а вот Circe нет, поэтому не использовала. Обычно шрифтами дизайнеры обеспечивают ))

На мой взгляд, плодить множество оттенков серого для текста на странице неверно. Я все цвета по сайту завожу в переменные, чтобы можно было легко менять всю тему сайта, но выделять отдельно незаметным глазу оттенок для бредкрамбсов, мне кажется излишним. Поэтому я использовала для них те, что уже были для других текстов сайта.

Увидела некоторые неточности в выравнивании (цепляю скриншот, он лежит в /src/assets/Screenshot_1.png) - в десктопной версии выравнивание основного контента идет не по центру, справа остается лишний отступ. На мой взгляд, это неверно. При наличии aside-столбца, отступы для основного котнента должны быть одинаковыми слева и справа все равно. Взяла на себя смелость реализовать именно так. 

Иконки whatsapp и telegram в десктопной и мобильной версии находятся на уровне списка в футере. А в таблеточной версии они почему-то прыгнули выше к заголовку списка. Это не очень юзерфрендли )), я оставила везде одинаково.

Ну и наконец, чтобы проверить анимацию работы кнопки нужно:
- навести мышку (будет отрабатываться событие наведения)
- навести мышку и нажать левую кнопку мыши, удерживая! ее (в это время будет отрабатываться событие нажатия)
на полях стоит проверка валидации/заполнения их, поэтому если все заполнить и кликнуть на кнопку, отработает анимация и по нажатию, но будет быстрее, т.к. идет отправка формы и страница перегрузится, как будто данные отправлены.

Общее затраченное время на верстку, анимацию, решение для меню по JS заняли у меня 14ч.
