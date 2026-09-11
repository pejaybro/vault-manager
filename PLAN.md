# 🔐 Vault Manager — Ultimate Project Plan

> **Goal**: Build a fully offline, secure Password Manager + Digital Key Manager + TOTP Authenticator
> with mobile (React Native + Expo) and desktop (Tauri + React) apps that sync via encrypted QR codes.

---

## 📅 Timeline Overview

| Milestone | Description | Estimated Time |
|---|---|---|
| **M0** | Environment Setup | Day 1 |
| **M1** | Project Scaffold & Architecture | Day 1–2 |
| **M2** | Core Crypto & Vault Engine | ✅ COMPLETE |
| **M3** | Mobile App — Auth & Vault UI | ✅ COMPLETE |
| **M4** | Mobile App — Password Manager | ✅ COMPLETE |
| **M5** | Mobile App — TOTP Authenticator | ✅ COMPLETE |
| **M6** | Mobile App — Key Manager | ✅ COMPLETE |
| **M7** | Mobile App — Sync (QR Export/Import) | ✅ COMPLETE |
| **M8** | Desktop App (Tauri + React) | ✅ COMPLETE |
| **M9** | Polish, Security Audit & Testing | ✅ COMPLETE |
| **M10** | Build & Release (APK + EXE) | Day 23–25 |

---

---

## 🏁 MILESTONE 0 — Environment Setup
> **Goal**: Get all tools installed and ready before writing a single line of code.

### Task 0.1 — Install Core Tools

#### Micro-tasks:
- [x] Install **Node.js** — v24.18.0 ✅
- [x] Install **Git** — v2.50.0 ✅
- [x] Install **VS Code** — Antigravity confirmed ✅
- [x] Install **pnpm** globally — v12.4.1 ✅ (`npm install -g pnpm`)
- [x] Install **Expo CLI** — v57.0.24 ✅ (`npm install -g @expo/cli` — modern CLI, used via `npx expo`)
- [x] Install **EAS CLI** — v24.3.0 ✅ (`npm install -g eas-cli`)

### Task 0.2 — Mobile Testing Setup
> ⏭️ **SKIPPED** — Will be done when app is ready for final testing. Android only (no iOS).

#### Micro-tasks:
- [ ] Install **Expo Go** on Android phone (Play Store) — do when app is ready
- [ ] Make sure phone and PC are on the **same WiFi network** — do when testing
- [ ] Create a free **Expo account** at https://expo.dev — needed for building APK

### Task 0.3 — Desktop Setup (Tauri)

#### Micro-tasks:
- [x] Install **Rust** — rustc 1.98.1 / cargo 1.98.1 ✅
- [x] Install **WebView2** — v151.0.4129.107 already installed ✅
- [x] **Antigravity** — already installed ✅ (replaces VS Code extensions)

### Task 0.4 — Verify All Installations

#### Micro-tasks:
- [x] `node --version` → v24.18.0 ✅
- [x] `pnpm --version` → 12.4.1 ✅
- [x] `npx expo --version` → 57.0.24 ✅
- [x] `eas --version` → eas-cli/24.3.0 ✅
- [x] `rustc --version` → rustc 1.98.1 ✅
- [x] `cargo --version` → cargo 1.98.1 ✅

---

---

## 🏁 MILESTONE 1 — Project Scaffold & Architecture
> **Goal**: Create the monorepo structure with shared logic between mobile and desktop.
> ✅ **COMPLETE** — Committed to GitHub: `feat(M1): project scaffold and monorepo architecture`

### Task 1.1 — Create Monorepo Structure

#### Micro-tasks:
- [x] Initialize workspace at `C:\1.CODE\vault-manager`
- [x] Create `pnpm-workspace.yaml` for monorepo
- [x] Create root `package.json`
- [x] Create full folder structure (apps/mobile, apps/desktop, packages/core, packages/ui)

### Task 1.2 — Initialize Mobile App

#### Micro-tasks:
- [x] Run `npx create-expo-app@latest apps/mobile --template blank-typescript`
- [x] Linked `@vault/core` workspace package
- [x] Created folder structure (app/(auth), app/(tabs), components, hooks, storage, constants)

### Task 1.3 — Initialize Desktop App

#### Micro-tasks:
- [x] Run `npm create tauri-app@latest desktop -- --template react-ts --manager pnpm`
- [x] Tauri 2 + React + TypeScript scaffold created
- [x] Linked `@vault/core` workspace package

### Task 1.4 — Initialize Shared Core Package

#### Micro-tasks:
- [x] Created `packages/core/package.json` (`@vault/core`)
- [x] Set up TypeScript config (`tsconfig.json`)
- [x] Created `src/models/index.ts` — all TypeScript interfaces (Vault, VaultEntry, PasswordData, TOTPData, KeyData, NoteData)
- [x] Created `src/crypto/keyDerivation.ts` — PBKDF2 key derivation (Argon2id upgrade in M2)
- [x] Created `src/crypto/encryption.ts` — AES-256-GCM encrypt/decrypt
- [x] Created `src/totp/totpEngine.ts` — RFC 6238 TOTP engine (otplib)
- [x] Created `src/vault/vaultManager.ts` — full CRUD + merge logic
- [x] Created `src/vault/session.ts` — in-memory session manager
- [x] Created `src/vault/storage.ts` — abstract StorageAdapter interface
- [x] Linked core package to both apps

### Task 1.5 — Git Setup

#### Micro-tasks:
- [x] `.gitignore` created (node_modules, .expo, dist, src-tauri/target)
- [x] `README.md` created
- [x] Initial commit pushed to `github.com:pejaybro/vault-manager.git`

---

---

## 🏁 MILESTONE 2 — Core Crypto & Vault Engine
> **Goal**: Build the encrypted vault — the heart of the entire app. Everything depends on this.

### Task 2.1 — Define Data Models

#### Micro-tasks:
- [ ] Create `packages/core/src/models/index.ts`
- [ ] Define `VaultEntry` interface:
  ```ts
  interface VaultEntry {
    id: string
    type: 'password' | 'totp' | 'key' | 'note'
    name: string
    createdAt: number
    updatedAt: number
    data: PasswordData | TOTPData | KeyData | NoteData
  }
  ```
- [ ] Define `PasswordData` interface (username, password, url, notes)
- [ ] Define `TOTPData` interface (secret, issuer, digits, period, algorithm)
- [ ] Define `KeyData` interface (keyType, keyValue, description, tags)
- [ ] Define `NoteData` interface (content, tags)
- [ ] Define `Vault` interface (version, entries, metadata)
- [ ] Define `VaultMeta` interface (createdAt, deviceId, lastSync)

### Task 2.2 — Master Password & Key Derivation

#### Micro-tasks:
- [ ] Install `argon2-browser` package in core
- [ ] Create `packages/core/src/crypto/keyDerivation.ts`
- [ ] Implement `deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey>`
  - Use **Argon2id** (memory: 64MB, iterations: 3, parallelism: 1)
  - Output: 256-bit key
- [ ] Implement `generateSalt(): Uint8Array` (random 16 bytes)
- [ ] Implement `hashMasterPassword(password: string): Promise<string>`
  - For verifying password on login without exposing vault key
- [ ] Write unit tests for key derivation

### Task 2.3 — AES-256-GCM Encryption

#### Micro-tasks:
- [ ] Create `packages/core/src/crypto/encryption.ts`
- [ ] Implement `encrypt(data: string, key: CryptoKey): Promise<EncryptedPayload>`
  - Generate random 96-bit IV
  - Use AES-256-GCM
  - Return `{ iv, ciphertext, tag }` as base64
- [ ] Implement `decrypt(payload: EncryptedPayload, key: CryptoKey): Promise<string>`
- [ ] Implement `encryptVault(vault: Vault, key: CryptoKey): Promise<string>`
- [ ] Implement `decryptVault(encrypted: string, key: CryptoKey): Promise<Vault>`
- [ ] Write unit tests for encrypt/decrypt round-trip

### Task 2.4 — Vault File Management

#### Micro-tasks:
- [ ] Create `packages/core/src/vault/vaultManager.ts`
- [ ] Implement `createNewVault(masterPassword: string): Promise<EncryptedVaultFile>`
- [ ] Implement `openVault(encryptedData: string, masterPassword: string): Promise<Vault>`
- [ ] Implement `saveVault(vault: Vault, key: CryptoKey): Promise<string>`
- [ ] Implement `addEntry(vault: Vault, entry: VaultEntry): Vault`
- [ ] Implement `updateEntry(vault: Vault, id: string, data: Partial<VaultEntry>): Vault`
- [ ] Implement `deleteEntry(vault: Vault, id: string): Vault`
- [ ] Implement `searchEntries(vault: Vault, query: string): VaultEntry[]`
- [ ] Write unit tests for all vault operations

### Task 2.5 — Local Storage Adapter

#### Micro-tasks:
- [ ] Create `packages/core/src/vault/storage.ts` (abstract interface)
- [ ] Define `StorageAdapter` interface:
  ```ts
  interface StorageAdapter {
    read(key: string): Promise<string | null>
    write(key: string, value: string): Promise<void>
    delete(key: string): Promise<void>
    exists(key: string): Promise<boolean>
  }
  ```
- [ ] Create `apps/mobile/storage/ExpoStorageAdapter.ts` using `expo-secure-store`
- [ ] Create `apps/desktop/storage/TauriStorageAdapter.ts` using Tauri file system API
- [ ] Both adapters implement the same interface — vault code is identical

### Task 2.6 — Session Management

#### Micro-tasks:
- [ ] Create `packages/core/src/vault/session.ts`
- [ ] Implement in-memory session (hold decrypted vault & key during app usage)
- [ ] Implement `lockVault()` — wipe key from memory
- [ ] Implement auto-lock after X minutes of inactivity
- [ ] Implement clipboard auto-clear after 30 seconds

---

---

## 🏁 MILESTONE 3 — Mobile App: Auth & Vault UI
> **Goal**: Build the login, setup, and main navigation shell of the mobile app.

### Task 3.1 — App Navigation Setup

#### Micro-tasks:
- [ ] Set up `expo-router` with file-based routing
- [ ] Create route groups: `(auth)` and `(tabs)`
- [ ] Implement route guard: redirect to login if vault is locked
- [ ] Set up tab navigator with 4 tabs:
  - 🔑 Passwords
  - 🔐 Authenticator (TOTP)
  - 🗝️ Keys
  - ⚙️ Settings

### Task 3.2 — First Launch / Setup Screen

#### Micro-tasks:
- [ ] Create `app/(auth)/setup.tsx`
- [ ] Design welcome screen with app logo and description
- [ ] Build "Create New Vault" flow:
  - [ ] Enter master password field (hidden)
  - [ ] Confirm master password field
  - [ ] Password strength indicator (weak/medium/strong)
  - [ ] Password requirements checklist (min 12 chars, uppercase, number, symbol)
  - [ ] "Create Vault" button
- [ ] Build "Import Existing Vault" flow (for device transfer):
  - [ ] Scan QR code button
  - [ ] Import from file button
- [ ] On vault creation: generate salt, derive key, create empty vault, save to secure storage

### Task 3.3 — Login / Unlock Screen

#### Micro-tasks:
- [ ] Create `app/(auth)/unlock.tsx`
- [ ] Display app logo + "Vault Locked" message
- [ ] Master password input field
- [ ] "Unlock" button → derive key → attempt decrypt → navigate to tabs
- [ ] Show error on wrong password (with attempt counter)
- [ ] Lock out after 5 wrong attempts (30 second cooldown)
- [ ] **Biometric unlock button** (fingerprint / face)
  - [ ] Use `expo-local-authentication`
  - [ ] Store derived key in secure enclave on first biometric setup
  - [ ] Retrieve key via biometric on subsequent logins
- [ ] "Forgot password" warning (no recovery — by design)

### Task 3.4 — Global App State

#### Micro-tasks:
- [ ] Set up React Context for vault state: `VaultContext`
- [ ] Store: current vault data, lock status, session key
- [ ] Implement `useVault()` hook for components to access vault
- [ ] Implement `useLock()` hook to manually lock the vault
- [ ] Set up auto-lock timer (configurable: 1/5/15/30 min or never)
- [ ] Handle app going to background → trigger lock if configured

### Task 3.5 — UI Theme & Design System

#### Micro-tasks:
- [ ] Choose color palette (dark theme default — better for a security app):
  - Background: `#0F0F0F`
  - Surface: `#1A1A1A`
  - Primary: `#6366F1` (indigo)
  - Success: `#22C55E`
  - Danger: `#EF4444`
  - Text: `#F5F5F5`
- [ ] Create `constants/theme.ts` with all colors, spacing, typography
- [ ] Create reusable components:
  - [ ] `VaultCard` — entry list item
  - [ ] `SecureInput` — password input with show/hide toggle
  - [ ] `CopyButton` — copies to clipboard + auto-clears
  - [ ] `SearchBar` — live search
  - [ ] `EmptyState` — when no entries exist
  - [ ] `ConfirmModal` — for delete confirmations
  - [ ] `LoadingOverlay` — full screen loading spinner

---

---

## 🏁 MILESTONE 4 — Mobile App: Password Manager
> **Goal**: Full CRUD for passwords with categories, search, and secure copy.

### Task 4.1 — Password List Screen

#### Micro-tasks:
- [ ] Create `app/(tabs)/passwords/index.tsx`
- [ ] Fetch all password entries from vault context
- [ ] Render flat list of `VaultCard` components
- [ ] Each card shows: site name, username, favicon (optional), last updated
- [ ] Implement live search bar (filter by name, username, URL)
- [ ] Implement sort options: A-Z, Z-A, newest, oldest
- [ ] Implement category filter: All, Social, Banking, Work, Shopping, Other
- [ ] Show empty state when no passwords exist
- [ ] Floating "+" button to add new password

### Task 4.2 — Add Password Screen

#### Micro-tasks:
- [ ] Create `app/(tabs)/passwords/add.tsx`
- [ ] Form fields:
  - [ ] Site/App name (required)
  - [ ] Username / Email (required)
  - [ ] Password field (required, hidden by default)
  - [ ] Website URL (optional)
  - [ ] Category picker
  - [ ] Notes (optional, multiline)
- [ ] **Password Generator** (built-in):
  - [ ] Length slider (8–64 chars)
  - [ ] Toggle: uppercase, lowercase, numbers, symbols
  - [ ] Generate button → fills password field
  - [ ] Copy generated password button
- [ ] Password strength meter (color bar: red → orange → green)
  - [ ] Uses `zxcvbn` library for realistic strength scoring
- [ ] "Save" button → add to vault → save encrypted → navigate back
- [ ] Validation: show errors for empty required fields

### Task 4.3 — View Password Screen

#### Micro-tasks:
- [ ] Create `app/(tabs)/passwords/[id].tsx`
- [ ] Display all fields in read mode
- [ ] Password field blurred by default, toggle to reveal
- [ ] Copy buttons next to each field (username, password, URL)
  - [ ] Clipboard auto-clears after 30 seconds
  - [ ] Show countdown timer on copy button
- [ ] "Edit" button → navigate to edit mode
- [ ] "Delete" button → confirm modal → delete from vault
- [ ] Show "Last updated" and "Created" timestamps
- [ ] Password strength indicator for saved password

### Task 4.4 — Edit Password Screen

#### Micro-tasks:
- [ ] Create `app/(tabs)/passwords/edit/[id].tsx`
- [ ] Pre-fill all fields with existing data
- [ ] Same password generator available
- [ ] Password history: show last 3 passwords (if changed)
- [ ] "Save Changes" button → update vault → navigate back
- [ ] "Cancel" button → discard changes

### Task 4.5 — Password Generator (Standalone)

#### Micro-tasks:
- [ ] Create `components/PasswordGenerator.tsx` as reusable component
- [ ] Options: length, uppercase, lowercase, numbers, symbols, exclude ambiguous chars
- [ ] Live preview of generated password
- [ ] Regenerate button
- [ ] Copy button
- [ ] "Use this password" button (when used from add/edit form)

---

---

## 🏁 MILESTONE 5 — Mobile App: TOTP Authenticator
> **Goal**: Build a Google Authenticator / Microsoft Authenticator clone.

### Task 5.1 — TOTP Engine (Core Package)

#### Micro-tasks:
- [ ] Install `otplib` in core package
- [ ] Create `packages/core/src/totp/totpEngine.ts`
- [ ] Implement `generateTOTP(secret: string): string` → returns 6-digit code
- [ ] Implement `getTimeRemaining(): number` → seconds until next rotation
- [ ] Implement `getProgress(): number` → 0 to 1 for progress bar
- [ ] Implement `validateSecret(secret: string): boolean` → check if Base32 valid
- [ ] Implement `parseTOTPUri(uri: string): TOTPData` → parse `otpauth://` URIs
- [ ] Support: SHA1 (default), SHA256, SHA512 algorithms
- [ ] Support: 6 or 8 digit codes
- [ ] Support: 30s or 60s periods
- [ ] Write unit tests for TOTP generation

### Task 5.2 — TOTP List Screen

#### Micro-tasks:
- [ ] Create `app/(tabs)/authenticator/index.tsx`
- [ ] Fetch all TOTP entries from vault
- [ ] Render each entry as a card showing:
  - [ ] Issuer name (e.g., "GitHub")
  - [ ] Account name (e.g., "user@email.com")
  - [ ] **Large 6-digit code** (formatted as "123 456")
  - [ ] Circular countdown timer (refreshes every second)
  - [ ] Color change: green → yellow → red as time runs out
- [ ] All codes refresh simultaneously on the 30-second mark
- [ ] Tap code → copy to clipboard
- [ ] "+" button → add new TOTP
- [ ] Long press entry → options: edit, delete
- [ ] Live search by issuer name

### Task 5.3 — Add TOTP Screen

#### Micro-tasks:
- [ ] Create `app/(tabs)/authenticator/add.tsx`
- [ ] Two methods to add:
  - **Method 1: Scan QR Code**
    - [ ] Open camera with `expo-camera`
    - [ ] Scan `otpauth://` QR code
    - [ ] Auto-parse issuer, account, secret from URI
    - [ ] Show preview → confirm → save
  - **Method 2: Manual Entry**
    - [ ] Issuer / Service name field
    - [ ] Account name / email field
    - [ ] Secret key field (Base32)
    - [ ] Advanced options: algorithm, digits, period
    - [ ] Live preview of code as user types secret
- [ ] Validate secret before saving
- [ ] Save to vault → navigate back

### Task 5.4 — TOTP Detail / Edit Screen

#### Micro-tasks:
- [ ] Create `app/(tabs)/authenticator/[id].tsx`
- [ ] Show full entry details
- [ ] Show current code (large) with timer
- [ ] QR code display (for exporting this specific TOTP to another device)
- [ ] Edit issuer name and account name
- [ ] Cannot edit the secret (must delete and re-add for security)
- [ ] Delete with confirmation

### Task 5.5 — TOTP Timer & Real-time Updates

#### Micro-tasks:
- [ ] Create `hooks/useTOTP.ts`
- [ ] Use `setInterval` to update codes every second
- [ ] Implement `useCallback` to avoid re-renders
- [ ] Handle app backgrounding (pause timer, resume on foreground)
- [ ] Ensure battery efficient (single interval for all codes)

---

---

## 🏁 MILESTONE 6 — Mobile App: Key Manager
> **Goal**: Store API keys, SSH keys, tokens, certificates, and other sensitive data.

### Task 6.1 — Key Manager List Screen

#### Micro-tasks:
- [ ] Create `app/(tabs)/keys/index.tsx`
- [ ] Display all key entries from vault
- [ ] Each card shows: key name, type badge, last updated
- [ ] Key types with icons:
  - 🔑 API Key
  - 🔒 SSH Key
  - 📜 Certificate
  - 🪙 Token (JWT, OAuth)
  - 📝 Secure Note
  - 🔐 Other
- [ ] Filter by key type
- [ ] Live search
- [ ] "+" button to add new key

### Task 6.2 — Add Key Screen

#### Micro-tasks:
- [ ] Create `app/(tabs)/keys/add.tsx`
- [ ] Form fields:
  - [ ] Key name (required)
  - [ ] Key type picker (API Key, SSH, Certificate, Token, Note, Other)
  - [ ] Key value (large text area, monospace font)
  - [ ] Description (optional)
  - [ ] Tags (comma separated)
  - [ ] Expiry date (optional, shows warning when near expiry)
- [ ] "Paste" button for easy key input
- [ ] Character count display
- [ ] Save to vault

### Task 6.3 — View / Edit Key Screen

#### Micro-tasks:
- [ ] Create `app/(tabs)/keys/[id].tsx`
- [ ] Key value blurred by default
- [ ] Tap to reveal
- [ ] Copy full key button
- [ ] For SSH keys: show key fingerprint
- [ ] For JWT tokens: decode and show payload (exp, iat, etc.)
- [ ] Expiry warning badge (e.g., "Expires in 7 days")
- [ ] Edit and delete functionality

### Task 6.4 — Secure Notes

#### Micro-tasks:
- [ ] Secure notes as a key type (reuse Key model)
- [ ] Rich text display (monospace for code, normal for prose)
- [ ] Full screen editor for long notes
- [ ] Markdown support (optional, for structured notes)

---

---

## 🏁 MILESTONE 7 — Mobile App: Sync (QR Export / Import)
> **Goal**: Transfer the encrypted vault between devices without any cloud service.

### Task 7.1 — Sync Strategy Design

#### Micro-tasks:
- [ ] Define sync modes:
  - **Full Vault Export**: entire encrypted vault as QR or file
  - **Single Entry Export**: export one password/key/totp as QR
- [ ] Define encryption for sync:
  - Vault is already encrypted — the encrypted blob is what gets exported
  - Password to decrypt is the master password (user must know it on new device)
- [ ] Design QR data format:
  ```json
  {
    "v": 1,
    "type": "vault_export",
    "data": "<base64 encrypted vault>",
    "salt": "<base64 salt>",
    "checksum": "<sha256 of data>"
  }
  ```

### Task 7.2 — Export Vault (QR Code)

#### Micro-tasks:
- [ ] Create `app/(tabs)/settings/export.tsx`
- [ ] "Export Vault" flow:
  - [ ] Confirm master password before export (security check)
  - [ ] Generate encrypted vault blob
  - [ ] Encode as QR code (use `react-native-qrcode-svg`)
  - [ ] If vault is too large for single QR → split into multiple QR codes (numbered)
  - [ ] Display QR code full screen, high brightness
  - [ ] Option: "Save as File" → save `.vault` file to device storage
  - [ ] Share button → share `.vault` file via any app (AirDrop, Bluetooth, etc.)
- [ ] Show warning: "Anyone with this QR + your master password can access your vault"

### Task 7.3 — Import Vault (QR Scan)

#### Micro-tasks:
- [ ] Create `app/(auth)/import.tsx`
- [ ] "Import from QR" flow:
  - [ ] Open camera → scan QR
  - [ ] Handle multi-part QR codes (scan all parts)
  - [ ] Decode and validate checksum
  - [ ] Prompt for master password
  - [ ] Decrypt and load vault
  - [ ] Show summary: "Found X passwords, Y TOTP codes, Z keys"
  - [ ] Confirm import → save to local storage
- [ ] "Import from File" flow:
  - [ ] Open file picker (`.vault` files)
  - [ ] Read and decrypt vault
  - [ ] Same confirm flow

### Task 7.4 — Merge vs Replace Logic

#### Micro-tasks:
- [ ] When importing, give user 3 options:
  - **Replace**: delete existing vault, use imported
  - **Merge**: combine entries (new device gets everything from both)
  - **Cancel**: abort import
- [ ] Implement merge logic:
  - Compare entry IDs
  - If conflict (same ID, different data): prefer newer `updatedAt` timestamp
  - Add unique entries from import
- [ ] Show merge preview before confirming

### Task 7.5 — LAN Sync (WiFi — Optional / Advanced)

#### Micro-tasks:
- [ ] Create local HTTP server on device
- [ ] Discover devices on same WiFi network
- [ ] PIN-based pairing (6-digit random PIN displayed on sender)
- [ ] Encrypted transfer over local network
- [ ] This is optional — implement after core features are done

---

---

## 🏁 MILESTONE 8 — Desktop App (Tauri + React)
> **Goal**: Port the mobile app to a desktop app using the same shared logic.

### Task 8.1 — Desktop Project Setup

#### Micro-tasks:
- [ ] Initialize Tauri app in `apps/desktop`
- [ ] Configure Tauri permissions:
  - `fs` — read/write vault file to user's home directory
  - `clipboard` — for copy functionality
  - `dialog` — for file open/save dialogs
  - `notification` — for clipboard clear notifications
- [ ] Set up React Router v6 for desktop navigation
- [ ] Link `packages/core` to desktop app
- [ ] Set window size: 1000x700, min 800x600
- [ ] Set app icon

### Task 8.2 — Desktop Storage Adapter

#### Micro-tasks:
- [ ] Create `apps/desktop/src/storage/TauriStorageAdapter.ts`
- [ ] Implement `StorageAdapter` interface using Tauri `fs` API
- [ ] Vault file stored at: `~/.vault-manager/vault.enc`
- [ ] Config file at: `~/.vault-manager/config.json`
- [ ] Implement file locking to prevent concurrent writes

### Task 8.3 — Desktop Auth Screens

#### Micro-tasks:
- [ ] Create `src/pages/Setup.tsx` (first run)
- [ ] Create `src/pages/Unlock.tsx` (master password)
- [ ] Implement Windows Hello / system biometrics (via Tauri plugin)
- [ ] Style with Tailwind CSS (same colors as mobile)
- [ ] Keyboard shortcut: `Enter` to submit password

### Task 8.4 — Desktop Password Manager

#### Micro-tasks:
- [ ] Create `src/pages/Passwords.tsx`
- [ ] Two-panel layout: list on left, details on right
- [ ] Click entry → show details in right panel
- [ ] Keyboard shortcuts:
  - `Ctrl+C` → copy password
  - `Ctrl+U` → copy username
  - `Ctrl+N` → new entry
  - `Ctrl+F` → focus search
  - `Delete` → delete entry (with confirm)

### Task 8.5 — Desktop TOTP Authenticator

#### Micro-tasks:
- [ ] Create `src/pages/Authenticator.tsx`
- [ ] Grid layout for TOTP codes (3–4 per row)
- [ ] Large readable code display
- [ ] Click code → copy to clipboard
- [ ] Add TOTP via QR code image (drag and drop)
- [ ] Add TOTP via manual entry
- [ ] Real-time timer bar

### Task 8.6 — Desktop Key Manager

#### Micro-tasks:
- [ ] Create `src/pages/Keys.tsx`
- [ ] Similar two-panel layout
- [ ] Syntax highlighting for key values
- [ ] Copy to clipboard button

### Task 8.7 — Desktop Sync

#### Micro-tasks:
- [ ] Create `src/pages/Sync.tsx`
- [ ] Export vault → save `.vault` file via system dialog
- [ ] Import vault → open `.vault` file via system dialog
- [ ] Display QR code on screen (for phone to scan)
- [ ] Drag and drop `.vault` file to import

### Task 8.8 — Desktop Settings

#### Micro-tasks:
- [ ] Create `src/pages/Settings.tsx`
- [ ] Auto-lock timeout
- [ ] Clipboard auto-clear timeout
- [ ] Theme (dark/light)
- [ ] Change master password
- [ ] Backup vault

---

---

## 🏁 MILESTONE 9 — Polish, Security Audit & Testing

### Task 9.1 — Security Audit

#### Micro-tasks:
- [ ] Review all places where sensitive data is in memory
- [ ] Ensure secrets are never logged to console
- [ ] Ensure secrets are never stored in plain text
- [ ] Clear clipboard after 30 seconds (verify it works)
- [ ] Verify vault file is always encrypted before writing
- [ ] Check that master password is never stored, only the derived key (in memory)
- [ ] Test: wrong password should never partially decrypt
- [ ] Test: deleting app removes all vault data

### Task 9.2 — Error Handling

#### Micro-tasks:
- [ ] Handle: vault file corrupted → show recovery options
- [ ] Handle: biometric auth fails → fall back to password
- [ ] Handle: QR scan fails → show manual entry fallback
- [ ] Handle: storage full → notify user
- [ ] Handle: app crash → ensure vault stays encrypted

### Task 9.3 — Performance

#### Micro-tasks:
- [ ] Vault decrypt happens once on unlock (not on every render)
- [ ] TOTP interval uses single shared timer
- [ ] Memoize expensive computations with `useMemo` / `useCallback`

### Task 9.4 — UX Polish

#### Micro-tasks:
- [ ] Add loading states for all async operations
- [ ] Add success/error toast notifications
- [ ] Add haptic feedback on copy (mobile)
- [ ] Add confirmation dialogs for destructive actions
- [ ] Smooth screen transitions
- [ ] Consistent icon usage throughout

### Task 9.5 — Testing

#### Micro-tasks:
- [ ] Unit tests for crypto engine
- [ ] Unit tests for vault manager
- [ ] Unit tests for TOTP engine
- [ ] Integration test: full vault lifecycle
- [ ] Integration test: export → import round trip
- [ ] Manual test checklist for each screen

---

---

## 🏁 MILESTONE 10 — Build & Release

### Task 10.1 — Mobile Build (Android APK)

#### Micro-tasks:
- [ ] Configure `app.json` with correct app name, bundle ID, version
- [ ] Add app icon (1024x1024 PNG)
- [ ] Add splash screen
- [ ] Configure EAS Build: `eas build:configure`
- [ ] Build preview APK: `eas build --platform android --profile preview`
- [ ] Download and install APK on physical device
- [ ] Test all features on real device

### Task 10.2 — Desktop Build (Windows EXE)

#### Micro-tasks:
- [ ] Configure `tauri.conf.json` with app details
- [ ] Add app icon (`.ico` format)
- [ ] Run: `pnpm tauri build`
- [ ] Test installer on Windows machine
- [ ] Verify vault file location and permissions

### Task 10.3 — Final Checklist

#### Micro-tasks:
- [ ] All features work end-to-end on Android
- [ ] All features work end-to-end on Windows
- [ ] QR sync works between phone and desktop
- [ ] Wrong master password shows error (not crash)
- [ ] No sensitive data in logs
- [ ] README.md updated with setup and usage instructions

---

## 📊 Summary

| Milestone | Focus | Days |
|---|---|---|
| M0 | Setup | 1 |
| M1 | Scaffold | 1–2 |
| M2 | Crypto Engine | 2–3 |
| M3 | Auth & Shell | 2–3 |
| M4 | Passwords | 2 |
| M5 | TOTP | 2 |
| M6 | Key Manager | 2 |
| M7 | Sync | 2 |
| M8 | Desktop | 4–5 |
| M9 | Polish & Tests | 3 |
| M10 | Build & Release | 2 |
| **Total** | | **~25 days** |

> ⚡ Since all code is written autonomously, each "day" represents a logical phase, not actual calendar days.

---

*Generated by Antigravity — Vault Manager Project Plan v1.0*
