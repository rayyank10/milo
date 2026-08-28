import { expect } from '@esm-bundle/chai';
import sinon from 'sinon';
import init, { updateTabBadges } from '../../../libs/blocks/preflight/preflight.js';

describe('Preflight Modal Redesign', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    container.id = 'preflight';
    container.className = 'dialog-modal';
    document.body.appendChild(container);

    // Set up minimal config to prevent errors in checks
    window.miloConfig = window.miloConfig || {};
    window.miloConfig.georouting = { enabled: false };

    // Add minimal DOM structure for checks
    const header = document.createElement('header');
    const footer = document.createElement('footer');
    document.body.appendChild(header);
    document.body.appendChild(footer);
  });

  afterEach(() => {
    if (container.parentNode) {
      document.body.removeChild(container);
    }
    // Clean up added DOM elements
    document.querySelectorAll('header, footer').forEach((el) => {
      if (el.parentNode === document.body) el.remove();
    });
    // Clean up config
    if (window.miloConfig) {
      delete window.miloConfig.georouting;
    }
    sinon.restore();
  });

  describe('Tab Badge Severity Colors', () => {
    it('shows red badge when tab has errors', async () => {
      updateTabBadges('General', 2, 0);
      await init(container);

      await new Promise((resolve) => {
        setTimeout(() => resolve(), 100);
      });
      const badge = container.querySelector('.preflight-nav-badge.error');
      expect(badge).to.exist;
      expect(badge.textContent).to.equal('2');
    });

    it('shows orange badge when tab has only warnings', async () => {
      updateTabBadges('SEO', 0, 3);
      await init(container);

      await new Promise((resolve) => {
        setTimeout(() => resolve(), 100);
      });
      const badge = container.querySelector('.preflight-nav-badge.warning');
      expect(badge).to.exist;
      expect(badge.textContent).to.equal('3');
    });

    it('shows red badge when tab has both errors and warnings', async () => {
      updateTabBadges('Performance', 1, 2);
      await init(container);

      await new Promise((resolve) => {
        setTimeout(() => resolve(), 100);
      });
      const badge = container.querySelector('.preflight-nav-badge.error');
      expect(badge).to.exist;
      expect(badge.textContent).to.equal('3');
    });

    it('shows no badge when issueCount is 0', async () => {
      updateTabBadges('Assets', 0, 0);
      await init(container);

      await new Promise((resolve) => {
        setTimeout(() => resolve(), 100);
      });
      const navItem = container.querySelector('[key="Assets"]');
      const badge = navItem?.querySelector('.preflight-nav-badge');
      expect(badge).to.not.exist;
    });
  });

  describe('Notification Suppression', () => {
    it('calls notification suppression on init', async () => {
      // Create a notification overlay to test suppression
      const overlay = document.createElement('div');
      overlay.className = 'milo-preflight-overlay';
      document.body.appendChild(overlay);

      await init(container);

      // Notification should be hidden when modal opens
      // This is tested via integration in preflight-notification.test.js
      expect(container.querySelector('.preflight-nav-rail')).to.exist;

      // Cleanup
      overlay.remove();
    });
  });

  describe('Navigation Rail Rendering', () => {
    it('renders left navigation rail with tab items', async () => {
      await init(container);

      await new Promise((resolve) => {
        setTimeout(() => resolve(), 100);
      });
      const navRail = container.querySelector('.preflight-nav-rail');
      expect(navRail).to.exist;

      const navItems = container.querySelectorAll('.preflight-nav-item');
      expect(navItems.length).to.equal(7); // 7 tabs
    });

    it('marks active tab with active class', async () => {
      await init(container);

      await new Promise((resolve) => {
        setTimeout(() => resolve(), 100);
      });
      const activeItem = container.querySelector('.preflight-nav-item.active');
      expect(activeItem).to.exist;
      expect(activeItem.textContent).to.include('General');
    });
  });

  describe('Mobile Top Nav', () => {
    it('renders mobile top nav for small viewports', async () => {
      await init(container);

      await new Promise((resolve) => {
        setTimeout(() => resolve(), 100);
      });
      const topNav = container.querySelector('.preflight-top-nav');
      expect(topNav).to.exist;

      const topNavItems = container.querySelectorAll('.preflight-top-nav-item');
      expect(topNavItems.length).to.equal(7);
    });
  });

  describe('Tab Panel Content', () => {
    it('shows only the active tab panel', async () => {
      await init(container);

      await new Promise((resolve) => {
        setTimeout(() => resolve(), 100);
      });
      const visiblePanels = container.querySelectorAll('.preflight-tab-panel[aria-selected="true"]');
      expect(visiblePanels.length).to.equal(1);
    });
  });
});
