'use client';

import { useEffect, useRef, useState } from 'react';
import { fetchLinknetMedia, normalizeMediaData } from '@/lib/mediaService';

const DISABLED_STATE = {
  data: null,
  isLoading: false,
  error: null,
};

export function useLinknetMedia(enabled = true) {
  const previousEnabledRef = useRef(enabled);
  const requestCycleRef = useRef(0);

  if (enabled && !previousEnabledRef.current) {
    requestCycleRef.current += 1;
  }

  previousEnabledRef.current = enabled;

  const activeRequestCycle = requestCycleRef.current;
  const [state, setState] = useState({
    cycle: -1,
    data: null,
    error: null,
  });

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    let mounted = true;

    fetchLinknetMedia()
      .then((payload) => {
        if (!mounted) return;
        setState({ cycle: activeRequestCycle, data: normalizeMediaData(payload), error: null });
      })
      .catch((error) => {
        if (!mounted) return;
        setState({ cycle: activeRequestCycle, data: null, error });
      });

    return () => {
      mounted = false;
    };
  }, [activeRequestCycle, enabled]);

  if (!enabled) {
    return DISABLED_STATE;
  }

  const isCurrentRequest = state.cycle === activeRequestCycle;

  return {
    data: isCurrentRequest ? state.data : null,
    isLoading: !isCurrentRequest,
    error: isCurrentRequest ? state.error : null,
  };
}
