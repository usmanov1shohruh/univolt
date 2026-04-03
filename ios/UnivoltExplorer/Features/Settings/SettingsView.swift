import SwiftUI

struct SettingsView: View {
  @State private var apiBase: String = AppConfig.apiBaseURL.absoluteString

  var body: some View {
    NavigationStack {
      Form {
        Section("API") {
          TextField("Base URL", text: $apiBase)
            .textInputAutocapitalization(.never)
            .autocorrectionDisabled()
          Button("Apply (restart app)") {
            if let url = URL(string: apiBase.trimmingCharacters(in: .whitespacesAndNewlines)) {
              AppConfig.apiBaseURL = url
              Haptics.success()
            } else {
              Haptics.error()
            }
          }
        }

        Section("Native features (next)") {
          LabeledContent("Live Activities", value: "scaffolded")
          LabeledContent("Widgets", value: "scaffolded")
          LabeledContent("Notifications", value: "scaffolded")
          LabeledContent("Background location", value: "scaffolded")
        }
      }
      .navigationTitle("Settings")
    }
  }
}

