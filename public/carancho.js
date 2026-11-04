/* Las ondas se mueven con el scroll. Sin movimiento si la persona lo pidió. */
(function(){
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  var r=document.documentElement,P=1800,pedido=0;
  function pintar(){
    pedido=0;
    var y=window.scrollY||0,d=(y*.45)%P;
    r.style.setProperty('--sy',y.toFixed(1));
    r.style.setProperty('--f',(-d).toFixed(1)+'px');
    r.style.setProperty('--g',(d-P).toFixed(1)+'px');
    r.style.setProperty('--sq',(1+.2*Math.sin(y*.0042)).toFixed(3));
    r.style.setProperty('--sq2',(1+.2*Math.sin(y*.0042+2)).toFixed(3));
    r.style.setProperty('--sk',(4*Math.sin(y*.003)).toFixed(2));
  }
  addEventListener('scroll',function(){if(!pedido)pedido=requestAnimationFrame(pintar)},{passive:true});
  pintar();
})();
