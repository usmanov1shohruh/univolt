import Foundation
import Combine

final class FavoritesStore: ObservableObject {
  @Published private(set) var favorites: Set<String> = []

  private let key = "favorites.stationIds.v1"
  private let defaults: UserDefaults

  init(defaults: UserDefaults = .standard) {
    self.defaults = defaults
    load()
  }

  func isFavorite(_ stationId: String) -> Bool {
    favorites.contains(stationId)
  }

  func toggle(_ stationId: String) {
    if favorites.contains(stationId) {
      favorites.remove(stationId)
      Haptics.tapLight()
    } else {
      favorites.insert(stationId)
      Haptics.success()
    }
    save()
  }

  private func load() {
    guard let arr = defaults.array(forKey: key) as? [String] else {
      favorites = []
      return
    }
    favorites = Set(arr)
  }

  private func save() {
    defaults.set(Array(favorites), forKey: key)
  }
}

