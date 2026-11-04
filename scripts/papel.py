# Genera una textura de papel que empalma por los cuatro lados. Se corre a mano: python3 scripts/papel.py
import numpy as np
from PIL import Image, ImageDraw
N=640; rng=np.random.default_rng(1871)
def ruido(beta):
    f=np.fft.fftfreq(N); fx,fy=np.meshgrid(f,f); r=np.sqrt(fx**2+fy**2); r[0,0]=1
    a=(rng.normal(size=(N,N))+1j*rng.normal(size=(N,N)))/r**beta; a[0,0]=0
    n=np.real(np.fft.ifft2(a)); return n/n.std()
base=250-3.2*ruido(1.5)-2.2*ruido(.9)-3.4*rng.normal(size=(N,N))
# fibras finas, cortas y curvas, repetidas en los bordes
S=2; fib=Image.new('L',(N*S,N*S),0); d=ImageDraw.Draw(fib)
for i in range(1500):
    x,y=rng.uniform(0,N*S,2); a=rng.uniform(0,6.283); L=rng.uniform(14,64)*S; c=rng.uniform(-.05,.05)/S
    p=[]
    for t in np.linspace(0,1,12):
        p.append((x,y)); a+=c*L/12; x+=np.cos(a)*L/12; y+=np.sin(a)*L/12
    v=int(rng.uniform(50,170))
    for ox in (-N*S,0,N*S):
        for oy in (-N*S,0,N*S):
            d.line([(a_+ox,b_+oy) for a_,b_ in p],fill=v,width=1)
f=np.array(fib.resize((N,N),Image.LANCZOS)).astype(float)/255
img=np.clip(base-f*11,0,255).astype('uint8')
Image.fromarray(img,'L').convert('RGB').save('public/img/carancho/papel.webp',quality=82,method=6)
