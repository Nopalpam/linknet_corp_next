'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { fetchLinknetMedia, normalizeMediaData } from '@/lib/mediaService';

const DISABLED_STATE = {
  data: null,
  isLoading: false,
  error: null,
};

function createLinknetMediaStore(enabledInitially) {
  let snapshot = {
    ...DISABLED_STATE,
    isLoading: Boolean(enabledInitially),
    needsRequest: Boolean(enabledInitially),
    requestId: 0,
  };

  const listeners = new Set();

  const emitChange = () => {
    listeners.forEach((listener) => listener());
  };

  return {
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    getSnapshot() {
      return snapshot;
    },
    markDisabled() {
      snapshot = {
        ...DISABLED_STATE,
        needsRequest: true,
        requestId: snapshot.requestId,
      };
      emitChange();
    },
    startRequest() {
      const requestId = snapshot.requestId + 1;
      snapshot = {
        ...DISABLED_STATE,
        isLoading: true,
        needsRequest: false,
        requestId,
      };
      emitChange();
      return requestId;
    },
    resolveRequest(requestId, data) {
      if (snapshot.requestId !== requestId) {
        return;
      }

      snapshot = {
        data,
        error: null,
        isLoading: false,
        needsRequest: false,
        requestId,
      };
      emitChange();
    },
    rejectRequest(requestId, error) {
      if (snapshot.requestId !== requestId) {
        return;
      }

      snapshot = {
        data: null,
        error,
        isLoading: false,
        needsRequest: false,
        requestId,
      };
      emitChange();
    },
  };
}

export function useLinknetMedia(enabled = true) {
  const [store] = useState(() => createLinknetMediaStore(enabled));
  const state = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);

  useEffect(() => {
    if (!enabled) {
      store.markDisabled();
      return undefined;
    }

    let cancelled = false;
    const requestId = store.startRequest();

    fetchLinknetMedia()
      .then((payload) => {
        if (cancelled) return;
        store.resolveRequest(requestId, normalizeMediaData(payload));
      })
      .catch((error) => {
        if (cancelled) return;
        store.rejectRequest(requestId, error);
      });

    return () => {
      cancelled = true;
    };
  }, [enabled, store]);

  if (!enabled) {
    return DISABLED_STATE;
  }

  const isLoading = state.isLoading || state.needsRequest;

  return {
    data: isLoading ? null : state.data,
    isLoading,
    error: isLoading ? null : state.error,
  };
}
