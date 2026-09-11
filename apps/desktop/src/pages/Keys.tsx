import React, { useState, useMemo } from 'react';
import { Search, Plus, Key, Copy, Check, Trash2, Save } from 'lucide-react';
import { useDesktopVault } from '../context/DesktopVaultContext';
import { getEntriesByType, KeyData, KeyType, VaultEntry } from '@vault/core';

const KEY_TYPES: { label: string; value: KeyType }[] = [
  { label: 'API Key', value: 'api_key' },
  { label: 'SSH Key', value: 'ssh_key' },
  { label: 'Certificate', value: 'certificate' },
  { label: 'Token', value: 'token' },
  { label: 'Secure Note', value: 'note' },
  { label: 'Other', value: 'other' },
];

export const KeysPage: React.FC = () => {
  const { vault, addEntry, updateEntry, deleteEntry } = useDesktopVault();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [copied, setCopied] = useState(false);

  // Form state
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState('');
  const [keyType, setKeyType] = useState<KeyType>('api_key');
  const [keyValue, setKeyValue] = useState('');
  const [description, setDescription] = useState('');
  const [tagsStr, setTagsStr] = useState('');
  const [showValue, setShowValue] = useState(false);

  const keyEntries = useMemo(() => {
    if (!vault) return [];
    return getEntriesByType(vault, 'key');
  }, [vault]);

  const filtered = useMemo(() => {
    return keyEntries.filter((e) => {
      const q = query.toLowerCase().trim();
      const d = e.data as KeyData;
      return !q || e.name.toLowerCase().includes(q) || d.description?.toLowerCase().includes(q);
    });
  }, [keyEntries, query]);

  const selectedEntry = useMemo(() => {
    return keyEntries.find((e) => e.id === selectedId);
  }, [keyEntries, selectedId]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const startCreate = () => {
    setIsCreating(true);
    setSelectedId(null);
    setName('');
    setKeyType('api_key');
    setKeyValue('');
    setDescription('');
    setTagsStr('');
    setShowValue(true);
  };

  const startEdit = (entry: VaultEntry) => {
    setIsCreating(false);
    setSelectedId(entry.id);
    const d = entry.data as KeyData;
    setName(entry.name);
    setKeyType(d.keyType);
    setKeyValue(d.keyValue);
    setDescription(d.description || '');
    setTagsStr(d.tags?.join(', ') || '');
    setShowValue(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !keyValue.trim()) return;

    const tags = tagsStr.split(',').map((t) => t.trim()).filter(Boolean);
    const data: KeyData = {
      keyType,
      keyValue: keyValue.trim(),
      description: description.trim() || undefined,
      tags: tags.length > 0 ? tags : undefined,
    };

    if (isCreating) {
      await addEntry({
        type: 'key',
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
    if (confirm('Delete this key / note entry?')) {
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
          <h2 style={{ fontSize: 20, fontWeight: 800 }}>Digital Keys</h2>
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
            placeholder="Search keys & notes..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {filtered.map((item) => {
            const d = item.data as KeyData;
            const isSelected = item.id === selectedId;
            return (
              <div
                key={item.id}
                onClick={() => startEdit(item)}
                style={{
                  padding: 12,
                  borderRadius: 8,
                  backgroundColor: isSelected ? 'var(--card-color)' : 'transparent',
                  border: isSelected ? '1px solid var(--warning-color)' : '1px solid transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <Key size={20} color="var(--warning-color)" />
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-color)' }}>{item.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{d.keyType.toUpperCase().replace('_', ' ')}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Detail / Edit Panel */}
      <div className="detail-panel">
        {isCreating || selectedEntry ? (
          <form onSubmit={handleSave} style={{ maxWidth: 540 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3 style={{ fontSize: 22, fontWeight: 700 }}>
                {isCreating ? 'New Key / Note' : 'Edit Key'}
              </h3>
              <div style={{ display: 'flex', gap: 8 }}>
                {selectedEntry && (
                  <button
                    type="button"
                    onClick={() => handleDelete(selectedEntry.id)}
                    style={{ padding: 8, borderRadius: 6, background: 'rgba(239,68,68,0.1)', border: '1px solid var(--danger-color)', color: 'var(--danger-color)', cursor: 'pointer' }}
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
              Key Name *
            </label>
            <input
              type="text"
              className="input-field"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. AWS Production Key, SSH Key"
              required
            />

            <label style={{ fontSize: 13, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
              Key Type
            </label>
            <select
              className="input-field"
              value={keyType}
              onChange={(e) => setKeyType(e.target.value as KeyType)}
              style={{ height: 42 }}
            >
              {KEY_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                {keyType === 'note' ? 'Content *' : 'Secret Key Value *'}
              </label>
              <button
                type="button"
                onClick={() => setShowValue(!showValue)}
                style={{ background: 'none', border: 'none', color: 'var(--primary-color)', fontSize: 12, cursor: 'pointer' }}
              >
                {showValue ? 'Hide Value' : 'Show Value'}
              </button>
            </div>

            <div style={{ position: 'relative' }}>
              <textarea
                className="input-field"
                rows={6}
                style={{ fontFamily: 'monospace', fontSize: 13 }}
                value={keyValue}
                onChange={(e) => setKeyValue(e.target.value)}
                placeholder="Secret key or payload value..."
                required
              />
              {keyValue && (
                <button
                  type="button"
                  onClick={() => handleCopy(keyValue)}
                  style={{ position: 'absolute', right: 10, top: 10, padding: '4px 8px', borderRadius: 6, background: 'var(--surface-color)', border: '1px solid var(--surface-border)', color: 'var(--text-color)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}
                >
                  {copied ? <Check size={14} color="var(--success-color)" /> : <Copy size={14} />} Copy
                </button>
              )}
            </div>

            <label style={{ fontSize: 13, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
              Description
            </label>
            <input
              type="text"
              className="input-field"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this key used for?"
            />

            <label style={{ fontSize: 13, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
              Tags (comma separated)
            </label>
            <input
              type="text"
              className="input-field"
              value={tagsStr}
              onChange={(e) => setTagsStr(e.target.value)}
              placeholder="production, aws, server"
            />
          </form>
        ) : (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: 100 }}>
            <Key size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
            <h3>Select a key or create a new entry</h3>
          </div>
        )}
      </div>
    </div>
  );
};
