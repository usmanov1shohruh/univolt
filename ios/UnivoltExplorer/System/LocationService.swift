import Foundation
import CoreLocation
import Combine

final class LocationService: NSObject, ObservableObject, CLLocationManagerDelegate {
  @Published private(set) var authorization: CLAuthorizationStatus = .notDetermined
  @Published private(set) var lastLocation: CLLocation?

  private let manager: CLLocationManager = CLLocationManager()

  override init() {
    super.init()
    manager.delegate = self
    authorization = manager.authorizationStatus
  }

  func requestWhenInUse() {
    manager.requestWhenInUseAuthorization()
  }

  func startUpdating() {
    manager.desiredAccuracy = kCLLocationAccuracyHundredMeters
    manager.startUpdatingLocation()
  }

  func stopUpdating() {
    manager.stopUpdatingLocation()
  }

  func locationManagerDidChangeAuthorization(_ manager: CLLocationManager) {
    authorization = manager.authorizationStatus
  }

  func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
    lastLocation = locations.last
  }
}

