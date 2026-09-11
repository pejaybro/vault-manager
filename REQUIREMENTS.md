# 🔐 Vault Manager — Requirements & Tech Stack

---

## 📋 Functional Requirements

### FR-1: Password Manager
| ID | Requirement | Priority |
|---|---|---|
| FR-1.1 | User can add passwords with name, username, password, URL, category, notes | Must Have |
| FR-1.2 | User can view, edit, and delete passwords | Must Have |
| FR-1.3 | Password fields are hidden by default, revealed on tap | Must Have |
| FR-1.4 | One-tap copy to clipboard (username, password, URL) | Must Have |
| FR-1.5 | Clipboard auto-clears after 30 seconds | Must Have |
| FR-1.6 | Built-in password generator with customizable options | Must Have |
| FR-1.7 | Password strength indicator | Must Have |
| FR-1.8 | Search and filter by name, username, URL | Must Have |
| FR-1.9 | Category grouping (Social, Banking, Work, etc.) | Should Have |
| FR-1.10 | Password history (last 3 passwords per entry) | Nice to Have |
| FR-1.11 | Favicon/logo for entries | Nice to Have |

### FR-2: TOTP Authenticator
| ID | Requirement | Priority |
|---|---|---|
| FR-2.1 | Generate 6-digit TOTP codes compatible with RFC 6238 | Must Have |
| FR-2.2 | Codes refresh every 30 seconds (configurable to 60s) | Must Have |
| FR-2.3 | Visual countdown timer per entry | Must Have |
| FR-2.4 | Add TOTP via QR code scan (camera) | Must Have |
| FR-2.5 | Add TOTP via manual secret entry | Must Have |
| FR-2.6 | One-tap copy current code | Must Have |
| FR-2.7 | Support SHA1, SHA256, SHA512 algorithms | Should Have |
| FR-2.8 | Support 6 and 8 digit codes | Should Have |
| FR-2.9 | Export single TOTP as QR code | Nice to Have |

### FR-3: Digital Key Manager
| ID | Requirement | Priority |
|---|---|---|
| FR-3.1 | Store API keys, SSH keys, tokens, certificates, secure notes | Must Have |
| FR-3.2 | Key types: API Key, SSH Key, Certificate, JWT/OAuth Token, Secure Note, Other | Must Have |
| FR-3.3 | Key value hidden by default, revealed on tap | Must Have |
| FR-3.4 | One-tap copy key value | Must Have |
| FR-3.5 | Expiry date tracking with warnings | Should Have |
| FR-3.6 | Tags for organization | Should Have |
| FR-3.7 | JWT token decoder (show payload) | Nice to Have |
| FR-3.8 | SSH key fingerprint display | Nice to Have |

### FR-4: Security & Auth
| ID | Requirement | Priority |
|---|---|---|
| FR-4.1 | Master password required to unlock vault | Must Have |
| FR-4.2 | Biometric unlock (fingerprint / Face ID) | Must Have |
| FR-4.3 | Auto-lock after configurable inactivity (1/5/15/30 min) | Must Have |
| FR-4.4 | Lock on app background | Should Have |
| FR-4.5 | Wrong password lockout (5 attempts → 30s cooldown) | Should Have |
| FR-4.6 | No master password recovery (by design — security) | Must Have |
| FR-4.7 | Change master password (requires current password) | Should Have |
| FR-4.8 | All data encrypted at rest, never stored in plain text | Must Have |

### FR-5: Sync & Transfer
| ID | Requirement | Priority |
|---|---|---|
| FR-5.1 | Export entire vault as encrypted QR code | Must Have |
| FR-5.2 | Import vault by scanning QR code | Must Have |
| FR-5.3 | Export vault as encrypted `.vault` file | Must Have |
| FR-5.4 | Import vault from `.vault` file | Must Have |
| FR-5.5 | Merge vaults (combine entries from two devices) | Should Have |
| FR-5.6 | LAN sync over WiFi (same network) | Nice to Have |

### FR-6: Settings
| ID | Requirement | Priority |
|---|---|---|
| FR-6.1 | Configure auto-lock timeout | Must Have |
| FR-6.2 | Configure clipboard auto-clear timeout | Should Have |
| FR-6.3 | Dark / Light theme toggle | Should Have |
| FR-6.4 | App version and security information | Should Have |
| FR-6.5 | Backup vault | Should Have |

---

## 🚫 Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR-1 | **Offline-first**: App must work 100% without internet connection |
| NFR-2 | **No telemetry**: Zero data sent to any external server |
| NFR-3 | **Encryption**: All vault data encrypted with AES-256-GCM |
| NFR-4 | **Key Derivation**: Master password never stored, only derived key (in memory) |
| NFR-5 | **Memory safety**: Sensitive data cleared from memory after use |
| NFR-6 | **Performance**: Vault unlock in < 3 seconds |
| NFR-7 | **Performance**: App launch to unlock screen in < 1 second |
| NFR-8 | **Compatibility**: Android 8.0+ / iOS 14+ for mobile |
| NFR-9 | **Compatibility**: Windows 10+ for desktop |
| NFR-10 | **App size**: Mobile APK < 50MB, Desktop installer < 20MB |

---

## 🛠️ Tech Stack

### 📁 Project Structure
```
Type: Monorepo (pnpm workspaces)
```

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| Package Manager | pnpm | 8+ | Fast, disk-efficient package management |
| Monorepo | pnpm workspaces | — | Shared code between apps |
| Language | TypeScript | 5.x | Type safety everywhere |

---

### 📱 Mobile App (`apps/mobile`)

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| Framework | React Native | 0.74+ | Cross-platform mobile |
| Toolchain | Expo SDK | 51+ | Dev server, builds, APIs |
| Router | Expo Router | 3.x | File-based navigation |
| UI Components | React Native Paper | 5.x | Material Design components |
| Styling | NativeWind | 4.x | Tailwind CSS for React Native |
| Secure Storage | expo-secure-store | — | OS-level secure keychain/keystore |
| Biometrics | expo-local-authentication | — | Face ID, fingerprint |
| Camera | expo-camera | — | QR code scanning |
| Barcode Scanner | expo-barcode-scanner | — | Parse QR codes |
| QR Generator | react-native-qrcode-svg | — | Display QR codes |
| File System | expo-file-system | — | Read/write vault files |
| Share | expo-sharing | — | Share vault file |
| Haptics | expo-haptics | — | Tactile feedback on copy |
| Clipboard | expo-clipboard | — | Copy to clipboard |
| Build | EAS Build | — | Cloud build for APK/IPA |

---

### 🖥️ Desktop App (`apps/desktop`)

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| Framework | Tauri | 2.x | Rust-powered desktop wrapper |
| Frontend | React | 18.x | UI (same patterns as mobile) |
| Router | React Router | 6.x | Desktop navigation |
| Styling | Tailwind CSS | 3.x | Same design tokens as mobile |
| File System | Tauri `fs` plugin | — | Read/write vault file |
| Clipboard | Tauri `clipboard` plugin | — | System clipboard |
| Dialogs | Tauri `dialog` plugin | — | File open/save dialogs |
| Notifications | Tauri `notification` plugin | — | Desktop notifications |
| QR Display | qrcode.react | — | Display QR codes |
| QR Scanner | html5-qrcode | — | Webcam QR scanning |
| Build | `cargo tauri build` | — | Generates MSI/EXE installer |

---

### 📦 Shared Core Package (`packages/core`)

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| Key Derivation | argon2-browser | — | Argon2id for master password KDF |
| Encryption | Web Crypto API (native) | — | AES-256-GCM encryption |
| TOTP | otplib | 12.x | RFC 6238 TOTP generation |
| Password Strength | zxcvbn | — | Realistic password strength scoring |
| UUID | nanoid | — | Unique IDs for vault entries |
| Encoding | base32-encode / decode | — | TOTP secret encoding |
| Validation | zod | 3.x | Runtime type validation |
| Testing | Vitest | — | Unit testing framework |

---

### 🔒 Cryptography Specification

```
Master Password
      │
      ▼
┌─────────────────────────────────────────┐
│  Argon2id (Key Derivation)              │
│  Memory: 64 MB                          │
│  Iterations: 3                          │
│  Parallelism: 1                         │
│  Salt: 128-bit random (per vault)       │
│  Output: 256-bit key                    │
└─────────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────────┐
│  AES-256-GCM (Vault Encryption)         │
│  Key: 256-bit derived key               │
│  IV: 96-bit random (per save)           │
│  Tag: 128-bit authentication tag        │
│  Input: JSON vault (UTF-8 string)       │
│  Output: base64 encoded ciphertext      │
└─────────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────────┐
│  .vault file format (JSON)              │
│  {                                      │
│    "v": 1,          (format version)    │
│    "salt": "...",   (base64, 16 bytes)  │
│    "iv": "...",     (base64, 12 bytes)  │
│    "data": "...",   (base64 ciphertext) │
│    "tag": "..."     (base64, 16 bytes)  │
│  }                                      │
└─────────────────────────────────────────┘
```

```
TOTP Generation (RFC 6238 standard):
Secret (Base32) → HMAC-SHA1(secret, floor(unixTime/30)) → truncate → 6-digit code
Refreshes every 30 seconds (synchronized to Unix epoch)
```

---

### 🗂️ Full Folder Structure

```
vault-manager/
│
├── apps/
│   ├── mobile/                        # React Native + Expo
│   │   ├── app/
│   │   │   ├── (auth)/
│   │   │   │   ├── setup.tsx          # First-time vault creation
│   │   │   │   ├── unlock.tsx         # Master password unlock
│   │   │   │   └── import.tsx         # Import vault from QR/file
│   │   │   ├── (tabs)/
│   │   │   │   ├── passwords/
│   │   │   │   │   ├── index.tsx      # Password list
│   │   │   │   │   ├── add.tsx        # Add password
│   │   │   │   │   ├── [id].tsx       # View password
│   │   │   │   │   └── edit/[id].tsx  # Edit password
│   │   │   │   ├── authenticator/
│   │   │   │   │   ├── index.tsx      # TOTP list
│   │   │   │   │   ├── add.tsx        # Add TOTP
│   │   │   │   │   └── [id].tsx       # View TOTP
│   │   │   │   ├── keys/
│   │   │   │   │   ├── index.tsx      # Key list
│   │   │   │   │   ├── add.tsx        # Add key
│   │   │   │   │   └── [id].tsx       # View/edit key
│   │   │   │   └── settings/
│   │   │   │       ├── index.tsx      # Settings screen
│   │   │   │       └── export.tsx     # Export vault
│   │   │   └── _layout.tsx            # Root layout
│   │   ├── components/                # Mobile-specific components
│   │   ├── hooks/                     # Mobile-specific hooks
│   │   ├── storage/                   # ExpoStorageAdapter
│   │   ├── constants/                 # Theme, config
│   │   └── app.json                   # Expo config
│   │
│   └── desktop/                       # Tauri + React
│       ├── src/
│       │   ├── pages/
│       │   │   ├── Unlock.tsx
│       │   │   ├── Setup.tsx
│       │   │   ├── Passwords.tsx
│       │   │   ├── Authenticator.tsx
│       │   │   ├── Keys.tsx
│       │   │   ├── Sync.tsx
│       │   │   └── Settings.tsx
│       │   ├── components/            # Desktop-specific components
│       │   ├── storage/               # TauriStorageAdapter
│       │   └── main.tsx
│       └── src-tauri/                 # Rust (Tauri auto-manages)
│           ├── tauri.conf.json
│           └── Cargo.toml
│
├── packages/
│   ├── core/                          # Shared business logic
│   │   └── src/
│   │       ├── crypto/
│   │       │   ├── keyDerivation.ts   # Argon2id KDF
│   │       │   └── encryption.ts     # AES-256-GCM
│   │       ├── totp/
│   │       │   └── totpEngine.ts     # TOTP code generation
│   │       ├── vault/
│   │       │   ├── vaultManager.ts   # Vault CRUD operations
│   │       │   ├── session.ts        # In-memory session
│   │       │   └── storage.ts        # StorageAdapter interface
│   │       └── models/
│   │           └── index.ts          # TypeScript interfaces
│   │
│   └── ui/                            # Shared UI components (future)
│
├── PLAN.md                            # Project plan
├── REQUIREMENTS.md                    # This file
├── README.md                          # Setup instructions
├── pnpm-workspace.yaml                # Monorepo config
└── package.json                       # Root package.json
```

---

### 🔗 Key Dependencies Summary

```bash
# Core package
pnpm add argon2-browser otplib zxcvbn nanoid zod
pnpm add -D vitest typescript

# Mobile app
pnpm add expo expo-router react-native-paper nativewind
pnpm add expo-secure-store expo-local-authentication
pnpm add expo-camera expo-barcode-scanner
pnpm add react-native-qrcode-svg
pnpm add expo-file-system expo-sharing expo-clipboard expo-haptics

# Desktop app
pnpm add @tauri-apps/api react react-router-dom
pnpm add tailwindcss qrcode.react html5-qrcode
```

---

## ✅ Definition of Done

The project is complete when:
- [ ] User can create a vault with a master password on mobile
- [ ] User can add/view/copy/delete passwords
- [ ] User can add TOTP codes (via QR scan) and see live 6-digit codes
- [ ] User can store and view API keys / SSH keys / tokens
- [ ] User can export vault as QR code
- [ ] User can import vault on a second device by scanning QR
- [ ] User can unlock with biometrics (fingerprint/face)
- [ ] Desktop app has full feature parity with mobile
- [ ] All data is stored offline, encrypted, and never leaves the device
- [ ] APK runs on a real Android device
- [ ] EXE installs on a real Windows machine

---

*Vault Manager Requirements v1.0 — Generated by Antigravity*
