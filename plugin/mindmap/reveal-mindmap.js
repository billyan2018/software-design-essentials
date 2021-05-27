Reveal.addEventListener('ready', event => asyncMermaidRender(event));

async function asyncMermaidRender (event) {
  const graphs = document.getElementsByClassName('mindmap');
  graphs.forEach((item, index) => {
    let graphCode = item.innerText.trim() ;//trim() becase of gantt, class and git diagram
    let mindDiv = document.createElement('div');
    mindDiv.classList.add('mindmap');
    mindDiv.setAttribute('data-processed', 'true');

    try {
      // item.innerText ignores html elements added by revealjs highlight plugin.
      /*mermaid.mermaidAPI.render('theGraph' + index, graphCode, function (svgCode) {
        mindDiv.innerHTML = svgCode;
      });*/

      let parentDiv = document.createElement('div');
      parentDiv.appendChild(mindDiv);
      item.parentNode.parentNode.insertBefore(parentDiv, item.parentNode);
      item.parentNode.remove();
    } catch (err) {
      console.log('Cannot render mermaid diagram ' + index + '\n' + graphCode);
      console.log(err.message);
    }
  });
}
