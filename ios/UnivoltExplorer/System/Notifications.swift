import Foundation
import UserNotifications

@MainActor
enum Notifications {
  static func requestAuthorizationIfNeeded() async {
    let center = UNUserNotificationCenter.current()
    let settings = await center.notificationSettings()
    if settings.authorizationStatus == .notDetermined {
      _ = try? await center.requestAuthorization(options: [.alert, .sound, .badge])
    }
  }

  static func scheduleLocalTimerReminder(secondsFromNow: Int, title: String, body: String) async {
    await requestAuthorizationIfNeeded()

    let content = UNMutableNotificationContent()
    content.title = title
    content.body = body
    content.sound = .default

    let trigger = UNTimeIntervalNotificationTrigger(timeInterval: TimeInterval(max(secondsFromNow, 1)), repeats: false)
    let req = UNNotificationRequest(identifier: UUID().uuidString, content: content, trigger: trigger)
    try? await UNUserNotificationCenter.current().add(req)
  }
}

