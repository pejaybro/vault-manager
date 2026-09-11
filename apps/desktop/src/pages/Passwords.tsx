import React, { useState, useMemo } from 'react';
import { Search, Plus, KeyRound, Copy, Check, Trash2, Save, ExternalLink, Star } from 'lucide-react';
import { useDesktopVault } from '../context/DesktopVaultContext';
import { getEntriesByType, PasswordData, VaultEntry, Category } from '@vault/core';

export const PasswordsPage: React.FC = () => {
  const { vault, addEntry, updateEntry, deleteEntry } = useDesktopVault();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Form state
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState<Category>('work');
  const [notes, setNotes] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const passwordEntries = useMemo(() => {
    if (!vault) return [];
    return getEntriesByType(vault, 'password');
  }, [vault]);

  const filtered = useMemo(() => {
    return passwordEntries.filter((e) => {
      const q = query.toLowerCase().trim();
      const d = e.data as PasswordData;
      return !q || e.name.toLowerCase().includes(q) || d.username?.toLowerCase().includes(q);
    });
  }, [passwordEntries, query]);

  const selectedEntry = useMemo(() => {
    return passwordEntries.find((e) => e.id === selectedId);
  }, [passwordEntries, selectedId]);

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const startCreate = () => {
    setIsCreating(true);
    setSelectedId(null);
    setName('');
    setUsername('');
    setPassword('');
    setUrl('');
    setCategory('work');
    setNotes('');
  };

  const startEdit = (entry: VaultEntry) => {
    setIsCreating(false);
    setSelectedId(entry.id);
    const d = entry.data as PasswordData;
    setName(entry.name);
    setUsername(d.username || '');
    setPassword(d.password);
    setUrl(d.url || '');
    setCategory(d.category || 'work');
    setNotes(d.notes || '');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !password) return;

    const data: PasswordData = {
      username: username.trim(),
      password,
      url: url.trim() || undefined,
      category,
      notes: notes.trim() || undefined,
    };

    if (isCreating) {
      await addEntry({
        type: 'password',
        name: name.trim(),
        favourite: false,
        data,
      });
      setIsCreating(false);
    } else if (selectedId) {
      await updateEntry(selectedId, {
        name: name.trim(),
        data,
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this password entry?')) {
      await deleteEntry(id);
      setSelectedId(null);
      setIsCreating(false);
    }
  };

  return (
    <div className="two-panel-layout">
      {/* Left List Panel */}
      <div className="list-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800 }}>Passwords</h2>
          <button className="btn-primary" style={{ padding: '6px 12px', width: 'auto' }} onClick={startCreate}>
            <Plus size={16} /> New
          </button>
        </div>

        <div style={{ position: 'relative', marginBottom: 16 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="input-field"
            style={{ paddingLeft: 36, marginBottom: 0 }}
            placeholder="Search passwords..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {filtered.map((item) => {
            const d = item.data as PasswordData;
            const isSelected = item.id === selectedId;
            return (
              <div
                key={item.id}
                onClick={() => startEdit(item)}
                style={{
                  padding: 12,
                  borderRadius: 8,
                  backgroundColor: isSelected ? 'var(--card-color)' : 'transparent',
                  border: isSelected ? '1px solid var(--primary-color)' : '1px solid transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <KeyRound size={20} color="var(--primary-color)" />
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-color)' }}>{item.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{d.username || 'No username'}</div>
                </div>
                {item.favourite && <Star size={14} fill="var(--warning-color)" color="var(--warning-color)" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Detail / Edit Panel */}
      <div className="detail-panel">
        {isCreating || selectedEntry ? (
          <form onSubmit={handleSave} style={{ maxWidth: 500 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3 style={{ fontSize: 22, fontWeight: 700 }}>
                {isCreating ? 'New Password' : 'Edit Password'}
              </h3>
              <div style={{ display: 'flex', gap: 8 }}>
                {selectedEntry && (
                  <button
                    type="button"
                    onClick={() => handleDelete(selectedEntry.id)}
                    style={{
                      padding: 8,
                      borderRadius: 6,
                      background: 'rgba(239,68,68,0.1)',
                      border: '1px solid var(--danger-color)',
                      color: 'var(--danger-color)',
                      cursor: 'pointer',
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                )}
                <button type="submit" className="btn-primary" style={{ width: 'auto' }}>
                  <Save size={16} /> Save
                </button>
              </div>
            </div>

            <label style={{ fontSize: 13, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
              Service / App Name *
            </label>
            <input
              type="text"
              className="input-field"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. GitHub, Google"
              required
            />

            <label style={{ fontSize: 13, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
              Username or Email
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="text"
                className="input-field"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. user@gmail.com"
              />
              {username && (
                <button
                  type="button"
                  onClick={() => handleCopy(username, 'username')}
                  style={{ height: 42, padding: '0 12px', background: 'var(--bg-color)', border: '1px solid var(--surface-border)', color: 'var(--text-color)', borderRadius: 8, cursor: 'pointer' }}
                >
                  {copiedField === 'username' ? <Check size={16} color="var(--success-color)" /> : <Copy size={16} />}
                </button>
              )}
            </div>

            <label style={{ fontSize: 13, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
              Password *
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type={showPassword ? 'text' : 'password'}
                className="input-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ height: 42, padding: '0 12px', background: 'var(--bg-color)', border: '1px solid var(--surface-border)', color: 'var(--text-color)', borderRadius: 8, cursor: 'pointer' }}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
              {password && (
                <button
                  type="button"
                  onClick={() => handleCopy(password, 'password')}
                  style={{ height: 42, padding: '0 12px', background: 'var(--bg-color)', border: '1px solid var(--surface-border)', color: 'var(--text-color)', borderRadius: 8, cursor: 'pointer' }}
                >
                  {copiedField === 'password' ? <Check size={16} color="var(--success-color)" /> : <Copy size={16} />}
                </button>
              )}
            </div>

            <label style={{ fontSize: 13, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
              Website URL
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="text"
                className="input-field"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://..."
              />
              {url && (
                <a
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  style={{ height: 42, padding: '0 12px', background: 'var(--bg-color)', border: '1px solid var(--surface-border)', color: 'var(--primary-color)', borderRadius: 8, display: 'flex', alignItems: 'center' }}
                >
                  <ExternalLink size={16} />
                </a>
              )}
            </div>

            <label style={{ fontSize: 13, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
              Notes
            </label>
            <textarea
              className="input-field"
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes..."
            />
          </form>
        ) : (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: 100 }}>
            <KeyRound size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
            <h3>Select a password or create a new entry</h3>
          </div>
        )}
      </div>
    </div>
  );
};
