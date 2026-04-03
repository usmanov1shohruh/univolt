import SwiftUI
import MapKit

struct StationsMapView: View {
  @StateObject private var vm = StationsViewModel()
  @StateObject private var favorites = FavoritesStore()

  @State private var region: MKCoordinateRegion = .init(
    center: CLLocationCoordinate2D(latitude: 41.2995, longitude: 69.2401), // Tashkent
    span: MKCoordinateSpan(latitudeDelta: 0.18, longitudeDelta: 0.18)
  )

  @State private var selected: BackendStation?
  @State private var isShowingDetail = false

  var body: some View {
    ZStack(alignment: .top) {
      Map(
        coordinateRegion: $region,
        annotationItems: vm.stations,
        annotationContent: { station in
          MapAnnotation(coordinate: CLLocationCoordinate2D(latitude: station.latitude, longitude: station.longitude)) {
            Button {
              selected = station
              isShowingDetail = true
              Haptics.tapMedium()
            } label: {
              Circle()
                .fill(pinColor(station.status))
                .frame(width: 14, height: 14)
                .overlay(Circle().stroke(.white, lineWidth: 2))
                .shadow(radius: 2)
            }
            .buttonStyle(.plain)
          }
        }
      )
      .ignoresSafeArea()
      .onAppear {
        vm.refresh(bbox: .from(region: region))
      }
      .onChange(of: region.center.latitude) { _, _ in
        vm.refresh(bbox: .from(region: region))
      }
      .onChange(of: region.center.longitude) { _, _ in
        vm.refresh(bbox: .from(region: region))
      }
      .onChange(of: region.span.latitudeDelta) { _, _ in
        vm.refresh(bbox: .from(region: region))
      }
      .onChange(of: region.span.longitudeDelta) { _, _ in
        vm.refresh(bbox: .from(region: region))
      }

      VStack(spacing: 10) {
        HStack {
          Image(systemName: "magnifyingglass")
            .foregroundStyle(.secondary)
          TextField("Search stations", text: $vm.search)
            .textInputAutocapitalization(.never)
            .autocorrectionDisabled()
            .submitLabel(.search)
            .onSubmit {
              vm.refresh(bbox: .from(region: region))
            }
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 10)
        .background(.thinMaterial)
        .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
        .padding(.horizontal, 12)
        .padding(.top, 8)

        if vm.isLoading {
          ProgressView()
            .padding(.horizontal, 12)
            .padding(.vertical, 8)
            .background(.thinMaterial)
            .clipShape(Capsule())
        }

        if let msg = vm.errorMessage {
          Text(msg)
            .font(.footnote)
            .foregroundStyle(.red)
            .padding(.horizontal, 12)
            .padding(.vertical, 8)
            .background(.thinMaterial)
            .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
            .padding(.horizontal, 12)
        }
      }
    }
    .sheet(isPresented: $isShowingDetail) {
      if let s = selected {
        StationDetailView(station: s, favorites: favorites)
      } else {
        Text("No station selected")
          .padding()
      }
    }
  }

  private func pinColor(_ status: BackendStationStatus) -> Color {
    switch status {
    case .available: return .green
    case .busy: return .orange
    case .offline: return .red
    case .unknown: return .blue
    }
  }
}

