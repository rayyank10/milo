import { html, signal, useEffect } from '../../../deps/htm-preact.js';
import { STATUS } from '../checks/constants.js';
import { getPreflightResults } from '../checks/preflightApi.js';
import { isViewportTooSmall } from '../checks/assets.js';
import { setTabBadge } from '../badge-state.js';

const assetDimensionsResult = signal({
  title: 'Asset Dimensions',
  description: 'Checking...',
});
const assetsWithMismatch = signal([]);
export const assetsWithMatch = signal([]);
export const criticalAssetFailures = signal([]);
export const warningAssetFailures = signal([]);
export const viewportTooSmall = signal(isViewportTooSmall());

async function getResults() {
  const results = await getPreflightResults({
    url: window.location.pathname,
    area: document,
    useCache: false,
    injectVisualMetadata: false,
  });

  if (!results) return;

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

function showBackPopover() {
  document.querySelector('.preflight-back-popover')?.remove();
  const popover = document.createElement('div');
  popover.className = 'preflight-back-popover';
  const btn = document.createElement('button');
  btn.className = 'preflight-back-btn';
  btn.textContent = 'Back to Preflight';
  btn.addEventListener('click', () => {
    popover.remove();
    const sidekick = document.querySelector('aem-sidekick, helix-sidekick');
    sidekick?.dispatchEvent(new CustomEvent('custom:preflight', { bubbles: true }));
  });
  popover.appendChild(btn);
  document.body.appendChild(popover);
}

function navigateToAsset(assetData) {
  const closeBtn = document.querySelector('.dialog-modal#preflight .dialog-close');
  if (closeBtn) {
    closeBtn.click();
  } else {
    document.getElementById('preflight')?.close?.();
  }

  requestAnimationFrame(() => {
    assetData.asset?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  showBackPopover();
}

function AssetsItem({ title, description }) {
  return html`
    <div class="assets-item">
      <div class="assets-item-text">
        <p class="assets-item-title">${title}</p>
        <p class="assets-item-description">${description}</p>
      </div>
    </div>`;
}

function AssetGroup({ group }) {
  const { title, assetArray } = group;
  const isCriticalGroup = title.includes('Critical');
  const isWarningGroup = title.includes('Warning');

  return html`
    <div class="assets-group">
      <div class="grid-heading">
        <div class="grid-toggle">${title}</div>
      </div>

      ${viewportTooSmall.value && html`
        <div class="assets-viewport-message">
          Please resize your browser to at least 1200px width to run image checks
        </div>
      `}

      ${!viewportTooSmall.value && assetArray.value.length > 0 && html`
        <div class="assets-card-list">
          ${assetArray.value.map((asset) => {
    const classes = ['assets-card'];
    if (isCriticalGroup) classes.push('assets-card-critical');
    else if (isWarningGroup) classes.push('assets-card-warning');
    return html`
              <div
                class=${classes.join(' ')}
                title="Click to navigate to this asset on the page"
                onClick=${() => navigateToAsset(asset)}
              >
                <div class="assets-thumb">
                  ${asset.type === 'image' && html`<img src=${asset.src} alt="" />`}
                  ${asset.type === 'video' && html`<video src=${asset.src} />`}
                  ${asset.type === 'mpc' && html`<iframe src=${asset.src} />`}
                </div>
                <div class="assets-metrics">
                  <div class="assets-metric-row">
                    <span class="assets-metric-label">Factor</span>
                    <span class="assets-metric-value">${asset.roundedFactor}</span>
                  </div>
                  <div class="assets-metric-row">
                    <span class="assets-metric-label">Upload</span>
                    <span class="assets-metric-value">${asset.naturalDimensions}</span>
                  </div>
                  <div class="assets-metric-row">
                    <span class="assets-metric-label">Display</span>
                    <span class="assets-metric-value">${asset.displayDimensions}</span>
                  </div>
                  ${asset.hasMismatch && html`
                    <div class="assets-metric-row">
                      <span class="assets-metric-label">Recommended</span>
                      <span class="assets-metric-value">${asset.recommendedDimensions}</span>
                    </div>
                  `}
                  <div class="assets-metric-row">
                    <span class="assets-metric-label">Type</span>
                    <span class="assets-metric-value">${asset.typeLabel}</span>
                  </div>
                  ${asset.notes && html`
                    <div class="assets-metric-row">
                      <span class="assets-metric-label">Notes</span>
                      <span class="assets-metric-value assets-metric-value-warn">${asset.notes}</span>
                    </div>
                  `}
                  ${isCriticalGroup && html`
                    <div class="assets-critical-label">Critical: above-the-fold</div>
                  `}
                </div>
              </div>
            `;
  })}
        </div>
      `}

      ${!viewportTooSmall.value && assetArray.value.length === 0 && html`
        <div class="assets-empty">No assets found</div>
      `}
    </div>
  `;
}

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

  const errors = criticalAssetFailures.value.length;
  const warnings = warningAssetFailures.value.length;
  setTabBadge('Assets', errors, warnings);

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
