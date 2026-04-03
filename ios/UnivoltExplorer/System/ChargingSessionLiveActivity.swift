import Foundation

#if canImport(ActivityKit)
import ActivityKit

struct ChargingSessionAttributes: ActivityAttributes {
  public struct ContentState: Codable, Hashable {
    var statusText: String
    var progress01: Double
    var elapsedSeconds: Int
  }

  var stationName: String
  var stationAddress: String
}

@MainActor
enum ChargingSessionLiveActivity {
  static func start(stationName: String, stationAddress: String) async throws -> Activity<ChargingSessionAttributes> {
    let attrs = ChargingSessionAttributes(stationName: stationName, stationAddress: stationAddress)
    let state = ChargingSessionAttributes.ContentState(statusText: "Charging", progress01: 0, elapsedSeconds: 0)
    return try Activity.request(attributes: attrs, contentState: state, pushType: nil)
  }

  static func update(_ activity: Activity<ChargingSessionAttributes>, statusText: String, progress01: Double, elapsedSeconds: Int) async {
    let state = ChargingSessionAttributes.ContentState(
      statusText: statusText,
      progress01: min(max(progress01, 0), 1),
      elapsedSeconds: max(elapsedSeconds, 0)
    )
    await activity.update(using: state)
  }

  static func end(_ activity: Activity<ChargingSessionAttributes>, finalStatus: String) async {
    let state = ChargingSessionAttributes.ContentState(statusText: finalStatus, progress01: 1, elapsedSeconds: 0)
    await activity.end(using: state, dismissalPolicy: .default)
  }
}
#endif

