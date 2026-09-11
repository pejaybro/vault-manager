import React from 'react';
import { Lock, Monitor } from 'lucide-react';
import { useDesktopVault } from '../context/DesktopVaultContext';

export const SettingsPage: React.FC = () => {
  const { lock } = useDesktopVault();

  return (
    <div style={{ padding: 28, overflowY: 'auto', flex: 1, maxWidth: 600 }}>
      <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 24 }}>Settings</h2>

      <div style={{ marginBottom: 32 }}>
        <h4 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
          Security
        </h4>

        <div style={{ backgroundColor: 'var(--surface-color)', borderRadius: 12, border: '1px solid var(--surface-border)', padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Lock size={20} color="var(--danger-color)" />
              <div>
                <div style={{ fontWeight: 600, color: 'var(--danger-color)' }}>Lock Vault Now</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Wipe decrypted key from memory</div>
              </div>
            </div>
            <button
              onClick={lock}
              style={{ padding: '8px 16px', borderRadius: 8, background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger-color)', color: 'var(--danger-color)', fontWeight: 600, cursor: 'pointer' }}
            >
              Lock Vault
            </button>
          </div>
        </div>
      </div>

      <div>
        <h4 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
          App Information
        </h4>

        <div style={{ backgroundColor: 'var(--surface-color)', borderRadius: 12, border: '1px solid var(--surface-border)', padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
          <Monitor size={24} color="var(--primary-color)" />
          <div>
            <div style={{ fontWeight: 700, color: 'var(--text-color)' }}>Vault Manager Desktop v1.0.0</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
              Powered by Tauri 2 + React + Web Crypto API (AES-256-GCM)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
