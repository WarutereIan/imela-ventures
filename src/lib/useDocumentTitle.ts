import { useEffect } from 'react';

/** Sets the page title. Never pass user-entered or sensitive text here. */
export function useDocumentTitle(title: string) {
  useEffect(() => {
    document.title = title ? `${title} · Imela Ventures` : 'Imela Ventures';
  }, [title]);
}
