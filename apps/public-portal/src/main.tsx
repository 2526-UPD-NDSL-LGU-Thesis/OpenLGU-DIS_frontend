import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import "@openlgu-dis/ui/globals.css";
import "./styles/locals.css";
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
