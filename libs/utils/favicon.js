export default function loadFavicon(createTag, config, getMetadata) {
  const { codeRoot } = config;
  const name = getMetadata('favicon') || 'favicon';
  const favBase = `${codeRoot}/img/favicons/${name}`;
  document.head.querySelector('link[rel="icon"]').href = `${favBase}.ico`;
  const tags = [];
  tags.push(createTag('link', { rel: 'apple-touch-icon', sizes: '180x180', href: `${favBase}-ati.png` }));
  tags.push(createTag('link', { rel: 'icon', type: 'image/png', sizes: '32x32', href: `${favBase}-32x32.png` }));
  tags.push(createTag('link', { rel: 'icon', type: 'image/png', sizes: '16x16', href: `${favBase}-16x16.png` }));
  tags.push(createTag('link', { rel: 'manifest', href: `${favBase}-site.webmanifest` }));
  tags.push(createTag('link', { rel: 'mask-icon', color: '#5bbad5', href: `${favBase}-spt.svg` }));
  tags.push(createTag('meta', { name: 'theme-color', content: '#FFFFFF' }));
  document.head.append(...tags);
}
