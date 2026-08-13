import { expect } from '@esm-bundle/chai';
import { html, render } from '../../../libs/deps/htm-preact.js';
import { Preflight } from '../../../libs/blocks/preflight/preflight.js';
import { setTabBadge, tabBadges } from '../../../libs/blocks/preflight/badge-state.js';

describe('Preflight Shell', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    tabBadges.value = {};
  });

  afterEach(() => {
    document.body.removeChild(container);
    tabBadges.value = {};
  });

  it('renders a left navigation rail', () => {
    render(html`<${Preflight} />`, container);
    expect(container.querySelector('.preflight-rail')).to.exist;
  });

  it('renders one tab button per section (7 sections)', () => {
    render(html`<${Preflight} />`, container);
    const tabButtons = container.querySelectorAll('.preflight-tab-button');
    expect(tabButtons.length).to.equal(7);
  });

  it('each tab button contains an icon and a label', () => {
    render(html`<${Preflight} />`, container);
    const tabButton = container.querySelector('.preflight-tab-button');
    expect(tabButton.querySelector('.preflight-tab-icon')).to.exist;
    expect(tabButton.querySelector('.preflight-tab-label')).to.exist;
  });

  it('marks the first tab as active by default', () => {
    render(html`<${Preflight} />`, container);
    const activeTab = container.querySelector('.preflight-tab-button[aria-selected="true"]');
    expect(activeTab).to.exist;
    expect(activeTab.querySelector('.preflight-tab-label').textContent).to.equal('General');
  });

  it('renders an error badge when errors are reported for a tab', () => {
    setTabBadge('General', 2, 0);
    render(html`<${Preflight} />`, container);
    const errorBadge = container.querySelector('.preflight-badge-error');
    expect(errorBadge).to.exist;
    expect(errorBadge.textContent).to.equal('2');
  });

  it('renders a warning badge when only warnings are reported', () => {
    setTabBadge('SEO', 0, 3);
    render(html`<${Preflight} />`, container);
    const warningBadge = container.querySelector('.preflight-badge-warning');
    expect(warningBadge).to.exist;
    expect(warningBadge.textContent).to.equal('3');
  });

  it('prefers the error badge over warning badge when both are present', () => {
    setTabBadge('Performance', 1, 2);
    render(html`<${Preflight} />`, container);
    const errorBadge = container.querySelector('.preflight-badge-error');
    const warningBadge = container.querySelector('.preflight-badge-warning');
    expect(errorBadge).to.exist;
    expect(warningBadge).to.not.exist;
  });

  it('renders no badge when counts are zero', () => {
    setTabBadge('Assets', 0, 0);
    render(html`<${Preflight} />`, container);
    expect(container.querySelector('.preflight-badge')).to.not.exist;
  });

  it('renders a panel header for each tab panel', () => {
    render(html`<${Preflight} />`, container);
    const panelHeaders = container.querySelectorAll('.preflight-panel-header');
    expect(panelHeaders.length).to.equal(7);
  });
});
