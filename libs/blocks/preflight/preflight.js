import { html, render, signal } from '../../deps/htm-preact.js';
import { createTag, getConfig } from '../../utils/utils.js';
import General from './panels/general.js';
import SEO from './panels/seo.js';
import Accessibility from './accessibility/accessibility.js';
import Martech from './panels/martech.js';
import Merch from './panels/merch.js';
import Performance from './panels/performance.js';
import Assets from './panels/assets.js';
import { tabBadges } from './badge-state.js';

const HEADING = 'Milo Preflight';
const IMG_PATH = '/blocks/preflight/img';

const TAB_ICONS = {
  General: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor"><path d="M13 2H3a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1zm-1 10H4V4h8v8zM6 6h4v1H6zm0 2h4v1H6zm0 2h2v1H6z"/></svg>',
  SEO: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor"><path d="M6.5 1a5.5 5.5 0 1 0 3.44 9.79l3.14 3.14 1.06-1.06-3.14-3.14A5.5 5.5 0 0 0 6.5 1zm0 1.5a4 4 0 1 1 0 8 4 4 0 0 1 0-8z"/></svg>',
  Martech: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor"><path d="M2 4h9l1.5 2L11 8H2V4zm0 5h9l1.5 2L11 13H2V9z"/></svg>',
  'M@S': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor"><path d="M5 2a1 1 0 0 0-1 1v1H2v10h12V4h-2V3a1 1 0 0 0-1-1zm0 1.5h6V4H5zM3 5.5h10V13H3z"/></svg>',
  Accessibility: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor"><circle cx="8" cy="2.5" r="1.5"/><path d="M13 5H3l2.5 4H7v5h2V9h1.5z"/></svg>',
  Performance: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm0 1.5a5.5 5.5 0 1 1 0 11A5.5 5.5 0 0 1 8 2.5zM8.5 4 7 7.5h2V12h1V7.5h2z"/></svg>',
  Assets: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor"><path d="M2 3a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1zm0 1h12v8l-3.5-4-2.5 3-2-2.5L2 12zm3.5 1a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z"/></svg>',
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

function TabButton({ tab, idx }) {
  const id = `tab-${idx + 1}`;
  const selected = tab.selected === true;
  const badge = tabBadges.value[tab.title];
  const errors = badge?.errors || 0;
  const warnings = badge?.warnings || 0;
  const iconSvg = TAB_ICONS[tab.title] || TAB_ICONS.General;

  return html`
    <button
      id=${id}
      class=preflight-tab-button
      key=${tab.title}
      aria-selected=${selected}
      onClick=${() => setTab(tab)}>
      <span class="preflight-tab-icon" dangerouslySetInnerHTML=${{ __html: iconSvg }}></span>
      <span class="preflight-tab-label">${tab.title}</span>
      ${errors > 0 && html`<span class="preflight-badge preflight-badge-error">${errors}</span>`}
      ${errors === 0 && warnings > 0 && html`<span class="preflight-badge preflight-badge-warning">${warnings}</span>`}
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
      <div class="preflight-panel-header">
        <h2 class="preflight-panel-title">${tab.title}</h2>
      </div>
      <div class="preflight-panel-body">
        ${setPanel(tab.title)}
      </div>
    </div>`;
}

export function Preflight() {
  return html`
    <div class="preflight-rail">
      <p id=preflight-title class="preflight-heading-title">${HEADING}</p>
      <div class=preflight-tab-button-group role="tablist" aria-label="Preflight sections">
        ${tabs.value.map((tab, idx) => html`<${TabButton} tab=${tab} idx=${idx} />`)}
      </div>
    </div>
    <div class=preflight-content>
      ${tabs.value.map((tab, idx) => html`<${TabPanel} tab=${tab} idx=${idx} />`)}
    </div>
  `;
}

function preloadIcons() {
  const { miloLibs, codeRoot } = getConfig();
  const base = miloLibs || codeRoot;
  const check = createTag('link', { rel: 'preload', as: 'image', href: `${base}${IMG_PATH}/check.svg` });
  const expand = createTag('link', { rel: 'preload', as: 'image', href: `${base}${IMG_PATH}/expand.svg` });
  document.head.append(check, expand);
}

export default async function init(el) {
  document.querySelector('.milo-preflight-overlay')?.remove();
  preloadIcons();
  render(html`<${Preflight} />`, el);
}
