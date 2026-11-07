<div align="center">

# zWeb

**Нативный клиент Telegram для Android — форк с брендингом zWeb.**

</div>

## Что это

Полноценный Android-клиент Telegram (MTProto, TDLib, голосовые и видеозвонки,
шифрование, медиа, истории, премиум) с фиолетово-чёрным брендингом zWeb:
своё имя приложения, своя иконка, свой package (`chat.zweb.app`).

В отличие от веб-версии, это **не WebView-обёртка**: свой протокол, свой движок,
нативные уведомления и звонки через `ConnectionService`.

## Скачать APK

Готовый файл собирается автоматически в GitHub Actions на каждый пуш в `main`:

**[zweb.apk](https://github.com/frizovdanyash/zweb/releases/download/apk-latest/zweb.apk)**

Откройте ссылку на телефоне и разрешите установку из этого источника.
Сборка для `arm64-v8a` (все телефоны с 2016 года).

## Сборка

Проект собирается в облаке — локально ничего ставить не нужно. Пуш в `main`
запускает workflow «zWeb Android APK»: JDK 17, Android SDK 36, NDK 27.2,
сабмодули TDLib, `assembleRelease`, публикация в релиз `apk-latest`.

Локально, если хочется:

```bash
git clone --recursive <repo>
./gradlew :TMessagesProj_AppStandalone:assembleRelease
```

Нужны JDK 17, Android SDK с NDK 27.2.12479018 и ~40 ГБ диска.

## Настройки приложения

- Package: `chat.zweb.app`
- Имя в лончере: **zWeb**
- Иконка: фиолетовая «Z» на тёмном фоне `#1A0F2E`
- Подпись: встроенный тестовый ключ репозитория (не для Google Play)

## Благодарности

Проект основан на открытом Android-клиенте Telegram (GPL-2.0).
Отдельное спасибо [@frizovdanya](https://github.com/frizovdanyash) за zWeb.

## Лицензия

GPL-2.0 — см. [LICENSE](LICENSE).
