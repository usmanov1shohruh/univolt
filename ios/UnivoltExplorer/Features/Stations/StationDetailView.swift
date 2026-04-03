import SwiftUI

struct StationDetailView: View {
  let station: BackendStation
  @ObservedObject var favorites: FavoritesStore

  var body: some View {
    VStack(alignment: .leading, spacing: 12) {
      HStack(alignment: .top) {
        VStack(alignment: .leading, spacing: 4) {
          Text(station.name)
            .font(.headline)
          Text(station.address)
            .font(.subheadline)
            .foregroundStyle(.secondary)
        }

        Spacer()

        Button {
          favorites.toggle(station.id)
        } label: {
          Image(systemName: favorites.isFavorite(station.id) ? "heart.fill" : "heart")
            .font(.title3)
        }
        .buttonStyle(.plain)
        .accessibilityLabel("Favorite")
      }

      HStack(spacing: 8) {
        Label(station.network, systemImage: "bolt.car")
        Spacer()
        Text(statusText(station.status))
          .font(.subheadline)
          .foregroundStyle(statusColor(station.status))
      }
      .font(.subheadline)

      if let kw = station.maxPowerKw {
        Text("Max power: \(kw) kW")
          .font(.subheadline)
      }

      if let ports = station.portsCount {
        Text("Ports: \(ports)")
          .font(.subheadline)
      }

      if !station.connectorTypes.isEmpty {
        VStack(alignment: .leading, spacing: 6) {
          Text("Connectors")
            .font(.subheadline)
            .foregroundStyle(.secondary)
          FlowTags(items: station.connectorTypes.map { $0.rawValue })
        }
      }

      if let hours = station.openingHours, !hours.isEmpty {
        Text("Hours: \(hours)")
          .font(.subheadline)
      }
    }
    .padding()
    .presentationDetents([.medium, .large])
  }

  private func statusText(_ s: BackendStationStatus) -> String {
    switch s {
    case .available: return "Available"
    case .busy: return "Busy"
    case .offline: return "Offline"
    case .unknown: return "Unknown"
    }
  }

  private func statusColor(_ s: BackendStationStatus) -> Color {
    switch s {
    case .available: return .green
    case .busy: return .orange
    case .offline: return .red
    case .unknown: return .secondary
    }
  }
}

struct FlowTags: View {
  let items: [String]

  var body: some View {
    VStack(alignment: .leading) {
      FlexibleView(
        availableWidth: UIScreen.main.bounds.width - 32,
        data: items,
        spacing: 8,
        alignment: .leading
      ) { item in
        Text(item)
          .font(.caption)
          .padding(.vertical, 6)
          .padding(.horizontal, 10)
          .background(.thinMaterial)
          .clipShape(Capsule())
      }
    }
  }
}

/// Small helper for wrapping tags without external deps.
struct FlexibleView<Data: Collection, Content: View>: View where Data.Element: Hashable {
  let availableWidth: CGFloat
  let data: Data
  let spacing: CGFloat
  let alignment: HorizontalAlignment
  let content: (Data.Element) -> Content

  @State private var elementsSize: [Data.Element: CGSize] = [:]

  var body: some View {
    var width = CGFloat.zero
    var height = CGFloat.zero

    return ZStack(alignment: Alignment(horizontal: alignment, vertical: .top)) {
      ForEach(Array(data), id: \.self) { element in
        content(element)
          .fixedSize()
          .readSize { size in
            elementsSize[element] = size
          }
          .alignmentGuide(.leading) { _ in
            if (abs(width - (elementsSize[element]?.width ?? 0)) > availableWidth) {
              width = 0
              height -= (elementsSize[element]?.height ?? 0) + spacing
            }
            let result = width
            width -= (elementsSize[element]?.width ?? 0) + spacing
            return result
          }
          .alignmentGuide(.top) { _ in
            let result = height
            return result
          }
      }
    }
    .frame(maxWidth: availableWidth, alignment: .leading)
  }
}

private struct SizePreferenceKey: PreferenceKey {
  static var defaultValue: CGSize = .zero
  static func reduce(value: inout CGSize, nextValue: () -> CGSize) {
    value = nextValue()
  }
}

private extension View {
  func readSize(onChange: @escaping (CGSize) -> Void) -> some View {
    background(
      GeometryReader { proxy in
        Color.clear
          .preference(key: SizePreferenceKey.self, value: proxy.size)
      }
    )
    .onPreferenceChange(SizePreferenceKey.self, perform: onChange)
  }
}

