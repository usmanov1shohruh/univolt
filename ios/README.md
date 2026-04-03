# Univolt Tashkent Explorer — iOS client (SwiftUI)

Этот репозиторий сейчас содержит web (Vite/React) + backend (NestJS). Здесь добавлены SwiftUI файлы, которые можно подключить к Xcode-проекту как основу нативного iOS клиента.

## Что уже сделано в `ios/UnivoltExplorer/`
- **Stations API**: `GET /stations`, `GET /stations/:id`, `GET /stations/filters/meta`
- **MapKit карта**: подгрузка станций по bbox (видимая область)
- **Детали станции**: базовая карточка
- **Избранное**: локально в `UserDefaults`
- **Хаптика**: тактильные отклики для ключевых действий
- **Заготовки**: Live Activities/Dynamic Island, Widgets, Notifications, Location (скелеты/точки интеграции)

## Как запустить (рекомендуемый путь)
1. Открой Xcode → **File → New → Project…** → iOS → **App**.
   - Interface: **SwiftUI**
   - Language: **Swift**
2. В созданный проект перетащи папку `ios/UnivoltExplorer/` (галка “Copy items if needed”).
3. В `App`-файле проекта используй `RootView()` как стартовый экран (пример ниже).
4. Настрой `AppConfig.apiBaseURL`:
   - для симулятора обычно `http://localhost:3000`
   - если backend доступен с телефона — укажи IP твоей машины в одной сети (например `http://192.168.1.10:3000`)

Пример минимального `App` файла (создай/замени в своём Xcode-проекте):

```swift
import SwiftUI

@main
struct UnivoltExplorerApp: App {
  var body: some Scene {
    WindowGroup {
      RootView()
    }
  }
}
```

## Требуемые permissions/capabilities (по мере включения фич)
- **Location**: добавь `NSLocationWhenInUseUsageDescription` в `Info.plist`
- **Background Location / Geofencing** (если реально нужно): Background Modes → Location updates
- **Live Activities**: включается как capability, плюс отдельный Widget Extension/Live Activity target (Xcode подскажет)
- **Notifications**: запрос разрешений при первом использовании

