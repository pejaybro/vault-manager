import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { KeyRound, ShieldCheck, Key, RefreshCw, Settings, Lock, Search } from 'lucide-react';
import { DesktopVaultProvider, useDesktopVault } from './context/DesktopVaultContext';
import { QuickSearchOverlay } from './components/QuickSearchOverlay';
import { SetupPage } from './pages/Setup';
import { UnlockPage } from './pages/Unlock';
import { PasswordsPage } from './pages/Passwords';
import { AuthenticatorPage } from './pages/Authenticator';
import { KeysPage } from './pages/Keys';
import { SyncPage } from './pages/Sync';
import { SettingsPage } from './pages/Settings';
import './App.css';

function DesktopAppShell() {
  const { isUnlocked, vaultExists, isLoading, lock } = useDesktopVault();
  const [showQuickSearch, setShowQuickSearch] = useState(false);

  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        setShowQuickSearch((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, []);

  if (isLoading) {
    return (
      <div className="auth-page">
        <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
          <h3>Checking vault security...</h3>
        </div>
      </div>
    );
  }

  if (!vaultExists) {
    return <SetupPage />;
  }

  if (!isUnlocked) {
    return <UnlockPage />;
  }

  return (
    <BrowserRouter>
      <div className="app-container">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-header">
            <ShieldCheck size={28} className="sidebar-logo" />
            <span className="sidebar-title">Vault Manager</span>
          </div>

          <nav className="sidebar-nav">
            <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <KeyRound size={18} /> Passwords
            </NavLink>
            <NavLink to="/authenticator" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <ShieldCheck size={18} /> Authenticator
            </NavLink>
            <NavLink to="/keys" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Key size={18} /> Digital Keys
            </NavLink>
            <NavLink to="/sync" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <RefreshCw size={18} /> Sync & Export
            </NavLink>
            <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Settings size={18} /> Settings
            </NavLink>
          </nav>

          <div className="sidebar-footer">
            <button
              onClick={() => setShowQuickSearch(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                width: '100%',
                padding: 10,
                borderRadius: 8,
                background: 'var(--card-color)',
                border: '1px solid var(--surface-border)',
                color: 'var(--text-color)',
                fontWeight: 600,
                fontSize: 13,
                cursor: 'pointer',
                marginBottom: 8,
              }}
            >
              <Search size={16} color="var(--primary-color)" /> Quick Fill (Ctrl+Shift+L)
            </button>

            <button className="lock-btn" onClick={lock}>
              <Lock size={16} /> Lock Vault
            </button>
          </div>
        </aside>

        {/* Quick Search Overlay */}
        <QuickSearchOverlay isOpen={showQuickSearch} onClose={() => setShowQuickSearch(false)} />

        {/* Main View Area */}
        <main className="main-content">
          <Routes>
            <Route path="/" element={<PasswordsPage />} />
            <Route path="/authenticator" element={<AuthenticatorPage />} />
            <Route path="/keys" element={<KeysPage />} />
            <Route path="/sync" element={<SyncPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <DesktopVaultProvider>
      <DesktopAppShell />
    </DesktopVaultProvider>
  );
}
