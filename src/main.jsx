import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// import './index.css' <-- ผมลบบรรทัดนี้ออกให้แล้วครับ เพราะเราไม่ได้ใช้ไฟล์นี้แล้ว
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)