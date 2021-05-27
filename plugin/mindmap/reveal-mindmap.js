

console.log('mindmap plugin launched');
const enabled = {};

function transform(transformer, content) {
  const { root, features } = transformer.transform(content);
  const keys = Object.keys(features).filter(key => !enabled[key]);
  keys.forEach(key => { enabled[key] = true; });
  const { styles, scripts } = transformer.getAssets(keys);
  const { loadJS, loadCSS } = window.markmap;
  if (styles) loadCSS(styles);
  if (scripts) loadJS(scripts);
  return root;
}
function hashCode(str) {
  var hash = 0, i, chr;
  if (str.length === 0) return hash;
  for (i = 0; i < str.length; i++) {
    chr = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

function fastRender(el) {
  const { Transformer, Markmap } = window.markmap;
  const lines = el.textContent.split('\n');
  const height = lines.length * 20 + 40;
  el.id = 'svg-' + hashCode(el.innerHTML);

  let indent = Infinity;
  lines.forEach(line => {
    const spaces = line.match(/^\s*/)[0].length;
    if (spaces < line.length) {
      indent = Math.min(indent, spaces);
    }
  });
  const content = lines.map(line => line.slice(indent)).join('\n');
  const transformer = new Transformer();
  el.innerHTML = `<svg height="${height}px" width="100%"></svg>`;
  const svg = el.firstChild;
  const mm = Markmap.create(svg);
  const render = () => {
    const root = transform(transformer, content);
    mm.setData(root);
    mm.fit();
  };
  transformer.hooks.retransform.tap(render);
  render();
}

Reveal.on('slidechanged', () => {
  document.querySelectorAll('.mindmap').forEach(fastRender);
});
