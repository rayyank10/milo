import sinon from 'sinon';
import { expect } from '@esm-bundle/chai';
import initAccessibility from '../../libs/scripts/accessibility.js';

// --------------------------------------------------------------------------
// Helpers
// --------------------------------------------------------------------------

function setC2Meta(on) {
  document.head.querySelector('meta[name="foundation"]')?.remove();
  if (on) {
    const m = document.createElement('meta');
    m.setAttribute('name', 'foundation');
    m.setAttribute('content', 'c2');
    document.head.appendChild(m);
  }
}

function makeFocusTarget() {
  const btn = document.createElement('button');
  document.body.appendChild(btn);
  // Stub getBoundingClientRect to return a rect fully inside the viewport
  // (top >= 0, bottom <= innerHeight) so the "outsideViewport" fast-path is
  // not taken — the elementFromPoint branch is exercised instead.
  sinon.stub(btn, 'getBoundingClientRect').returns({
    top: 100, bottom: 150, left: 10, right: 110, width: 100, height: 50,
  });
  btn.scrollIntoView = sinon.stub();
  return btn;
}

// Build a shadow host with one inner button and return both.
// getActiveEl(host) returns `host` itself when nothing in the shadow root
// has focus, so we stub getBoundingClientRect on the host to observe whether
// scrollElement() ran.
function makeShadowHost() {
  const host = document.createElement('div');
  host.attachShadow({ mode: 'open' });
  const inner = document.createElement('button');
  host.shadowRoot.appendChild(inner);
  document.body.appendChild(host);
  sinon.stub(host, 'getBoundingClientRect').returns({
    top: 100, bottom: 150, left: 10, right: 110, width: 100, height: 50,
  });
  return { host, inner };
}

function dispatchTab(target = document.body) {
  target.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
}

function dispatchFocusIn(target) {
  // Dispatch on the element so e.target is set correctly via bubbling.
  target.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
}

// --------------------------------------------------------------------------
// Suite
// --------------------------------------------------------------------------

describe('accessibility — scrollTabFocusedElIntoView', () => {
  let rafStub;
  let elemFromPointStub;
  let clock;
  let btn;

  before(() => {
    // Init once; event listeners are registered on document and persist for
    // the whole file.
    initAccessibility();
  });

  beforeEach(() => {
    setC2Meta(false);
    btn = makeFocusTarget();

    // elementFromPoint returns the button itself → shouldntScroll() returns
    // true → no scroll needed.  Individual tests override this where required.
    elemFromPointStub = sinon.stub(document, 'elementFromPoint').returns(btn);

    // Capture (but do not execute) rAF calls so we can control when they fire.
    rafStub = sinon.stub(window, 'requestAnimationFrame');

    // Fake synchronous timers so setTimeout(fn, 0) is controllable.
    clock = sinon.useFakeTimers({ toFake: ['setTimeout'] });
  });

  afterEach(() => {
    clock.restore();
    sinon.restore();
    btn.remove();
    setC2Meta(false);
  });

  // -------------------------------------------------------------------------
  // Non-c2 page — existing synchronous behaviour must be preserved
  // -------------------------------------------------------------------------

  describe('non-c2 page', () => {
    it('calls scroll decision synchronously (no rAF) on focusin after Tab', () => {
      dispatchTab();
      dispatchFocusIn(btn);

      // On a non-c2 page, scheduleScrollElement() calls scrollElement()
      // directly.  getBoundingClientRect() is called synchronously — no rAF.
      expect(btn.getBoundingClientRect.called).to.be.true;
      expect(rafStub.called).to.be.false;
    });

    it('calls scroll decision synchronously (no rAF) on keydown shadow path after Tab', () => {
      const { host, inner } = makeShadowHost();
      elemFromPointStub.returns(inner);

      dispatchTab(host);
      clock.tick(0); // fire the zero-delay setTimeout in the keydown handler

      // On non-c2 the shadow path calls scrollElement() directly; the scroll
      // decision reads the host's bounding rect synchronously.
      expect(host.getBoundingClientRect.called).to.be.true;
      expect(rafStub.called).to.be.false;

      host.remove();
    });
  });

  // -------------------------------------------------------------------------
  // C2 page — scroll decision must be deferred to requestAnimationFrame
  // -------------------------------------------------------------------------

  describe('c2 page', () => {
    beforeEach(() => {
      setC2Meta(true);
    });

    it('does NOT call scroll decision before rAF fires on focusin after Tab', () => {
      dispatchTab();
      dispatchFocusIn(btn);

      // rAF should have been scheduled …
      expect(rafStub.calledOnce).to.be.true;
      // … but scrollElement() must not have run yet.
      expect(btn.getBoundingClientRect.called).to.be.false;
    });

    it('calls scroll decision after rAF fires on focusin after Tab', () => {
      dispatchTab();
      dispatchFocusIn(btn);

      // Manually invoke the rAF callback that scheduleScrollElement registered.
      const rafCallback = rafStub.firstCall.args[0];
      rafCallback();

      expect(btn.getBoundingClientRect.called).to.be.true;
    });

    it('does NOT call scroll decision before rAF fires on keydown shadow path', () => {
      const { host, inner } = makeShadowHost();
      elemFromPointStub.returns(inner);

      dispatchTab(host);
      clock.tick(0); // fire the zero-delay setTimeout in the keydown handler

      // rAF should have been scheduled …
      expect(rafStub.calledOnce).to.be.true;
      // … but scrollElement() must not have run yet.
      expect(host.getBoundingClientRect.called).to.be.false;

      host.remove();
    });

    it('calls scroll decision after rAF fires on keydown shadow path', () => {
      const { host, inner } = makeShadowHost();
      elemFromPointStub.returns(inner);

      dispatchTab(host);
      clock.tick(0);

      // Manually fire the rAF callback; scrollElement() should now run.
      const rafCallback = rafStub.firstCall.args[0];
      rafCallback();

      expect(host.getBoundingClientRect.called).to.be.true;

      host.remove();
    });
  });
});
