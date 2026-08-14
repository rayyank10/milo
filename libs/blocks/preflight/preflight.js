import { html, render, signal } from '../../deps/htm-preact.js';
import General, { generalBadge } from './panels/general.js';
import SEO, { seoBadge } from './panels/seo.js';
import Accessibility, { accessibilityBadge } from './accessibility/accessibility.js';
import Martech from './panels/martech.js';
import Merch, { merchBadge } from './panels/merch.js';
import Performance, { performanceBadge } from './panels/performance.js';
import Assets, { assetsBadge } from './panels/assets.js';

const HEADING = 'Preflight';

const tabs = signal([
  { title: 'General', selected: true },
  { title: 'SEO' },
  { title: 'Martech' },
  { title: 'M@S' },
  { title: 'Accessibility' },
  { title: 'Performance' },
  { title: 'Assets' },
]);

const BADGES = {
  General: generalBadge,
  SEO: seoBadge,
  'M@S': merchBadge,
  Accessibility: accessibilityBadge,
  Performance: performanceBadge,
  Assets: assetsBadge,
};

const ICONS = {
  General: () => html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7.5" height="7.5" rx="1.5"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="1.5"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.5"/></svg>`,
  SEO: () => html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  Martech: () => html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4.5" width="18" height="15" rx="1.5"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="9" y1="10" x2="9" y2="19.5"/></svg>`,
  'M@S': () => html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.5 3.5 6.25v5.5c0 5 3.75 8.25 8.5 9.75 4.75-1.5 8.5-4.75 8.5-9.75v-5.5Z"/></svg>`,
  Accessibility: () => html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="2"/><path d="M4 9h16M12 9v5.5m0 0-3.25 7m3.25-7 3.25 7"/></svg>`,
  Performance: () => html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15a8 8 0 1 1 16 0"/><line x1="12" y1="15" x2="15.5" y2="10.5"/><circle cx="12" cy="15" r="1"/></svg>`,
  Assets: () => html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4.5" width="18" height="15" rx="2"/><circle cx="8.5" cy="9.5" r="1.5"/><path d="m21 15.5-5-5-9 9"/></svg>`,
};

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
  const counts = BADGES[props.tab.title]?.value;
  const badgeCount = counts ? (counts.errors || counts.warnings || 0) : 0;
  const badgeType = counts?.errors ? 'error' : 'warning';
  const icon = ICONS[props.tab.title];

  return html`
    <button
      id=${id}
      class=preflight-tab-button
      key=${props.tab.title}
      aria-selected=${selected}
      onClick=${() => setTab(props.tab)}>
      <span class=preflight-tab-icon aria-hidden="true">${icon?.()}</span>
      <span class=preflight-tab-label>${props.tab.title}</span>
      ${!!badgeCount && html`<span class="preflight-tab-badge ${badgeType}">${badgeCount}</span>`}
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
      ${setPanel(props.tab.title)}
    </div>`;
}

function Preflight() {
  const activeTab = tabs.value.find((tab) => tab.selected) || tabs.value[0];

  return html`
    <nav class=preflight-nav aria-label="Preflight sections">
      <div class=preflight-nav-header>
        <p id=preflight-title class=preflight-nav-title>${HEADING}</p>
      </div>
      <div class=preflight-tab-button-group role="tablist" aria-labelledby=preflight-title>
        ${tabs.value.map((tab, idx) => html`<${TabButton} tab=${tab} idx=${idx} />`)}
      </div>
    </nav>
    <div class=preflight-main>
      <header class=preflight-main-header>
        <p class=preflight-section-title>${activeTab.title}</p>
      </header>
      <div class=preflight-content>
        ${tabs.value.map((tab, idx) => html`<${TabPanel} tab=${tab} idx=${idx} />`)}
      </div>
    </div>
  `;
}

export default async function init(el) {
  render(html`<${Preflight} />`, el);
}
