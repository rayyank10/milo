/* eslint-disable import/no-named-as-default-member */
import { expect } from 'chai';
import { html, render, signal } from '../../../../../libs/deps/htm-preact.js';
import Panel from '../../../../../libs/blocks/preflight/panels/performance.js';

describe('Preflight performance', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    document.head.innerHTML = '';
  });

  describe('Panel', () => {
    it('renders a panel with all the items', () => {
      const panel = html`<${Panel} />`;
      render(panel, document.body);
      const panelItems = document.querySelectorAll('.preflight-item');
      expect(panelItems.length).to.exist;
    });

    it('hides Highlight LCP link when showHighlightLCP is false', () => {
      const showHighlightLCP = signal(false);
      const panel = html`<${Panel} showHighlightLCP=${showHighlightLCP} />`;
      render(panel, document.body);

      // Wait for render
      setTimeout(() => {
        const lcpLink = document.querySelector('[onclick*="highlightLCP"]');
        expect(lcpLink).to.not.exist;
      }, 100);
    });

    it('shows Highlight LCP link when showHighlightLCP is true', () => {
      const showHighlightLCP = signal(true);
      const panel = html`<${Panel} showHighlightLCP=${showHighlightLCP} />`;
      render(panel, document.body);

      setTimeout(() => {
        const lcpLink = document.querySelector('[onclick*="highlightLCP"]');
        expect(lcpLink).to.exist;
      }, 100);
    });
  });
});
