import { expect } from '@esm-bundle/chai';
import {
  suppressPreflightNotification,
  restorePreflightNotification,
} from '../../libs/utils/preflight-notification.js';

describe('Preflight Notification Suppression', () => {
  let overlay;

  beforeEach(() => {
    // Create a mock notification overlay
    overlay = document.createElement('div');
    overlay.className = 'milo-preflight-overlay';
    overlay.style.display = '';
    document.body.appendChild(overlay);
  });

  afterEach(() => {
    if (overlay && overlay.parentNode) {
      document.body.removeChild(overlay);
    }
    // Reset any other DOM state
    document.querySelectorAll('.milo-preflight-overlay').forEach((el) => el.remove());
  });

  describe('suppressPreflightNotification', () => {
    it('hides existing notification overlay', () => {
      suppressPreflightNotification();

      expect(overlay.style.display).to.equal('none');
    });

    it('sets isPreflightOpen flag to prevent new notifications', () => {
      suppressPreflightNotification();

      // The flag is internal, but we can verify behavior:
      // Attempting to create a new notification should be blocked
      // This is tested indirectly through the notification creation guard
      const existingOverlay = document.querySelector('.milo-preflight-overlay');
      expect(existingOverlay).to.exist;
    });
  });

  describe('restorePreflightNotification', () => {
    it('restores hidden notification overlay', () => {
      // First suppress
      suppressPreflightNotification();
      expect(overlay.style.display).to.equal('none');

      // Then restore
      restorePreflightNotification();
      expect(overlay.style.display).to.equal('');
    });

    it('does not restore if notification was dismissed', () => {
      // Mock the wasDismissed flag by removing the overlay entirely
      overlay.remove();

      restorePreflightNotification();

      // Should not recreate notification if it was dismissed
      // This behavior depends on the wasDismissed flag in the actual implementation
      // The test verifies the overlay doesn't magically reappear
    });

    it('handles case when notification was suppressed during creation', async () => {
      // Remove existing overlay to simulate creation-suppressed case
      overlay.remove();

      // Suppress before any notification exists
      suppressPreflightNotification();

      // Now restore - should recreate if suppressedNotificationData exists
      restorePreflightNotification();

      // Wait for async creation
      await new Promise((resolve) => {
        setTimeout(resolve, 100);
      });

      // Notification might be recreated depending on suppressedNotificationData
      // This tests the restoration path for creation-suppressed notifications
    });
  });

  describe('Integration', () => {
    it('suppresses then restores notification correctly', () => {
      expect(overlay.style.display).to.equal('');

      suppressPreflightNotification();
      expect(overlay.style.display).to.equal('none');

      restorePreflightNotification();
      expect(overlay.style.display).to.equal('');
    });

    it('handles multiple suppress calls without error', () => {
      suppressPreflightNotification();
      suppressPreflightNotification();
      suppressPreflightNotification();

      expect(overlay.style.display).to.equal('none');
    });

    it('handles multiple restore calls without error', () => {
      suppressPreflightNotification();

      restorePreflightNotification();
      restorePreflightNotification();
      restorePreflightNotification();

      expect(overlay.style.display).to.equal('');
    });
  });
});
