import "@openlguid/ui/globals.css";
import "./styles/locals.css";

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from '#/App.tsx';
import { ThemeProvider } from '#/components/theme-provider.tsx';

// From https://mswjs.io/docs/integrations/browser#conditionally-enable-mocking
async function enableMocking() {
  if (process.env.NODE_ENV !== 'development') {
    return
  }
 
  const { worker } = await import('#/tests/browser.ts')
 
  // `worker.start()` returns a Promise that resolves
  // once the Service Worker is up and ready to intercept requests.
  return worker.start()
}


enableMocking().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <ThemeProvider defaultTheme="system">
        <App />
      </ThemeProvider>
    </StrictMode>,
  )
});

