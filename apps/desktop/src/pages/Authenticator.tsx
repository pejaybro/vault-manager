import React, { useState, useEffect, useMemo } from 'react';
import { ShieldCheck, Plus, Copy, Check, Search, Clock } from 'lucide-react';
import { useDesktopVault } from '../context/DesktopVaultContext';
import { getEntriesByType, generateTOTP, getTimeRemaining, getProgress, formatCode, validateSecret, TOTPData, parseTOTPUri } from '@vault/core';

const DesktopTOTPCard: React.FC<{ entry: any; onDelete: (id: string) => void }> = ({ entry, onDelete }) => {
  const data = entry.data as TOTPData;

  const [code, setCode] = useState(() => generateTOTP(data.secret, data.period, data.digits));
  const [remaining, setRemaining] = useState(() => getTimeRemaining(data.period));
  const [progress, setProgress] = useState(() => getProgress(data.period));
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const rem = getTimeRemaining(data.period);
      const prog = getProgress(data.period);

      setRemaining(rem);
      setProgress(prog);

      if (rem === data.period || code === '------') {
        try {
          setCode(generateTOTP(data.secret, data.period, data.digits));
        } catch {
          setCode('ERROR');
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [data]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ backgroundColor: 'var(--surface-color)', borderRadius: 12, padding: 20, border: '1px solid var(--surface-border)', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <ShieldCheck size={24} color="var(--success-color)" />
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-color)' }}>{data.issuer}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{data.account || 'Account'}</div>
          </div>
        </div>
        <button
          onClick={handleCopy}
          style={{ background: 'var(--bg-color)', border: '1px solid var(--surface-border)', color: 'var(--text-color)', borderRadius: 6, padding: '6px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
        >
          {copied ? <Check size={16} color="var(--success-color)" /> : <Copy size={16} />}
        </button>
      </div>

      <div style={{ fontSize: 32, fontWeight: 800, fontFamily: 'monospace', letterSpacing: 4, color: 'var(--primary-color)', textAlign: 'center', padding: '10px 0' }}>
        {formatCode(code)}
      </div>

      <div style={{ width: '100%', height: 4, backgroundColor: 'var(--bg-color)', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ width: `${progress * 100}%`, height: '100%', backgroundColor: remaining < 5 ? 'var(--danger-color)' : 'var(--primary-color)', transition: 'width 1s linear' }} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: 'var(--text-muted)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Clock size={12} /> Refreshes in {remaining}s
        </div>
        <button
          onClick={() => onDelete(entry.id)}
          style={{ background: 'none', border: 'none', color: 'var(--danger-color)', cursor: 'pointer', fontSize: 12 }}
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export const AuthenticatorPage: React.FC = () => {
  const { vault, addEntry, deleteEntry } = useDesktopVault();

  const [query, setQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [issuer, setIssuer] = useState('');
  const [account, setAccount] = useState('');
  const [secret, setSecret] = useState('');
  const [otpUri, setOtpUri] = useState('');

  const totpEntries = useMemo(() => {
    if (!vault) return [];
    return getEntriesByType(vault, 'totp');
  }, [vault]);

  const filtered = useMemo(() => {
    return totpEntries.filter((e) => {
      const q = query.toLowerCase().trim();
      const d = e.data as TOTPData;
      return !q || d.issuer.toLowerCase().includes(q) || d.account?.toLowerCase().includes(q);
    });
  }, [totpEntries, query]);

  const handleUriParse = () => {
    if (!otpUri) return;
    const parsed = parseTOTPUri(otpUri);
    if (parsed) {
      setIssuer(parsed.issuer);
      setAccount(parsed.account);
      setSecret(parsed.secret);
    } else {
      alert('Invalid otpauth:// URI');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!issuer.trim() || !secret.trim()) return;

    const cleanSecret = secret.trim().replace(/\s+/g, '').toUpperCase();
    if (!validateSecret(cleanSecret)) {
      alert('Secret key must be a valid Base32 string (A-Z, 2-7)');
      return;
    }

    const data: TOTPData = {
      secret: cleanSecret,
      issuer: issuer.trim(),
      account: account.trim(),
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
    };

    await addEntry({
      type: 'totp',
      name: `${issuer.trim()} (${account.trim()})`,
      favourite: false,
      data,
    });

    setShowAddModal(false);
    setIssuer('');
    setAccount('');
    setSecret('');
    setOtpUri('');
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this 2FA account?')) {
      await deleteEntry(id);
    }
  };

  return (
    <div style={{ padding: 28, overflowY: 'auto', flex: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 800 }}>Authenticator (TOTP)</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>6-digit refreshing security codes (RFC 6238)</p>
        </div>
        <button className="btn-primary" style={{ width: 'auto' }} onClick={() => setShowAddModal(true)}>
          <Plus size={16} /> Add Authenticator
        </button>
      </div>

      <div style={{ position: 'relative', maxWidth: 360, marginBottom: 24 }}>
        <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-muted)' }} />
        <input
          type="text"
          className="input-field"
          style={{ paddingLeft: 36, marginBottom: 0 }}
          placeholder="Search 2FA accounts..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
        {filtered.map((item) => (
          <DesktopTOTPCard key={item.id} entry={item} onDelete={handleDelete} />
        ))}
      </div>

      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="auth-card" style={{ maxWidth: 480 }}>
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Add 2FA Authenticator</h3>
            <form onSubmit={handleSave}>
              <label style={{ fontSize: 13, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                Paste OTP Auth URI (optional)
              </label>
              <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                <input
                  type="text"
                  className="input-field"
                  style={{ marginBottom: 0 }}
                  placeholder="otpauth://totp/GitHub:user@email.com?secret=..."
                  value={otpUri}
                  onChange={(e) => setOtpUri(e.target.value)}
                />
                <button type="button" onClick={handleUriParse} style={{ padding: '0 12px', borderRadius: 8, background: 'var(--primary-color)', color: 'white', border: 'none', cursor: 'pointer' }}>
                  Parse
                </button>
              </div>

              <label style={{ fontSize: 13, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                Issuer / Service Name *
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. GitHub, Google"
                value={issuer}
                onChange={(e) => setIssuer(e.target.value)}
                required
              />

              <label style={{ fontSize: 13, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                Account / Email
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. user@email.com"
                value={account}
                onChange={(e) => setAccount(e.target.value)}
              />

              <label style={{ fontSize: 13, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                Secret Key (Base32) *
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="JBSWY3DPEHPK3PXP"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                required
              />

              <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
                <button type="button" style={{ flex: 1, padding: 12, borderRadius: 8, background: 'transparent', border: '1px solid var(--surface-border)', color: 'var(--text-color)', cursor: 'pointer' }} onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                  Save Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
