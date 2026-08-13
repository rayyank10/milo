import { html, render, signal } from '../../deps/htm-preact.js';
import { getConfig, loadStyle } from '../../utils/utils.js';
import General, { generalBadge } from './panels/general.js';
import SEO, { seoBadge } from './panels/seo.js';
import Accessibility from './accessibility/accessibility.js';
import Martech from './panels/martech.js';
import Merch from './panels/merch.js';
import Performance, { performanceBadge } from './panels/performance.js';
import Assets, { assetsBadge } from './panels/assets.js';

const HEADING = 'Preflight';

const SECTION_ICONS = {
  General: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><rect x="3" y="2" width="12" height="14" rx="1.5"/><line x1="6" y1="6" x2="12" y2="6"/><line x1="6" y1="9" x2="12" y2="9"/><line x1="6" y1="12" x2="10" y2="12"/></svg>',
  SEO: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="7.5" cy="7.5" r="4.5"/><line x1="10.5" y1="11" x2="15.5" y2="15.5"/></svg>',
  Martech: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18" width="18" height="18" fill="currentColor"><path d="M2 2h7.5l6.5 6.5-7 7-6.5-6.5V2zm3 2.5a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"/></svg>',
  'M@S': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 5.5h11l-1.5 9h-8L3.5 5.5z"/><path d="M6.5 5.5V4a2.5 2.5 0 0 1 5 0v1.5"/></svg>',
  Accessibility: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18" width="18" height="18" fill="currentColor"><circle cx="9" cy="3.5" r="1.5"/><path d="M5 7.5C5 5.6 6.8 4 9 4s4 1.6 4 3.5h-1.5C11.5 6.5 10.4 5.5 9 5.5S6.5 6.5 6.5 7.5H5zm1.5.5v5.5h1.5V11H10v2.5h1.5V8H6.5z"/></svg>',
  Performance: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M2.5 13a6.5 6.5 0 0 1 13 0"/><line x1="9" y1="13" x2="12.5" y2="7.5"/></svg>',
  Assets: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="14" height="12" rx="1.5"/><circle cx="6.5" cy="7.5" r="1.5"/><path d="M2 12.5l4-4 3 3 2.5-2 4.5 5"/></svg>',
};

const BADGE_MAP = {
  General: generalBadge,
  SEO: seoBadge,
  Performance: performanceBadge,
  Assets: assetsBadge,
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

function NavItem({ tab, idx }) {
  const id = `tab-${idx + 1}`;
  const selected = tab.selected === true;
  const badge = BADGE_MAP[tab.title]?.value || { errors: 0, warnings: 0 };

  return html`
    <button
      id=${id}
      class=${`preflight-nav-item${selected ? ' is-selected' : ''}`}
      key=${tab.title}
      aria-selected=${selected}
      role="tab"
      onClick=${() => setTab(tab)}>
      <span class="preflight-nav-icon" dangerouslySetInnerHTML=${{ __html: SECTION_ICONS[tab.title] || '' }}></span>
      <span class="preflight-nav-label">${tab.title}</span>
      ${badge.errors > 0 && html`<span class="preflight-nav-badge error">${badge.errors}</span>`}
      ${badge.errors === 0 && badge.warnings > 0 && html`<span class="preflight-nav-badge warning">${badge.warnings}</span>`}
    </button>`;
}

function TabPanel({ tab, idx }) {
  const id = `panel-${idx + 1}`;
  const labeledBy = `tab-${idx + 1}`;
  const selected = tab.selected === true;

  return html`
    <div
      id=${id}
      class="preflight-tab-panel"
      aria-labelledby=${labeledBy}
      key=${tab.title}
      aria-selected=${selected}
      role="tabpanel">
      <div class="preflight-panel-header">
        <h2 class="preflight-panel-title">${tab.title}</h2>
      </div>
      ${setPanel(tab.title)}
    </div>`;
}

function Preflight() {
  return html`
    <div class="preflight-rail">
      <div class="preflight-rail-header">
        <p id="preflight-title">${HEADING}</p>
      </div>
      <nav class="preflight-nav" role="tablist" aria-labelledby="preflight-title">
        ${tabs.value.map((tab, idx) => html`<${NavItem} tab=${tab} idx=${idx} />`)}
      </nav>
    </div>
    <div class="preflight-main">
      ${tabs.value.map((tab, idx) => html`<${TabPanel} tab=${tab} idx=${idx} />`)}
    </div>
  `;
}

export default async function init(el) {
  const { miloLibs, codeRoot } = getConfig();
  const base = miloLibs || codeRoot;
  loadStyle(`${base}/c2/styles/deps/tokens.primitives.light.css`);
  loadStyle(`${base}/c2/styles/deps/tokens.semantic.light.css`);

  document.body.classList.add('preflight-is-open');
  document.querySelector('.milo-preflight-overlay')?.remove();
  document.dispatchEvent(new CustomEvent('preflight:open'));

  render(html`<${Preflight} />`, el);

  const dialog = el.closest('.dialog-modal');
  if (dialog) {
    const closeBtn = dialog.querySelector('.dialog-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        document.body.classList.remove('preflight-is-open');
        document.dispatchEvent(new CustomEvent('preflight:close'));
      }, { once: true });
    }
  }
}
