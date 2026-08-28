import { html, render, signal, useEffect } from '../../deps/htm-preact.js';
import { loadStyle } from '../../utils/utils.js';
import { suppressPreflightNotification, restorePreflightNotification } from '../../utils/preflight-notification.js';
import General from './panels/general.js';
import SEO from './panels/seo.js';
import Accessibility from './accessibility/accessibility.js';
import Martech from './panels/martech.js';
import Merch from './panels/merch.js';
import Performance from './panels/performance.js';
import Assets from './panels/assets.js';

const tabs = signal([
  { title: 'General', selected: true, issueCount: 0, hasErrors: false, hasWarnings: false },
  { title: 'SEO', selected: false, issueCount: 0, hasErrors: false, hasWarnings: false },
  { title: 'Martech', selected: false, issueCount: 0, hasErrors: false, hasWarnings: false },
  { title: 'M@S', selected: false, issueCount: 0, hasErrors: false, hasWarnings: false },
  { title: 'Accessibility', selected: false, issueCount: 0, hasErrors: false, hasWarnings: false },
  { title: 'Performance', selected: false, issueCount: 0, hasErrors: false, hasWarnings: false },
  { title: 'Assets', selected: false, issueCount: 0, hasErrors: false, hasWarnings: false },
]);

const showHighlightLCP = signal(false);

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
      return html`<${Performance} showHighlightLCP=${showHighlightLCP} />`;
    case 'Assets':
      return html`<${Assets} />`;
    default:
      return html`<p>No matching panel.</p>`;
  }
}

function NavRailItem(props) {
  const { tab, idx } = props;
  const selected = tab.selected === true;
  let badgeClass = '';
  if (tab.hasErrors) {
    badgeClass = 'error';
  } else if (tab.hasWarnings) {
    badgeClass = 'warning';
  }

  return html`
    <button
      id=${`nav-rail-${idx + 1}`}
      class=${`preflight-nav-item ${selected ? 'active' : ''}`}
      key=${tab.title}
      aria-selected=${selected}
      onClick=${() => setTab(tab)}>
      <span class=preflight-nav-icon>
        ${tab.title.charAt(0)}
      </span>
      <span>${tab.title}</span>
      ${tab.issueCount > 0 && html`
        <span class=${`preflight-nav-badge ${badgeClass}`}>
          ${tab.issueCount}
        </span>
      `}
    </button>`;
}

function TopNavItem(props) {
  const { tab, idx } = props;
  const selected = tab.selected === true;

  return html`
    <button
      id=${`top-nav-${idx + 1}`}
      class=${`preflight-top-nav-item ${selected ? 'active' : ''}`}
      key=${tab.title}
      aria-selected=${selected}
      onClick=${() => setTab(tab)}>
      ${tab.title}
      ${tab.issueCount > 0 && html` (${tab.issueCount})`}
    </button>`;
}

function TabPanel(props) {
  const id = `panel-${props.idx + 1}`;
  const labeledBy = `nav-rail-${props.idx + 1}`;
  const selected = props.tab.selected === true;

  if (!selected) return null;

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
  useEffect(() => {
    // Suppress notification when modal opens
    suppressPreflightNotification();

    // Restore notification when component unmounts
    return () => {
      restorePreflightNotification();
    };
  }, []);

  return html`
    <nav class=preflight-nav-rail role="navigation" aria-label="Preflight sections">
      ${tabs.value.map((tab, idx) => html`<${NavRailItem} tab=${tab} idx=${idx} />`)}
    </nav>
    <div class=preflight-top-nav role="navigation" aria-label="Preflight sections">
      ${tabs.value.map((tab, idx) => html`<${TopNavItem} tab=${tab} idx=${idx} />`)}
    </div>
    <div class=preflight-content>
      ${tabs.value.map((tab, idx) => html`<${TabPanel} tab=${tab} idx=${idx} />`)}
    </div>
  `;
}

export function updateTabBadges(tabTitle, errorCount, warningCount) {
  tabs.value = tabs.value.map((tab) => {
    if (tab.title === tabTitle) {
      return {
        ...tab,
        issueCount: errorCount + warningCount,
        hasErrors: errorCount > 0,
        hasWarnings: warningCount > 0 && errorCount === 0,
      };
    }
    return tab;
  });
}

export default async function init(el) {
  // Load the new CSS
  await loadStyle('/libs/blocks/preflight/preflight.css');

  render(html`<${Preflight} />`, el);
}
