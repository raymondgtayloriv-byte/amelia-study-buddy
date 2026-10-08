import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// StrictMode removed — it forces Canvas mount/unmount/remount in development,
// which destroys and recreates the WebGL context. R3F's remount path fails
// silently, producing a white box. Development-only (no production impact).
createRoot(document.getElementById('root')).render(<App />)
