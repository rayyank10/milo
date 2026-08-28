import { html, signal, useEffect } from '../../../deps/htm-preact.js';
import { STATUS } from '../checks/constants.js';
import { getPreflightResults } from '../checks/preflightApi.js';
import { isViewportTooSmall } from '../checks/assets.js';
import { updateTabBadges } from '../preflight.js';

// Define signals for check results and viewport status
const assetDimensionsResult = signal({
  title: 'Asset Dimensions',
  description: 'Checking...',
});
const assetsWithMismatch = signal([]);
const assetsWithMatch = signal([]);
const criticalAssetFailures = signal([]);
const warningAssetFailures = signal([]);
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

  // Update badge counts
  const errorCount = result.status === STATUS.FAIL ? criticalAssetFailures.value.length : 0;
  const warningCount = warningAssetFailures.value.length;
  updateTabBadges('Assets', errorCount, warningCount);
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
 * Navigate to an asset on the page and show "Back to Preflight" popover
 */
async function navigateToAsset(asset) {
  // Find the asset element on the page
  let targetElement;
  if (asset.type === 'image') {
    targetElement = document.querySelector(`img[src="${asset.src}"]`);
  } else if (asset.type === 'video') {
    targetElement = document.querySelector(`video[data-video-source="${asset.src}"]`) || document.querySelector(`video source[src="${asset.src}"]`)?.parentElement;
  } else if (asset.type === 'mpc') {
    targetElement = document.querySelector(`iframe[src="${asset.src}"]`);
  }

  if (!targetElement) return;

  // Close the preflight modal using the modal utility
  const modal = document.querySelector('#preflight');
  if (modal) {
    const { closeModal } = await import('../../modal/modal.js');
    closeModal(modal, false);
  }

  // Scroll to the element
  targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });

  // Inject "Back to Preflight" popover at top-left
  let popover = document.querySelector('.preflight-back-popover');
  if (!popover) {
    popover = document.createElement('div');
    popover.className = 'preflight-back-popover';
    popover.innerHTML = '<button>Back to Preflight</button>';
    document.body.appendChild(popover);

    const button = popover.querySelector('button');
    button.addEventListener('click', () => {
      popover.remove();
      // Reopen preflight via the sidekick custom event
      const sidekick = document.querySelector('aem-sidekick, helix-sidekick');
      if (sidekick) {
        sidekick.dispatchEvent(new CustomEvent('custom:preflight', { bubbles: true }));
      }
    });
  }
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
      <div class='${itemClass}' title='${isAboveFoldWithMismatch ? 'Above-the-fold asset with critical dimension issues' : ''}' onclick=${() => navigateToAsset(asset)} style="cursor: pointer;">
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
          ${isAboveFoldWithMismatch && html`<span class="above-fold-notice"><strong>⚠️ CRITICAL:</strong></span>`}
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
      <h2 class="preflight-section-header">Assets</h2>
      <${AssetsItem} ...${assetDimensionsResult.value} />
      ${groups.map((group) => html`<${AssetGroup} group=${group} />`)}
    </div>
  `;
}
