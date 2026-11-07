# zWeb для Android (APK)

В репозитории лежит Android-проект (`android/`): нативная обёртка zWeb на WebView.
Тот же веб-клиент, но в своём окне — иконка в лончере, без адресной строки,
микрофон и камера для звонков, ссылки `t.me` открываются внутри.

Код веб-клиента не менялся.

## Готовый APK

**[zweb.apk](https://github.com/frizovdanyash/zweb/releases/download/apk-latest/zweb.apk)** — release, 2.7 МБ.
Рядом лежит `zweb-debug.apk` (debug, ставится рядом с обычной версией).
Пересобираются автоматически при каждом пуше в `main`.

Установка: скачать на телефон → открыть → разрешить установку из этого источника.

## Адрес приложения

По умолчанию используется `https://frizovdanyash.github.io/zweb/`. Он записан в
`android/app/build.gradle`:

```groovy
resValue 'string', 'zweb_default_url', '"https://frizovdanyash.github.io/zweb/"'
```

Если zWeb развёрнут на другом домене, менять код не обязательно: при ошибке
загрузки приложение показывает окно ввода адреса и запоминает его. Адрес должен
начинаться с `https://`.

Чтобы сменить адрес по умолчанию для всех сборок, поправьте строку выше и
запушьте — APK пересоберётся сам.

## Сборка

### GitHub Actions

Workflow **«Сборка APK»** запускается сам на пуш в `main`, либо вручную:
вкладка **Actions** → **Сборка APK** → **Run workflow**. Результат — в артефактах
и в релизе `apk-latest`.

### Локально

Нужны JDK 17 и Android SDK (`ANDROID_HOME`):

```bash
cd android
gradle assembleDebug      # app/build/outputs/apk/debug/app-debug.apk
gradle assembleRelease    # app/build/outputs/apk/release/app-release.apk
```

Или откройте папку `android/` в Android Studio и нажмите
**Build → Build Bundle(s)/APK(s) → Build APK(s)**.

## Подпись

Release подписан debug-ключом: APK ставится и обновляется, но не принимается
Google Play. Для своего ключа:

```bash
keytool -genkey -v -keystore zweb-release.jks -keyalg RSA -keysize 2048 \
        -validity 10000 -alias zweb
```

и в `android/app/build.gradle`:

```groovy
android {
    signingConfigs {
        release {
            storeFile file('../../zweb-release.jks')
            storePassword System.getenv('ZWEB_STORE_PASSWORD')
            keyAlias 'zweb'
            keyPassword System.getenv('ZWEB_KEY_PASSWORD')
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
        }
    }
}
```

Ключ и пароли не коммитьте: `.jks` уже в `.gitignore`, пароли — в переменных
окружения.

## Что настроено

| | |
|---|---|
| Пакет | `chat.zweb.app`, debug — `chat.zweb.app.debug` |
| minSdk / targetSdk | 23 / 34 |
| Иконки | все плотности + adaptive-icon, фон `#1A0F2E` |
| Тема | тёмная, окно `#0B0613` — без белой вспышки при старте |
| Разрешения | интернет, микрофон, камера, уведомления, вибрация, чтение медиа |
| Сеть | HTTPS обязателен, cleartext только для `localhost` и `10.0.2.2` |
| Ссылки | домен zWeb, `t.me`, `telegram.me` — внутри; остальное в браузер |
| Кнопка «Назад» | сначала история WebView, потом выход |
| Куки и сессия | сохраняются, сбрасываются на диск при сворачивании |

## Ограничения

- **Push-уведомления.** В WebView web-push не работает так, как в Chrome:
  уведомления приходят, только пока приложение открыто. Настоящие пуши требуют
  нативного MTProto-клиента.
- **Звонки.** WebRTC в Android WebView есть, качество зависит от устройства.
  Микрофон спрашивается один раз.
- **QR-вход и вход по номеру** работают как в браузере.
- Приложение не в Google Play — APK ставится вручную.
- Приложение открывает удалённый домен: без сети это просто окно с ошибкой и
  предложением сменить адрес.
