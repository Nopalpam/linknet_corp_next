export function mountJsonConfiguredScript({
  container,
  src,
  config,
  scriptId,
  onError,
}) {
  if (!container || !src) {
    return () => {};
  }

  container.replaceChildren();

  const safeSrc = getSafeScriptUrl(src);
  if (!safeSrc) {
    return () => {};
  }

  const script = document.createElement('script');
  if (scriptId) script.dataset.widgetId = scriptId;
  script.src = safeSrc;
  script.type = 'text/javascript';
  script.async = true;
  script.textContent = JSON.stringify(config || {});
  script.onerror = () => {
    if (typeof onError === 'function') {
      onError(new Error(`Failed to load external widget script: ${safeSrc}`));
    }
  };

  container.appendChild(script);

  return () => {
    script.onerror = null;
    if (container) {
      container.replaceChildren();
    }
  };
}

function getSafeScriptUrl(value) {
  try {
    const url = new URL(String(value || ''), window.location.origin);
    const isLocalHttp = url.protocol === 'http:' && ['localhost', '127.0.0.1', '::1'].includes(url.hostname);
    if (url.protocol === 'https:' || isLocalHttp || url.origin === window.location.origin) {
      return url.href;
    }
  } catch {
    return null;
  }

  return null;
}
