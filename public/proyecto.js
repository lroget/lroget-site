/* Plantilla de proyecto: aparición al entrar en pantalla y foto ampliada. */
(function(){
  var quieto=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var els=document.querySelectorAll('[data-v]');
  if(quieto||!('IntersectionObserver' in window)){els.forEach(function(e){e.classList.add('vis')})}
  else{
    var io=new IntersectionObserver(function(en){en.forEach(function(x){if(x.isIntersecting){x.target.classList.add('vis');io.unobserve(x.target)}})},{rootMargin:'0px 0px -12% 0px',threshold:.15});
    els.forEach(function(e){io.observe(e)});
  }
  // índice para escalonar (puntos del bosque, días del programa)
  document.querySelectorAll('.bosque i,.programa li').forEach(function(e,i,l){e.style.setProperty('--k',[].indexOf.call(e.parentNode.children,e))});

  var lb=document.getElementById('lb');if(!lb)return;
  var im=document.getElementById('lbImg'),cap=document.getElementById('lbCap');
  document.querySelectorAll('[data-full]').forEach(function(b){
    b.addEventListener('click',function(){
      var i=b.querySelector('img'),c=b.closest('figure')&&b.closest('figure').querySelector('figcaption');
      im.src=b.dataset.full;im.alt=i?i.alt:'';cap.innerHTML=c?c.innerHTML:'';lb.showModal();
    });
  });
  document.getElementById('lbClose').addEventListener('click',function(){lb.close()});
  lb.addEventListener('click',function(e){if(e.target===lb)lb.close()});
})();
