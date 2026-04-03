import Foundation

enum BackendConnectorType: String, Codable, CaseIterable {
  case ccs2 = "CCS2"
  case chademo = "CHAdeMO"
  case type2 = "Type2"
  case gbt = "GB/T"
  case other = "Other"
}

enum BackendStationStatus: String, Codable, CaseIterable {
  case available
  case busy
  case offline
  case unknown
}

struct BackendStation: Codable, Identifiable, Hashable {
  let id: String
  let name: String
  let address: String
  let latitude: Double
  let longitude: Double
  let network: String
  let connectorTypes: [BackendConnectorType]
  let maxPowerKw: Int?
  let portsCount: Int?
  let status: BackendStationStatus
  let openingHours: String?
}

struct BackendStationsPage: Codable, Hashable {
  let items: [BackendStation]
  let total: Int
}

/// Backend `/stations` currently returns `{ items, total }`.
/// Keep this wrapper in case response changes in the future.
enum BackendStationsResponse: Decodable {
  case page(BackendStationsPage)

  init(from decoder: Decoder) throws {
    let container = try decoder.singleValueContainer()
    let page = try container.decode(BackendStationsPage.self)
    self = .page(page)
  }

  var pageValue: BackendStationsPage {
    switch self {
    case let .page(p): return p
    }
  }
}

struct StationsFiltersMeta: Codable, Hashable {
  let networks: [String]
  let connectorTypes: [BackendConnectorType]
  let statuses: [BackendStationStatus]
}

