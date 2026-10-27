import { useLocation } from 'react-router-dom';
import { usePageMeta } from '../seo/usePageMeta';

/**
 * Title for private and utility screens (portals, workspaces, staff tools).
 * These are always marked noindex. Public pages use `usePageMeta` instead.
 * Never pass user-entered or sensitive text here.
 */
export function useDocumentTitle(title: string) {
  const { pathname } = useLocation();
  usePageMeta({
    title: title || 'Imela Ventures',
    description: 'Imela Ventures — counselling and mental wellness in Nairobi, Kenya.',
    path: pathname,
    noindex: true,
  });
}
