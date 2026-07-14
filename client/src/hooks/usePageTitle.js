import { useEffect } from 'react';

export default function usePageTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} — Whispering Pines School` : 'Whispering Pines School';
  }, [title]);
}
