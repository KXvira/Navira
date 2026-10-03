// Deterministic local raster export of assets/brand/navira-mark.svg.
const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');
const root = path.join(__dirname, '..', 'assets');
const navy = [8, 25, 43], mint = [91, 241, 190], cyan = [59, 205, 235], white = [242, 252, 255];
const outer = [[280, 567], [742, 286], [548, 747], [497, 596]];
const facet = [[497, 596], [742, 286], [548, 747]];
const inPolygon = (x,y,poly) => { let inside=false; for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j]; if(((a[1]>y)!==(b[1]>y)) && x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0]) inside=!inside;} return inside; };
function colorAt(x,y,mono=false){
  const dx=x-512,dy=y-512, r=Math.hypot(dx,dy), deg=(Math.atan2(dy,dx)*180/Math.PI+360)%360;
  let color=null;
  if(r>=317 && r<=335 && ((deg>=32&&deg<=128)||(deg>=146&&deg<=230))) color=mono?white:(deg>=146?mint:cyan);
  if(Math.hypot(x-278,y-275)<=27) color=mono?white:mint;
  if(inPolygon(x,y,outer)) color=mono?white:mint;
  if(inPolygon(x,y,facet)) color=mono?white:cyan;
  return color;
}
function render(size,scale,background,mono=false){
  const png=new PNG({width:size,height:size,colorType:6});
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
    const samples=[[.25,.25],[.75,.25],[.25,.75],[.75,.75]]; let rr=0,gg=0,bb=0,aa=0;
    for(const [sx,sy] of samples){const xx=((x+sx)/size*1024-512)/scale+512,yy=((y+sy)/size*1024-512)/scale+512; const c=colorAt(xx,yy,mono); if(c){rr+=c[0];gg+=c[1];bb+=c[2];aa++;}else if(background){rr+=background[0];gg+=background[1];bb+=background[2];aa++;}}
    const i=(y*size+x)*4; png.data[i]=rr/4;png.data[i+1]=gg/4;png.data[i+2]=bb/4;png.data[i+3]=aa*255/4;
  }
  return png;
}
function save(name,png){fs.writeFileSync(path.join(root,name),PNG.sync.write(png));}
function solid(size,color,height=size){const p=new PNG({width:size,height,colorType:6});for(let i=0;i<p.data.length;i+=4){p.data[i]=color[0];p.data[i+1]=color[1];p.data[i+2]=color[2];p.data[i+3]=255;}return p;}
function paste(dst,src,left,top){for(let y=0;y<src.height;y++)for(let x=0;x<src.width;x++){const X=left+x,Y=top+y;if(X<0||Y<0||X>=dst.width||Y>=dst.height)continue;const a=(y*src.width+x)*4,b=(Y*dst.width+X)*4,t=src.data[a+3]/255;for(let k=0;k<3;k++)dst.data[b+k]=Math.round(src.data[a+k]*t+dst.data[b+k]*(1-t));dst.data[b+3]=255;}}
const icon=render(1024,1,navy), foreground=render(1024,.82,null), monochrome=render(1024,.82,null,true), splash=render(1024,.9,null), favicon=render(64,1,navy);
save('icon.png',icon);save('android-icon-foreground.png',foreground);save('android-icon-background.png',solid(1024,navy));save('android-icon-monochrome.png',monochrome);save('splash-icon.png',splash);save('favicon.png',favicon);
const preview=solid(1260,[222,233,239],740);
const tile=render(360,1,navy);paste(preview,tile,60,170);
const adaptive=solid(360,navy),small=render(360,.82,null);paste(adaptive,small,0,0);paste(preview,adaptive,450,170);
const phone=solid(360,navy,640),splashSmall=render(190,.9,null);paste(phone,splashSmall,85,225);
paste(preview,phone,840,30);
// Dark bars frame the three previews without becoming part of an app asset.
for(const left of [60,450])for(let x=left;x<left+360;x++)for(let y=145;y<151;y++){const i=(y*preview.width+x)*4;preview.data[i]=35;preview.data[i+1]=68;preview.data[i+2]=88;}
save('brand/navira-preview.png',preview);
console.log('Rendered Navira brand PNGs and preview');
