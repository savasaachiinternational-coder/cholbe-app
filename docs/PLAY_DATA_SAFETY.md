# Cholbe — Google Play Data Safety answers

Use this checklist when filling **Play Console → App content → Data safety**.
Answers reflect the current `cholbe-app` + `cholbeapi.pino7.com` behavior.

## App overview

| Item | Value |
|------|--------|
| Package | `com.cholbe` |
| Category | Health & fitness / Medical |
| Ads | **No** |
| In-app purchases | **No** (physical pharmacy goods only; not Play Billing) |
| Third-party analytics (Firebase/GA/Mixpanel/etc.) | **No** |
| Crash reporting SDK | **No** |

## Does your app collect or share user data?

**Yes — collects.** Data is sent to Cholbe’s backend (`https://cholbeapi.pino7.com`) to provide the service.  
**Does not share** with third-party advertisers or data brokers.

> “Share” in Play Console means transferring data to a third party. Sending data to *your own* backend for app functionality is **collection**, not sharing — unless you also sell/transfer it to others.

---

## Data types collected

Declare each row below as **Collected = Yes**, **Shared = No**, unless noted.

### Personal info

| Data type | Collected? | Required / Optional | Purpose | Ephemeral? |
|-----------|------------|---------------------|---------|------------|
| Name | Yes | Required (account / profile) | App functionality, Account management | No |
| Email address | Yes | Required (signup / login) | App functionality, Account management | No |
| Phone number | Yes | Optional / required depending on flow | App functionality, Account management | No |
| User IDs | Yes (account id, JWT subject) | Required | App functionality, Account management | No |
| Address | Yes (delivery addresses) | Optional (needed for pharmacy delivery) | App functionality | No |
| Other info (emergency contacts: name, relation, phone) | Yes | Optional | App functionality | No |

### Health and fitness

| Data type | Collected? | Required / Optional | Purpose | Ephemeral? |
|-----------|------------|---------------------|---------|------------|
| Health info | Yes — medical history, blood group, vitals (BP/O₂), prescriptions, lab/report images, family-member health profiles | Optional for basic browsing; required for onboarding / clinical features | App functionality | No |

This is a **health app**. Be prepared for Play’s Health apps / Medical policies and a clear privacy policy URL.

### Photos and videos

| Data type | Collected? | Required / Optional | Purpose | Ephemeral? |
|-----------|------------|---------------------|---------|------------|
| Photos | Yes — avatar, prescription / report uploads, product images (vendor), chat attachments | Optional | App functionality | No |
| Videos | Live consultation via Agora; not stored as a media library in-app. If Agora or your backend records sessions, declare that in the privacy policy. | Optional (video call) | App functionality | See Agora note |

**Agora note:** Video/voice consultation uses Agora RTC. Confirm whether streams are recorded. If not recorded, treat call media as ephemeral for the session. Still declare **Photos** for uploaded images.

### Audio files

| Data type | Collected? | Required / Optional | Purpose | Ephemeral? |
|-----------|------------|---------------------|---------|------------|
| Voice / audio messages | Yes — consultation chat voice notes uploaded to backend | Optional | App functionality | No |
| Live call audio | Via Agora during video consultation | Optional | App functionality | Ephemeral unless recorded |

### Location

| Data type | Collected? | Approximate / Precise | Required / Optional | Purpose | Ephemeral? |
|-----------|------------|----------------------|---------------------|---------|------------|
| Location | Yes | **Precise** (fine location for delivery map picker / geocoding) | Optional (user grants permission) | App functionality | No (saved with delivery address when user saves) |

Permissions: `ACCESS_FINE_LOCATION`, `ACCESS_COARSE_LOCATION`. Used in `AddressMapPickerScreen` + Google Maps / Geocoding.

### Device or other IDs

| Data type | Collected? | Notes |
|-----------|------------|-------|
| Advertising ID | **No** | No ads SDK |
| Device or other IDs | Auth token stored on device (Android Keystore / iOS Keychain via react-native-keychain) — not an advertising ID |

### Financial info

| Data type | Collected? | Notes |
|-----------|------------|-------|
| Purchase history | Yes — pharmacy order / payment records on backend | App functionality |
| Payment info | Payment method choice (COD / bKash / Nagad / Card) with orders. Card PANs are not collected via a card SDK in the app today — declare only what you store |

---

## Data handling answers (common Play questions)

| Question | Recommended answer |
|----------|-------------------|
| Is all user data encrypted in transit? | **Yes** (HTTPS to production API; release build has cleartext disabled) |
| Do you provide a way for users to request deletion? | **Yes** — in-app **Delete account** on Profile/Settings (customer, doctor, vendor, admin). Calls `DELETE /api/v1/users/me`, which anonymizes the account, removes personal/health data, and blocks login. |
| Do you encrypt data at rest on device? | Auth session in **Keychain / Android Keystore** (encrypted platform storage). Answer honestly |
| Independent security review? | No (unless you have one) |
| Designed for children / Families Policy? | Generally **No** — target 18+ for a health app |

---

## Permissions ↔ Data Safety mapping

| Android permission | Related Data Safety type | Why |
|--------------------|--------------------------|-----|
| `INTERNET` | (enables collection) | API, Maps, Agora, uploads |
| `ACCESS_FINE_LOCATION` / `ACCESS_COARSE_LOCATION` | Precise location | Delivery address map |
| `CAMERA` | Photos / Videos | Video consult; capture prescription/report photos |
| `RECORD_AUDIO` | Audio files | Video consult + voice messages |
| `MODIFY_AUDIO_SETTINGS` | (supporting) | Call audio routing |
| `BLUETOOTH_CONNECT` | (supporting) | Headset for calls (Android 12+) |

No `AD_ID` — declare that the app does not use an advertising ID.

---

## Third parties involved in processing

| Party | Role | Declare as “shared”? |
|-------|------|----------------------|
| Cholbe backend (`cholbeapi.pino7.com`) | Primary processor (your service) | No — your collection endpoint |
| Google Maps / Geocoding | Location → address | Service provider; disclose in privacy policy |
| Agora | Real-time video/voice | Service provider; disclose in privacy policy |

---

## Privacy policy (blocker for submission)

Play requires a **public privacy policy URL** covering:

1. What you collect (tables above)
2. Why (app functionality / account)
3. Location, camera, mic, health data
4. Third parties (Google Maps, Agora, hosting)
5. Retention and deletion / contact email
6. Medical disclaimer (app is not a substitute for emergency care)

**Live URLs (use these in Play Console):**

| Item | URL |
|------|-----|
| Privacy Policy | https://cholbepharmacy.com/privacy |
| Terms of Service | https://cholbepharmacy.com/terms |
| Website | https://cholbepharmacy.com |

Also wire the same links in-app (Sign-in, signup Terms checkbox, checkout). Contact: `support@cholbepharmacy.com`.

---

## Before you click Submit

- [x] Privacy policy URL live and linked in Play Console — https://cholbepharmacy.com/privacy
- [x] Account deletion path exists in-app (`DELETE /users/me` + Profile → Delete account)
- [ ] Data safety form matches this doc
- [ ] Content rating questionnaire completed
- [ ] Health / medical claims reviewed (no unproven cure claims)

This file is guidance for Console filling — it is **not** a legal privacy policy.
