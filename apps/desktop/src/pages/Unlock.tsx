import React, { useState } from 'react';
import { ShieldCheck, KeyRound } from 'lucide-react';
import { useDesktopVault } from '../context/DesktopVaultContext';

export const UnlockPage: React.FC = () => {
  const { unlockVault, isLoading, error } = useDesktopVault();
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    await unlockVault(password);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <ShieldCheck size={48} className="sidebar-logo" style={{ margin: '0 auto 12px' }} />
          <h2 style={{ fontSize: 24, fontWeight: 800 }}>Vault Locked</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 4 }}>
            Enter your Master Password to unlock your vault.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            className="input-field"
            placeholder="Master Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
          />

          {error && (
            <p style={{ color: 'var(--danger-color)', fontSize: 13, marginBottom: 14 }}>
              {error}
            </p>
          )}

          <button type="submit" className="btn-primary" disabled={isLoading}>
            <KeyRound size={18} />
            {isLoading ? 'Unlocking...' : 'Unlock Vault'}
          </button>
        </form>
      </div>
    </div>
  );
};
