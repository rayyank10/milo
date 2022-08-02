import { loadStyle } from '../utils/utils.js';

const localeMap = {
  '': { ietf: 'en-US', tk: 'pps7abe.css' },
  de: { ietf: 'de-DE', tk: 'vin7zsi.css' },
  cn: { ietf: 'zh-CN', tk: 'puu3xkp' },
};

export function getLocale() {
  const { pathname } = window.location;
  const split = pathname.split('/');
  return localeMap[split[1]] || localeMap[''];
}

export function getTypeKit() {
  const locale = getLocale();
  const tkSplit = locale.tk.split('.');
  if (tkSplit[1] === 'css') {
    loadStyle(`https://use.typekit.net/${locale.tk}`);
  }
}

export default localeMap;
