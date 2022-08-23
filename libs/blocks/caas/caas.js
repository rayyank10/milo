import { initCaas, loadCaasFiles, loadStrings } from './utils.js';
import { parseEncodedConfig } from '../../utils/utils.js';

const rootMargin = 1000;

const getCaasStrings = (placeholderUrl) => new Promise((resolve) => {
  if (placeholderUrl) {
    resolve(loadStrings(placeholderUrl));
    return;
  }
  resolve({});
});

export default async function init(link) {
  const io = new IntersectionObserver((entries, observer) => {
    entries.forEach(async (entry) => {
      if (entry.isIntersecting) {
        const a = entry.target;
        observer.unobserve(a);

        const encodedConfig = a.href.split('#')[1];
        const state = parseEncodedConfig(encodedConfig);

        const [caasStrs] = await Promise.all([
          getCaasStrings(state.placeholderUrl),
          loadCaasFiles(),
        ]);

        const block = document.createElement('div');
        block.className = a.className;
        block.id = 'caas';
        a.insertAdjacentElement('afterend', block);
        a.remove();

        initCaas(state, caasStrs, block);
      }
    });
  }, { rootMargin: `${rootMargin}px` });

  io.observe(link);
}
