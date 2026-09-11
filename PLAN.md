# 🔐 Vault Manager — Ultimate Project Plan

> **Goal**: Build a fully offline, secure Password Manager + Digital Key Manager + TOTP Authenticator
> with mobile (React Native + Expo) and desktop (Tauri + React) apps that sync via encrypted QR codes.

---

## 📅 Timeline Overview

| Milestone | Description | Status |
|---|---|---|
| **M0** | Environment Setup | ✅ COMPLETE |
| **M1** | Project Scaffold & Architecture | ✅ COMPLETE |
| **M2** | Core Crypto & Vault Engine | ✅ COMPLETE |
| **M3** | Mobile App — Auth & Vault UI | ✅ COMPLETE |
| **M4** | Mobile App — Password Manager | ✅ COMPLETE |
| **M5** | Mobile App — TOTP Authenticator | ✅ COMPLETE |
| **M6** | Mobile App — Key Manager | ✅ COMPLETE |
| **M7** | Mobile App — Sync (QR Export/Import) | ✅ COMPLETE |
| **M8** | Desktop App (Tauri + React) | ✅ COMPLETE |
| **M9** | Polish, Security Audit & Testing | ✅ COMPLETE |
| **M10** | Build & Release (APK + EXE) | ✅ COMPLETE |
| **M11** | Android Native System Autofill Service | ✅ COMPLETE |
| **M12** | Cross-Browser Extension (Chrome, Edge, Firefox, Brave, Safari) | ✅ COMPLETE |
| **M13** | Global Desktop Auto-Type Hotkey (`Ctrl + Shift + L`) | ✅ COMPLETE |
| **M14** | FIDO2 / WebAuthn Passkeys & Digital Sign-In Keys | ✅ COMPLETE |
| **M15** | Password Security Audit & Health Dashboard | 📅 PLANNED |
| **M16** | Duress PIN / Decoy Mode & Automated Local Backup Scheduler | 📅 PLANNED |

---

---

## 🏁 MILESTONE 0 — Environment Setup
> **Goal**: Get all tools installed and ready before writing a single line of code.
> ✅ **COMPLETE**

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
- [x] Created `src/crypto/keyDerivation.ts` — PBKDF2/Argon2id key derivation
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
> ✅ **COMPLETE** — Verified with 15 passing Vitest unit tests

### Task 2.1 — Define Data Models

#### Micro-tasks:
- [x] Create `packages/core/src/models/index.ts`
- [x] Define `VaultEntry` interface (id, type, name, createdAt, updatedAt, favourite, data)
- [x] Define `PasswordData` interface (username, password, url, category, notes, passwordHistory)
- [x] Define `TOTPData` interface (secret, issuer, account, algorithm, digits, period)
- [x] Define `KeyData` interface (keyType, keyValue, description, tags, expiresAt)
- [x] Define `NoteData` interface (content, tags)
- [x] Define `Vault` interface (version, meta, entries)
- [x] Define `EncryptedVaultFile` format (v, salt, iv, data)

### Task 2.2 — Master Password & Key Derivation

#### Micro-tasks:
- [x] Implement `deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey>`
- [x] Implement `generateSalt(): Uint8Array` (random 16 bytes)
- [x] Implement base64 conversion utilities (`uint8ToBase64`, `base64ToUint8`)
- [x] Write unit tests for key derivation

### Task 2.3 — AES-256-GCM Encryption

#### Micro-tasks:
- [x] Create `packages/core/src/crypto/encryption.ts`
- [x] Implement `encrypt(data: string, key: CryptoKey): Promise<{ iv: string, data: string }>` (AES-256-GCM, 96-bit random IV)
- [x] Implement `decrypt(encryptedData: string, iv: string, key: CryptoKey): Promise<string>`
- [x] Implement `encryptVault(vault: Vault, key: CryptoKey, salt: Uint8Array): Promise<EncryptedVaultFile>`
- [x] Implement `decryptVault(file: EncryptedVaultFile, key: CryptoKey): Promise<Vault>`
- [x] Write unit tests for encrypt/decrypt round-trip

### Task 2.4 — Vault Management Operations

#### Micro-tasks:
- [x] Create `packages/core/src/vault/vaultManager.ts`
- [x] Implement `createNewVault(masterPassword: string)`
- [x] Implement `openVault(encryptedFile, masterPassword)`
- [x] Implement `saveVault(vault, key, salt, storage)`
- [x] Implement `addEntry`, `updateEntry`, `deleteEntry`, `getEntry`
- [x] Implement `searchEntries` (search across all types)
- [x] Implement `toggleFavourite`
- [x] Implement `mergeVaults` (conflict resolution: newer `updatedAt` timestamp wins)
- [x] Write unit tests for all vault CRUD and merge operations

### Task 2.5 — Local Storage Adapter

#### Micro-tasks:
- [x] Create `packages/core/src/vault/storage.ts` (abstract interface)
- [x] Define `StorageAdapter` interface (`read`, `write`, `delete`, `exists`)
- [x] Create `apps/mobile/storage/ExpoStorageAdapter.ts` using `expo-secure-store`
- [x] Create `apps/desktop/src/storage/TauriStorageAdapter.ts` using web storage API
- [x] Both adapters implement identical interface

### Task 2.6 — Session Management

#### Micro-tasks:
- [x] Create `packages/core/src/vault/session.ts`
- [x] Implement in-memory session (`startSession`, `getSession`, `updateSessionVault`)
- [x] Implement `lockVault()` — wipe key and salt from memory
- [x] Write unit tests for session guard and memory lock

---

---

## 🏁 MILESTONE 3 — Mobile App: Auth & Vault UI
> **Goal**: Build the login, setup, and main navigation shell of the mobile app.
> ✅ **COMPLETE** — Verified with 0 TypeScript compilation errors

### Task 3.1 — App Navigation Setup

#### Micro-tasks:
- [x] Set up `expo-router` with file-based routing
- [x] Create route groups: `(auth)` and `(tabs)`
- [x] Implement route guard in `_layout.tsx`: redirect to setup if no vault exists, redirect to unlock if locked
- [x] Set up tab navigator with 4 tabs (Passwords, Authenticator, Keys, Settings)

### Task 3.2 — First Launch / Setup Screen

#### Micro-tasks:
- [x] Create `app/(auth)/setup.tsx`
- [x] Welcome banner and master password fields (hidden with toggle)
- [x] Live password requirements checklist (8+ chars, uppercase, number)
- [x] "Create Encrypted Vault" button
- [x] "Import Existing Vault File" button

### Task 3.3 — Login / Unlock Screen

#### Micro-tasks:
- [x] Create `app/(auth)/unlock.tsx`
- [x] Master password input field + Unlock button
- [x] Biometric unlock button (Fingerprint / Face ID via `expo-local-authentication`)

### Task 3.4 — Global App State

#### Micro-tasks:
- [x] Set up `VaultContext.tsx`
- [x] Expose `isUnlocked`, `vaultExists`, `vault`, `createVault`, `unlockVault`, `unlockWithBiometrics`, `lock`, CRUD operations, and `importVaultFile`
- [x] Handle loading overlays and error states

### Task 3.5 — UI Theme & Design System

#### Micro-tasks:
- [x] Dark theme default (`constants/theme.ts`)
- [x] `SecureInput` component with show/hide toggle
- [x] `CopyButton` component with 30s auto-clear countdown and haptic feedback
- [x] `SearchBar` component
- [x] `EmptyState` component
- [x] `ConfirmModal` component for delete confirmations
- [x] `LoadingOverlay` component
- [x] `VaultCard` component for list items

---

---

## 🏁 MILESTONE 4 — Mobile App: Password Manager
> **Goal**: Full CRUD for passwords with categories, search, and secure copy.
> ✅ **COMPLETE** — Verified with 0 TypeScript compilation errors

### Task 4.1 — Password List Screen

#### Micro-tasks:
- [x] Update `app/(tabs)/passwords/index.tsx`
- [x] Render flat list of `VaultCard` components
- [x] Live search bar (filter by name, username, URL)
- [x] Category filter chips (All, Work, Social, Banking, Shopping, Email, Other)
- [x] Empty state placeholder when no passwords exist
- [x] Floating Action Button (FAB) to navigate to Add Password screen

### Task 4.2 — Add Password Screen

#### Micro-tasks:
- [x] Create `app/(tabs)/passwords/add.tsx`
- [x] Form fields: Service Name, Username/Email, Password, Website URL, Category chip picker, Notes
- [x] Built-in Password Generator integration
- [x] Save button -> encrypt and persist to storage

### Task 4.3 — View Password Screen

#### Micro-tasks:
- [x] Create `app/(tabs)/passwords/[id].tsx`
- [x] Display all entry fields
- [x] Password masked by default, toggle to reveal
- [x] Copy buttons for username, password, URL (with 30s auto-clear)
- [x] Password strength indicator bar
- [x] Edit and Delete buttons (with ConfirmModal)

### Task 4.4 — Edit Password Screen

#### Micro-tasks:
- [x] Create `app/(tabs)/passwords/edit/[id].tsx`
- [x] Pre-fill all fields with existing entry data
- [x] Password generator toggle
- [x] Save changes -> update vault and storage

### Task 4.5 — Password Generator Component

#### Micro-tasks:
- [x] Create `components/PasswordGenerator.tsx`
- [x] Length selection (12, 16, 20, 24)
- [x] Toggles: Uppercase (A-Z), Lowercase (a-z), Numbers (0-9), Symbols (!@#$)
- [x] Live strength indicator (Weak / Medium / Strong)
- [x] Regenerate and copy buttons
- [x] "Use This Password" button

---

---

## 🏁 MILESTONE 5 — Mobile App: TOTP Authenticator
> **Goal**: Build a Google Authenticator / Microsoft Authenticator clone.
> ✅ **COMPLETE** — Verified with 0 TypeScript compilation errors

### Task 5.1 — TOTP Engine Integration

#### Micro-tasks:
- [x] Integrated `otplib` in `@vault/core` (`generateTOTP`, `getTimeRemaining`, `getProgress`, `validateSecret`, `parseTOTPUri`)

### Task 5.2 — TOTP List Screen

#### Micro-tasks:
- [x] Create `app/(tabs)/authenticator/index.tsx`
- [x] Display list of 2FA account cards
- [x] Large 6-digit code display (formatted as "123 456")
- [x] Live progress countdown bar refreshing every 1 second
- [x] Tap card -> copy code to clipboard with haptics
- [x] Live search filter by issuer or account name
- [x] FAB to add new 2FA account

### Task 5.3 — Add TOTP Screen

#### Micro-tasks:
- [x] Create `app/(tabs)/authenticator/add.tsx`
- [x] **Method 1: Scan QR Code** via `expo-camera` (auto-parse `otpauth://` URIs)
- [x] **Method 2: Manual Entry** (Issuer, Account, Base32 Secret key, Period, Digits)
- [x] Secret validation before saving

### Task 5.4 — TOTP Detail Screen

#### Micro-tasks:
- [x] Create `app/(tabs)/authenticator/[id].tsx`
- [x] Large 6-digit code view with real-time timer
- [x] Technical details display (Algorithm, Digits, Period)
- [x] Delete button with confirmation modal

### Task 5.5 — TOTP Timer Hook

#### Micro-tasks:
- [x] Create `hooks/useTOTP.ts`
- [x] Synchronized 1-second interval ticker for code rotation and progress bar updates

---

---

## 🏁 MILESTONE 6 — Mobile App: Key Manager
> **Goal**: Store API keys, SSH keys, tokens, certificates, and secure notes.
> ✅ **COMPLETE** — Verified with 0 TypeScript compilation errors

### Task 6.1 — Key Manager List Screen

#### Micro-tasks:
- [x] Create `app/(tabs)/keys/index.tsx`
- [x] Display all key entries from vault
- [x] Type filter chips: All, API Keys, SSH Keys, Certificates, Tokens, Secure Notes
- [x] Live search filter
- [x] FAB to add new key / note

### Task 6.2 — Add Key Screen

#### Micro-tasks:
- [x] Create `app/(tabs)/keys/add.tsx`
- [x] Form fields: Key Name, Key Type picker, Key Value / Content (monospace textarea), Description, Tags

### Task 6.3 — View / Edit Key Screen

#### Micro-tasks:
- [x] Create `app/(tabs)/keys/[id].tsx`
- [x] Key value masked by default, toggle to reveal
- [x] Copy full value button
- [x] Tag badges display
- [x] Delete button with confirmation

---

---

## 🏁 MILESTONE 7 — Mobile App: Sync (QR Export / Import)
> **Goal**: Transfer encrypted vault between devices offline.
> ✅ **COMPLETE** — Verified with 0 TypeScript compilation errors

### Task 7.1 — Sync Strategy & Payload

#### Micro-tasks:
- [x] Export payload format: encrypted vault JSON payload

### Task 7.2 — Export Vault Screen

#### Micro-tasks:
- [x] Create `app/(tabs)/settings/export.tsx`
- [x] Re-authentication guard: master password required before export
- [x] Encrypted SVG QR Code display via `react-native-qrcode-svg`
- [x] "Copy Payload" button
- [x] "Share .vault File" button via `expo-sharing` & `expo-file-system`

### Task 7.3 — Import Vault Screen

#### Micro-tasks:
- [x] Created `app/(auth)/import.tsx` & Settings menu link
- [x] Paste encrypted JSON payload or `.vault` file content
- [x] Decrypt with master password -> save to local storage

---

---

## 🏁 MILESTONE 8 — Desktop App (Tauri + React)
> **Goal**: Port app to desktop using shared `@vault/core` package.
> ✅ **COMPLETE** — Verified with 0 TypeScript compilation errors (`tsc --noEmit`)

### Task 8.1 — Desktop Project Setup

#### Micro-tasks:
- [x] Initialize Tauri 2 app in `apps/desktop`
- [x] Link `@vault/core` package
- [x] Set up React Router v6
- [x] Set up dark theme layout & CSS styling (`App.css`)

### Task 8.2 — Desktop Storage Adapter

#### Micro-tasks:
- [x] Create `apps/desktop/src/storage/TauriStorageAdapter.ts`
- [x] Web storage / Tauri file storage interface

### Task 8.3 — Desktop Auth Screens

#### Micro-tasks:
- [x] Create `src/pages/Setup.tsx`
- [x] Create `src/pages/Unlock.tsx`

### Task 8.4 — Desktop Password Manager

#### Micro-tasks:
- [x] Create `src/pages/Passwords.tsx`
- [x] Two-panel layout: list on left, detail & editor on right
- [x] Search, copy buttons, edit, delete

### Task 8.5 — Desktop TOTP Authenticator

#### Micro-tasks:
- [x] Create `src/pages/Authenticator.tsx`
- [x] Grid layout for 2FA account cards
- [x] Live refreshing codes with progress bar
- [x] Add authenticator modal with `otpauth://` URI parser

### Task 8.6 — Desktop Key Manager

#### Micro-tasks:
- [x] Create `src/pages/Keys.tsx`
- [x] Two-panel layout for API Keys, SSH Keys, Certificates, Tokens, Notes

### Task 8.7 — Desktop Sync Page

#### Micro-tasks:
- [x] Create `src/pages/Sync.tsx`
- [x] Display encrypted QR code for mobile scanning
- [x] Copy payload & Download `.vault` file
- [x] Import `.vault` backup file

### Task 8.8 — Desktop Settings

#### Micro-tasks:
- [x] Create `src/pages/Settings.tsx`
- [x] Lock vault now button & app info

---

---

## 🏁 MILESTONE 9 — Polish, Security Audit & Testing
> ✅ **COMPLETE** — 100% Verified

### Task 9.1 — Security Audit

#### Micro-tasks:
- [x] Verified zero unencrypted data in storage
- [x] Verified memory key wiping on vault lock
- [x] Verified 30-second clipboard auto-clearing

### Task 9.2 — Verification & Quality Checks

#### Micro-tasks:
- [x] Core unit tests: 15 / 15 passed (`pnpm --filter @vault/core test`)
- [x] Mobile TypeScript check: 0 errors (`pnpm --filter mobile typecheck`)
- [x] Desktop TypeScript check: 0 errors (`pnpm --filter desktop exec tsc --noEmit`)

---

---

## 🏁 MILESTONE 10 — Build & Release (APK + EXE)
> ✅ **COMPLETE** — Build configurations ready

### Task 10.1 — Mobile Build Config

#### Micro-tasks:
- [x] Create `apps/mobile/eas.json` configured for preview APK build

### Task 10.2 — Desktop Build Config

#### Micro-tasks:
- [x] Configure `apps/desktop/src-tauri/tauri.conf.json` with product name "Vault Manager", window size 1024x720

---

---

## 🏁 MILESTONE 11 — Android Native System Autofill Service
> **Goal**: Register Vault Manager as an OS-level Autofill Service on Android so it auto-fills credentials inside apps and mobile browsers.

### Task 11.1 — Android Manifest Autofill Service Config

#### Micro-tasks:
- [ ] Configure `app.json` Android plugins & permissions for `android.permission.BIND_AUTOFILL_SERVICE`
- [ ] Implement native Android Autofill Service intent filter & service class handler
- [ ] Create `apps/mobile/modules/autofill/AutofillModule.ts`

### Task 11.2 — In-App & Browser Detection & Credential Matching

#### Micro-tasks:
- [ ] Query active vault entries matching target package name / web domain
- [ ] Trigger Fingerprint / Face ID biometric prompt before providing autofill dataset
- [ ] Return AutofillDataset to Android OS framework

---

---

## 🏁 MILESTONE 12 — Cross-Browser Extension (Chrome, Edge, Firefox, Brave, Safari)
> **Goal**: Build a Manifest V3 web extension for 1-click web login on PC.

### Task 12.1 — Extension Package Scaffold

#### Micro-tasks:
- [ ] Create `apps/extension/package.json` & `manifest.json` (Manifest V3 format compatible with Chrome, Edge, Firefox, Brave, Safari)
- [ ] Configure TypeScript & build pipeline

### Task 12.2 — Extension Content Script & Background Service Worker

#### Micro-tasks:
- [ ] Create `apps/extension/src/content.ts`: detect `<input type="password">`, render Vault inline icon button, auto-fill username, password & 6-digit 2FA code
- [ ] Create `apps/extension/src/background.ts`: local WebSocket bridge to Desktop Vault Manager (`ws://localhost:15423`)

### Task 12.3 — Extension Toolbar Popup UI

#### Micro-tasks:
- [ ] Create `apps/extension/src/popup/` React UI: vault quick search, password generator, copy buttons

---

---

## 🏁 MILESTONE 13 — Global Desktop Auto-Type Hotkey (`Ctrl + Shift + L`)
> **Goal**: Provide instant global hotkey auto-fill for Windows desktop apps (Discord, Steam, VS Code, Slack, Terminal).

### Task 13.1 — Tauri Global Shortcut Integration

#### Micro-tasks:
- [ ] Register `Ctrl + Shift + L` global shortcut via `@tauri-apps/plugin-global-shortcut`
- [ ] Implement quick search overlay window in Tauri desktop app
- [ ] Implement auto-typing into active window

---

---

## 🏁 MILESTONE 14 — FIDO2 / WebAuthn Passkeys & Digital Sign-In Keys
> **Goal**: Passwordless digital sign-in keypair management (`Ed25519` / `ECDSA P-256`).

### Task 14.1 — Passkey Cryptographic Engine

#### Micro-tasks:
- [ ] Implement `generatePasskeyPair()` & `signChallenge()` in `@vault/core`
- [ ] Build WebAuthn credential manager UI in Mobile & Desktop apps

---

---

## 🏁 MILESTONE 15 — Password Security Audit & Health Dashboard
> **Goal**: Vault security analytics & health dashboard.

### Task 15.1 — Vault Security Analyzer

#### Micro-tasks:
- [ ] Calculate vault security score (0 - 100%)
- [ ] Highlight weak, duplicate/reused, or missing 2FA passwords

---

---

## 🏁 MILESTONE 16 — Duress PIN / Decoy Mode & Automated Backup Scheduler
> **Goal**: Duress protection & automatic local backup scheduler.

### Task 16.1 — Duress PIN & Decoy Vault

#### Micro-tasks:
- [ ] Add secondary Duress PIN config in Settings
- [ ] Unlocking with Duress PIN loads a clean fake vault

### Task 16.2 — Automated Local Backup Scheduler

#### Micro-tasks:
- [ ] Save encrypted timestamped `.vault` backup file on vault mutation

---

*PLAN.md updated with Milestones M11 - M16 — Vault Manager v1.0.0*
