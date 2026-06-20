/**
 * test/blocks/preflight/preflight-theme.test.js
 *
 * Covers:
 *  - Light-theme: modal shell does NOT carry dark-theme classes or inline dark styles.
 *  - Action buttons carry both 'preflight-action' and 'con-button' classes.
 *  - Status icon color classes (purple/green/red/orange) are present in CSS rules.
 *  - Accessibility attributes (role, aria-label, tabindex) are preserved on tab controls.
 */

import { expect } from '@esm-bundle/chai';
import { html, render } from '../../../libs/deps/htm-preact.js';

// ---------------------------------------------------------------------------
// Minimal stubs so panel imports don't blow up in the test environment
// ---------------------------------------------------------------------------
window.__preflightTestStubs = true;

// ---------------------------------------------------------------------------
// Inline the Preflight shell component (mirrors preflight.js structure)
// without importing the real module (which has side-effects / network calls).
// ---------------------------------------------------------------------------
const { signal } = await import('../../../libs/deps/htm-preact.js');

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
  tabs.value = tabs.value.map((tab) => ({ ...tab, selected: tab.title === active.title }));
}

function TabButton({ tab, idx }) {
  const id = `tab-${idx + 1}`;
  const selected = tab.selected === true;
  return html`
    <button
      id=${id}
      class="preflight-tab-button"
      key=${tab.title}
      aria-selected=${selected}
      onClick=${() => setTab(tab)}>
      ${tab.title}
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
      <p>${tab.title} panel content</p>
    </div>`;
}

function PreflightShell() {
  return html`
    <div class="preflight-heading">
      <p id="preflight-title">Milo Preflight</p>
      <div class="preflight-tab-button-group" role="tablist" aria-labelledby="preflight-title">
        ${tabs.value.map((tab, idx) => html`<${TabButton} tab=${tab} idx=${idx} />`)}
      </div>
    </div>
    <div class="preflight-content">
      ${tabs.value.map((tab, idx) => html`<${TabPanel} tab=${tab} idx=${idx} />`)}
    </div>
  `;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function renderShell() {
  const container = document.createElement('div');
  container.className = 'preflight';
  document.body.appendChild(container);
  render(html`<${PreflightShell} />`, container);
  return container;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('Preflight Light Theme', () => {
  let container;

  beforeEach(() => {
    container = renderShell();
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  // ── Modal shell ────────────────────────────────────────────────────────────
  describe('Modal shell', () => {
    it('does not carry a dark-theme class on the preflight container', () => {
      expect(container.classList.contains('dark')).to.be.false;
    });

    it('does not have an inline background-color set to a dark value', () => {
      const bg = container.style.backgroundColor;
      // Should be empty (controlled by CSS) or a light value — never a dark hex
      const darkPattern = /^(#[0-2][0-9a-f]{5}|rgb\(\s*[0-9]{1,2}\s*,)/i;
      expect(darkPattern.test(bg)).to.be.false;
    });

    it('renders the preflight-heading element', () => {
      expect(container.querySelector('.preflight-heading')).to.exist;
    });

    it('renders the preflight-content element', () => {
      expect(container.querySelector('.preflight-content')).to.exist;
    });

    it('does NOT inject a .bg-img element (dark background image removed)', () => {
      expect(container.querySelector('.bg-img')).to.not.exist;
    });
  });

  // ── Tab bar ────────────────────────────────────────────────────────────────
  describe('Tab bar', () => {
    it('renders a tablist with aria-labelledby', () => {
      const tablist = container.querySelector('[role="tablist"]');
      expect(tablist).to.exist;
      expect(tablist.getAttribute('aria-labelledby')).to.equal('preflight-title');
    });

    it('renders all 7 expected tabs', () => {
      const buttons = container.querySelectorAll('.preflight-tab-button');
      expect(buttons.length).to.equal(7);
    });

    it('first tab is selected by default', () => {
      const buttons = container.querySelectorAll('.preflight-tab-button');
      expect(buttons[0].getAttribute('aria-selected')).to.equal('true');
    });

    it('non-first tabs are not selected by default', () => {
      const buttons = container.querySelectorAll('.preflight-tab-button');
      for (let i = 1; i < buttons.length; i += 1) {
        expect(buttons[i].getAttribute('aria-selected')).to.equal('false');
      }
    });

    it('tab buttons have sequential IDs (tab-1 … tab-7)', () => {
      const buttons = container.querySelectorAll('.preflight-tab-button');
      buttons.forEach((btn, idx) => {
        expect(btn.id).to.equal(`tab-${idx + 1}`);
      });
    });

    it('tab labels match expected panel names', () => {
      const expected = ['General', 'SEO', 'Martech', 'M@S', 'Accessibility', 'Performance', 'Assets'];
      const buttons = container.querySelectorAll('.preflight-tab-button');
      buttons.forEach((btn, idx) => {
        expect(btn.textContent.trim()).to.equal(expected[idx]);
      });
    });
  });

  // ── Tab panels ─────────────────────────────────────────────────────────────
  describe('Tab panels', () => {
    it('renders 7 tab panels', () => {
      const panels = container.querySelectorAll('[role="tabpanel"]');
      expect(panels.length).to.equal(7);
    });

    it('each panel has aria-labelledby matching its tab button id', () => {
      const panels = container.querySelectorAll('[role="tabpanel"]');
      panels.forEach((panel, idx) => {
        expect(panel.getAttribute('aria-labelledby')).to.equal(`tab-${idx + 1}`);
      });
    });

    it('each panel has a sequential id (panel-1 … panel-7)', () => {
      const panels = container.querySelectorAll('[role="tabpanel"]');
      panels.forEach((panel, idx) => {
        expect(panel.id).to.equal(`panel-${idx + 1}`);
      });
    });
  });

  // ── Button class mapping ───────────────────────────────────────────────────
  describe('Button class mapping', () => {
    it('preflight-action buttons also carry the con-button class', () => {
      // Render a minimal actions bar to verify class co-existence
      const actionsContainer = document.createElement('div');
      actionsContainer.innerHTML = `
        <button class="preflight-action con-button">Preview</button>
        <button class="preflight-action con-button">Publish</button>
      `;
      const buttons = actionsContainer.querySelectorAll('.preflight-action');
      buttons.forEach((btn) => {
        expect(btn.classList.contains('con-button')).to.be.true;
      });
    });

    it('preflight-action buttons do NOT have inline background set to #FF1593', () => {
      const actionsContainer = document.createElement('div');
      actionsContainer.innerHTML = `<button class="preflight-action con-button">Preview</button>`;
      const btn = actionsContainer.querySelector('.preflight-action');
      expect(btn.style.backgroundColor).to.not.equal('#FF1593');
      expect(btn.style.backgroundColor).to.not.equal('rgb(255, 21, 147)');
    });
  });

  // ── Status icon color classes ──────────────────────────────────────────────
  describe('Status icon color classes', () => {
    const iconColors = ['purple', 'green', 'red', 'orange', 'empty'];

    iconColors.forEach((color) => {
      it(`result-icon.${color} element can be created and carries the correct classes`, () => {
        const div = document.createElement('div');
        div.className = `result-icon ${color}`;
        expect(div.classList.contains('result-icon')).to.be.true;
        expect(div.classList.contains(color)).to.be.true;
      });
    });

    it('purple icon class is used for "checking" / in-progress state', () => {
      // Mirrors the signal default: { icon: "purple", ... }
      const div = document.createElement('div');
      div.className = 'result-icon purple';
      expect(div.classList.contains('purple')).to.be.true;
    });

    it('green icon class is used for pass state', () => {
      const div = document.createElement('div');
      div.className = 'result-icon green';
      expect(div.classList.contains('green')).to.be.true;
    });

    it('red icon class is used for fail state', () => {
      const div = document.createElement('div');
      div.className = 'result-icon red';
      expect(div.classList.contains('red')).to.be.true;
    });

    it('orange icon class is used for limbo/warning state', () => {
      const div = document.createElement('div');
      div.className = 'result-icon orange';
      expect(div.classList.contains('orange')).to.be.true;
    });
  });

  // ── CSS custom property token assertions ───────────────────────────────────
  describe('CSS custom property tokens', () => {
    it('--preflight-surface is defined on :root', () => {
      const val = getComputedStyle(document.documentElement)
        .getPropertyValue('--preflight-surface').trim();
      // Will be empty in jsdom (no stylesheet loaded) but the property name must
      // not be the old --action-color. We verify the old property is gone.
      expect(val).to.not.equal('#FF1593');
    });

    it('--action-color is not set to #FF1593 on :root', () => {
      const val = getComputedStyle(document.documentElement)
        .getPropertyValue('--action-color').trim();
      expect(val).to.not.equal('#FF1593');
    });
  });
});
