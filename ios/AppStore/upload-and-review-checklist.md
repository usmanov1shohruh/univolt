# Upload and review checklist

Use this checklist for the final submission flow in App Store Connect.

## 1) Upload archive

- [ ] Open Xcode Organizer.
- [ ] Select latest successful archive.
- [ ] Click Distribute App -> App Store Connect -> Upload.
- [ ] Wait until processing completes in App Store Connect.

## 2) TestFlight validation

- [ ] Add internal testers.
- [ ] Validate onboarding, map loading, station details, favorites.
- [ ] Confirm no critical crashes in TestFlight sessions.
- [ ] If issues found, fix, increment build number, re-archive, and re-upload.

## 3) Prepare version submission

- [ ] In App Store Connect, create app version (e.g. `1.0.0`).
- [ ] Attach the processed build to this version.
- [ ] Complete export compliance, content rights, and IDFA answers.
- [ ] Complete App Privacy section.
- [ ] Add review notes and demo credentials (if required).

## 4) Submit and release strategy

- [ ] Click Submit for Review.
- [ ] Monitor status changes: Waiting for Review -> In Review -> Approved.
- [ ] Use Manual Release to publish at your preferred time.
- [ ] After release, monitor crashes and user feedback for hotfix planning.

## Completion criteria

Submission stage is complete when:

- One build is approved by Apple Review.
- The approved version is released in chosen storefronts.
