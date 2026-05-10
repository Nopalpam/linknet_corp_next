'use client';

import { useEffect, useState } from 'react';
import { fetchLinknetMedia, normalizeMediaData } from '@/lib/mediaService';

export function useLinknetMedia(enabled = true) {
  const [state, setState] = useState({
    data: null,
    isLoading: Boolean(enabled),
    error: null,
  });

  useEffect(() => {
    if (!enabled) {
      setState({ data: null, isLoading: false, error: null });
      return undefined;
    }

    let mounted = true;

    setState((previous) => ({ ...previous, isLoading: true, error: null }));
    fetchLinknetMedia()
      .then((payload) => {
        if (!mounted) return;
        setState({ data: normalizeMediaData(payload), isLoading: false, error: null });
      })
      .catch((error) => {
        if (!mounted) return;
        setState({ data: null, isLoading: false, error });
      });

    return () => {
      mounted = false;
    };
  }, [enabled]);

  return state;
}
