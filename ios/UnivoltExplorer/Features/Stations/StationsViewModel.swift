import Foundation
import MapKit
import Combine

final class StationsViewModel: ObservableObject {
  @Published private(set) var stations: [BackendStation] = []
  @Published private(set) var isLoading: Bool = false
  @Published var errorMessage: String?

  @Published var search: String = ""
  @Published var network: String?
  @Published var connectorType: BackendConnectorType?
  @Published var status: BackendStationStatus?

  private let api: StationsAPI
  private var loadTask: Task<Void, Never>?

  init(api: StationsAPI = StationsAPI()) {
    self.api = api
  }

  func refresh(bbox: MapBBox) {
    loadTask?.cancel()
    loadTask = Task { [weak self] in
      guard let self else { return }
      try? await Task.sleep(nanoseconds: 350_000_000) // debounce bbox moves
      if Task.isCancelled { return }

      await MainActor.run {
        self.isLoading = true
        self.errorMessage = nil
      }

      do {
        var q = StationsQuery()
        let currentSearch = await MainActor.run { self.search }
        let currentNetwork = await MainActor.run { self.network }
        let currentConnector = await MainActor.run { self.connectorType }
        let currentStatus = await MainActor.run { self.status }

        q.search = currentSearch.trimmingCharacters(in: .whitespacesAndNewlines)
        if q.search?.isEmpty == true { q.search = nil }
        q.network = currentNetwork
        q.connectorType = currentConnector
        q.status = currentStatus
        q.minLat = bbox.minLat
        q.minLon = bbox.minLon
        q.maxLat = bbox.maxLat
        q.maxLon = bbox.maxLon

        let page = try await api.getStations(q)
        await MainActor.run {
          self.stations = page.items
        }
      } catch {
        let msg = (error as? LocalizedError)?.errorDescription ?? String(describing: error)
        await MainActor.run {
          self.errorMessage = msg
        }
      }

      await MainActor.run {
        self.isLoading = false
      }
    }
  }
}

struct MapBBox: Hashable {
  let minLat: Double
  let minLon: Double
  let maxLat: Double
  let maxLon: Double

  static func from(region: MKCoordinateRegion) -> MapBBox {
    let latDelta = region.span.latitudeDelta / 2
    let lonDelta = region.span.longitudeDelta / 2
    let minLat = region.center.latitude - latDelta
    let maxLat = region.center.latitude + latDelta
    let minLon = region.center.longitude - lonDelta
    let maxLon = region.center.longitude + lonDelta
    return .init(minLat: minLat, minLon: minLon, maxLat: maxLat, maxLon: maxLon)
  }
}

