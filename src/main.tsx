import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { startAnalytics } from './lib/analytics';
import './index.css';

// Production only, so local development never pollutes the reports.
if (import.meta.env.PROD) startAnalytics();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
