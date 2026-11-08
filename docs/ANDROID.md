# zWeb для Android

Нативный клиент Telegram с брендингом zWeb. Собран из открытого Android-клиента
(GPL-2.0) — не WebView-обёртка: свой MTProto-стек, TDLib, нативные звонки
через `ConnectionService`, системные уведомления, медиа и шифрование.

## Скачать

**[zweb.apk](https://github.com/frizovdanyash/zweb/releases/download/apk-latest/zweb.apk)**

Откройте ссылку на телефоне, разрешите установку из этого источника.
Сборка под `arm64-v8a` — это все телефоны с 2016 года. Размер ~130–180 МБ,
внутри всё нужное, ничего докачивать не требуется.

## Что изменено относительно исходного клиента

| Что | Значение |
|---|---|
| Имя в лончере | zWeb |
| Package | `chat.zweb.app` |
| Иконка | фиолетовая «Z», фон `#1A0F2E` |
| Версия | из `gradle.properties` (`APP_VERSION_CODE`, `APP_VERSION_NAME`) |
| Подпись | `TMessagesProj/config/release.keystore` (тестовый ключ из репозитория) |

Логика клиента, протокол, интерфейс и функциональность не переписывались.

## Сборка в облаке

Пуш в `main` запускает workflow **zWeb Android APK**:

1. checkout с `submodules: recursive` — 19 сабмодулей (TDLib, tgcalls, ffmpeg, boringssl, медиа);
2. JDK 17 (temurin), Android SDK 36, NDK `27.2.12479018`, CMake 3.22.1;
3. `./gradlew :TMessagesProj_AppStandalone:assembleRelease`;
4. APK уходит в артефакт `zweb-android-apk` и в релиз `apk-latest`.

Сборка занимает 40–90 минут: основное время — компиляция нативного кода TDLib.
Диск раннера ограничен, поэтому в `TMessagesProj_AppStandalone/build.gradle`
оставлена только `arm64-v8a`; для всех ABI уберите блок `ndk { abiFilters }`.

При падении сборки шаг «Build APK» пишет ошибки Gradle в summary запуска и
в аннотации — открывать полный лог не обязательно.

## Сборка локально

```bash
git clone --recursive https://github.com/frizovdanyash/zweb.git
cd zweb
./gradlew :TMessagesProj_AppStandalone:assembleRelease
```

Нужны JDK 17, Android SDK с NDK 27.2.12479018 и ~40 ГБ свободного места.

## Ограничения

- Release подписан тестовым ключом из репозитория: ставится и обновляется,
  но для Google Play нужен свой ключ (`keytool` + `signingConfigs`).
- `APP_ID`/`APP_HASH`, зашитые в `BuildVars.java`, — от исходного клиента.
  Для серьёзного использования получите свои на my.telegram.org.
- Собрана только `arm64-v8a`. Для старых 32-битных устройств добавьте ABI.
