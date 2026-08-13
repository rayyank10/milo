import { html, render, signal } from '../../deps/htm-preact.js';
import General, { localizationIssues } from './panels/general.js';
import SEO from './panels/seo.js';
import Accessibility from './accessibility/accessibility.js';
import Martech from './panels/martech.js';
import Merch from './panels/merch.js';
import Performance from './panels/performance.js';
import Assets, { criticalAssetFailures, warningAssetFailures } from './panels/assets.js';

const NAV_ICONS = {
  General: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>',
  SEO: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
  Martech: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>',
  'M@S': '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>',
  Accessibility: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M8 12h8M12 8v8"/></svg>',
  Performance: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>',
  Assets: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>',
};

const tabs = signal([
  { title: 'General', selected: true },
  { title: 'SEO' },
  { title: 'Martech' },
  { title: 'M@S' },
  { title: 'Accessibility' },
  { title: 'Performance' },
  { title: 'Assets' },
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

function getTabBadge(title) {
  if (title === 'General') {
    const count = localizationIssues.value.length;
    return count > 0 ? { count, type: 'error' } : null;
  }
  if (title === 'Assets') {
    const critical = criticalAssetFailures.value.length;
    const warning = warningAssetFailures.value.length;
    if (critical > 0) return { count: critical, type: 'error' };
    if (warning > 0) return { count: warning, type: 'warning' };
    return null;
  }
  return null;
}

function NavItem({ tab }) {
  const badge = getTabBadge(tab.title);
  const icon = NAV_ICONS[tab.title] || '';
  return html`
    <button
      class="preflight-nav-item${tab.selected ? ' is-active' : ''}"
      aria-selected=${tab.selected === true}
      onClick=${() => setTab(tab)}>
      <span class="preflight-nav-icon" dangerouslySetInnerHTML=${{ __html: icon }}></span>
      <span class="preflight-nav-label">${tab.title}</span>
      ${badge && html`<span class="preflight-nav-badge preflight-nav-badge-${badge.type}">${badge.count}</span>`}
    </button>`;
}

function TabPanel({ tab, idx }) {
  const id = `panel-${idx + 1}`;
  const labeledBy = `tab-${idx + 1}`;
  const selected = tab.selected === true;

  return html`
    <div
      id=${id}
      class=preflight-tab-panel
      aria-labelledby=${labeledBy}
      key=${tab.title}
      aria-selected=${selected}
      role="tabpanel">
      ${setPanel(tab.title)}
    </div>`;
}

function Preflight() {
  const activeTab = tabs.value.find((t) => t.selected) || tabs.value[0];
  return html`
    <nav class="preflight-nav" role="tablist" aria-label="Preflight sections">
      <p class="preflight-nav-title">Preflight</p>
      ${tabs.value.map((tab) => html`<${NavItem} tab=${tab} />`)}
    </nav>
    <div class="preflight-main">
      <div class="preflight-heading">
        <p id="preflight-title">${activeTab.title}</p>
      </div>
      <div class="preflight-content">
        ${tabs.value.map((tab, idx) => html`<${TabPanel} tab=${tab} idx=${idx} />`)}
      </div>
    </div>
  `;
}

export default function init(el) {
  render(html`<${Preflight} />`, el);
}
