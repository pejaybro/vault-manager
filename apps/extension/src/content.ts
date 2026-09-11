// ============================================================
// VAULT MANAGER — Content Script
// Detects login input fields on websites and provides 1-click auto-fill
// Compatible with Chrome, Edge, Firefox, Brave, Safari
// ============================================================

export interface FillRequestPayload {
  username?: string;
  password?: string;
  totpCode?: string;
}

/**
 * Auto-fill credentials into detected login fields on the current page
 */
export function autoFillCredentials(payload: FillRequestPayload): void {
  const passwordInputs = Array.from(
    document.querySelectorAll<HTMLInputElement>('input[type="password"]')
  );

  const usernameInputs = Array.from(
    document.querySelectorAll<HTMLInputElement>(
      'input[type="text"], input[type="email"], input[name*="user"], input[name*="email"], input[autocomplete="username"]'
    )
  );

  // Fill Username / Email
  if (payload.username && usernameInputs.length > 0) {
    const userField = usernameInputs[0];
    userField.value = payload.username;
    userField.dispatchEvent(new Event('input', { bubbles: true }));
    userField.dispatchEvent(new Event('change', { bubbles: true }));
  }

  // Fill Password
  if (payload.password && passwordInputs.length > 0) {
    const passField = passwordInputs[0];
    passField.value = payload.password;
    passField.dispatchEvent(new Event('input', { bubbles: true }));
    passField.dispatchEvent(new Event('change', { bubbles: true }));
  }
}

/**
 * Inject in-field Vault Manager icon into password fields
 */
export function injectInFieldBadge(): void {
  const passwordFields = document.querySelectorAll<HTMLInputElement>('input[type="password"]');

  passwordFields.forEach((field) => {
    if (field.dataset.vaultInjected === 'true') return;
    field.dataset.vaultInjected = 'true';

    // Position relative wrapper
    const wrapper = field.parentElement;
    if (wrapper) {
      const badge = document.createElement('div');
      badge.innerText = '🔐';
      badge.title = 'Auto-fill with Vault Manager';
      badge.style.position = 'absolute';
      badge.style.right = '8px';
      badge.style.top = '50%';
      badge.style.transform = 'translateY(-50%)';
      badge.style.cursor = 'pointer';
      badge.style.zIndex = '999';
      badge.style.fontSize = '14px';

      badge.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        // Request credentials from extension service worker / desktop vault
        if (typeof chrome !== 'undefined' && chrome.runtime) {
          chrome.runtime.sendMessage({ action: 'REQUEST_AUTOFILL', domain: window.location.hostname });
        }
      });

      if (getComputedStyle(wrapper).position === 'static') {
        wrapper.style.position = 'relative';
      }
      wrapper.appendChild(badge);
    }
  });
}

// Observe DOM mutations to catch dynamically loaded forms (React / Vue / Angular SPA logins)
const observer = new MutationObserver(() => {
  injectInFieldBadge();
});

if (document.body) {
  injectInFieldBadge();
  observer.observe(document.body, { childList: true, subtree: true });
}

// Listen for fill commands from Extension background service worker
if (typeof chrome !== 'undefined' && chrome.runtime) {
  chrome.runtime.onMessage.addListener((message) => {
    if (message.action === 'FILL_CREDENTIALS') {
      autoFillCredentials(message.payload);
    }
  });
}
