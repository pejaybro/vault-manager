# 🔐 Vault Manager

> Offline-first Password Manager + Digital Key Manager + TOTP Authenticator

## Apps
- **Mobile** — React Native + Expo (iOS & Android)
- **Desktop** — Tauri + React (Windows, macOS, Linux)

## Tech Stack
- **Language**: TypeScript
- **Mobile**: React Native + Expo SDK 51
- **Desktop**: Tauri 2 + React 18
- **Crypto**: Argon2id + AES-256-GCM
- **TOTP**: RFC 6238 (otplib)
- **Monorepo**: pnpm workspaces

## Getting Started

### Prerequisites
- Node.js v20+
- pnpm v8+
- Rust (for desktop)
- Expo Go app (for mobile testing)

### Install
```bash
pnpm install
```

### Run Mobile
```bash
pnpm mobile
```

### Run Desktop
```bash
pnpm desktop
```

### Run Tests
```bash
pnpm test
```

## Security
- All data encrypted with AES-256-GCM
- Master password hashed with Argon2id
- Zero cloud storage — fully offline
- Biometric unlock support
