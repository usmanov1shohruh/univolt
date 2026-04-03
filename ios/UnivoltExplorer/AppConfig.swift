import Foundation

enum AppConfig {
  /// Base URL of backend API.
  /// - Simulator default: `http://localhost:3000`
  /// - Device: use your machine LAN IP, e.g. `http://192.168.1.10:3000`
  static var apiBaseURL: URL = URL(string: "http://localhost:3000")!
}

