import SwiftUI

struct RootView: View {
  var body: some View {
    TabView {
      StationsMapView()
        .tabItem { Label("Map", systemImage: "map") }

      FavoritesListView()
        .tabItem { Label("Favorites", systemImage: "heart") }

      SettingsView()
        .tabItem { Label("Settings", systemImage: "gearshape") }
    }
  }
}

