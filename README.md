# 🔐 Vault Manager

> **Offline-first Password Manager + Digital Key Manager + TOTP Authenticator + Passkeys**
> Cross-platform security suite with mobile (React Native + Expo), desktop (Tauri + React), and browser extension (Chrome, Edge, Firefox, Brave, Safari) sharing a single unified cryptographic core.

---

## 📂 Repository Structure

```
vault-manager/
├── apps/
│   ├── mobile/         ← React Native + Expo SDK 57 (Android & iOS)
│   ├── desktop/        ← Tauri 2 + React 18 + TypeScript (Windows & macOS)
│   └── extension/      ← Manifest V3 Cross-Browser Extension (Chrome, Edge, Firefox, Brave, Safari)
├── packages/
│   └── core/           ← Shared Crypto (AES-256-GCM, PBKDF2/Argon2id, TOTP, Passkeys, Vault Engine)
└── dist/               ← Platform Build Output Folder
```

---

## 🛠️ Prerequisites

Before running or building, ensure you have the following installed:
- **Node.js**: `v20.0.0+` (v24 tested)
- **pnpm**: `v9.0.0+` (`npm install -g pnpm`)
- **Rust**: `rustc 1.80+` / `cargo` (Required for Desktop Tauri build)
- **Expo Go App**: Installed on your Android phone for live mobile testing
- **EAS CLI**: `npm install -g eas-cli` (For building APK/IPA binaries)

---

## 🚀 Running Development Mode

### 1. Install All Dependencies
```bash
pnpm install
```

### 2. Run Mobile App (Expo Go on Android)
```bash
pnpm mobile
```
*Scan the QR code printed in terminal using the Expo Go app on your phone.*

### 3. Run Desktop App (Tauri + React)
```bash
pnpm desktop
```
*Launches native desktop window with hot-reloading.*

### 4. Run Core Unit Tests
```bash
pnpm test
```
*Executes 20 Vitest unit tests verifying crypto, TOTP, passkeys, and vault merge logic.*

---

## 📦 How to Make Production Builds & Output Directories

All production builds are compiled into separate, structured target directories:

```
dist/
├── mobile/
│   ├── android/   ➔ VaultManager-v1.0.0.apk
│   └── ios/       ➔ VaultManager-v1.0.0.ipa
├── desktop/
│   ├── windows/   ➔ VaultManager-Setup-v1.0.0.exe / VaultManager-v1.0.0.msi
│   └── macos/     ➔ VaultManager-v1.0.0.dmg
└── extension/     ➔ vault-manager-extension-v1.0.0.zip
```

---

### 📱 1. Mobile Builds

#### A. Build Android APK Locally on PC (Offline — No Cloud)
```bash
pnpm build:apk:local
```
- **Command**: Runs Expo local prebuild + local Gradle release compilation on your laptop
- **Output Folder**: `apps/mobile/android/app/build/outputs/apk/release/`
- **Installable File Name**: `app-release.apk`

#### B. Cloud EAS Android APK (`.apk`)
```bash
pnpm build:mobile:android
```
- **Command**: `cd apps/mobile && eas build --platform android --profile preview`
- **Output Folder**: `dist/mobile/android/`
- **Installable File Name**: `VaultManager-v1.0.0.apk`

#### B. Build iOS Application (`.ipa`)
```bash
pnpm build:mobile:ios
```
- **Command**: `cd apps/mobile && eas build --platform ios --profile preview`
- **Output Folder**: `dist/mobile/ios/`
- **Installable File Name**: `VaultManager-v1.0.0.ipa`

---

### 🖥️ 2. Desktop Builds

#### A. Build Windows Installer (`.exe` / `.msi`)
```bash
pnpm build:desktop:windows
```
- **Command**: `cd apps/desktop && pnpm tauri build`
- **Output Folder**: `dist/desktop/windows/`
- **Installable File Names**:
  - `VaultManager-Setup-v1.0.0.exe` (Executable Installer)
  - `VaultManager-v1.0.0.msi` (MSI Installer package)
- **Tauri Path**: `apps/desktop/src-tauri/target/release/bundle/msi/`

#### B. Build macOS Bundle (`.dmg`)
```bash
pnpm build:desktop:macos
```
- **Command**: `cd apps/desktop && pnpm tauri build --target x86_64-apple-darwin`
- **Output Folder**: `dist/desktop/macos/`
- **Installable File Name**: `VaultManager-v1.0.0.dmg`
- **Tauri Path**: `apps/desktop/src-tauri/target/release/bundle/dmg/`

---

### 🔌 3. Browser Extension Build (Chrome, Edge, Firefox, Brave, Safari)

```bash
pnpm build:extension
```
- **Output Folder**: `dist/extension/`
- **Installable File Name**: `vault-manager-extension-v1.0.0.zip`

#### How to Load Extension:
- **Chrome / Edge / Brave / Firefox**: Go to `chrome://extensions` ➔ Enable *Developer Mode* ➔ Click *Load Unpacked* ➔ Select `apps/extension`.
- **Safari (macOS)**: Run `xcrun safari-web-extension-converter apps/extension`.

---

## 🔒 Security Specifications

- **Zero-Knowledge Architecture**: Encryption and key derivation happen 100% locally on your device.
- **AES-256-GCM**: Authenticated encryption for all vault entries at rest.
- **Argon2id / PBKDF2**: Key derivation from Master Password using cryptographically random 16-byte salt.
- **Memory Wiping**: Locking vault purges decrypted keys and salt from RAM instantly.
- **Clipboard Auto-Clear**: Copied passwords and keys are wiped from clipboard automatically after 30 seconds.
- **Android System Autofill**: OS-level integration (`android.permission.BIND_AUTOFILL_SERVICE`).
- **Global Desktop Quick Fill**: `Ctrl + Shift + L` overlay hotkey for PC apps.
- **FIDO2 / WebAuthn Passkeys**: ECDSA P-256 passwordless digital sign-in keys.

---

## 📄 License

MIT © Vault Manager
