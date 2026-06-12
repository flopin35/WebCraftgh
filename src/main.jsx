import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { logProductionCheckReport, runProductionChecks } from './services/productionCheckService';
import './styles/global.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);

if (import.meta.env.PROD) {
  runProductionChecks().then(logProductionCheckReport);
}
