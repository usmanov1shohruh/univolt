import Foundation
import CoreLocation

struct StationsQuery: Hashable {
  var search: String?
  var network: String?
  var connectorType: BackendConnectorType?
  var minPowerKw: Int?
  var status: BackendStationStatus?

  var minLat: Double?
  var minLon: Double?
  var maxLat: Double?
  var maxLon: Double?

  var offset: Int?
  var limit: Int?
}

final class StationsAPI {
  private let client: APIClient

  init(client: APIClient = APIClient()) {
    self.client = client
  }

  func getStations(_ query: StationsQuery) async throws -> BackendStationsPage {
    let response: BackendStationsResponse = try await client.get(
      "stations",
      queryItems: queryItems(from: query)
    )
    return response.pageValue
  }

  func getStation(id: String) async throws -> BackendStation {
    try await client.get("stations/\(id)")
  }

  func getFiltersMeta() async throws -> StationsFiltersMeta {
    try await client.get("stations/filters/meta")
  }

  private func queryItems(from q: StationsQuery) -> [URLQueryItem] {
    var items: [URLQueryItem] = []
    if let v = q.search, !v.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
      items.append(.init(name: "search", value: v))
    }
    if let v = q.network { items.append(.init(name: "network", value: v)) }
    if let v = q.connectorType { items.append(.init(name: "connectorType", value: v.rawValue)) }
    if let v = q.minPowerKw { items.append(.init(name: "minPowerKw", value: String(v))) }
    if let v = q.status { items.append(.init(name: "status", value: v.rawValue)) }

    if let v = q.minLat { items.append(.init(name: "minLat", value: String(v))) }
    if let v = q.minLon { items.append(.init(name: "minLon", value: String(v))) }
    if let v = q.maxLat { items.append(.init(name: "maxLat", value: String(v))) }
    if let v = q.maxLon { items.append(.init(name: "maxLon", value: String(v))) }

    if let v = q.offset { items.append(.init(name: "offset", value: String(v))) }
    if let v = q.limit { items.append(.init(name: "limit", value: String(v))) }
    return items
  }
}

