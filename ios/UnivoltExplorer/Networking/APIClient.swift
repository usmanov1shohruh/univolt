import Foundation

final class APIClient {
  private let baseURL: URL
  private let session: URLSession

  init(baseURL: URL = AppConfig.apiBaseURL, session: URLSession = .shared) {
    self.baseURL = baseURL
    self.session = session
  }

  func get<T: Decodable>(_ path: String, queryItems: [URLQueryItem] = []) async throws -> T {
    var url = baseURL
    url.append(path: path.trimmingCharacters(in: CharacterSet(charactersIn: "/")))
    if !queryItems.isEmpty {
      url.append(queryItems: queryItems)
    }

    var req = URLRequest(url: url)
    req.httpMethod = "GET"

    let (data, resp) = try await session.data(for: req)
    guard let http = resp as? HTTPURLResponse else {
      throw URLError(.badServerResponse)
    }
    guard (200..<300).contains(http.statusCode) else {
      throw APIError.httpStatus(http.statusCode, body: String(data: data, encoding: .utf8))
    }

    do {
      return try JSONDecoder().decode(T.self, from: data)
    } catch {
      throw APIError.decodeFailed(error, body: String(data: data, encoding: .utf8))
    }
  }
}

enum APIError: Error, LocalizedError {
  case httpStatus(Int, body: String?)
  case decodeFailed(Error, body: String?)

  var errorDescription: String? {
    switch self {
    case let .httpStatus(code, _):
      return "HTTP error \(code)"
    case .decodeFailed:
      return "Failed to decode server response"
    }
  }
}

