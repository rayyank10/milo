import { html, signal, useEffect } from '../../../deps/htm-preact.js';
import { STATUS } from '../checks/constants.js';
import { getPreflightResults } from '../checks/preflightApi.js';
import { isViewportTooSmall } from '../checks/assets.js';

// Define signals for check results and viewport status
const assetDimensionsResult = signal({
  title: 'Asset Dimensions',
  description: 'Checking...',
});
const assetsWithMismatch = signal([]);
const assetsWithMatch = signal([]);
export const criticalAssetFailures = signal([]);
export const warningAssetFailures = signal([]);
const viewportTooSmall = signal(isViewportTooSmall());

/**
 * Runs asset checks and updates signals with the results.
 */
async function getResults() {
  const results = await getPreflightResults({
    url: window.location.pathname,
    area: document,
    useCache: false,
    injectVisualMetadata: false,
  });

  if (!results) return; // Page is excluded from preflight checks

  const checks = results.runChecks.assets || [];

  const result = await Promise.resolve(checks[0]).catch((error) => ({
    title: 'Assets - Image Dimensions',
    status: STATUS.FAIL,
    description: `Error: ${error.message}`,
  }));

  assetDimensionsResult.value = {
    title: result.title.replace('Assets - ', ''),
    description: result.description,
  };

  if (result.details) {
    assetsWithMismatch.value = result.details.assetsWithMismatch || [];
    assetsWithMatch.value = result.details.assetsWithMatch || [];
    criticalAssetFailures.value = result.details.criticalAssetFailures || [];
    warningAssetFailures.value = result.details.warningAssetFailures || [];
  }
}

function showBackToPreflightPopover() {
  document.querySelector('.back-to-preflight-popover')?.remove();
  const popover = document.createElement('div');
  popover.className = 'back-to-preflight-popover';
  const btn = document.createElement('button');
  btn.className = 'back-to-preflight-btn';
  btn.textContent = 'Back to Preflight';
  btn.addEventListener('click', () => {
    popover.remove();
    const sk = document.querySelector('aem-sidekick, helix-sidekick');
    if (sk) sk.dispatchEvent(new CustomEvent('custom:preflight', { bubbles: true }));
  });
  popover.appendChild(btn);
  document.body.appendChild(popover);
}

function navigateToAsset(asset) {
  let el = null;
  if (asset.type === 'image') {
    el = document.querySelector(`img[src="${asset.src}"]`);
  } else if (asset.type === 'video') {
    el = document.querySelector(`video[src="${asset.src}"]`)
      || document.querySelector(`source[src="${asset.src}"]`)?.closest('video');
  }
  if (!el) return;
  document.querySelector('.dialog-modal#preflight .dialog-close')?.click();
  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  showBackToPreflightPopover();
}

/**
 * Component to display a single asset check result.
 */
function AssetsItem({ title, description }) {
  return html`
    <div class="assets-item">
      <div class="assets-item-text">
        <p class="assets-item-title">${title}</p>
        <p class="assets-item-description">${description}</p>
      </div>
    </div>`;
}

/**
 * Component to display a group of assets.
 */
function AssetGroup({ group }) {
  const { title, assetArray } = group;
  const isCriticalGroup = title.includes('Critical');

  return html`
    <div class="grid-heading">
      <div class="grid-toggle">${title}</div>
    </div>

    ${viewportTooSmall.value && html`
      <div class='assets-image-grid'>
        <div class='assets-image-grid-item full-width'>Please resize your browser to at least 1200px width to run image checks</div>
      </div>
    `}

    ${!viewportTooSmall.value && assetArray.value.length > 0 && html`
    <div class='assets-image-grid'>
      ${assetArray.value.map((asset) => {
    const isAboveFoldWithMismatch = isCriticalGroup;
    const itemClass = isAboveFoldWithMismatch ? 'assets-image-grid-item above-fold-critical' : 'assets-image-grid-item';

    return html`
      <div class='${itemClass}'
           title='${isAboveFoldWithMismatch ? 'Above-the-fold asset with critical dimension issues' : ''}'
           onClick=${() => navigateToAsset(asset)}
           style='cursor:pointer'>
        ${asset.type === 'image' && html`<img src='${asset.src}' />`}
        ${asset.type === 'video' && html`<video controls src='${asset.src}' />`}
        ${asset.type === 'mpc' && html`<iframe src='${asset.src}' />`}
        <div class='assets-image-grid-item-text'>
          <span>Factor: ${asset.roundedFactor}</span>
          <span>Upload size: ${asset.naturalDimensions}</span>
          <span>Display size: ${asset.displayDimensions}</span>
          ${asset.hasMismatch && html`<span>Recommended size: ${asset.recommendedDimensions}</span>`}
          <span>Type: ${asset.typeLabel}</span>
          ${asset.notes && html`<span><strong>Notes:</strong> ${asset.notes}</span>`}
          ${isAboveFoldWithMismatch && html`<span class="above-fold-notice"><strong>CRITICAL:</strong></span>`}
        </div>
      </div>`;
  })}
    </div>`}

    ${!viewportTooSmall.value && assetArray.value.length === 0 && html`
      <div class='assets-image-grid'>
        <div class='assets-image-grid-item full-width'>No assets found</div>
      </div>
    `}
  `;
}

/**
 * Main Panel Component
 */
export default function Assets() {
  useEffect(() => {
    let resizeTimeout;

    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        const isSmall = isViewportTooSmall();
        if (viewportTooSmall.value !== isSmall) {
          viewportTooSmall.value = isSmall;
          if (!isSmall) getResults();
        }
      }, 250);
    };

    window.addEventListener('resize', handleResize);
    if (!viewportTooSmall.value) getResults();

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
    };
  }, []);

  const groups = [
    { title: 'Critical Asset Issues (Above-the-fold)', assetArray: criticalAssetFailures },
    { title: 'Warning Asset Issues (Below-the-fold)', assetArray: warningAssetFailures },
    { title: 'Assets with matching dimensions', assetArray: assetsWithMatch },
  ];

  return html`
    <div class="assets-columns">
      <${AssetsItem} ...${assetDimensionsResult.value} />
      ${groups.map((group) => html`<${AssetGroup} group=${group} />`)}
    </div>
  `;
}
