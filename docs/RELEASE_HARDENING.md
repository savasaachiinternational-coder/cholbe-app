# Release hardening notes

Covers the security/robustness work applied for the Play Store release.

## Code shrinking (R8)

`enableProguardInReleaseBuilds` is `true` in `android/app/build.gradle`. Keep rules
live in `android/app/proguard-rules.pro` and cover React Native's JNI entry points,
Nitro modules, Agora and Google Maps.

After each release build, upload the deobfuscation mapping to Play Console so crash
stack traces stay readable:

```
android/app/build/outputs/mapping/release/mapping.txt
```

Play Console does this automatically for App Bundles built with the Gradle plugin,
but verify it under **Release → App bundle explorer → Downloads**.

If a release-only crash appears in a library that uses reflection, add a targeted
`-keep` rule rather than disabling minification.

## Two Google Maps keys

The two keys are separate on purpose and must have different restrictions:

| Key | Where it lives | Restriction to apply |
| --- | --- | --- |
| Android key | `android/secrets.properties` → `@string/google_maps_api_key` | Android apps: package name + release SHA-1 |
| Server key | backend `.env` → `GOOGLE_MAPS_SERVER_API_KEY` | IP address of the API server |

The Android key ships inside the APK (unavoidable — `react-native-maps` needs it in
the manifest), which is safe once it is locked to the package name and signing
certificate. The server key never reaches the device: Geocoding and Static Maps go
through `GET /maps/reverse-geocode` and `GET /maps/static` on the backend.

Verify a release build never embeds a web-service key:

```
unzip -p app-release.apk assets/index.android.bundle | grep -o 'AIza[0-9A-Za-z_-]\{35\}'
```

That should print nothing.

## Session storage

Tokens live in the iOS Keychain / Android Keystore via `react-native-keychain`
(`src/api/tokenStorage.ts`), not AsyncStorage. Sessions written by older builds are
migrated on first read and the plaintext copies are deleted.

## Crash reporting

Sentry is wired in but inert until a DSN is set in `src/config/sentry.ts`. PII is
disabled (`sendDefaultPii: false`) and only the user id and role are attached, since
this app handles health data.

## iOS

`react-native-keychain` and `@sentry/react-native` are new native dependencies:

```
cd ios && pod install
```
