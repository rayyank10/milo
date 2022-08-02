/* global it */
import { expect } from '@esm-bundle/chai';
import { getLocale } from '../../../libs/features/localeMap.js';

it('Clones an object', () => {
  const locale = getLocale();
  expect(locale.ietf).to.equal('en-US');
});


