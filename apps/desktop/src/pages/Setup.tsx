import React, { useState } from 'react';
import { ShieldCheck, Lock } from 'lucide-react';
import { useDesktopVault } from '../context/DesktopVaultContext';

export const SetupPage: React.FC = () => {
  const { createVault, isLoading, error } = useDesktopVault();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    if (!password) {
      setLocalError('Please enter a master password');
      return;
    }
    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      setLocalError('Password must be at least 8 characters long');
      return;
    }

    try {
      await createVault(password);
    } catch {
      // Handled by context error
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <ShieldCheck size={48} className="sidebar-logo" style={{ margin: '0 auto 12px' }} />
          <h2 style={{ fontSize: 24, fontWeight: 800 }}>Create Master Password</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 4 }}>
            Set up an offline AES-256-GCM encrypted vault on your PC.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <label style={{ fontSize: 13, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
            Master Password
          </label>
          <input
            type="password"
            className="input-field"
            placeholder="Enter strong password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <label style={{ fontSize: 13, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
            Confirm Master Password
          </label>
          <input
            type="password"
            className="input-field"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          {(localError || error) && (
            <p style={{ color: 'var(--danger-color)', fontSize: 13, marginBottom: 14 }}>
              {localError || error}
            </p>
          )}

          <button type="submit" className="btn-primary" disabled={isLoading}>
            <Lock size={18} />
            {isLoading ? 'Creating Vault...' : 'Create Encrypted Vault'}
          </button>
        </form>

        <p style={{ color: 'var(--text-muted)', fontSize: 12, textAlign: 'center', marginTop: 20 }}>
          ⚠️ Your Master Password cannot be recovered if lost. All vault data remains strictly local and offline.
        </p>
      </div>
    </div>
  );
};
