import SwiftUI

struct FavoritesListView: View {
  @StateObject private var favorites = FavoritesStore()
  @StateObject private var vm = StationsViewModel()

  var body: some View {
    NavigationStack {
      List {
        if favorites.favorites.isEmpty {
          ContentUnavailableView("No favorites yet", systemImage: "heart", description: Text("Add stations to favorites from the map."))
        } else {
          ForEach(vm.stations.filter { favorites.favorites.contains($0.id) }) { station in
            NavigationLink {
              StationDetailView(station: station, favorites: favorites)
            } label: {
              VStack(alignment: .leading, spacing: 4) {
                Text(station.name).font(.headline)
                Text(station.address).font(.subheadline).foregroundStyle(.secondary)
              }
            }
          }
        }
      }
      .navigationTitle("Favorites")
      .toolbar {
        ToolbarItem(placement: .topBarTrailing) {
          Button {
            Task {
              // No bbox here; load a broad area around Tashkent for now.
              let bbox = MapBBox(minLat: 41.1, minLon: 69.0, maxLat: 41.5, maxLon: 69.5)
              vm.refresh(bbox: bbox)
            }
          } label: {
            Image(systemName: "arrow.clockwise")
          }
        }
      }
      .task {
        let bbox = MapBBox(minLat: 41.1, minLon: 69.0, maxLat: 41.5, maxLon: 69.5)
        vm.refresh(bbox: bbox)
      }
    }
  }
}

