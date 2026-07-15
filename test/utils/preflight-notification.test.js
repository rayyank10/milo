import { expect } from '@esm-bundle/chai';
import { createPreflightNotification } from '../../libs/utils/preflight-notification.js';

function addOverlay() {
  const overlay = document.createElement('div');
  overlay.className = 'milo-preflight-overlay';
  document.body.appendChild(overlay);
  return overlay;
}

describe('Preflight notification suppression', () => {
  afterEach(() => {
    document.querySelectorAll('.milo-preflight-overlay, .dialog-modal#preflight').forEach((el) => el.remove());
  });

  it('dismisses an existing notification when preflight opens', () => {
    addOverlay();
    expect(document.querySelector('.milo-preflight-overlay')).to.exist;

    window.dispatchEvent(new CustomEvent('custom:preflight'));

    expect(document.querySelector('.milo-preflight-overlay')).to.not.exist;
  });

  it('suppresses new notifications while preflight is open', async () => {
    window.dispatchEvent(new CustomEvent('custom:preflight'));

    await createPreflightNotification();

    expect(document.querySelector('.milo-preflight-overlay')).to.not.exist;
  });

  it('allows notifications again once preflight closes', async () => {
    window.dispatchEvent(new CustomEvent('custom:preflight'));

    window.dispatchEvent(new Event('milo:modal:closed'));
    await new Promise((resolve) => { setTimeout(resolve, 0); });

    await createPreflightNotification();

    expect(document.querySelector('.milo-preflight-overlay')).to.exist;
  });

  it('stays suppressed if the preflight dialog is still in the DOM when closed fires', async () => {
    window.dispatchEvent(new CustomEvent('custom:preflight'));
    const dialog = document.createElement('div');
    dialog.className = 'dialog-modal';
    dialog.id = 'preflight';
    document.body.appendChild(dialog);

    window.dispatchEvent(new Event('milo:modal:closed'));
    await new Promise((resolve) => { setTimeout(resolve, 0); });

    await createPreflightNotification();

    expect(document.querySelector('.milo-preflight-overlay')).to.not.exist;
  });
});
