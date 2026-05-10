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

  container.innerHTML = '';

  const script = document.createElement('script');
  if (scriptId) script.dataset.widgetId = scriptId;
  script.src = src;
  script.type = 'text/javascript';
  script.async = true;
  script.text = JSON.stringify(config || {});
  script.onerror = () => {
    if (typeof onError === 'function') {
      onError(new Error(`Failed to load external widget script: ${src}`));
    }
  };

  container.appendChild(script);

  return () => {
    script.onerror = null;
    if (container) {
      container.innerHTML = '';
    }
  };
}
