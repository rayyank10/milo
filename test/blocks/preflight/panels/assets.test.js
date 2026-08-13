import { expect } from '@esm-bundle/chai';
import sinon from 'sinon';
import { html, render } from '../../../../libs/deps/htm-preact.js';
import Assets, { criticalAssetFailures, warningAssetFailures, assetsWithMatch, viewportTooSmall } from '../../../../libs/blocks/preflight/panels/assets.js';

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
    // Reset signals to default state
    criticalAssetFailures.value = [];
    warningAssetFailures.value = [];
    assetsWithMatch.value = [];
    viewportTooSmall.value = false;
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
    viewportTooSmall.value = true;
    render(html`<${Assets} />`, container);

    const tooSmallMessage = container.querySelector('.assets-viewport-message');
    expect(tooSmallMessage).to.exist;
    expect(tooSmallMessage.textContent).to.include('Please resize your browser');
  });

  it('renders asset check items when viewport is appropriate', () => {
    viewportTooSmall.value = false;
    const pendingCheck = new Promise(() => {});
    window.runChecksFromAssets.returns([pendingCheck]);
    render(html`<${Assets} />`, container);

    expect(container.querySelector('.assets-columns')).to.exist;
    expect(container.querySelector('.assets-item')).to.exist;
    expect(container.querySelector('.assets-item-title')).to.exist;
    expect(container.querySelector('.assets-item-description')).to.exist;
  });

  it('renders compact asset cards with metric rows for critical failures', () => {
    viewportTooSmall.value = false;
    criticalAssetFailures.value = [{
      type: 'image',
      src: 'test.jpg',
      roundedFactor: 2.5,
      naturalDimensions: '1000x500',
      displayDimensions: '400x200',
      hasMismatch: true,
      recommendedDimensions: '800x400',
      typeLabel: 'Image',
      notes: null,
      asset: null,
    }];

    render(html`<${Assets} />`, container);

    const card = container.querySelector('.assets-card');
    expect(card).to.exist;
    expect(card.classList.contains('assets-card-critical')).to.be.true;

    const thumb = card.querySelector('.assets-thumb');
    expect(thumb).to.exist;

    const metricRows = card.querySelectorAll('.assets-metric-row');
    expect(metricRows.length).to.be.greaterThan(0);

    const criticalLabel = card.querySelector('.assets-critical-label');
    expect(criticalLabel).to.exist;
  });

  it('renders a card-list container when assets are present', () => {
    viewportTooSmall.value = false;
    warningAssetFailures.value = [{
      type: 'image',
      src: 'warn.jpg',
      roundedFactor: 1.5,
      naturalDimensions: '800x400',
      displayDimensions: '600x300',
      hasMismatch: true,
      recommendedDimensions: '1200x600',
      typeLabel: 'Image',
      notes: null,
      asset: null,
    }];

    render(html`<${Assets} />`, container);

    const cardList = container.querySelector('.assets-card-list');
    expect(cardList).to.exist;
    const card = cardList.querySelector('.assets-card');
    expect(card).to.exist;
    expect(card.classList.contains('assets-card-warning')).to.be.true;
  });
});
