// ============================================================
// VAULT MANAGER — Extension Background Service Worker
// Manages local WebSocket connection to Desktop Vault App
// ============================================================

const DESKTOP_VAULT_WS_URL = 'ws://localhost:15423';
let socket: WebSocket | null = null;

function connectDesktopVault(): void {
  try {
    socket = new WebSocket(DESKTOP_VAULT_WS_URL);

    socket.onopen = () => {
      console.log('[VaultExtension] Connected to Desktop Vault Manager');
    };

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.action === 'AUTOFILL_DATA') {
          // Send data to active tab
          chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]?.id) {
              chrome.tabs.sendMessage(tabs[0].id, {
                action: 'FILL_CREDENTIALS',
                payload: message.payload,
              });
            }
          });
        }
      } catch (err) {
        console.error('[VaultExtension] Failed to parse message', err);
      }
    };

    socket.onclose = () => {
      // Reconnect after 5 seconds
      setTimeout(connectDesktopVault, 5000);
    };
  } catch {
    // Retry connection
    setTimeout(connectDesktopVault, 5000);
  }
}

connectDesktopVault();

// Handle messages from content script or extension popup
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.action === 'REQUEST_AUTOFILL') {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ action: 'QUERY_DOMAIN', domain: request.domain }));
      sendResponse({ status: 'sent' });
    } else {
      sendResponse({ status: 'disconnected' });
    }
  }
  return true;
});
