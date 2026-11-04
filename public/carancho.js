/* Ondas dibujadas en vivo: ondulan con el scroll. Si la persona pidió menos movimiento, quedan quietas. */
(function(){
  var NS='http://www.w3.org/2000/svg',TAU=Math.PI*2;
  var quieto=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var semilla=4217;
  function rnd(){semilla=(semilla*16807)%2147483647;return semilla/2147483647}
  function ruido(n){var a=[];for(var i=0;i<n;i++)a.push([1+i,rnd()*TAU,1/(i+1)]);
    return function(t){var s=0;for(var i=0;i<a.length;i++)s+=a[i][2]*Math.sin(TAU*a[i][0]*t+a[i][1]);return s/1.6}}
  function f(n){return n.toFixed(1)}

  // contorno de un trazo de ancho variable
  function trazo(c,ancho,pasos){
    var A=[],B=[],i,t,p,q,r,nx,ny,l,w;
    for(i=0;i<=pasos;i++){t=i/pasos;p=c(t);q=c(Math.max(0,t-.004));r=c(Math.min(1,t+.004));
      nx=-(r[1]-q[1]);ny=r[0]-q[0];l=Math.hypot(nx,ny)||1;w=ancho(t)/2;
      A.push(f(p[0]+nx/l*w)+' '+f(p[1]+ny/l*w));B.unshift(f(p[0]-nx/l*w)+' '+f(p[1]-ny/l*w))}
    return 'M'+A.concat(B).join('L')+'Z'}

  function lienzo(host,clase,vw,vh,alFinal){
    var s=document.createElementNS(NS,'svg'),p=document.createElementNS(NS,'path');
    s.setAttribute('class',clase);s.setAttribute('viewBox','0 0 '+vw+' '+vh);s.setAttribute('preserveAspectRatio','none');s.setAttribute('aria-hidden','true');
    s.appendChild(p);if(alFinal)host.appendChild(s);else host.insertBefore(s,host.firstChild);
    return {svg:s,path:p}}

  var olas=[];
  // franja horizontal: las líneas se abren, se juntan y se desplazan
  function franja(host,dir){
    var L=lienzo(host,'ola',1600,320),W=1600,H=320,lineas=[],a=rnd()*TAU,b=rnd()*TAU;
    for(var k=0;k<8;k++)lineas.push({k:k,n:ruido(3),w:ruido(4)});
    host.classList.add('con-ola');
    olas.push({el:L.svg,v:dir,dibujar:function(g){var d='';
      lineas.forEach(function(o){var k=o.k-3.5;
        d+=trazo(function(t){return [-30+t*(W+60),
          H/2+k*(22+3.5*Math.sin(TAU*1.3*t+g*.7+o.k*.3))+36*Math.sin(TAU*1.1*t+g+a)+19*Math.sin(TAU*2.2*t-g*1.6+b)+6*o.n(t)]},
          function(t){return 9+2.8*o.w(t)},80)});
      L.path.setAttribute('d',d)}})}

  // haz de esquina: entra por arriba y sale por el costado
  function esquina(host,clase,dir){
    var L=lienzo(host,clase,1000,560),lineas=[];
    for(var k=0;k<12;k++)lineas.push({k:k,sx:230+k*(50+rnd()*3),ey:34+k*(19+rnd()*1.5),a:ruido(2),b:ruido(2),w:ruido(4)});
    olas.push({el:L.svg,v:dir,dibujar:function(g){var d='';
      lineas.forEach(function(o){var k=o.k;
        d+=trazo(function(t){var s=Math.sin(Math.PI*t);return [
          o.sx*(1-t)-50*t+(70+k*7)*s+30*Math.sin(TAU*(1.4*t+.1)+g)+12*o.a(t),
          -50*(1-t)+o.ey*t+(52+k*4)*s+30*Math.sin(TAU*(1.2*t+.55)-g*1.25)+9*o.b(t)]},
          function(t){return 11+3.4*o.w(t)},70)});
      L.path.setAttribute('d',d)}})}

  // haz vertical: baja entre el nombre y la foto
  function vertical(host){
    var L=lienzo(host,'ola-vertical',400,1000),lineas=[];
    for(var k=0;k<9;k++)lineas.push({k:k,n:ruido(3),w:ruido(4)});
    olas.push({el:L.svg,v:1,dibujar:function(g){var d='';
      lineas.forEach(function(o){var k=o.k;
        d+=trazo(function(t){return [
          60+k*31*(1+.2*Math.sin(TAU*.9*t+g*.7))+58*Math.sin(TAU*(.85*t+.1)+g)+24*Math.sin(TAU*1.9*t-g*1.5)+7*o.n(t),
          -30+t*1060]},
          function(t){return 11+3.2*o.w(t)},70)});
      L.path.setAttribute('d',d)}})}

  // borde inferior de la portada: papel que entra sobre el negro
  function borde(host){
    var L=lienzo(host,'borde',1600,120,true),n=ruido(4);
    olas.push({el:L.svg,v:1,dibujar:function(g){var p=[],i,t;
      for(i=0;i<=70;i++){t=i/70;p.push(f(t*1600)+' '+f(62+22*Math.sin(TAU*1.2*t+g)+13*Math.sin(TAU*2.6*t-g*1.4)+6*n(t)))}
      L.path.setAttribute('d','M'+p.join('L')+'L1600 121L0 121Z')}})}

  var hero=document.querySelector('.hero'),ph=document.querySelector('.phead');
  if(hero){
    if(innerWidth>820)vertical(hero);else{franja(hero,1);olas[olas.length-1].el.setAttribute('class','ola-hero')}
    borde(hero)}
  if(ph)esquina(ph,'ola-esquina espejo',-1);
  [['.projects',1],['.novedades',-1],['.contact',1]].forEach(function(x){var e=document.querySelector(x[0]);if(e)franja(e,x[1])});
  if(!olas.length)return;

  function visible(e){var r=e.getBoundingClientRect();return r.bottom>-40&&r.top<innerHeight+40}
  var fase=0,meta=0,activo=false;
  function pintar(todas){olas.forEach(function(o){if(todas||visible(o.el))o.dibujar(fase*o.v)})}
  function cuadro(){
    var d=meta-fase;
    if(Math.abs(d)<.0008){fase=meta;pintar();activo=false;return}
    fase+=d*.1;pintar();requestAnimationFrame(cuadro)}
  meta=fase=(window.scrollY||0)*.0034;pintar(true);
  if(quieto)return;
  addEventListener('scroll',function(){meta=(window.scrollY||0)*.0034;if(!activo){activo=true;requestAnimationFrame(cuadro)}},{passive:true});
  addEventListener('resize',function(){pintar(true)},{passive:true});
})();
