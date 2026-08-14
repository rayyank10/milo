import { getPreflightResults } from './preflightApi.js';
import captureMetrics from './captureMetrics.js';

const handleSidekickEvent = async () => {
  try {
    const result = await getPreflightResults({
      url: window.location.href,
      area: document,
      useCache: false,
    });
    if (!result) return;
    await captureMetrics(result.runChecks, { force: true });
  } catch (e) {
    window.lana?.log?.(`Preflight metrics capture failed: ${e}`, { tags: 'preflight' });
  }
};

export default function init() {
  const sidekick = document.querySelector('aem-sidekick, helix-sidekick');
  if (!sidekick) return;

  sidekick.addEventListener('previewed', handleSidekickEvent);
  sidekick.addEventListener('published', handleSidekickEvent);
}
