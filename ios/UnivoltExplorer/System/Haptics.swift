import Foundation
import UIKit

enum Haptics {
  static func tapLight() {
    let gen = UIImpactFeedbackGenerator(style: .light)
    gen.prepare()
    gen.impactOccurred()
  }

  static func tapMedium() {
    let gen = UIImpactFeedbackGenerator(style: .medium)
    gen.prepare()
    gen.impactOccurred()
  }

  static func success() {
    let gen = UINotificationFeedbackGenerator()
    gen.prepare()
    gen.notificationOccurred(.success)
  }

  static func warning() {
    let gen = UINotificationFeedbackGenerator()
    gen.prepare()
    gen.notificationOccurred(.warning)
  }

  static func error() {
    let gen = UINotificationFeedbackGenerator()
    gen.prepare()
    gen.notificationOccurred(.error)
  }
}

