/**
 * Jib M3ak — punto de entrada.
 * Copyright (c) 2026 Ángel Serrano Domínguez. Todos los derechos reservados.
 */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { ProveedorIdioma } from './i18n/idioma.jsx';
import { registrarServiceWorker } from './registrarServiceWorker.js';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ProveedorIdioma>
      <App />
    </ProveedorIdioma>
  </StrictMode>
);

registrarServiceWorker();
