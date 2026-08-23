# Cholbe App — Codebase Audit Report

**Repository:** `cholbe` (React Native 0.85.3 / React 19.2.3 / TypeScript 5.8)
**Branch audited:** `nasir65` @ `ca4ed89`
**Audit date:** 2026-08-20
**Scope:** React Native client only. The backend (`https://cholbeapi.pino7.com/api/v1`) was **not** in scope — findings about server behaviour are inferred from client code and marked as such.

---

## 1. Executive Summary

Cholbe is a **four-role healthcare + pharmacy super-app** (Customer, Doctor, Vendor, Admin) with telemedicine (Agora video), prescription OCR, e-commerce checkout, and an AI symptom-checker flow. It is **61.1 KLOC** across 214 TypeScript files, which is a substantial application.

The **API layer is the strongest part of the codebase** — typed, consistent, and cleanly separated. The **UI layer is the weakest** — 82% of all code lives in screen files, with essentially no shared presentation components, no design-token adoption, and heavy copy-paste duplication.

### Scorecard

| Dimension | Grade | One-line verdict |
|---|:---:|---|
| **Size & structure** | C | 61 KLOC, but 82% concentrated in screens; average screen is 286 lines, largest is 1,828 |
| **Architecture** | C− | Clean API layer; no state management, no service/domain layer, competing navigation paradigms |
| **Navigation** | D | 89 screens in a single flat stack, zero role isolation, auth flow outside the navigator |
| **Code reusability** | D | 4,010 hardcoded colors, theme system used by 1 file, 4 duplicated bottom navs, 2 cloned 1,200-line screens |
| **Security** | D+ | Debug-keystore release signing, unencrypted PHI token storage, client-confirmed payments, unrestricted Maps key |
| **Performance** | C− | ~2 MB dead font weight, 1.37 MB PNG, no pagination anywhere, `ScrollView + .map` instead of `FlatList` |
| **Code quality** | D | **40 TypeScript errors** (project does not compile), 147 ESLint problems, 1 test file, 0.7% comment density |
| **Build & release** | F | Release APK is **signed with the debug keystore**; ProGuard/R8 disabled |

### The five things to fix first

1. **Release builds are signed with the debug keystore** (`android/app/build.gradle:118`). This app cannot be published to Play Store, and if it were, no future update could ever be installed over it.
2. **The project does not typecheck** — 40 `tsc` errors, one of which is a live payment bug (card orders send `"Card"` instead of `"CARD"`).
3. **Any authenticated user can navigate to any screen**, including all 15 admin screens. Role separation exists only as an initial-route hint.
4. **Session tokens and PHI are stored in plaintext AsyncStorage** with no expiry handling and no 401 auto-logout.
5. **The design system is dead code.** 334 distinct hardcoded colors, 116 references to a font that is not shipped.

---

## 2. Application Size (Precise KLOC)

Measured over all `.ts`/`.tsx` files under `src/` plus `App.tsx` and `index.js`. `node_modules`, `build/`, `Pods/`, and generated artifacts excluded.

### 2.1 Headline numbers

| Metric | Value |
|---|---|
| **Total physical lines (KLOC)** | **61.10 KLOC** |
| **Source lines, blanks + comments removed (KSLOC)** | **57.32 KSLOC** |
| Blank lines | 3,376 (5.5%) |
| Comment lines | 409 (0.7%) |
| Source files | 214 |
| Average file size | 286 lines |
| React components (`.tsx`) | 135 |
| Registered navigation screens | 89 |
| API modules | 25 |
| Test files | **1** |

> **Comment density of 0.7% is exceptionally low.** Industry norm for an application of this size is 8–15%. There are 409 comment lines across 57,316 source lines — roughly one comment per 140 lines of code.

### 2.2 Breakdown by layer

| Area | Files | Total lines | SLOC | Blank | Comment | % of codebase |
|---|---:|---:|---:|---:|---:|---:|
| `screens/home` | 65 | 27,865 | 26,413 | 1,328 | 124 | 45.6% |
| `screens/admin` | 17 | 8,377 | 7,912 | 405 | 60 | 13.7% |
| `screens/vendor` | 8 | 6,282 | 5,930 | 296 | 56 | 10.3% |
| `screens/auth` | 10 | 3,946 | 3,746 | 197 | 3 | 6.5% |
| `components` | 18 | 3,473 | 3,196 | 206 | 71 | 5.7% |
| `screens/doctor` | 11 | 3,223 | 3,045 | 167 | 11 | 5.3% |
| `api` | 25 | 2,491 | 2,188 | 293 | 10 | 4.1% |
| `screens/aisymptom` | 31 | 2,427 | 2,165 | 224 | 38 | 4.0% |
| `navigation` | 3 | 735 | 722 | 9 | 4 | 1.2% |
| `utils` | 7 | 662 | 569 | 81 | 12 | 1.1% |
| `hooks` | 4 | 565 | 494 | 65 | 6 | 0.9% |
| `screens/onboarding` | 3 | 461 | 429 | 29 | 3 | 0.8% |
| root (`App.tsx`, `index.js`) | 2 | 294 | 257 | 33 | 4 | 0.5% |
| `context` | 2 | 171 | 148 | 23 | 0 | 0.3% |
| `theme` | 3 | 72 | 62 | 6 | 4 | 0.1% |
| `config` | 3 | 23 | 12 | 8 | 3 | 0.04% |
| `checkout` | 1 | 22 | 20 | 2 | 0 | 0.04% |
| `auth` | 1 | 12 | 8 | 4 | 0 | 0.02% |
| **TOTAL** | **214** | **61,101** | **57,316** | **3,376** | **409** | **100%** |

### 2.3 Distribution analysis

```
Screens          50,591 lines  ████████████████████████████████████████  82.8%
Components        3,473 lines  ███                                        5.7%
API layer         2,491 lines  ██                                         4.1%
Navigation          735 lines  ▌                                          1.2%
Utils + hooks     1,227 lines  █                                          2.0%
Everything else   2,584 lines  ██                                         4.2%
```

**This is the single most important structural fact in the report.** A healthy React Native app of this size would put 35–50% of code in reusable components, hooks, and domain logic. Here, **82.8% is screen code** and only **5.7% is shared components** — a 14:1 ratio. Every screen re-implements its own header, loading state, empty state, card, badge, and modal.

### 2.4 The 15 largest files

| Lines | File | Concern |
|---:|---|---|
| 1,828 | `src/screens/home/MyProfileScreen.tsx` | 15 `useState`, 825 lines of styles (45% of file) |
| 1,598 | `src/screens/vendor/VendorPharmacyProfileScreen.tsx` | **34 `useState` calls** in one component |
| 1,520 | `src/screens/home/HomeScreen.tsx` | 717 lines of styles |
| 1,329 | `src/screens/doctor/DoctorEditProfileScreen.tsx` | **48 `useState` calls** |
| 1,318 | `src/screens/home/CartCheckoutDetailsScreen.tsx` | 18 `useState`, 4 `useEffect` |
| 1,205 | `src/screens/home/ConsultationChatScreen.tsx` | 5s full-list polling |
| 1,185 | `src/screens/vendor/VendorHomeScreen.tsx` | |
| 1,177 | `src/screens/admin/AdminDoctorEditScreen.tsx` | **43 `useState`**; near-clone of DoctorEditProfileScreen |
| 1,107 | `src/screens/home/PharmacyDetailsScreen.tsx` | |
| 1,005 | `src/screens/vendor/VendorOrdersScreen.tsx` | |
| 950 | `src/screens/home/ReportDetailsView.tsx` | near-clone of ReportPreview |
| 930 | `src/screens/home/NotificationsScreen.tsx` | |
| 930 | `src/screens/home/CartPaymentScreen.tsx` | contains the `"Card"` payment bug |
| 907 | `src/screens/home/BookVideoCallScreen.tsx` | |
| 901 | `src/screens/admin/AdminUsersScreen.tsx` | |

**23 files exceed 600 lines.** A React Native screen component should generally stay under 250 lines with styles extracted.

---

## 3. Architecture

### 3.1 What is actually good

Give credit where it's due — these are genuinely well-built:

- **`src/api/` (2,491 lines, 25 modules).** Every endpoint is a typed function on a namespaced object (`ordersApi.list()`, `adminApi.getDoctor()`). Request/response types are declared. `apiRequest<T>` centralises headers, auth, JSON parsing, and error normalisation into a typed `ApiError`. This layer would survive a full UI rewrite unchanged.
- **Type discipline in application code.** Only **3** uses of `any` and **0** `@ts-ignore` across 61 KLOC. That is unusually good; the 40 compiler errors are genuine type mismatches, not suppressed ones.
- **`useAgoraRtc`** correctly fetches the Agora token from the server per-appointment rather than embedding an App Certificate in the client (`src/hooks/useAgoraRtc.ts:69`). This is the right call and avoids the most common Agora security mistake.
- **iOS configuration** is complete and correct: all four `NSUsageDescription` strings are written and specific, and ATS is properly locked down (`NSAllowsArbitraryLoads: false`).
- **`src/screens/aisymptom/`** is the one module organised properly — `screens/`, `components/`, `data/` each with per-screen subfolders, average file size 78 lines. **This module is the template the rest of the app should follow.**

### 3.2 Layer diagram — as built

```
┌──────────────────────────────────────────────────────────────┐
│  App.tsx  — hand-rolled 11-state `phase` machine (auth flow)  │
│             renders 9 auth screens OUTSIDE the navigator      │
├──────────────────────────────────────────────────────────────┤
│  RootNavigator — ONE flat native stack, 89 screens,           │
│                  all statically imported, no role boundary    │
├──────────────────────────────────────────────────────────────┤
│  Screens (50,591 lines, 82.8%)                                │
│   • own data fetching (92 × useFocusEffect)                   │
│   • own loading state (78 × ActivityIndicator)                │
│   • own error handling (260 × Alert.alert)                    │
│   • own styles (130 × StyleSheet.create)                      │
│   • own colors (4,010 hardcoded hex literals)                 │
│                          ↕ (no layer between)                 │
├──────────────────────────────────────────────────────────────┤
│  api/ (2,491 lines) — typed, clean  ✅                        │
└──────────────────────────────────────────────────────────────┘

Escaping the layers sideways:
  • src/checkout/checkoutSession.ts  — module-level mutable singleton
  • src/auth/sessionControl.ts       — module-level mutable singleton
```

### 3.3 Findings

#### A-1 · **HIGH** · No state management or server-cache layer

There is no Redux, Zustand, TanStack Query, or SWR — only two narrow React Contexts (`MedicationDraftContext`, `NotificationContext`, 171 lines combined). Consequences measured in the code:

- **92 `useFocusEffect` call sites** each re-fetch from scratch on every screen focus. Navigating Home → Orders → back → Orders refetches everything four times. No caching, no deduplication, no stale-while-revalidate.
- **78 hand-rolled `ActivityIndicator` loading states**, each with its own `useState(loading)` boilerplate.
- **260 `Alert.alert` calls** as the universal error UI. There is no toast, no inline field error, no retry affordance — every failure is a blocking modal.
- Shared data (cart contents, unread count, current user) has no single source of truth, so screens can and do disagree.

**Fix:** Adopt **TanStack Query v5**. Your `api/` layer is already perfectly shaped for it — each `xxxApi.list()` becomes a `queryFn` verbatim. This one change removes the refetch storms, gives you caching + retry + background refresh for free, and eliminates the 78 manual loading states and most of the 260 alerts.

```ts
// src/api/queries/orders.ts
export const orderKeys = {
  all: ['orders'] as const,
  detail: (id: string) => ['orders', id] as const,
};

export const useOrders = () =>
  useQuery({ queryKey: orderKeys.all, queryFn: ordersApi.list, staleTime: 30_000 });
```

#### A-2 · **HIGH** · God components with unmanaged local state

`DoctorEditProfileScreen.tsx` has **48 `useState` calls**; `AdminDoctorEditScreen.tsx` has 43; `VendorPharmacyProfileScreen.tsx` has 34. Each `setState` on any one of 48 independent values re-renders a 1,300-line tree. This is unmaintainable and unmeasurably slow.

**Fix:** Replace with a single `useReducer` holding one form object, or adopt **React Hook Form** (`useForm` + `Controller`), which keeps field state uncontrolled and re-renders only the changed field. For a 48-field form this is the difference between 48 re-renders of a 1,300-line tree and zero.

#### A-3 · **MEDIUM** · Module-level mutable singletons bypass React

```ts
// src/checkout/checkoutSession.ts
let prescriptionUrl: string | undefined;   // module-global mutable state
export const checkoutSession = { setPrescriptionUrl, getPrescriptionUrl, ... };
```

`checkoutSession` and `sessionControl` are module-scope mutable variables. They are invisible to React, survive logout unless manually cleared, are unreachable from tests without module resets, and will leak one user's prescription URL into the next user's checkout if `clear()` is ever missed. `CartPaymentScreen.tsx:73` reads `checkoutSession.getPrescriptionUrl()` at submit time with no guarantee it belongs to the current session.

**Fix:** Move both into React Context (or the Zustand store, if adopted) so their lifetime is bound to the provider and reset on logout.

#### A-4 · **MEDIUM** · No error boundary

`grep -c "ErrorBoundary\|componentDidCatch"` returns **0**. Any render-time exception in any of 89 screens white-screens the entire app with no recovery path and no report. For a health app where users may be mid-consultation, this is a serious reliability gap.

**Fix:** Wrap `RootNavigator` in `react-error-boundary`, add a "Something went wrong / Try again" fallback, and wire it to a crash reporter (Sentry or Firebase Crashlytics — currently there is **no crash reporting or analytics of any kind** in the project).

#### A-5 · **MEDIUM** · No path aliases, no barrel exports

`find src -name "index.ts*"` returns **0** barrels; there are **24** imports with three-or-more `../` segments (e.g. `src/screens/aisymptom/screens/AiSymptomHome/AiSymptomHome.tsx:15` imports `'../../../../api/tokenStorage'`). Any file move breaks a cascade of imports.

**Fix:** Add `babel-plugin-module-resolver` + `tsconfig` paths for `@api/*`, `@components/*`, `@theme/*`, `@navigation/*`.

#### A-6 · **LOW** · Dead dependency

`@react-native/new-app-screen` remains in `dependencies` but is never imported.

---

## 4. Navigation

### 4.1 Findings

#### N-1 · **CRITICAL** · No role isolation — every screen is reachable by every user

`RootNavigator.tsx` registers all 89 screens in one flat `createNativeStackNavigator`, including all 15 `A*` admin screens and all 6 `V*` vendor screens. Role handling consists solely of `getHomeRouteForRole()` (`src/navigation/roleRoutes.ts`) choosing an `initialRouteName`.

```tsx
// src/navigation/RootNavigator.tsx — same stack, no guard
<Stack.Screen name="AUsers" component={AdminUsersScreen} />        // admin
<Stack.Screen name="VPayments" component={VendorPaymentsScreen} /> // vendor
<Stack.Screen name="Home" component={HomeScreen} />                // customer
```

A logged-in CUSTOMER reaching `navigation.navigate('AUsers')` — via any code path, a mis-wired button, or a future deep link — lands on the full admin user-management screen. The screens themselves contain no role checks. Whether data is returned depends **entirely** on the backend enforcing authorization on every admin endpoint. **Client-side, there is zero defence.**

This is filed as a navigation issue and a security issue (see S-2).

**Fix:** Split into role-scoped navigators mounted conditionally on the authenticated role. Screens the user's role does not own must not exist in the tree:

```tsx
function RootNavigator() {
  const {role} = useSession();
  if (role === 'ADMIN')  return <AdminStack />;
  if (role === 'VENDOR') return <VendorStack />;
  if (role === 'DOCTOR') return <DoctorStack />;
  return <CustomerStack />;   // shared screens live in a SharedStack composed into each
}
```

#### N-2 · **HIGH** · The auth flow is a hand-rolled state machine outside React Navigation

`App.tsx` implements an 11-state `AppPhase` union (`splash | onboarding | signIn | register | otpVerificationMethod | forgotPassword | verification | patientInformation | medicalHistory | createNewPassword | main`) with 17 `useCallback` transition handlers, rendering 9 auth screens as conditional JSX **outside** `NavigationContainer`.

Consequences:

- **Android hardware back does nothing during the entire auth flow.** `grep -c BackHandler` returns 0, and there is no navigator to intercept it. A user on the OTP screen who presses back exits the app.
- Auth screens cannot be deep-linked, cannot be typed against `RootStackParamList`, and cannot use `useNavigation`.
- Every screen needs bespoke `onBack`/`onContinue` props threaded from `App.tsx`, which is why `App.tsx` carries 17 handler callbacks for what should be `navigation.goBack()`.
- No transition animations; screens hard-swap.

**Fix:** Make it an `AuthStack` navigator inside `NavigationContainer`, switched against the session:

```tsx
<NavigationContainer linking={linking}>
  {session ? <RoleStack role={session.role} /> : <AuthStack />}
</NavigationContainer>
```

#### N-3 · **HIGH** · Tab bars are stack pushes, not a tab navigator

There are **four** separate bottom-nav components (`HomeBottomNav`, `DoctorBottomNav`, `VendorBottomNav`, `AdminBottomNav`) plus a `RoleBottomNav` dispatcher. Each one is a `switch` over tab keys calling `navigation.navigate('VOrders')` etc. on a **native stack**.

Because these are stack routes, not tabs:

- Each tab screen unmounts and fully re-fetches when you leave it — no tab state preservation.
- Back-button semantics are unpredictable (back from a "tab" pops to whichever screen happened to precede it).
- Tab state is passed manually as an `activeTab` prop to every screen, so every screen must know its own tab identity.
- `RoleBottomNav` does an **async `getStoredUser()` read on every mount** and returns `null` until it resolves, so the tab bar visibly pops in after first paint (`src/components/RoleBottomNav.tsx:37-58`).

**Fix:** Use `@react-navigation/bottom-tabs`. `activeTab` becomes implicit, state is preserved per tab, back behaviour is correct, and the four nav components collapse into one config-driven `<Tab.Navigator>` per role.

#### N-4 · **MEDIUM** · All 89 screens are statically imported and eagerly evaluated

`RootNavigator.tsx` has 89 top-of-file static imports. React Navigation lazily *renders* screens, but the modules — and their `StyleSheet.create` calls, module constants, and transitive imports — are all **evaluated at startup** because they are eagerly imported. A customer pays the parse-and-eval cost of all 15 admin screens and all 6 vendor screens on every cold start.

**Fix:** `React.lazy` + `Suspense` for the role stacks, or at minimum split the navigator so role stacks are separate modules (which N-1's fix gives you for free).

#### N-5 · **MEDIUM** · `options={{animation:'slide_from_right'}}` repeated 88 times

Identical `options` prop on 88 of 89 `<Stack.Screen>` declarations, ~350 lines of pure noise in a 654-line file.

**Fix:** One line — `screenOptions={{headerShown: false, animation: 'slide_from_right'}}` on `<Stack.Navigator>`. This alone removes ~350 lines.

#### N-6 · **MEDIUM** · No deep linking configuration

`NavigationContainer` has no `linking` prop. There is no `intent-filter` for `VIEW`/`BROWSABLE` in `AndroidManifest.xml` and no `CFBundleURLTypes` in `Info.plist`. The app cannot open from a push notification payload, an email verification link, a shared prescription URL, or a payment-gateway return redirect.

For an app with OTP verification, order tracking, and (eventually) a payment gateway callback, deep linking is not optional — a bKash/Nagad redirect flow **requires** it.

#### N-7 · **LOW** · `RootStackParamList` is a 159-entry flat union

All 89 route params in one type. Splitting per role stack makes each list comprehensible and makes cross-role `navigate()` calls a compile error rather than a runtime surprise.

---

## 5. Code Reusability

### 5.1 Duplication measurement

I ran a normalised 8-line sliding-window clone detector across all 212 source files (whitespace-normalised, comments stripped, windows under 120 chars ignored):

| Metric | Value |
|---|---|
| Total 8-line windows analysed | 46,925 |
| Distinct windows appearing in **2+ different files** | **2,734** |
| Cross-file clone signal | **5.8%** |

5.8% is the *cross-file* rate only — it excludes duplication *within* a file, so true duplication is meaningfully higher.

### 5.2 The worst offenders

| Shared windows | File pair |
|---:|---|
| **773** | `admin/AdminDoctorEditScreen.tsx` ↔ `doctor/DoctorEditProfileScreen.tsx` |
| 271 | `home/ReportDetailsView.tsx` ↔ `home/ReportPreview.tsx` |
| 115 | `admin/AdminMedicinesScreen.tsx` ↔ `admin/AdminVendorsScreen.tsx` |
| 105 | `home/AlertsScreen.tsx` ↔ `home/RemindersScreen.tsx` |
| 102 | `home/ChooseFromGalleryScreen.tsx` ↔ `home/ChooseFromReportGalleryScreen.tsx` |
| 101 | `home/AddReportMenuScreen.tsx` ↔ `home/UploadReportOptionsMenuScreen.tsx` |
| 90 | `home/OrderCompletedDetailsScreen.tsx` ↔ `home/OrderTrackingScreen.tsx` |
| 70 | `home/SavedReportScreen.tsx` ↔ `home/ViewReportDetailsScreen.tsx` |
| 64 | `home/AddFamilyMemberScreen.tsx` ↔ `home/EditProfileScreen.tsx` |
| 58 | `auth/MedicalHistoryScreen.tsx` ↔ `auth/PatientInformationScreen.tsx` |
| 54 | `admin/AdminProfileScreen.tsx` ↔ `vendor/VendorPharmacyProfileScreen.tsx` |
| 53 | `home/ChooseFromPharmacyGalleryScreen.tsx` ↔ `home/ChooseFromReportGalleryScreen.tsx` |

**`AdminDoctorEditScreen` (1,177 lines) and `DoctorEditProfileScreen` (1,329 lines) share 773 identical 8-line windows.** These are the same screen copy-pasted — one for the doctor editing their own profile, one for an admin editing a doctor's profile. Every bug fixed in one must be manually mirrored in the other. Together they are **2,506 lines, 4.1% of the entire codebase**, that should be **one** component with an `editorRole: 'SELF' | 'ADMIN'` prop.

Similarly, `ReportDetailsView` + `ReportPreview` (1,845 lines) share 271 windows — one component with a `mode` prop.

### 5.3 R-1 · **CRITICAL** · The design system is dead code

| Metric | Value |
|---|---|
| Hardcoded hex color literals in `.tsx` | **4,010** |
| Distinct hex colors | **334** |
| Files importing `src/theme/*` | **1** (only `SplashScreen.tsx`) |

`src/theme/` (colors, spacing, typography — 72 lines) exists, is well-designed, and is **used by exactly one file out of 135**.

The consequence is that the brand has no single color. Here are the teals actually in use, all clearly meant to be "the brand green":

```
#0D9488  ×166      #45A096  ×149      #4E929D  ×113
#4DA69F  ×70       #3EA08F  (nav bars, both files)
```

Five different primary colors. Meanwhile `theme/colors.ts` declares `primary: '#0B7A5A'` — **a sixth value that appears nowhere in the app.**

Greys are worse — `#424242`, `#616161`, `#333333`, `#212121`, `#1E293B`, `#1A1C1E`, `#64748B`, `#7E8B97`, `#94A3B8`, `#475569`, `#9AA6B2`, `#A0A5BA` are all in active use for what is presumably the same set of 3–4 text roles. A dark-mode implementation is currently impossible without touching 4,010 literals.

**Fix (highest ROI in this report):**

1. Extract the real palette from Figma into `theme/colors.ts` — semantic roles (`text.primary`, `surface.raised`, `brand.default`), not raw names.
2. Codemod the top 30 hex values (which cover the large majority of the 4,010 occurrences) to token references. A `jscodeshift` script or even careful `sed` per color handles this mechanically.
3. Add an ESLint rule to prevent regression:

```js
'no-restricted-syntax': ['error', {
  selector: "Literal[value=/^#[0-9a-fA-F]{3,8}$/]",
  message: 'Use a token from src/theme/colors instead of a hex literal.',
}]
```

### 5.4 R-2 · **CRITICAL** · The app references a font it does not ship

**116 references** to `ProximaNova-Regular` / `-Medium` / `-Semibold` / `-Bold` across **30 files**, each file re-declaring the same block:

```ts
// repeated verbatim in 30 files
const FONT = {
  regular: 'ProximaNova-Regular',
  medium: 'ProximaNova-Medium',
  semibold: 'ProximaNova-Semibold',
  bold: 'ProximaNova-Bold',
} as const;
```

`find . -iname "*.ttf" -o -iname "*.otf"` (excluding `node_modules` and build output) finds **zero Proxima Nova files**. There is no `react-native.config.js` declaring an assets path.

**Every one of those 116 font references silently falls back to the system font.** The app does not currently render in its intended typeface on either platform, and nobody has noticed because the fallback is graceful. The entire typographic design is not shipping.

**Fix:**

1. Add the licensed Proxima Nova `.ttf` files to `src/assets/fonts/`.
2. Create `react-native.config.js`:
   ```js
   module.exports = { assets: ['./src/assets/fonts/'] };
   ```
3. Run `npx react-native-asset`.
4. Delete all 30 local `FONT` consts; export one from `src/theme/typography.ts`.

> ⚠️ **Licensing:** Proxima Nova is a commercial typeface. Confirm you hold a mobile-app embedding licence before shipping it.

### 5.5 R-3 · **HIGH** · Four duplicated bottom navigation bars

`AdminBottomNav` (132) + `VendorBottomNav` (102) + `DoctorBottomNav` (81) + `HomeBottomNav` + `RoleBottomNav` (101). The Admin and Vendor versions are near-identical — same `StyleSheet` (same `borderTopLeftRadius: 24`, same `shadowColor: '#040620'`, same `shadowOpacity: 0.06`, same `elevation: 12`), same `#3EA08F`/`#9E9E9E` active/inactive colors, same map-over-tabs render, differing only in a hardcoded `switch` of route names and a couple of sizes. A comment in `AdminBottomNav.tsx:88` literally reads *"Same chrome as the vendor bar."*

**Fix:** One `<BottomNav tabs={TABS} />` driven by the existing `adminNav.ts` / `vendorNav.ts` / `doctorNav.ts` config arrays — which already exist and already hold the route names. Better still, delete all of it and use `@react-navigation/bottom-tabs` with `tabBarIcon` (see N-3).

### 5.6 R-4 · **HIGH** · No shared screen scaffolding

| Pattern | Duplicated across |
|---|---|
| `useSafeAreaInsets()` + manual inset math | **94 files** |
| Custom back-arrow header (`chevron-left`/`arrow-left`) | **75 files** |
| `ActivityIndicator` loading state | **78 files** |
| `StyleSheet.create` | **130 of 135 `.tsx` files** |
| `Alert.alert` error handling | **260 call sites** |
| `HeaderWithLogo` (the one shared header that exists) | **1 file** |

75 hand-rolled back headers is roughly 75 × 40 = **~3,000 lines** that should be one `<ScreenHeader title back />` component.

**Fix — build these six components first.** They will delete an estimated 8,000–12,000 lines:

```
<Screen>            SafeArea + insets + status bar + scroll container  (replaces 94 copies)
<ScreenHeader>      back arrow + title + right slot                    (replaces 75 copies)
<AsyncBoundary>     loading / error / empty / retry states             (replaces 78 copies)
<Card>              the surface + radius + shadow combination
<Badge>             status pills (order status, appointment status)
<PrimaryButton>     the brand CTA
```

### 5.7 R-5 · **MEDIUM** · Style blocks dominate screen files

`MyProfileScreen.tsx` — 825 of 1,828 lines (45%) are `StyleSheet.create`. `HomeScreen.tsx` — 717 of 1,520 (47%). Most repeated literal style values across the codebase:

```
fontWeight: '600'         ×348      paddingHorizontal: 16   ×193
fontSize: 14              ×189      fontWeight: '700'       ×164
backgroundColor: '#FFFFFF'×156      borderRadius: 12        ×128
```

**Fix:** Move shared style primitives to `theme/`; consider `StyleSheet` composition or a utility layer (`restyle`/`unistyles`) for the repeated spacing/typography combinations.

---

## 6. Security

> **Scope note:** The backend was not audited. Several findings below depend on server-side enforcement I could not verify. Where that is the case I say so explicitly — but *client-side defence is absent in every one of them*, which is itself the finding.

### 6.1 Critical

#### S-1 · **CRITICAL** · Release builds are signed with the debug keystore

```gradle
// android/app/build.gradle:114-121
release {
    // Caution! In production, you need to generate your own keystore file.
    signingConfig signingConfigs.debug            // ← the debug keystore
    minifyEnabled enableProguardInReleaseBuilds   // ← false
    ...
}
```

The debug keystore (`storePassword 'android'`, `keyAlias 'androiddebugkey'`) ships with the Android SDK and is **identical on every developer machine on earth**. Anyone can build and sign an APK that Android considers the same application as yours.

Impact:

- Google Play **rejects** debug-signed uploads. The app cannot be published.
- If distributed as a sideloaded APK, an attacker can produce a malicious build that installs as a legitimate update over yours.
- Any signature-based integration (Google Maps SHA-1 restriction, Firebase, social login) is bound to a keystore everyone possesses.
- Once you switch to a real keystore, existing installs cannot upgrade — they must uninstall first. **Fix this before any user has the app.**

**Fix:**

```gradle
signingConfigs {
    release {
        storeFile     file(System.getenv("CHOLBE_KEYSTORE") ?: "release.keystore")
        storePassword System.getenv("CHOLBE_STORE_PASSWORD")
        keyAlias      System.getenv("CHOLBE_KEY_ALIAS")
        keyPassword   System.getenv("CHOLBE_KEY_PASSWORD")
    }
}
buildTypes { release { signingConfig signingConfigs.release } }
```

Generate the keystore, store it in a secrets manager (never in git — `.gitignore` already excludes `*.keystore`), and enable Play App Signing.

#### S-2 · **CRITICAL** · No client-side authorization; admin surface fully reachable

See **N-1**. All 15 admin screens and 6 vendor screens are mounted in the same stack available to a signed-in customer. `getHomeRouteForRole()` picks a starting screen; it does not restrict anything. No screen contains a role assertion.

If the backend has a gap on even one admin endpoint, the fully-functional admin UI is already installed on every customer's phone, ready to drive it.

**Fix:** Role-scoped navigators (N-1) **and** a server-side authorization test per admin/vendor endpoint. Defence in depth — neither alone is sufficient.

### 6.2 High

#### S-3 · **HIGH** · Session token and PHI in plaintext AsyncStorage

```ts
// src/api/tokenStorage.ts
await AsyncStorage.setItem('@cholbe/access_token', accessToken);
await AsyncStorage.setItem('@cholbe/user', JSON.stringify(user));
```

AsyncStorage is an unencrypted SQLite/plist file. On a rooted/jailbroken device or via an ADB backup, both the bearer token and the user record are readable. For an app handling prescriptions, medical history, and consultations, this is **protected health information at rest with no encryption**.

Compounding issues in the same file:

- **No token expiry is stored or checked.** `hasSession()` returns `Boolean(token)` — a token expired six months ago still reads as a valid session, so `App.tsx:78` sends the user straight to the main app, where every request then 401s.
- **No refresh token.** The server issues only `accessToken` (`src/api/auth.ts:7`), so sessions cannot be renewed; either the token lives dangerously long or users are silently logged out.

**Fix:**

1. Move the token to the OS keystore — `react-native-keychain` (Android Keystore / iOS Keychain) — or use `react-native-mmkv` with encryption.
2. Store `expiresAt` alongside; have `hasSession()` verify it.
3. Add refresh-token rotation server-side.
4. Set `android:allowBackup="false"` — ✅ **already correctly set** in your manifest.

#### S-4 · **HIGH** · No 401 handling — expired sessions never log the user out

`performLogout()` exists (`src/auth/sessionControl.ts`) but is called from **exactly four places**, all of them a "Log out" button on a profile screen:

```
AdminProfileScreen.tsx:208   DoctorProfileScreen.tsx:189
MyProfileScreen.tsx:242      VendorPharmacyProfileScreen.tsx:854
```

`apiRequest` (`src/api/client.ts:66-77`) throws `ApiError` for any non-OK status and **never inspects `401`**. When the token expires, every screen shows its own `Alert.alert` with a server error message, forever, and the user is trapped in an app that cannot function until they find the logout button.

**Fix — 5 lines in `client.ts`:**

```ts
if (response.status === 401 && auth) {
  await performLogout();
  throw new ApiError('Your session expired. Please sign in again.', 401, data);
}
```

#### S-5 · **HIGH** · Client self-confirms payment; no payment gateway

```ts
// src/screens/home/CartPaymentScreen.tsx:71-77
const order = await ordersApi.checkout({ paymentMethod: uiPaymentToApi(selectedMethod), ... });
if (selectedMethod !== 'COD') {
  await ordersApi.confirmPayment(order.id);   // ← client asserts payment succeeded
}
```

Selecting bKash, Nagad, or Card does not open any payment SDK, gateway webview, or redirect. The client simply calls `POST /orders/:id/payment/confirm`. The bKash and Nagad "icons" are `<View>`s with a hardcoded background color and a single letter of text (`CartPaymentScreen.tsx:94-108`) — placeholders, not integrations.

If the backend marks the order paid on this call, **any user can obtain goods for free** by placing an order and letting the app confirm it. I could not verify the backend, but there is no mechanism in the client by which real money moves.

**Fix:** Integrate the real bKash/Nagad checkout (hosted redirect + server-verified callback). Payment status must **only** ever be set by a server-to-server webhook from the PSP. Remove `ordersApi.confirmPayment` from the client entirely.

#### S-6 · **HIGH** · Google Maps API key embedded and used for the Geocoding Web Service

```ts
// src/config/googleMaps.ts  (gitignored ✅, but compiled into the JS bundle)
export const GOOGLE_MAPS_API_KEY = 'AIzaSy...';
```

Used at `src/utils/geocoding.ts:145` to call `https://maps.googleapis.com/maps/api/geocode/json?...&key=${KEY}` directly from the device.

Two separate problems:

1. **The key is in the JS bundle.** `.gitignore` keeps it out of git (good — and `secrets.properties` + `resValue` for the native Maps SDK key is the correct pattern, also good), but any release APK can be unzipped and the bundle string-searched in seconds.
2. **Geocoding Web Service keys cannot be restricted by Android app signature or iOS bundle ID** — Google only supports *IP address* restriction for Web Service APIs. A key shipped in an app for Geocoding is therefore **inherently unrestrictable** and can be extracted and used freely against your billing account.

**Fix:** Proxy geocoding through your own backend — `GET /api/v1/geocode?lat=..&lng=..`. The key lives server-side, is IP-restricted to your VPS, and you can rate-limit per user. Keep only the *native* Maps SDK key on-device (that one *can* be signature-restricted, and your `secrets.properties` setup already does it correctly).

Also note `src/utils/geocoding.ts:140` currently compares the key against `'your_google_maps_api_key_here'`, which `tsc` flags as a comparison with no overlap — the placeholder guard is dead code.

### 6.3 Medium

#### S-7 · **MEDIUM** · OTP codes displayed in an alert with no `__DEV__` guard

```ts
// ForgotPasswordScreen.tsx:43, OTPVerificationMethodScreen.tsx:38, VerificationScreen.tsx:79
if (res.debugCode) {
  Alert.alert('OTP sent', `Dev code: ${res.debugCode}`);
}
```

Three screens will render an OTP on-screen whenever the server includes `debugCode` in the response. The root fault is server-side (production must never return it), but the client has no second line of defence.

**Fix:** `if (__DEV__ && res.debugCode)`. Also remove `debugCode` from the production API response.

#### S-8 · **MEDIUM** · `Linking.openURL` with unvalidated server-supplied URLs

```ts
// ConsultationChatScreen.tsx:729
if (attachmentUrl) void Linking.openURL(attachmentUrl);
```

Also `ReportDetailsView.tsx:126`, `ReportPreview.tsx:99`. A chat attachment URL controlled by the other party in a consultation is passed straight to `openURL`, which will happily launch `tel:`, `sms:`, `intent://`, or an arbitrary deep link into another installed app.

**Fix:** Validate the scheme is `https:` and, ideally, that the host matches `API_ORIGIN` before opening.

#### S-9 · **MEDIUM** · ProGuard/R8 disabled in release

```gradle
def enableProguardInReleaseBuilds = false
```

No minification and no obfuscation of the native/Java layer, and a larger APK. For a health app, shipping unobfuscated is a needless disclosure of internal structure.

**Fix:** Set to `true`, add the necessary `-keep` rules for Agora, react-native-maps, ML Kit, and Nitro modules, then test the release build end-to-end.

#### S-10 · **MEDIUM** · No certificate pinning

All traffic goes to a single known host (`cholbeapi.pino7.com`) over HTTPS. Cleartext is correctly disabled for release (`usesCleartextTraffic: "false"`) and iOS ATS is correctly locked down — both good. But there is no pinning, so a user-installed or malicious root CA can MITM all PHI traffic.

**Fix:** Add `network_security_config.xml` with a `<pin-set>` for the API host (pin the leaf and a backup), plus the iOS equivalent. Given the sensitivity of the data, this is warranted.

#### S-11 · **MEDIUM** · Weak password policy

Minimum length 8 (`CreateHealthProfileScreenUpdated.tsx:93`) with no complexity, no breach check, and no strength meter. For accounts holding medical records this is below current guidance (NIST SP 800-63B recommends ≥8 with a breached-password check, or longer minimums without).

**Fix:** Raise to 10–12, screen against the Have I Been Pwned k-anonymity API server-side, and add a strength indicator.

### 6.4 Low / Informational

#### S-12 · **LOW** · Dependency vulnerabilities are all dev-tooling

`npm audit`: **19 total — 0 critical, 8 high, 9 moderate, 2 low.**

All of them are in `@react-native-community/cli`, `metro`, and their transitive deps (`brace-expansion`, `js-yaml`, `nanoid`, `shell-quote`, `image-size`, `fast-xml-parser`, `launch-editor`). These are **devDependencies — none ship in the app binary**. The practical risk is limited to developer machines and CI.

Worth noting: `launch-editor` (NTLMv2 hash disclosure via UNC paths on Windows) is directly relevant since this project is developed on Windows.

**Fix:** `npm audit fix`, then re-run. Not urgent, but keep it clean so real runtime advisories aren't lost in the noise.

#### S-13 · **LOW** · Broad location permission

`ACCESS_FINE_LOCATION` is requested for delivery-address selection. `ACCESS_COARSE_LOCATION` is likely sufficient and is a lighter privacy ask. There is also no Prominent Disclosure flow, which Google Play requires for location.

#### S-14 · **INFO** · No privacy policy, consent, or data-deletion flow

For an app processing medical records and operating in Bangladesh (and potentially subject to GDPR for any EU users), there is no in-app privacy policy link, no consent capture, and no account-deletion path. **Google Play now requires an in-app account-deletion route for any app with account creation.** This will block publication.

---

## 7. Performance

### 7.1 Startup & bundle size

#### P-1 · **HIGH** · ~2 MB of unused icon fonts shipped

`android/app/build.gradle:4` applies `react-native-vector-icons/fonts.gradle` with no `iconFontNames` filter, bundling **all 19 icon fonts = 3.71 MB**.

Actually used across 172 import sites:

| Family | Imports | Font size |
|---|---:|---:|
| Feather | 103 | 54 KB |
| MaterialCommunityIcons | 49 | 1,120 KB |
| FontAwesome | 17 | 161 KB |
| MaterialIcons | 3 | 348 KB |
| **Used total** | **172** | **1.68 MB** |
| **Shipped total** | | **3.71 MB** |
| **Wasted** | | **~2.03 MB** |

**Fix:**

```gradle
project.ext.vectoricons = [
    iconFontNames: ['Feather.ttf', 'MaterialCommunityIcons.ttf',
                    'FontAwesome.ttf', 'MaterialIcons.ttf']
]
apply from: file("../../node_modules/react-native-vector-icons/fonts.gradle")
```

`MaterialIcons` is used only 3 times (all in `AdminBottomNav`) for 348 KB — migrating those 3 icons to Feather saves another 348 KB.

#### P-2 · **HIGH** · A 1.37 MB PNG in the bundle

`src/assets/` is **2.47 MB** across 25 files, and one file is **53% of it**:

| Size | File |
|---:|---|
| **1,366 KB** | `logoImage.png` |
| 323 KB | `home_profile_bg.png` |
| 199 KB | `splash.png` |
| 149 KB | `b2.png` |
| 138 KB | `b4.png` |
| 102 KB | `b3.png` |

A 1.37 MB logo is almost certainly a full-resolution export displayed at a fraction of its size. There are no `@2x`/`@3x` density variants anywhere, so the same full-size asset decodes on every device.

**Fix:**

1. Convert to WebP (typically 25–35% of PNG size at equal quality) — RN supports WebP on both platforms.
2. Generate `@2x`/`@3x` variants and drop the oversized base.
3. Run all 25 assets through `pngquant`/`sharp`.

Realistic saving: **~1.8 MB of the 2.47 MB.**

#### P-3 · **MEDIUM** · Universal APK includes emulator architectures

```properties
reactNativeArchitectures=armeabi-v7a,arm64-v8a,x86,x86_64
```

`x86`/`x86_64` are emulator-only and add substantial native-library weight (Agora, Maps, ML Kit, Hermes all ship per-ABI `.so` files). Your `build:apk` npm scripts do override this with `-PreactNativeArchitectures=arm64-v8a`, so scripted builds are fine — but a plain `./gradlew assembleRelease` (or any CI job that doesn't use your script) produces a bloated universal APK.

**Fix:** Ship an **Android App Bundle** (`bundleRelease`) so Play does per-device ABI splitting automatically, and drop `x86,x86_64` from `gradle.properties` for release variants.

#### P-4 · **MEDIUM** · All 89 screens evaluated at startup

See N-4. Every screen module — including 15 admin and 6 vendor screens a customer will never see — is parsed and its top-level `StyleSheet.create` executed on cold start.

### 7.2 Runtime

#### P-5 · **HIGH** · `ScrollView` + `.map()` instead of virtualised lists

Only **4 files** use `FlatList`/`SectionList`. Meanwhile these screens render lists by mapping inside a `ScrollView`, which mounts **every** row at once with no recycling:

| `.map()` calls | Screen |
|---:|---|
| 12 | `doctor/DoctorEditProfileScreen.tsx` |
| 11 | `admin/AdminHomeScreen.tsx` |
| 11 | `admin/AdminDoctorEditScreen.tsx` |
| 10 | `vendor/VendorHomeScreen.tsx` |
| 8 | `vendor/VendorOrdersScreen.tsx` |
| 8 | `home/MyProfileScreen.tsx` |
| 7 | `home/PharmacyDetailsScreen.tsx`, `admin/AdminReportsScreen.tsx`, `admin/AdminOrdersScreen.tsx` |
| 6 | `home/CartCheckoutDetailsScreen.tsx`, `admin/AdminUsersScreen.tsx` |

`AdminUsersScreen` maps over the full user list. `AdminOrdersScreen` maps over all orders. With a few hundred records these screens will visibly jank; with a few thousand they will run out of memory.

**Fix:** Convert every unbounded, data-driven list to `FlatList` (or `@shopify/flash-list` for the heavy ones) with `keyExtractor`, `getItemLayout` where row height is fixed, and `windowSize` tuning. Short fixed lists (a 5-item settings menu) are fine as `.map()`.

#### P-6 · **HIGH** · No pagination on any endpoint

Every list API fetches the complete collection:

```
addresses.list()   appointments.list()   medications.list()   medicines.list()
notifications.list()   orders.list()   prescriptions.list()   reports.list()
specialties.list()   vendorProducts.list()   pharmacy.list()   doctors.list()
```

The single exception is `doctors.reviews(id, limit = 20)`.

Combined with P-5, an admin opening `AdminUsersScreen` downloads and renders **every user in the system**. This degrades continuously as the product succeeds.

**Fix:** Add cursor pagination server-side; on the client use TanStack Query's `useInfiniteQuery` with `FlatList`'s `onEndReached`.

#### P-7 · **MEDIUM** · Chat re-fetches the entire message history every 5 seconds

```ts
// ConsultationChatScreen.tsx:196-227
const POLL_MS = 5000;
const [context, list] = await Promise.all([
  consultationsApi.context(appointmentId),
  consultationsApi.listMessages(appointmentId),   // full history, every 5s
]);
setMessages(list);   // replaces the entire array → full re-render
```

During a 30-minute consultation that is **360 full-history downloads** and 360 complete list re-renders, on a mobile connection, while a video call is running.

**Fix:** WebSocket (Socket.IO) for live messages. If polling must stay short-term: add an `?after=<lastMessageId>` cursor, append rather than replace, and back off the interval when the screen is not focused.

#### P-8 · **MEDIUM** · Global 30-second notification poll

`NotificationContext.tsx:31` polls `/notifications/unread-count` every 30s for the entire app lifetime — **2,880 requests per device per day**, plus one on every `AppState` → active transition.

**Fix:** Push notifications (FCM/APNs) for the badge. If polling stays, pause it when `AppState !== 'active'` (currently the interval keeps firing in the background) and raise the interval to 2–5 minutes.

#### P-9 · **MEDIUM** · Impure state updaters with side effects

```ts
// src/hooks/useAgoraRtc.ts:150-160
const toggleMute = useCallback(() => {
  setState(prev => {
    const nextMuted = !prev.muted;
    engine.muteLocalAudioStream(nextMuted);   // ← side effect inside the updater
    return {...prev, muted: nextMuted};
  });
}, [engine]);
```

Same pattern in `toggleVideo` (which calls `enableLocalVideo`, `muteLocalVideoStream`, `startPreview`/`stopPreview` inside the updater). React may invoke a state updater more than once — guaranteed in StrictMode, and permitted in concurrent rendering. Each extra invocation fires the Agora call again, so mute can toggle twice and land back where it started.

**Fix:** Compute the next value outside, call the engine, then `setState`.

#### P-10 · **MEDIUM** · Almost no memoization at component boundaries

`React.memo` appears **4 times** across 135 components, against 138 `useCallback` and 47 `useMemo`. The callbacks are largely wasted effort: passing a stable `onPress` to an unmemoized child re-renders it anyway. In `ScrollView + .map()` lists this means every row re-renders on every parent state change — and with 34–48 `useState` per screen, parent state changes constantly.

**Fix:** Extract list rows into `React.memo` components. This is the change that makes the existing `useCallback` work pay off.

#### P-11 · **LOW** · No image caching or resizing

`ProductImage.tsx` uses the bare RN `<Image>`. No disk cache beyond the platform default, no progressive loading, no thumbnail variants. Product grids re-download full-size images on every mount.

**Fix:** `react-native-fast-image` or `expo-image`, plus server-side thumbnail generation.

---

## 8. Weaknesses — Code Quality, Build & Process

### 8.1 Q-1 · **CRITICAL** · The project does not typecheck — 40 `tsc` errors

`npx tsc --noEmit` reports **40 errors across 31 files**. This means CI cannot gate on types, and real bugs are hiding in the noise. Affected files span every layer:

```
src/api/orders.ts                     src/components/ReportFilePreview.tsx
src/utils/geocoding.ts                src/utils/pharmacyHelpers.ts
13 × src/screens/admin/*              6 × src/screens/vendor/*
4 × src/screens/doctor/*              5 × src/screens/home/*
```

**Three of these are live bugs, not just type noise:**

**(a) Card payments are broken.**

```ts
// src/api/orders.ts:59-64  →  error TS2322: Type '"Card"' is not assignable to type 'PaymentMethod'
export function uiPaymentToApi(method: 'COD' | 'bKash' | 'Nagad' | 'Card'): PaymentMethod {
  if (method === 'bKash') return 'BKASH';
  if (method === 'Nagad') return 'NAGAD';
  return method;              // 'Card' falls through — should be 'CARD'
}
```

`PaymentMethod` is `'COD' | 'BKASH' | 'NAGAD' | 'CARD'`. Selecting "Card" at checkout (`CartPaymentScreen.tsx:71`) sends the literal string `"Card"`, which the API will reject. **Card checkout cannot currently succeed.**

Fix: `if (method === 'Card') return 'CARD'; return 'COD';`

**(b) Vendor dashboard type mismatch.**
`VendorDashboard` is missing `recentProducts` and `recentOrders` from `DashboardData` — the vendor home screen reads fields the API type does not provide.

**(c) Vendor payments filter is broken.**
`VendorPaymentsScreen.tsx:397` passes a date-range value into a setter that also expects a status value; the two filter states have been crossed. Selecting "Pending" will not do what it appears to do.

The remaining ~30 are two mechanical families, each fixable in one pass:

- `NativeStackNavigationProp<RootStackParamList, "VHome">` not assignable to `NativeStackNavigationProp<RootStackParamList>` (×7) — the bottom-nav prop types are over-specified; widen to `NavigationProp<RootStackParamList>`. `RoleBottomNav.tsx:66` already contains a comment acknowledging and casting around this.
- `ViewStyle` passed where `ImageStyle` is expected, and `overflow: 'scroll'` on an image style (×~10) — genuine style-type mismatches in `ReportFilePreview` and the gallery screens.

**Fix:** Fix the three bugs, then the two mechanical families, then add `npx tsc --noEmit` to CI as a required check so this never recurs.

### 8.2 Q-2 · **HIGH** · 147 ESLint problems

| Count | Rule | Severity |
|---:|---|---|
| 64 | `react-native/no-inline-styles` | Warning |
| **43** | `@typescript-eslint/no-unused-vars` | **Error** |
| 35 | `no-void` | Warning |
| **4** | `react-hooks/exhaustive-deps` | **Error** |
| 1 | `@typescript-eslint/no-shadow` | Warning |

The 4 `exhaustive-deps` errors are stale-closure bugs waiting to fire:

```
AddressMapPickerScreen.tsx:88     useCallback missing 'regionDraft'
CartCheckoutDetailsScreen.tsx:230 useEffect missing 'route.params'
DoctorListScreen.tsx:102          useCallback missing 'specialties.length'
WaitingRoomScreen.tsx:114         useMemo has unnecessary dependency 'countdown'
```

`CartCheckoutDetailsScreen` missing `route.params` is the concerning one — a checkout screen that will not react to changed navigation params (e.g. a newly selected address).

The 43 unused-variable errors indicate dead code left behind after refactors — including `Alert` imported but unused in `geocoding.ts:1`.

### 8.3 Q-3 · **CRITICAL** · There is essentially no test suite

```
__tests__/App.test.tsx    267 bytes    ← the React Native template default
```

**One test file, 267 bytes, for 61,101 lines of code.** Effective coverage ≈ 0%.

Untested, and each capable of causing real harm: checkout and payment, medication schedule creation (**wrong dosage data is a patient-safety issue**), prescription OCR parsing, the auth/OTP state machine, and role routing.

**Fix — in priority order:**

1. **`src/api/` unit tests** (fetch mocked). 2,491 lines, pure functions, highest value per hour. Start with `uiPaymentToApi` — a 3-line test would have caught Q-1(a).
2. **`src/utils/` unit tests** — `medicationDraft.ts`, `reportFormat.ts`, `pharmacyHelpers.ts`, `geocoding.ts` are all pure and trivially testable.
3. **Component tests** with `@testing-library/react-native` for the checkout flow and the auth state machine.
4. **E2E** with Maestro (far lighter than Detox) for: sign-in → browse → add to cart → checkout, and book → join video consultation.

Target ≥60% on `api/` and `utils/` before adding features.

### 8.4 Q-4 · **MEDIUM** · No CI/CD

No `.github/workflows`, no `fastlane`, no build pipeline. Nothing prevents the 40 type errors, 44 lint errors, or a debug-signed release from reaching a build.

**Fix — minimum viable pipeline:**

```yaml
# .github/workflows/ci.yml
- run: npm ci
- run: npx tsc --noEmit          # gate on Q-1
- run: npx eslint . --max-warnings 0
- run: npm test -- --coverage
- run: cd android && ./gradlew assembleRelease
```

### 8.5 Q-5 · **MEDIUM** · Version numbers are frozen at the template defaults

```gradle
versionCode 1
versionName "1.0"
```

Never incremented across 7 commits. Play Store requires a monotonically increasing `versionCode` for every upload.

**Fix:** Derive from the CI build number or git tags; automate with `react-native-version` or a Gradle snippet.

### 8.6 Q-6 · **MEDIUM** · Repository hygiene

| Signal | Value |
|---|---|
| Total commits | **7** |
| Commits messaged literally `update` | **5** of 7 |
| Uncommitted changes right now | **69 files** |
| Branches | `main`, `nasir65` |

Five of seven commits say `update` and one says `Update UI Design`. There is no traceability — you cannot bisect, cannot attribute a regression, cannot review a change in isolation. With 69 files currently dirty, a single further commit will bundle changes across navigation, admin, vendor, auth, and home into one unreviewable blob.

**Fix:** Conventional Commits (`feat:`, `fix:`, `perf:`), one logical change per commit, PRs into `main` with the CI gate from Q-4.

### 8.7 Q-7 · **LOW** · Comment density of 0.7%

409 comment lines / 57,316 SLOC. The comments that *do* exist are good — `RoleBottomNav.tsx:22-27` and `roleRoutes.ts` explain genuine "why". There are simply almost none, and no JSDoc on the 25 exported API modules.

**Fix:** Don't comment the obvious. Do add: a short module header on each `api/` file, a `README.md` in `src/` describing the layer boundaries, and "why" comments on the non-obvious flows (the `App.tsx` phase machine, the checkout session singleton, the Agora lifecycle).

### 8.8 Q-8 · **INFO** · The AI symptom checker is static placeholder data

```ts
// src/screens/aisymptom/data/SymptomResultScreen/symptomResults.ts:34
// Placeholder results until the backend scores the intake.
export const CONDITION_SUGGESTIONS: ConditionSuggestion[] = [
  { id: 'migraine', name: 'Migraine', confidence: 80, ... },
```

The `aisymptom` module makes **no API calls** — the entire 2,427-line flow collects the user's answers into `SymptomIntake` and then renders a hardcoded list with a hardcoded 80% confidence, regardless of input.

The code is clearly and honestly marked as a placeholder, and the module is the best-organised in the codebase — this is noted for **release-readiness**, not as a defect. But shipping a screen headed *"Here's what I think it might be"* with fabricated confidence percentages for a medical condition would be a serious safety and regulatory problem.

**Fix:** Wire `SymptomIntake` to a real backend scoring endpoint before this flow is exposed to users. Add a prominent medical disclaimer and a "this is not a diagnosis" interstitial regardless.

---

## 9. Prioritised Remediation Roadmap

Effort estimates assume one experienced React Native engineer.

### 🔴 Phase 0 — Release blockers (1 week)

| # | Action | Effort |
|---|---|---|
| S-1 | Generate a real release keystore; wire env-var signing; enable Play App Signing | 4h |
| Q-1a | Fix `uiPaymentToApi` — card checkout is broken | 15m |
| S-4 | Add 401 → auto-logout in `apiRequest` | 30m |
| S-7 | Guard OTP `debugCode` behind `__DEV__` | 15m |
| Q-1 | Clear the remaining 39 `tsc` errors | 1–2d |
| Q-2 | Clear 44 ESLint errors (incl. 4 `exhaustive-deps`) | 4h |
| S-14 | Add privacy policy link + account-deletion flow (Play requirement) | 1d |
| Q-4 | CI: `tsc` + `eslint` + `test` as required checks | 3h |

### 🟠 Phase 1 — Security & correctness (2–3 weeks)

| # | Action | Effort |
|---|---|---|
| N-1 / S-2 | Split into role-scoped navigators; remove cross-role screen access | 3–4d |
| S-3 | Move token + user to `react-native-keychain`; store and check `expiresAt` | 1–2d |
| S-5 | Integrate real bKash/Nagad checkout; remove client `confirmPayment` | 1–2w |
| S-6 | Proxy geocoding through the backend; rotate the exposed key | 1d |
| S-9 | Enable R8/ProGuard; add keep-rules; verify release build | 1d |
| S-10 | Certificate pinning (Android `network_security_config` + iOS) | 1d |
| A-4 | Error boundary + Sentry/Crashlytics | 1d |
| Q-3 | Test suite for `api/` + `utils/` to ≥60% | 1w |

### 🟡 Phase 2 — Architecture (3–4 weeks)

| # | Action | Effort |
|---|---|---|
| A-1 | Adopt TanStack Query across all 92 fetch sites | 1–2w |
| N-2 | Move the auth phase machine into an `AuthStack` navigator | 3d |
| N-3 | Replace 4 bottom navs with `@react-navigation/bottom-tabs` | 2–3d |
| N-6 | Deep linking config (required before payment redirects) | 1d |
| A-2 | React Hook Form for the 48/43/34-`useState` screens | 1w |
| A-3 | Move `checkoutSession` + `sessionControl` into Context | 1d |
| A-5 | Path aliases + barrel exports | 4h |
| P-7 | WebSocket for consultation chat | 3–4d |
| P-6 | Cursor pagination on all list endpoints (needs backend) | 1w |

### 🟢 Phase 3 — Reusability & performance (4–6 weeks)

| # | Action | Est. lines removed |
|---|---|---|
| R-1 | Real design tokens + codemod 4,010 hex literals + lint rule | ~1,000 |
| R-2 | Ship Proxima Nova; delete 30 duplicated `FONT` consts | ~200 |
| R-4 | Build `<Screen>`, `<ScreenHeader>`, `<AsyncBoundary>`, `<Card>`, `<Badge>`, `<PrimaryButton>` | **~8,000–12,000** |
| 5.2 | Merge `AdminDoctorEditScreen` + `DoctorEditProfileScreen` (773 shared windows) | ~1,200 |
| 5.2 | Merge `ReportDetailsView` + `ReportPreview` (271 shared windows) | ~900 |
| 5.2 | Merge the 3 gallery-picker screens and the 2 report-menu screens | ~600 |
| N-5 | `screenOptions` instead of 88 repeated `options` props | ~350 |
| P-1 | Filter icon fonts to 4 families | −2.0 MB APK |
| P-2 | Optimise assets to WebP + density variants | −1.8 MB APK |
| P-5 | Convert unbounded lists to `FlatList`/`FlashList` | — |
| P-10 | `React.memo` on list rows | — |

**Projected outcome:** ~13,000–16,000 lines removed (**a 21–26% reduction** from 61.1 KLOC to roughly 45–48 KLOC) with no loss of functionality, and roughly **4 MB off the APK**.

---

## 10. Appendix — Measurement Methodology

All figures are reproducible from the repository root.

| Metric | Method |
|---|---|
| KLOC / SLOC | Node script walking `src/` for `.ts`/`.tsx` + `App.tsx` + `index.js`; excludes `node_modules`, `.git`, `build`, `Pods`. SLOC = total − blank − lines matching `^\s*(//\|/\*\|\*)` |
| Duplication | Normalised 8-line sliding-window MD5 hashing; whitespace trimmed, comments stripped, windows < 120 chars ignored; counted when a window appears in ≥ 2 distinct files |
| Type errors | `npx tsc --noEmit` |
| Lint | `npx eslint . --ext .ts,.tsx -f unix` |
| Vulnerabilities | `npm audit --json` |
| Colors | `grep -rhoE "#[0-9A-Fa-f]{3,8}\b" src --include=*.tsx`, case-normalised |
| Font sizes | `stat` on `android/app/build/intermediates/assets/debug/mergeDebugAssets/fonts/*.ttf` |
| Asset sizes | `find src/assets -type f -printf "%s\t%p\n"` |
| Screen count | `<Stack.Screen>` declarations in `RootNavigator.tsx` (89) |

**Not covered by this audit:** the backend API, its authorization model, and its data-at-rest encryption; accessibility (no `accessibilityLabel` audit was performed — a quick grep suggests it is largely absent and deserves its own review); internationalisation (the app is English-only with no i18n framework, notable for a Bangladesh-market product where Bangla support is likely expected); and iOS runtime behaviour (analysis was static, on Windows).

---

*Report generated 2026-08-20 · branch `nasir65` @ `ca4ed89` · 61,101 lines across 214 files analysed.*
