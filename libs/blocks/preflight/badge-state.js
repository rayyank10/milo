import { signal } from '../../deps/htm-preact.js';

export const tabBadges = signal({});

export function setTabBadge(title, errors, warnings) {
  const current = tabBadges.value[title];
  if (current?.errors === errors && current?.warnings === warnings) return;
  tabBadges.value = { ...tabBadges.value, [title]: { errors, warnings } };
}
