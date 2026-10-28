/* Eventos con fecha: cuando pasa data-end, el evento sale de "Próximas"
   y entra en la línea de tiempo de su año. Se quita lo que solo sirve antes
   (.pre: inscripción) y el JSON-LD de Event. Sin JS, todo queda como está. */
(function(){
  var now=Date.now(), tl=document.querySelector('.tline');
  document.querySelectorAll('li[data-end]').forEach(function(li){
    if(!(Date.parse(li.dataset.end)<=now))return;
    li.querySelectorAll('.pre').forEach(function(e){e.remove()});
    if(!tl||!li.closest('.upcoming'))return;
    var yr=li.dataset.end.slice(0,4), g=null;
    tl.querySelectorAll('.yg').forEach(function(x){if(x.querySelector('.yh').textContent.trim()===yr)g=x});
    if(!g){
      g=document.createElement('div');g.className='yg';
      g.innerHTML='<h3 class="yh">'+yr+'</h3><ul></ul>';
      var first=tl.querySelector('.yg');
      first?first.parentNode.insertBefore(g,first):tl.querySelector('.wrap').appendChild(g);
    }
    if(li.dataset.tag){var s=document.createElement('span');s.className='tag';s.textContent=li.dataset.tag;li.querySelector('.yr').appendChild(s)}
    g.querySelector('ul').prepend(li);
  });
  document.querySelectorAll('.upcoming').forEach(function(s){if(!s.querySelector('li'))s.hidden=true});
  document.querySelectorAll('script[type="application/ld+json"][data-end]').forEach(function(s){
    if(Date.parse(s.dataset.end)<=now)s.remove();
  });
})();
