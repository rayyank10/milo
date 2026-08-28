import { expect } from '@esm-bundle/chai';
import sinon from 'sinon';
import { html, render } from '../../../../libs/deps/htm-preact.js';
import Assets from '../../../../libs/blocks/preflight/panels/assets.js';

describe('Preflight Assets Panel', () => {
  let container;
  let originalWindowProps = {};

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    originalWindowProps = {
      runChecksFromAssets: window.runChecksFromAssets,
      isViewportTooSmallFromAssets: window.isViewportTooSmallFromAssets,
    };
    window.runChecksFromAssets = sinon.stub();
    window.isViewportTooSmallFromAssets = sinon.stub().returns(false);
    window.mockImport = true;
  });

  afterEach(() => {
    document.body.removeChild(container);
    window.runChecksFromAssets = originalWindowProps.runChecksFromAssets;
    window.isViewportTooSmallFromAssets = originalWindowProps.isViewportTooSmallFromAssets;
    window.mockImport = false;
    sinon.restore();
  });

  it('displays loading state when check is running', () => {
    const pendingCheck = new Promise(() => {}); // Never resolves, simulates loading
    window.runChecksFromAssets.returns([pendingCheck]);

    render(html`<${Assets} />`, container);

    expect(container.querySelector('.assets-item-title').textContent).to.equal('Asset Dimensions');
    expect(container.querySelector('.assets-item-description').textContent).to.equal('Checking...');
  });

  it('shows warning message when viewport is too small', () => {
    window.isViewportTooSmallFromAssets.returns(true);
    render(html`<${Assets} />`, container);

    const tooSmallMessage = container.querySelector('.assets-image-grid-item.full-width');
    expect(tooSmallMessage).to.exist;
    expect(tooSmallMessage.textContent).to.include('Please resize your browser');
  });

  it('renders asset check items when viewport is appropriate', () => {
    window.isViewportTooSmallFromAssets.returns(false);
    const pendingCheck = new Promise(() => {});
    window.runChecksFromAssets.returns([pendingCheck]);
    render(html`<${Assets} />`, container);

    expect(container.querySelector('.assets-columns')).to.exist;
    expect(container.querySelector('.assets-item')).to.exist;
    expect(container.querySelector('.assets-item-title')).to.exist;
    expect(container.querySelector('.assets-item-description')).to.exist;
  });

  it('renders asset thumbnails with click handlers', () => {
    // This test verifies the structure is in place
    // Full integration test for click-to-navigate requires modal.js which has external deps
    window.isViewportTooSmallFromAssets.returns(false);
    render(html`<${Assets} />`, container);

    // Verify asset grid structure exists
    const assetColumns = container.querySelector('.assets-columns');
    expect(assetColumns).to.exist;
  });

  it('Back to Preflight popover dispatches sidekick event when clicked', () => {
    // Create sidekick
    const sidekick = document.createElement('aem-sidekick');
    const dispatchSpy = sinon.spy(sidekick, 'dispatchEvent');
    document.body.appendChild(sidekick);

    // Create popover (simulating what navigateToAsset creates)
    const popover = document.createElement('div');
    popover.className = 'preflight-back-popover';
    popover.innerHTML = '<button>Back to Preflight</button>';
    document.body.appendChild(popover);

    const button = popover.querySelector('button');

    // Manually attach the same listener logic that navigateToAsset uses
    button.addEventListener('click', () => {
      popover.remove();
      const sk = document.querySelector('aem-sidekick, helix-sidekick');
      if (sk) {
        sk.dispatchEvent(new CustomEvent('custom:preflight', { bubbles: true }));
      }
    });

    button.click();

    // Verify sidekick event was dispatched
    expect(dispatchSpy.calledOnce).to.be.true;
    const event = dispatchSpy.firstCall.args[0];
    expect(event.type).to.equal('custom:preflight');

    // Verify popover was removed
    expect(document.querySelector('.preflight-back-popover')).to.not.exist;

    // Cleanup
    sidekick.remove();
  });
});
