# iOS release preflight checklist

This checklist prepares a production-ready iOS build from the SwiftUI client in `ios/UnivoltExplorer/`.

## 1) Create or open Xcode project

- [ ] Create a new iOS App project in Xcode (SwiftUI, Swift).
- [ ] Import all files from `ios/UnivoltExplorer/`.
- [ ] Set `RootView()` as the app entry UI.

## 2) Bundle and versioning

- [ ] Set unique Bundle Identifier (`com.yourcompany.univoltexplorer`).
- [ ] Set Marketing Version (`CFBundleShortVersionString`, e.g. `1.0.0`).
- [ ] Set Build Number (`CFBundleVersion`, increment each upload).

## 3) Signing and capabilities

- [ ] In `Signing & Capabilities`, select your Team.
- [ ] Enable Automatic Signing.
- [ ] Ensure Distribution certificate is created by Xcode.
- [ ] Add required capabilities only (Background Modes, Push Notifications, etc.).

## 4) Permissions in Info.plist

- [ ] Add `NSLocationWhenInUseUsageDescription` with user-friendly text.
- [ ] Add any other required usage strings if features are enabled.
- [ ] Verify no unused permission key remains in `Info.plist`.

Recommended text for location permission:

`We use your location to show nearby charging stations and improve route planning.`

## 5) Runtime configuration and QA

- [ ] Set production API URL in `AppConfig.apiBaseURL`.
- [ ] Validate API over HTTPS (required for production).
- [ ] Test on physical device (not only simulator).
- [ ] Validate crash-free cold start, navigation, map loading, favorites, and settings.

## 6) App identity assets

- [ ] Prepare App Icon set for all required sizes via Xcode asset catalog.
- [ ] Confirm launch appearance in light/dark mode.
- [ ] Verify app display name and localization.

## 7) Archive readiness

- [ ] Select Generic iOS Device or a real device.
- [ ] Run Product -> Archive.
- [ ] Resolve all Archive warnings before upload.

## Completion criteria

Build-preparation stage is complete when:

- Archive is produced successfully.
- Automatic signing is valid for distribution.
- All required permission strings and assets are set.
