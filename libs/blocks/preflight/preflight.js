import { html, render, signal } from '../../deps/htm-preact.js';
import { getConfig } from '../../utils/utils.js';
import icons from '../../c2/assets/icons.js';
import General from './panels/general.js';
import SEO from './panels/seo.js';
import Accessibility from './accessibility/accessibility.js';
import Martech from './panels/martech.js';
import Merch from './panels/merch.js';
import Performance from './panels/performance.js';
import Assets from './panels/assets.js';

const HEADING = 'Preflight';

const TAB_ICONS = {
  General: icons.preflightGeneral,
  SEO: icons.preflightSeo,
  Martech: icons.preflightMartech,
  'M@S': icons.preflightMas,
  Accessibility: icons.preflightAccessibility,
  Performance: icons.preflightPerformance,
  Assets: icons.preflightAssets,
};

const tabs = signal([
  { title: 'General', selected: true, errors: 0, warnings: 0 },
  { title: 'SEO', errors: 0, warnings: 0 },
  { title: 'Martech', errors: 0, warnings: 0 },
  { title: 'M@S', errors: 0, warnings: 0 },
  { title: 'Accessibility', errors: 0, warnings: 0 },
  { title: 'Performance', errors: 0, warnings: 0 },
  { title: 'Assets', errors: 0, warnings: 0 },
]);

function setTab(active) {
  tabs.value = tabs.value.map((tab) => {
    const selected = tab.title === active.title;
    return { ...tab, selected };
  });
}

function setPanel(title) {
  switch (title) {
    case 'General':
      return html`<${General} />`;
    case 'SEO':
      return html`<${SEO} />`;
    case 'Martech':
      return html`<${Martech} />`;
    case 'M@S':
      return html`<${Merch} />`;
    case 'Accessibility':
      return html`<${Accessibility} />`;
    case 'Performance':
      return html`<${Performance} />`;
    case 'Assets':
      return html`<${Assets} />`;
    default:
      return html`<p>No matching panel.</p>`;
  }
}

function TabButton(props) {
  const id = `tab-${props.idx + 1}`;
  const selected = props.tab.selected === true;
  const icon = TAB_ICONS[props.tab.title] || '';
  const { errors, warnings } = props.tab;

  return html`
    <button
      id=${id}
      class=preflight-tab-button
      key=${props.tab.title}
      aria-selected=${selected}
      onClick=${() => setTab(props.tab)}>
      <span class="preflight-tab-icon" dangerouslySetInnerHTML=${{ __html: icon }}></span>
      <span class="preflight-tab-label">${props.tab.title}</span>
      ${errors > 0 && html`<span class="preflight-tab-badge preflight-tab-badge-error">${errors}</span>`}
      ${errors === 0 && warnings > 0 && html`<span class="preflight-tab-badge preflight-tab-badge-warning">${warnings}</span>`}
    </button>`;
}

function TabPanel(props) {
  const id = `panel-${props.idx + 1}`;
  const labeledBy = `tab-${props.idx + 1}`;
  const selected = props.tab.selected === true;

  return html`
    <div
      id=${id}
      class=preflight-tab-panel
      aria-labelledby=${labeledBy}
      key=${props.tab.title}
      aria-selected=${selected}
      role="tabpanel">
      ${selected && html`
        <div class="preflight-panel-header">
          <span class="preflight-panel-title">${props.tab.title}</span>
        </div>
      `}
      ${setPanel(props.tab.title)}
    </div>`;
}

function Preflight() {
  return html`
    <div class="preflight-rail" role="tablist" aria-label="Preflight sections">
      <p class="preflight-heading-title">${HEADING}</p>
      ${tabs.value.map((tab, idx) => html`<${TabButton} tab=${tab} idx=${idx} />`)}
    </div>
    <div class=preflight-content>
      ${tabs.value.map((tab, idx) => html`<${TabPanel} tab=${tab} idx=${idx} />`)}
    </div>
  `;
}

function handleBadgeEvent(e) {
  const { tab, errors, warnings } = e.detail;
  tabs.value = tabs.value.map((t) => {
    if (t.title !== tab) return t;
    return { ...t, errors: errors || 0, warnings: warnings || 0 };
  });
}

export default function init(el) {
  window.addEventListener('preflight:badge', handleBadgeEvent);
  window.dispatchEvent(new CustomEvent('milo:preflight:open'));

  const { miloLibs, codeRoot } = getConfig();
  const base = miloLibs || codeRoot;
  const check = document.createElement('link');
  check.rel = 'preload';
  check.as = 'image';
  check.href = `${base}/blocks/preflight/img/check.svg`;
  const expand = document.createElement('link');
  expand.rel = 'preload';
  expand.as = 'image';
  expand.href = `${base}/blocks/preflight/img/expand.svg`;
  document.head.append(check, expand);

  render(html`<${Preflight} />`, el);
}
