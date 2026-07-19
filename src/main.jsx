import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { registerSW } from 'virtual:pwa-register'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// --- PWA: auto-detect new deployed versions and offer to update ---
const showUpdateBanner = (onUpdate) => {
  if (document.getElementById('pwa-update-banner')) return
  const bar = document.createElement('div')
  bar.id = 'pwa-update-banner'
  bar.style.cssText =
    'position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:9999;' +
    'display:flex;align-items:center;gap:14px;padding:12px 16px;border-radius:16px;' +
    'background:#0f172a;color:#fff;box-shadow:0 12px 30px -8px rgba(0,0,0,.5);' +
    "font-family:'IBM Plex Sans Thai','Prompt',sans-serif;font-size:14px;white-space:nowrap"
  bar.innerHTML =
    '<span>✨ มีเวอร์ชันใหม่พร้อมใช้งาน</span>' +
    '<button id="pwa-update-btn" style="border:0;cursor:pointer;font:inherit;font-weight:700;' +
    'background:linear-gradient(135deg,#0d9488,#0891b2);color:#fff;padding:8px 16px;border-radius:10px">อัปเดต</button>' +
    '<button id="pwa-update-later" style="border:0;cursor:pointer;font:inherit;background:transparent;' +
    'color:#94a3b8;padding:8px 4px">ภายหลัง</button>'
  document.body.appendChild(bar)
  document.getElementById('pwa-update-btn').onclick = () => onUpdate()
  document.getElementById('pwa-update-later').onclick = () => bar.remove()
}

const updateSW = registerSW({
  onNeedRefresh() {
    showUpdateBanner(() => updateSW(true))
  },
  onRegisteredSW(swUrl, registration) {
    // Check for a newer deployed version every 30 minutes while the app is open
    if (registration) {
      setInterval(() => registration.update(), 30 * 60 * 1000)
    }
  },
})
