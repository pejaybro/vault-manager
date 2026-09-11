import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { QrCode, Download, Upload, Copy, Check, ShieldAlert } from 'lucide-react';
import { useDesktopVault } from '../context/DesktopVaultContext';
import { STORAGE_KEYS } from '@vault/core';
import { desktopStorage } from '../storage/TauriStorageAdapter';

export const SyncPage: React.FC = () => {
  const { unlockVault, importVaultFile } = useDesktopVault();

  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [password, setPassword] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [encryptedPayload, setEncryptedPayload] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  // Import state
  const [importJson, setImportJson] = useState('');
  const [importPassword, setImportPassword] = useState('');
  const [importError, setImportError] = useState('');

  const handleAuthorize = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const ok = await unlockVault(password);
    if (ok) {
      const raw = await desktopStorage.read(STORAGE_KEYS.VAULT);
      if (raw) {
        setEncryptedPayload(raw);
        setIsAuthorized(true);
      }
    } else {
      setError('Invalid Master Password');
    }
  };

  const handleCopyPayload = () => {
    navigator.clipboard.writeText(encryptedPayload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = () => {
    const blob = new Blob([encryptedPayload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vault_backup.vault';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setImportError('');
    if (!importJson.trim() || !importPassword) return;

    const ok = await importVaultFile(importJson.trim(), importPassword);
    if (ok) {
      alert('Vault imported successfully!');
      setImportJson('');
      setImportPassword('');
    } else {
      setImportError('Invalid password or corrupted vault file.');
    }
  };

  return (
    <div style={{ padding: 28, overflowY: 'auto', flex: 1, maxWidth: 640 }}>
      <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Export & Sync Vault</h2>
      <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 }}>
        Transfer your encrypted vault between mobile and desktop offline.
      </p>

      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        <button
          onClick={() => setActiveTab('export')}
          className="btn-primary"
          style={{
            flex: 1,
            backgroundColor: activeTab === 'export' ? 'var(--primary-color)' : 'var(--surface-color)',
            color: activeTab === 'export' ? '#FFF' : 'var(--text-muted)',
            border: '1px solid var(--surface-border)',
          }}
        >
          <QrCode size={16} /> Export / Sync QR
        </button>
        <button
          onClick={() => setActiveTab('import')}
          className="btn-primary"
          style={{
            flex: 1,
            backgroundColor: activeTab === 'import' ? 'var(--primary-color)' : 'var(--surface-color)',
            color: activeTab === 'import' ? '#FFF' : 'var(--text-muted)',
            border: '1px solid var(--surface-border)',
          }}
        >
          <Upload size={16} /> Import Vault File
        </button>
      </div>

      {activeTab === 'export' ? (
        !isAuthorized ? (
          <div className="auth-card">
            <ShieldAlert size={36} color="var(--warning-color)" style={{ margin: '0 auto 12px', display: 'block' }} />
            <h3 style={{ fontSize: 18, fontWeight: 700, textAlign: 'center', marginBottom: 8 }}>
              Authorize Export
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', marginBottom: 20 }}>
              Confirm your master password to generate encrypted sync QR payload.
            </p>
            <form onSubmit={handleAuthorize}>
              <input
                type="password"
                className="input-field"
                placeholder="Master Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {error && <p style={{ color: 'var(--danger-color)', fontSize: 13, marginBottom: 12 }}>{error}</p>}
              <button type="submit" className="btn-primary">
                Authorize
              </button>
            </form>
          </div>
        ) : (
          <div className="auth-card" style={{ maxWidth: '100%', alignItems: 'center', textAlign: 'center' }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Encrypted Sync QR Code</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 20 }}>
              Scan this QR code using Vault Manager on your phone to sync your vault.
            </p>

            <div style={{ backgroundColor: '#FFF', padding: 16, borderRadius: 12, display: 'inline-block', marginBottom: 20 }}>
              <QRCodeSVG value={encryptedPayload.slice(0, 800)} size={220} />
            </div>

            <div style={{ display: 'flex', gap: 12, width: '100%' }}>
              <button className="btn-primary" style={{ flex: 1, backgroundColor: 'var(--surface-color)', color: 'var(--text-color)', border: '1px solid var(--surface-border)' }} onClick={handleCopyPayload}>
                {copied ? <Check size={16} color="var(--success-color)" /> : <Copy size={16} />}
                {copied ? 'Copied' : 'Copy Payload'}
              </button>
              <button className="btn-primary" style={{ flex: 1 }} onClick={handleDownloadFile}>
                <Download size={16} /> Download .vault File
              </button>
            </div>
          </div>
        )
      ) : (
        <div className="auth-card" style={{ maxWidth: '100%' }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Import Vault Backup</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 20 }}>
            Paste the contents of your `.vault` file to restore or load on desktop.
          </p>

          <form onSubmit={handleImportSubmit}>
            <label style={{ fontSize: 13, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
              Encrypted Payload (JSON)
            </label>
            <textarea
              className="input-field"
              rows={6}
              style={{ fontFamily: 'monospace', fontSize: 12 }}
              placeholder='{"v":1,"salt":"...","iv":"...","data":"..."}'
              value={importJson}
              onChange={(e) => setImportJson(e.target.value)}
              required
            />

            <label style={{ fontSize: 13, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
              Vault Master Password
            </label>
            <input
              type="password"
              className="input-field"
              placeholder="Master Password"
              value={importPassword}
              onChange={(e) => setImportPassword(e.target.value)}
              required
            />

            {importError && <p style={{ color: 'var(--danger-color)', fontSize: 13, marginBottom: 12 }}>{importError}</p>}

            <button type="submit" className="btn-primary">
              <Upload size={16} /> Decrypt & Import Vault
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
