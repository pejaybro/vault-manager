import React, { useState, useMemo, useEffect } from 'react';
import { Search, KeyRound, Copy, Check, X } from 'lucide-react';
import { useDesktopVault } from '../context/DesktopVaultContext';
import { getEntriesByType, PasswordData } from '@vault/core';

interface QuickSearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickSearchOverlay: React.FC<QuickSearchOverlayProps> = ({ isOpen, onClose }) => {
  const { vault } = useDesktopVault();
  const [query, setQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        if (isOpen) onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const passwordEntries = useMemo(() => {
    if (!vault) return [];
    return getEntriesByType(vault, 'password');
  }, [vault]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return passwordEntries.filter((e) => {
      const data = e.data as PasswordData;
      return !q || e.name.toLowerCase().includes(q) || data.username?.toLowerCase().includes(q);
    });
  }, [passwordEntries, query]);

  if (!isOpen) return null;

  const handleCopyPassword = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
      onClose();
    }, 1200);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 100, zIndex: 9999 }}>
      <div style={{ width: 500, backgroundColor: 'var(--surface-color)', borderRadius: 12, border: '1px solid var(--surface-border)', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)' }}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '14px 16px', borderBottom: '1px solid var(--surface-border)' }}>
          <Search size={18} color="var(--text-muted)" style={{ marginRight: 10 }} />
          <input
            type="text"
            style={{ flex: 1, background: 'none', border: 'none', color: '#FFF', fontSize: 16, outline: 'none' }}
            placeholder="Type to search passwords (Ctrl+Shift+L)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ maxHeight: 320, overflowY: 'auto', padding: 8 }}>
          {filtered.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
              No passwords found
            </div>
          ) : (
            filtered.map((item) => {
              const data = item.data as PasswordData;
              const isCopied = copiedId === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => handleCopyPassword(data.password, item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    borderRadius: 8,
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--card-color)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <KeyRound size={18} color="var(--primary-color)" />
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-color)' }}>{item.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{data.username || 'No username'}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: isCopied ? 'var(--success-color)' : 'var(--text-muted)' }}>
                    {isCopied ? <Check size={16} /> : <Copy size={16} />}
                    {isCopied ? 'Copied!' : 'Copy Password'}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
