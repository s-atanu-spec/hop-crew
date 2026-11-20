const colors=[
  ["#fb9669","#ffd696","#e08b70","#ce693f","#773544","#b57757","#f6ac70"],
  ["#46bb98","#f3f3a9","#75bb75","#3f9758","#345b4a","#7f9154","#c5bf73"],
  ["#4599e7","#c1ebff","#8f97d6","#e592ac","#713f83","#8a629f","#e995b4"],
  ["#242c60","#75c4d3","#46678f","#488398","#323859","#456377","#8bbdca"],
  ["#23a9bb","#c8f2e9","#6bb5a5","#43b0a0","#346587","#519b7b","#afd893"],
  ["#438ec3","#f5e9a8","#87bb9c","#66af63","#315c52","#69945e","#d9c682"],
  ["#ee7649","#ffd57f","#bd6548","#bf553a","#813548","#b75436","#f69552"],
  ["#0c8886","#def4b8","#63b78a","#459773","#244c4d","#94704d","#d5a76c"],
  ["#5f6ac8","#ffb1ab","#8387c1","#49819a","#483d72","#9c6b74","#e5a286"],
  ["#6741a8","#ff977e","#9e578e","#b85a6f","#522f6b","#7b527e","#ed8f81"],
  ["#272969","#e185ae","#6a5c9f","#635790","#31254e","#645786","#c394a7"],
  ["#111a40","#287c81","#39547b","#2c5572","#1d2b51","#3d596d","#70a99b"],
  ["#36165e","#ff977d","#bd5192","#625589","#232b5b","#404766","#9392ac"],
  ["#332341","#ffb076","#af584d","#b95137","#572f40","#aa513e","#e59b69"],
  ["#5f99ae","#ffc975","#91716a","#d8a175","#4d5b63","#926b5b","#c4a37e"]
];
const thumbnails=[];
// Offline paintings and animation atlases. Keep a single decoded texture per asset.
const gallery={"actors":{}};
function texture(data){
  if(typeof Image!=="function")return null;
  const image=new Image();image.src="data:image/webp;base64,"+data;return image;
}
const worldImages=Object.fromEntries(Object.entries({"leaves":"@@asset:world/leaves.webp@@","walls":"@@asset:world/walls.webp@@"}).map(([k,data])=>[k,texture(data)]));
const cast=Object.fromEntries(Object.entries(gallery.actors).map(([k,data])=>[k,texture(data)]));
function pursuitCar(x,y,w,phase,broken=false){
  // The moving car is a baked toon sheet; only the wrecked prop keeps the flat drawing.
  if(!broken){const im=fetchSheet("pursuit"),k=w/149*1.9;if(im?.naturalWidth){drawSheet(im,Math.floor(Math.abs(phase)*.6)%12,x-5*k,y,k);return}}
  pen.save();pen.translate(x,y);pen.scale(w/149,w/149);
  if(!broken){poly("#66faef55",[-58,-17,-108,-13,-65,-10]);oval(-46,1,28,3,"#71ffe36b")}
  for(const a of [-44,43]){oval(a,-11,11,11,"#221e30");oval(a,-11,6,6,"#8496a2");oval(a,-11,2,2,"#313447")}
  inked(gradient(0,-49,0,-9,broken?"#b58668":"#8d69e2",broken?"#915650":"#563991",broken?"#513e4b":"#222f54"),"#262738",p=>{
    p.moveTo(-72,-13);p.lineTo(-68,-25);p.lineTo(-42,-32);p.lineTo(-22,-48);p.lineTo(13,-49);p.lineTo(34,-33);p.lineTo(62,-28);p.lineTo(73,-18);p.lineTo(71,-9);p.lineTo(56,-9);p.quadraticCurveTo(45,-32,32,-9);p.lineTo(-30,-9);p.quadraticCurveTo(-43,-32,-56,-9);p.closePath()});
  poly("#567f93",[-33,-32,-17,-44,-4,-44,-4,-32]);poly("#28384e",[0,-44,13,-44,28,-32,0,-32]);
  stroke([-68,-18,-54,-20],"#ffedac",3);stroke([56,-22,67,-21],"#ef799f",3);
  stroke([-24,-16,23,-16],broken?"#e5b487":"#54efdc",2.5);
  if(!broken){
    for(const hub of [-44,43])for(let k=0;k<3;k++){
      const a=phase+k*2*Math.PI/3;stroke([hub,-11,hub+Math.cos(a)*4,-11+Math.sin(a)*4],"#d0d7de",1.4)
    }
    box(-8,-53,18,4,Math.sin(phase*2)>0?"#ff6fa1":"#66eaff");stroke([54,-33,67,-34,67,-38],"#403953",3)}
  pen.restore();
}
function streetHazard(x,w,h,art,variant){
  if(art==="wreck"){
    // A pile-up of three different wrecks: one rammed up onto the next, one dented with its bonnet open, one on its roof.
    const count=Math.max(2,Math.round(w/112)),slot=w/count,wreck=fetchSheet("wreck"),order=count>2?[1,0,2]:[1,0];
    oval(x+w*.5,floor+2,w*.52,5,"#392f435f");oval(x+w*.42,floor+3,w*.2,2.4,"#1c182a66");
    for(let i=0;i<count;i++){const sx=x+slot*(i+.5);stroke([sx-slot*.6,floor+3+i%2,sx-slot*.1,floor+4],"#2a24336e",3);stroke([sx-slot*.55,floor+7,sx,floor+8-i%2],"#2a243355",2.4)}
    for(const i of [...order.keys()].sort((a,b)=>order[a]-order[b]===0?0:order[a]===1?-1:order[b]===1?1:0)){
      const f=order[i%order.length],k=slot*1.06/80;pen.save();pen.translate(x+slot*(i+.5)+(f===1?slot*.2:0),floor+1);pen.rotate(f===2?.03:f===0?-.02:0);if(f===2)pen.scale(-1,1);
      if(wreck?.naturalWidth){const fw=wreck.width/4;pen.drawImage(wreck,f*fw,0,fw,wreck.height,-96*k,-104*k,170.67*k,112*k)}
      else{pen.scale(1,.62*129/slot);pursuitCar(0,-19,slot*.96,0,true)}pen.restore();
    }
    // thin smoke rising from the crumpled bonnets
    for(let c=0;c<count;c++)for(let j=0;j<5;j++){const life=((g?.time||0)*.5+j*.2+c*.37)%1,sx=x+slot*(c+.62)+Math.sin(life*5+c)*5+life*10,sy=floor-30-life*52,r=5+life*11;pen.globalAlpha=(1-life)*.34;const puff=pen.createRadialGradient(sx,sy,1,sx,sy,r);puff.addColorStop(0,"#d8d6de");puff.addColorStop(1,"rgba(150,146,160,0)");pen.fillStyle=puff;pen.beginPath();pen.arc(sx,sy,r,0,6.283);pen.fill()}pen.globalAlpha=1;
    // loose wheel, bumper, glass
    const lx=x+w+10;oval(lx,floor-7,7.5,7.5,"#26222e");oval(lx,floor-7,3.4,3.4,"#c8ccd8");oval(lx,floor+1.5,8,2,"#00000040");
    pen.save();pen.translate(x+slot*1.02,floor-2);pen.rotate(-.2);box(-12,-2,24,3.4,"#5a4a86");box(-12,-2,24,1.2,"#8a78c0");pen.restore();
    for(let i=1;i<count;i++){const cx=x+slot*i;for(let k=0;k<5;k++)star(cx-12+k*6,floor-1-(k%2)*3,1.5+k%2,"#bfeaf0")}
    return;
  }
  pen.save();pen.translate(x,floor);pen.scale(w/100,h/60);
  const t=g?.time||0;
  if(art==="tire"){
    oval(52,0,41,4,"#41324077");
    for(let i=0;i<6;i++){const xx=18+i*11, yy=-47-Math.sin(t*10+i*2)*10;
      path(i%2?"#ffb934":"#fc7040",p=>{p.moveTo(xx-8,-26);p.quadraticCurveTo(xx-11,-40,xx+4,yy);p.quadraticCurveTo(xx+2,-37,xx+12,-27);p.closePath()})}
    oval(49,-22,34,22,"#393243");oval(49,-23,21,14,"#72616a");oval(49,-22,12,9,"#352d40");
    for(let j=0;j<7;j++){const a=t+j*Math.PI/3.5;stroke([49+27*Math.cos(a),-22+17*Math.sin(a),49+30*Math.cos(a+.13),-22+19*Math.sin(a+.13)],"#8f7a7b",1.7)}
  }else{
    box(8,-44,84,36,"#996448");for(const xx of [19,81]){oval(xx,-6,6,6,"#41353c");box(xx-1,-40,2,32,"#edbe89")}
    for(let i=0;i<8;i++)box(2+i*12,-58,12,13,i%2?"#f5bd70":"#b75450");
    for(let i=0;i<8;i++)oval(16+i*9,-40+i%2*2,4,4,i%3?"#f6c85d":"#8ea659");
  }
  pen.restore();
}

// Screen-space aircraft are decorative. Drop targets are world-space, just like the runner.
// The world is measured in metres, with X along the run, Y up and Z away from the track.
// Meshes repeat in long, deterministic blocks. Animation lives on the GPU, so trees and
// water keep moving without rebuilding vertex buffers or downloading environment textures.
const WORLD_TILE=88, FOCAL=340, CENTER=193;
const WORLD_STYLES=[
 ["#719bba","#ffd999","#a56b4b","#bf9366","#5c793e","#dd754b"],
 ["#479db7","#ffdf8c","#59764e","#aa985d","#268258","#e5a529"],
 ["#448bb5","#fbdab1","#c38880","#bf9b82","#547e69","#e65678"],
 ["#283a59","#7db8bb","#49586a","#647981","#315d56","#f4ab54"],
 ["#4b9fb1","#ffdbb7","#448b80","#aa9873","#397d54","#ed779d"],
 ["#559cb3","#e6d7a0","#53886c","#aba16e","#35874c","#efc75f"],
 ["#9b5d52","#ffca80","#a95c41","#bc764f","#567046","#f4a24b"],
 ["#35798a","#c3d8a3","#397d70","#aa8658","#397648","#e3b46d"],
 ["#816b97","#f7b998","#977b86","#b19184","#426d5e","#ec986d"],
 ["#383855","#ed9394","#927176","#9c786f","#536c57","#ffd074"],
 ["#3b3d69","#da90ab","#74647e","#967e86","#51635e","#ffb66e"],
 ["#142947","#4c8289","#3a5c63","#586d69","#2d5648","#e6d769"],
 ["#35345e","#ffa3a2","#806887","#715d7b","#37685f","#58efdf"],
 ["#624768","#f8ae83","#a76861","#b37559","#688493","#72f6d9"],
 ["#698daa","#ffce99","#9f8174","#b99778","#386b58","#ffd367"],
 ["#122839","#688b80","#234a48","#664c37","#174a3d","#f4b64e"]
];
WORLD_STYLES.push(...extraPalettes);
const rgbCache=new Map();
function rgb(hex){if(!rgbCache.has(hex))rgbCache.set(hex,[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255));return rgbCache.get(hex)}
const mix3=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t);
const shade3=(a,n)=>a.map(v=>Math.min(1,v*n));
const vadd=(a,b)=>a.map((v,i)=>v+b[i]), vsub=(a,b)=>a.map((v,i)=>v-b[i]);
const cross3=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const unit3=a=>{const n=Math.hypot(...a)||1;return a.map(x=>x/n)};
const WORLD_STAGE={0:[4.8,2.7],1:[4.7,2.3],2:[6,2.6],3:[6,3.2],4:[4.7,2.3],5:[4.7,2.3],7:[4.7,2.3],8:[4.7,2.3],9:[6,3.2],10:[6,3.2],13:[4.3,3.1],14:[6,3.2],15:[3.1,2.9],17:[4.1,3.2],20:[6,3.2]};
function buildWorld(zone,coarse=false){
  const P=WORLD_STYLES[zone].map(rgb), [sky,haze,far,soil,green,gold]=P;
  const night=[3,9,10,11,12,15].includes(zone),marsWorld=zone===13,jungle=zone===15;
  const water=[3,4,7,8,12,14,15,17,22,26,27].includes(zone);
  const cream=rgb("#f5c68e"), iron=rgb("#45505a"), bark=rgb(jungle?"#59463b":"#765044");
  const stone=mix3(soil,iron,.25), leafLight=mix3(green,rgb(jungle?"#a8ce65":"#d0cf66"),.43);
  const tile=[], rings=[], stride=11;
  let output=tile,seed=1919+zone*919;
  const rand=()=>{seed=(Math.imul(1664525,seed)+1013904223)>>>0;return seed/4294967296};
  // Material numbers identify stone, water, wind-bent foliage, flags, live lights and vehicles.
  function tri(a,b,c,col,mat=0,m=0){
    const n=unit3(cross3(vsub(b,a),vsub(c,a)));
    for(const [i,v] of [a,b,c].entries())output.push(...v,...n,...col,mat,Array.isArray(m)?m[i]:m);
  }
  function quad(a,b,c,d,col,mat=0,m=0){tri(a,b,c,col,mat,m);tri(a,c,d,col,mat,m)}
  function block(x,y,z,w,h,d,col,mat=0,m=0){
    const a=x-w/2,b=x+w/2,e=z-d/2,f=z+d/2,t=y+h;
    quad([a,y,e],[a,t,e],[b,t,e],[b,y,e],col,mat,m);
    quad([b,y,f],[b,t,f],[a,t,f],[a,y,f],col,mat,m);
    quad([a,y,f],[a,t,f],[a,t,e],[a,y,e],col,mat,m);
    quad([b,y,e],[b,t,e],[b,t,f],[b,y,f],col,mat,m);
    quad([a,t,e],[a,t,f],[b,t,f],[b,t,e],col,mat,m);
  }
  function taper(a,b,ra,rb,col,n=6,mat=0,m=0){
    const axis=unit3(vsub(b,a)),side=unit3(cross3(axis,Math.abs(axis[1])>.92?[1,0,0]:[0,1,0])),up=cross3(axis,side);
    function at(v,r,i){const ang=i*2*Math.PI/n;return v.map((c,k)=>c+r*(side[k]*Math.cos(ang)+up[k]*Math.sin(ang)))}
    for(let i=0;i<n;i++){const q=at(b,rb,i),r=at(b,rb,i+1);quad(at(a,ra,i),at(a,ra,i+1),r,q,col,mat,m);if(rb>0)tri(b,q,r,col,mat,m)}
  }
  function solid(x,y,z,rx,ry,rz,col,mat=0,m=0,n=8){
    const rows=coarse?3:4;
    function point(i,j){const a=i*Math.PI*2/n+(j%2)*.18, p=-Math.PI/2+j*Math.PI/rows;
      return [x+rx*Math.cos(a)*Math.cos(p),y+ry*Math.sin(p),z+rz*Math.sin(a)*Math.cos(p)]}
    for(let j=0;j<rows;j++)for(let i=0;i<n;i++){
      const a=point(i,j),b=point(i+1,j),c=point(i+1,j+1),d=point(i,j+1);
      const tint=shade3(col,.94+.06*(.5+.5*Math.sin(i*12+j*4+x)));
      if(j>0)tri(a,d,b,tint,mat,m);if(j<rows-1)tri(b,d,c,tint,mat,m);
    }
  }
  function ribbonLeaf(origin,angle,len,wide,down,col){
    const dx=Math.cos(angle),dz=Math.sin(angle);
    const p=(u,v)=>[origin[0]+dx*len*u-dz*v,origin[1]+Math.sin(u*Math.PI)*len*.27-down*u,origin[2]+dz*len*u+dx*v];
    const middle=p(.48,0);middle[1]+=.3;
    const A=p(0,0),B=p(.46,-wide),D=p(.46,wide),E=p(1,0);
    tri(A,B,middle,col,3,[0,.55,.55]);tri(A,middle,D,shade3(col,.83),3,[0,.55,.55]);
    tri(B,E,middle,col,3,[.55,1,.55]);tri(middle,E,D,shade3(col,.84),3,[.55,1,.55]);
  }
  // UVs occupy the colour slots on textured surfaces. Slight curvature and several
  // crossing planes per crown preserve depth in the overhead-to-side camera movement.
  function panel(x,y,z,w,h,angle,index,botanical=false,light=1){
    const sin=Math.sin(angle),cos=Math.cos(angle),mat=(botanical?10:20)+index;
    const point=(u,v)=>[x+(u-.5)*w*cos,y+(1-v)*h,z+(u-.5)*w*sin+(botanical?Math.sin(u*Math.PI)*.18*w*(1-v):0)];
    function triangle(a,b,c){
      const A=point(...a),B=point(...b),C=point(...c),N=unit3(cross3(vsub(B,A),vsub(C,A)));
      [[A,a],[B,b],[C,c]].forEach(([p,uv])=>output.push(...p,...N,...uv,light,mat,botanical?(1-uv[1])*.83:0));
    }
    for(let j=0;j<2;j++){const l=j*.5,r=l+.5;triangle([l,1],[l,0],[r,0]);triangle([l,1],[r,0],[r,1])}
  }
  function shadow(x,z,sx,sz){
    // Warm umbra on the ground and a wider, softer rim; these move with the caster.
    for(let ring=0;ring<2;ring++){
      const col=mix3(soil,rgb("#25393b"),ring?.49:.26),r=ring?.70:1;
      for(let j=0;j<9;j++){const at=k=>[x+sx*r*Math.cos(k*2*Math.PI/9),.044+ring*.003,z+sz*r*Math.sin(k*2*Math.PI/9)];
        tri([x,.044+ring*.003,z],at(j+1),at(j),col);}
    }
  }
  function tree(x,z,h,type="broad"){
    const base=[x,0,z],top=[x+.48,h*.77,z],r=h*(jungle?.075:.047);
    taper(base,top,r,r*.41,bark,coarse?4:7);
    if(z<11||!water)shadow(x+.7,z+.3,h*.32,h*.16);
    if(type==="palm"||type==="fern"){
      for(let i=0;i<10;i++)ribbonLeaf(top,i*.633+z,h*(.39+i%3*.045),h*(type==="fern"?.11:.067),h*.21, i%2?leafLight:green);
      for(const yaw of [-.71,.45])panel(x,h*(type==="fern"?.23:.44),z-.12,h*(type==="fern"?1.48:1.15),h*.65,yaw,type==="fern"?3:4,true,jungle?.79:.94);
      if(type==="palm")for(let i=0;i<3;i++)solid(x+i*.19,h*.75,z,.25,.32,.26,bark,0,0,5);
    }else{
      for(let j=0;j<(coarse?3:5);j++){
        const a=j*2.4+.3, tip=[x+Math.cos(a)*h*.22,h*(.75+j%2*.15),z+Math.sin(a)*h*.25];
        taper([x,h*.46,z],tip,r*.5,.12,bark,5);solid(...tip,h*.22,h*.17,h*.20,j%2?green:mix3(green,leafLight,.49),3,.45,coarse?5:8);
        if(zone===1&&!coarse)for(let i=0;i<3;i++)solid(tip[0]+i*.53-.5,tip[1]-h*.115,tip[2]-.78,.18,.27,.18,gold,3,.3,5);
      }
      if(jungle){
        for(let j=0;j<5;j++){const a=j*1.24;tri([x,4,z],[x+Math.cos(a)*2.9,0,z+Math.sin(a)*2.9],[x+Math.sin(a)*.4,0,z+Math.cos(a)*.4],bark)}
        const start=[x-1,h*.78,z-.8];let last=start;
        for(let j=1;j<=7;j++){const p=[start[0]+j*.8,start[1]-Math.sin(j*Math.PI/7)*3.4,start[2]+j*.25];taper(last,p,.09,.08,green,4,3,.4);last=p}
      }
      for(let k=0;k<(coarse?2:4);k++){
        const a=k*1.66+.4;
        panel(x+Math.cos(a)*h*.19,h*(.53+k%2*.09),z+Math.sin(a)*h*.17-h*.15,h*.77,h*.54,a*.73,zone===1&&k%2?2:0,true,(jungle?.79:.91)+k*.026);
      }
      if(jungle)panel(x+1,h*.29,z-1.1,h*.32,h*.59,.18,1,true,.84);
    }
  }
  function tower(x,z,ht,facade,style=0){
    const w=style===2?7:9,front=z-2.76;
    block(x,0,z,w,ht,5.5,facade,1);block(x,ht-.2,z,w+.5,.42,5.9,cream,1);
    const bays=style===2?3:4;
    for(let r=0;r<Math.floor(ht/2.2);r++){
      const y=.5+r*2.2;block(x,y-.21,z,w+.16,.16,5.62,shade3(facade,.86));
      for(let j=0;j<bays;j++){
        const a=x-w*.38+j*w*.76/(bays-1);block(a,y,front,.88,1.42,.12,style===2?iron:shade3(facade,.42));
        block(a,y+.18,front-.09,.60,1.1,.08,night&&((r+j)%3)?gold:mix3(iron,sky,.35),night&&((r+j)%3)?5:0);
        if(style===1){block(a-.54,y,front-.1,.18,1.42,.17,green);block(a+.54,y,front-.1,.18,1.42,.17,green)}
      }
    }
    if(style===2){block(x,ht+.25,z,4,1,3,facade);block(x,ht+.5,front,w+.5,.1,.12,gold,5);block(x-w*.49,.5,front,.13,ht-.7,.15,gold,5)}
    if(water){block(x,-.15,z,w+1.8,.60,6.9,stone,1);for(let j=0;j<2;j++)block(x,.08+j*.13,z-3.5+j*.21,w+1.2,.15,.74,cream,1)}
    const faceZ=front-.25;
    if(zone===12){for(let j=0;j<Math.ceil(ht/7);j++)panel(x,j*ht/Math.ceil(ht/7),faceZ,w-.23,ht/Math.ceil(ht/7),0,3,false,.89)}
    else{
      const storey=ht>7?ht*.39:ht*.46;
      panel(x,.36,faceZ,w-.20,storey-.3,0,2,false,night?.88:.94);
      panel(x,storey,faceZ,w-.21,ht-storey-.12,0,0,false,night?.90:1);
      if(zone===14||zone===9)for(const side of [-1,1])block(x+side*(w*.46),.5,front-.28,.17,ht-.55,.21,cream,1);
    }
  }
  function dome(x,y,z,r,col){solid(x,y,z,r,r*.92,r,col,0,0,coarse?8:12);taper([x,y+r*.86,z],[x,y+r*1.33,z],r*.1,.03,gold,6)}
  function arch(x,y,z,r,thick,col){
    for(let i=0;i<9;i++){
      const a=i*Math.PI/9,b=(i+1)*Math.PI/9;
      const p=(t,R,Z)=>[x+Math.cos(t)*R,y+Math.sin(t)*R,Z];
      quad(p(a,r,z),p(a,r+thick,z),p(b,r+thick,z),p(b,r,z),col,1);
      quad(p(a,r,z),p(b,r,z),p(b,r,z+.45),p(a,r,z+.45),shade3(col,.75));
    }
  }
  function shrine(x,z,fete=false){
    const brick=fete?mix3(gold,rgb("#d15c6f"),.53):rgb("#c27650");
    block(x,0,z,13,.55,6,stone,1);block(x,.55,z,12.3,.4,5.5,cream,1);
    for(let j=-2;j<=2;j++)block(x+j*2.36,.9,z-1.76,.55,3.1,.65,brick,1);
    for(let j=-2;j<2;j++)arch(x+(j+.5)*2.36,2.9,z-2.1,.90,.31,cream);
    block(x,4.25,z,12,1.4,4.7,brick,1);
    panel(x,.95,z-2.15,11.6,3.25,0,1,false,fete?1:.96);
    panel(x,4.28,z-2.37,11.7,1.19,0,1,false,.84);
    for(let j=-1;j<=1;j++){
      const radius=j===0?3:1.8,base=5.65;
      taper([x+j*4,base,z],[x+j*4,base+radius*1.65,z],radius,radius*.38,brick,8);
      for(let k=0;k<4;k++)taper([x+j*4,base+k*radius*.35,z],[x+j*4,base+k*radius*.35+.13,z],radius*(1.04-k*.13),radius*(1.04-k*.13),cream,8);
      dome(x+j*4,base+radius*1.65,z,radius*.45,gold);
    }
  }
  function bridge(x,z,bamboo=false){
    const col=bamboo?rgb("#d0a367"):mix3(iron,haze,.22), len=30,y=bamboo?2.2:5.6, top=bamboo?3.9:12;
    block(x,y,z,len,.45,3,col,1);
    for(const side of [-1,1]){
      const Z=z+side*1.4;for(const dx of [-12,-4,4,12])block(x+dx,-1,Z,.66,y+1.1,.73,col);
      for(let j=0;j<=8;j++){
        const u=x-len/2+j*len/8, h=top+(bamboo?0:2.8*Math.cos(j*Math.PI/4));
        taper([u,y,Z],[u,h,Z],.14,.11,col,4);
        if(j<8){const nx=u+len/8,nh=top+(bamboo?0:2.8*Math.cos((j+1)*Math.PI/4));
          taper([u,h,Z],[nx,nh,Z],.16,.16,col,4);
          taper([u,j%2?h:y,Z],[nx,j%2?y:nh,Z],.12,.12,col,4)}
      }
    }
  }
  function pennants(x,z,y,lights=false){
    for(let j=0;j<13;j++){
      const a=x+j*1.5,b=y-Math.sin(j*Math.PI/12)*1.8,bb=y-Math.sin((j+1)*Math.PI/12)*1.8;
      taper([a,b,z],[a+1.5,bb,z],.037,.037,iron,3);
      const col=[gold,rgb("#ea726a"),rgb("#82cbb1"),cream][j%4];
      if(lights)solid(a,b-.31,z,.22,.34,.22,col,5,.3,6);
      else tri([a,b,z],[a+1.1,bb,z],[a+.6,b-1.1,z+.12],col,4,[0,0,1]);
    }
  }
  function lantern(x,y,z,s){
    solid(x,y,z,s*.54,s*.72,s*.54,gold,5,.8,8);
    block(x,y-s*.68,z,s*.64,.12,s*.63,iron,5,.8);
  }
  function vehicle(x,z,tram){
    const paint=tram?rgb("#498e82"):rgb(zone===12?"#e876a3":"#e5b847"),mat=6;
    for(const i of [-1,1])for(const j of [-1,1])solid(x+i*(tram?2.68:1.55),.32,z+j*.86,.36,.33,.15,iron,mat,1,6);
    block(x,.44,z,tram?7:4.5,tram?1.8:.65,1.82,paint,mat,1);
    block(x,.98,z,tram?6.8:2.62,tram?1.22:.72,1.62,mix3(iron,sky,.35),mat,1);
    block(x,tram?2.24:1.69,z,tram?7.1:2.58,.18,1.87,paint,mat,1);
    if(tram)for(let j=-3;j<=3;j++)block(x+j*.91,1.05,z-.84,.12,1.1,.13,cream,mat,1);
    for(let j=0;j<(tram?8:3);j++)block(x+(j-(tram?3.5:1))*(tram?.77:.65),tram?1.27:1.08,z-(tram?.93:.82),tram?.57:.51,tram?.72:.45,.05,night?cream:rgb("#577582"),mat,1);
    block(x-(tram?3.4:2.18),.76,z-.74,.15,.15,.26,cream,mat,1);
  }
  // A broad background ridge and silhouettes sit on their own depth plane.
  output=rings;
  for(let j=0;j<8;j++){
    const x=j*11+rand()*4, h=(marsWorld?13:7)+rand()*15;
    if(marsWorld){taper([x,-2,64],[x,h,64],12,4+rand()*4,far,7,9);taper([x,h-1,64],[x,h+.5,64],6,5,mix3(far,haze,.3),7,9)}
    else if([2,3,9,10,12,14].includes(zone)){block(x,0,57,6+rand()*5,h,5,far);block(x,h,57,4,2,4,far)}
    else solid(x,-1,67,16,h,11,far,0,0,coarse?6:9);
  }
  if(!marsWorld&&![2,3,10,12,14].includes(zone)){
    for(let i=0;i<15;i++){const x=i*6.1,z=48+rand()*8;
      panel(x,-.5,z,10+rand()*7,8+rand()*6,rand()*.45-.2,zone===1?2:0,true,jungle?.51:.76);}
  }
  output=tile;
  const surf=water?7:8;
  quad([0,-.14,-38],[0,-.14,110],[WORLD_TILE,-.14,110],[WORLD_TILE,-.14,-38],soil,8);
  if(water)quad([0,-.01,10],[0,-.01,45],[WORLD_TILE,-.01,45],[WORLD_TILE,-.01,10],mix3(far,rgb(zone===15?"#204f4c":"#458e98"),.55),7);
  const road=[0,2,3,8,9,10,11,12,14,18,19,20,21,23,24,28,29,30].includes(zone);
  quad([0,.016,-6],[0,.016,4.4],[88,.016,4.4],[88,.016,-6],road?mix3(soil,iron,zone===12?.57:.19):soil,road?1:8);
  if(road){block(44,.02,4.6,88,.14,.38,mix3(soil,cream,.45),1);
    if([3,12,14].includes(zone)){
      block(44,-.05,8,88,.1,6,mix3(iron,soil,.4),1);
      if(zone!==12)for(const z of [7.1,8.9])block(44,.05,z,88,.06,.09,iron);
      if(zone!==12){vehicle(32,8,zone===14);vehicle(71,8.6,false)}   // Neon Causeway traffic is drawn as street life instead
    }
  }
  if(zone===0){shrine(17,14);shrine(60,25);tree(39,8,10);pennants(5,9,8);
    for(let j=0;j<6;j++){block(j*14,0,31,11,2.8,3,stone,1);panel(j*14,.12,29.43,10.9,2.6,0,1,false,.82)}
    tree(73,12,9,"palm");tree(4,18,8);tree(55,30,10);
  }
  if(zone===1||zone===11){for(let j=0;j<12;j++)tree(j*7+rand()*3,(zone===11?12:8)+rand()*(zone===11?14:17),7+rand()*6);if(zone===11){tower(48,24,7,far,1);for(let i=0;i<13;i++)lantern(i*7,4+rand()*7,12+rand()*12,.34)}}
  if([2,3,9,10,12,14].includes(zone)){
    for(let j=0;j<7;j++){const x=j*13+2,z=(zone===14&&j<3?44:zone===12?17.3:15)+rand()*4;
      if(zone===9&&(j===1||j===4)){shrine(x,z,true);continue}
      tower(x,z,(zone===12?9:4)+rand()*(zone===12?12:6),mix3(far,[gold,soil,cream,far][j%4],.34),zone===12?2:1);
      if([2,3,9,10,14].includes(zone)&&j%2){
        const y=3.2;quad([x-4,y,z-2.8],[x-4,y-.7,z-4.4],[x+4,y-.7,z-4.4],[x+4,y,z-2.8],gold,4,.18);}
      if(zone===12||zone===14&&j%2===0)tree(x+4,zone===12?13.9:11,8+rand()*4,"palm");
    }
    if(zone===14)bridge(17,27);
    if([2,9,10].includes(zone))for(let j=0;j<4;j++)pennants(j*22,8+j%2*4,7+j%3,zone!==2);
    if(zone===10)for(let j=0;j<12;j++)lantern(j*7+3,11+rand()*8,13+rand()*20,.6+rand()*.4);
  }
  if(zone===4||zone===8||zone===7){
    if(zone===7){bridge(18,16,true);bridge(63,23,true)}
    else if(zone===8){for(let j=0;j<7;j++)block(41,j*.38,17+j*.65,74,.40,1.6,mix3(soil,cream,j*.045),1);shrine(24,29);dome(65,5.4,30,3.4,cream);block(65,0,30,7,5.4,6,far,1)}
    else for(let j=0;j<32;j++){
      const x=rand()*88,z=10+rand()*17;solid(x,.16,z,.85,.08,.65,green,7,0,6);
      if(j%2)for(let k=0;k<5;k++)solid(x+.22*Math.sin(k*1.26),.36,z+.22*Math.cos(k*1.26),.19,.28,.17,rgb("#ed81a3"),3,.12,5);
    }
    for(let j=0;j<7;j++)tree(j*13,31+rand()*12,8+rand()*8);
    if(zone===8||zone===7){const x=45,z=18;solid(x,.35,z,3.4,.48,.85,bark,6,1,8);taper([x,0,z],[x,4.9,z],.09,.07,cream,4,6,1);tri([x,4.8,z],[x-2.4,1.2,z],[x,1.1,z],gold,6,1)}
  }
  if(zone===5)for(let j=0;j<6;j++){for(let i=0;i<7;i++)solid(i*13+j*.8,1+j*.43,8+j*3.2,6.5,1.7,1.6,j%2?green:leafLight,3,.22,7);if(j%2===0)tree(j*14+6,27,11)}
  if(zone===6||marsWorld){for(let j=0;j<14;j++){const x=rand()*88,z=(zone===6?12.5:8)+rand()*(zone===6?22:26),h=1.2+rand()*4;solid(x,h*.4,z,h*1.4,h,h,rand()>.5?soil:far,9,0,7)}
    if(marsWorld){for(let j=0;j<3;j++){const x=9+j*29,z=14+j%2*6;
      solid(x,1.05,z,4.2,3.3,3.4,mix3(iron,rgb("#a8c8c2"),.5),0,0,10);
      for(let side=0;side<10;side++){const ang=side*Math.PI/5;
        const p=a=>[x+4.24*Math.cos(a)*Math.cos(ang),1.05+3.34*Math.sin(a),z+3.43*Math.cos(a)*Math.sin(ang)];
        for(let b=0;b<3;b++)taper(p(b*Math.PI/6),p((b+1)*Math.PI/6),.06,.06,iron,4)}
      for(let k=-2;k<=2;k++)block(x+k*1.13,.7,z-2.9,.65,.92,.33,gold,5);
      block(x,.05,z-2.6,6.4,2.0,1.5,iron,1);panel(x,.1,z-3.38,6.25,1.92,0,4,false,1);
      if(j!==1){block(x+7,0,z+7,7.8,4.0,4,far);panel(x+7,0,z+4.94,7.8,4.0,0,5,false,.99)}
      taper([x+6,0,z],[x+6,5.6,z],.16,.1,iron,6);solid(x+6.7,5.5,z,1.8,.58,1.7,cream,3,.16,9)}
    }else for(let j=0;j<6;j++)tree(j*16+3,12+rand()*18,6+rand()*5);
  }
  if(jungle){for(let j=0;j<(coarse?7:14);j++)tree(j*88/(coarse?7:14)+rand()*2,13+rand()*21,14+rand()*11);
    for(let j=0;j<14;j++)tree(j*6+rand()*3,5.6+rand()*5,2+rand()*4,"fern");
    for(let j=0;j<13;j++){const x=j*6.8+rand()*2;panel(x,0,5+rand()*1.8,3+rand()*2.1,3.1+rand()*1.4,rand()*.7-.35,j%3?3:5,true,.84)}
    for(let j=0;j<4;j++){const x=j*22+2;panel(x,6.4,6.2+rand()*4,4.9,7.4,.1,1,true,.78)}
    // Cap the canopy with a leaning kapok, a low tangle of buttresses and a second,
    // darker river bank. Leave the playable lane completely open for jump cues.
    for(let j=0;j<15;j++)panel(j*6.1,.05,20+j%3*1.8,8,4+j%3,Math.sin(j)*.51,j%4?0:3,true,.61);
    const A=[14,0,5.4],B=[12,7,6],D=[18,13,8],E=[28,15,9];
    taper(A,B,.84,.68,bark,8);taper(B,D,.69,.46,bark,8);taper(D,E,.47,.21,bark,8);
    for(let j=0;j<5;j++){panel(16+j*2.7,10+j%3,7+j%2,7.4,6.7,.2*j,0,true,.58);if(j%2===0)panel(15+j*3,5.8,6.6,3.3,6.4,.12,1,true,.68)}
    for(let j=0;j<7;j++){const x=rand()*88;solid(x,.26,5+rand()*2,.8,.54,.72,far,0,0,6);panel(x+1,0,5.2,2.1,2.2,.36,5,true,.88)}
    for(let j=0;j<3;j++){const x=j*33+5;for(const dx of [0,.51])solid(x+dx,1.1,6,.12,.07,.10,gold,5,0,6)}
  }
  if([0,3,9,10,12,14].includes(zone))for(let j=0;j<5;j++){const x=7+j*17.6;
    const lz=zone===12?13.8:6.2;   // on Neon Causeway the lamps stand at the back of the pavement
    taper([x,0,lz],[x,4.3,lz],.11,.065,iron,5);taper([x,4.3,lz],[x+.55,4.5,lz],.075,.06,iron,5);lantern(x+.58,4.28,lz,.32)}
  if([1,4,5,6,7,8,11].includes(zone))for(let j=0;j<10;j++){
    const back=zone===6||zone===11,x=j*8.8+rand()*2,z=(back?9.6:4.8)+rand()*3.2,h=1.2+rand()*1.3;   // behind the far row of set pieces where a path has onepanel(x,0,z,h*1.55,h,.32*Math.sin(j),j%3||zone===5?3:5,true,.88);
  }
  // Mesh authoring in metres. Separate distant silhouettes, middle landmarks and close props.
  const chestnut=rgb("#754b3a"), linen=rgb("#ffe4b2"),cyan=rgb("#67e7df"),ruby=rgb("#e85160"),slate=rgb("#334358"),brass=rgb("#efb35c");
  function spindle(x,y,z,r,color,axis=false){
    const hub=[x,y,z];
    for(let j=0;j<12;j++){
      const a=j*Math.PI/6,b=(j+1)*Math.PI/6;
      const pos=v=>[x+r*Math.cos(v),y+r*Math.sin(v),z];
      taper(pos(a),pos(b),r*.105,r*.105,color,5);
      if(!(j%2))taper(hub,pos(a),r*.055,r*.04,color,4);
    }
    solid(x,y,z,r*.19,r*.19,.25,axis?gold:iron,0,0,6);
  }
  function kiosk(x,z,color,flowers=false){
    block(x,0,z,5.7,.6,3.2,chestnut,1);
    for(const s of [-1,1])block(x+s*2.6,.6,z,.18,3.5,.21,iron);
    for(let n=0;n<8;n++){const X=x-3.1+n*.8,col=n%2?linen:color;
      quad([X,4.25,z+1],[X+.8,4.25,z+1],[X+.8,3.45,z-2],[X,3.45,z-2],col,4,[0,0,.2,.2]);
      tri([X,3.45,z-2],[X+.8,3.45,z-2],[X+.4,3.04,z-2],col,4,[.1,.1,.4]);}
    block(x,.65,z,5.4,.69,2.3,stone,1);
    for(let k=0;k<7;k++)solid(x-2.4+k*.8,1.45,z-.6,.48,flowers?.55:.35,.45,[gold,ruby,leafLight][k%3],3,.1,6);
  }
  function fort(x,z,h,col,pointed=false){
    block(x,0,z,8,h,5.7,col,1);
    for(const sign of [-1,1]){const X=x+sign*4.4;
      taper([X,0,z],[X,h+1,z],1.55,1.24,col,8);
      if(pointed)taper([X,h+1,z],[X,h+6,z],1.8,.03,slate,6);
      else{for(let k=0;k<4;k++)block(X+(k%2-.5)*1.6,h+1,z+(Math.floor(k/2)-.5)*1.6,.6,1,.6,gold,1);}}
    for(let row=0;row<Math.floor(h/2.4);row++)for(let j=-2;j<=2;j++){
      const X=x+j*1.42,Y=1.1+row*2.4;block(X,Y,z-2.9,.52,1.02,.14,pointed?(j%3?gold:cyan):iron,pointed?5:0);
      if(!pointed)arch(X,Y+.96,z-3,.27,.12,linen);}
    block(x,h,z,8.5,.42,6,pointed?slate:linen,1);
  }
  function dunes(z,h,col){for(let j=0;j<8;j++)solid(j*12,-1,z+(j%2)*3,10+j%3,h*(.7+.18*(j%4)),5,col,9,0,8)}
  function hull(x,z,scale=1){solid(x,.65*scale,z,4.2*scale,.75*scale,1.1*scale,chestnut,0,0,8);
    block(x,1.1*scale,z,6.6*scale,.20*scale,1.6*scale,linen);}
  function mast(x,z){taper([x,0,z],[x,6.3,z],.13,.07,chestnut,6);
    tri([x,6.2,z],[x-3.3,1.8,z],[x-.12,1.85,z],linen,4,[0,.35,0]);}
  function spire(x,z,h){fort(x,z,h,far,true);taper([x,h,z],[x,h+7,z],2.8,.12,stone,6);lantern(x,h+5,z,.51)}
  function stairs(x,z){for(let j=0;j<8;j++){
    block(x,0,z+1.12*j,11+j*.65, .43+j*.55,1.2,j%2?far:stone,1);}
    for(const q of [-1,1]){block(x+q*6.4,0,z+5,.48,4.2,8,far,1);lantern(x+q*6.4,4.55,z+5,.5);}}
  function booths(color,flower){for(let j=0;j<5;j++)kiosk(5+j*17,8+j%2*5,j%2?color:gold,flower)}
  function viaduct(z,metal){for(let x=0;x<88;x+=11){block(x,0,z,.8,6,1,metal,1);arch(x+5.5,1.95,z-.53,4.6,.62,metal)}
    block(44,6.45,z,88,.48,2.4,metal,1);for(let j=0;j<2;j++)block(44,6.95,z+j-.5,88,.12,.09,iron);}
  if(zone<16){
    // Small stories are placed behind the shoulder, where they cannot obscure a hazard.
    switch(zone){
      case 0: kiosk(54,7,ruby);for(let j=0;j<5;j++)taper([58+j*.67,0,6],[58+j*.67,1.1,6],.33,.23,gold,7);break;
      case 1: kiosk(27,8,leafLight);for(let j=0;j<4;j++)block(30+j*.9,0,7,1,.72,.9,brass,1);break;
      case 2: spindle(33,2.1,7.2,1.5,ruby);pennants(51,12,10);break;
      case 3: for(let x of [13,49]){arch(x,2.5,8,2.8,.38,cyan);block(x,0,7.5,6,.32,2,slate);}break;
      case 4: hull(51,14,.8);mast(51,14);for(let i=0;i<10;i++)solid(19+i*.7,.2,10+i%3,.5,.12,.4,i%3?leafLight:ruby,3,.18,6);break;
      case 5: kiosk(46,9,green);spindle(50,2.2,8,1.7,chestnut);break;
      case 6: for(let i=0;i<4;i++)taper([32+i*2,0,13],[34+i*2,3+i%2,14],1.5,.3,shade3(far,1.15),6);break;
      case 7: for(let i=0;i<6;i++){taper([11+i*2,0,7],[9+i*2,5,7],.16,.13,leafLight,5);lantern(10+i*2,4.3,7,.27)}break;
      case 8: stairs(32,11);mast(52,13);break;
      case 9: booths(ruby,true);break;
      case 10: for(let i=0;i<2;i++)pennants(15+i*42,11,9,true);break;
      case 11: for(let i=0;i<14;i++)lantern(20+i*2,1+(i%4)*.4,11+i%3,.24);break;
      case 12: for(let i=0;i<3;i++){block(19+i*22,0,11,.22,6,.22,slate);block(19+i*22,5.7,11,4,.32,.34,i%2?cyan:ruby,5)}break;
      case 13: spindle(26,4.8,12,2.2,cyan);block(26,0,12,.55,5,.55,iron);break;
      case 14:kiosk(31,13,brass,true);break;
      case 15:for(let i=0;i<5;i++){taper([45+i*2,9+i%2,10],[47+i*2,2.1,9],.13,.08,leafLight,5,3,.35)}break;
    }
  }else{
    // New districts have their own horizon and skyline, including the entire side-road interval.
    rings.length=0;output=rings;
    if([20,30].includes(zone)){for(let i=0;i<13;i++){const X=i*7.15,h=9+(i*17%20);block(X,0,52,6,h,5,far,1);block(X,h,52,3.5,2.6,3,far);taper([X,h+2,52],[X,h+7,52],.5,.05,slate,5)}}
    else if([17,27].includes(zone)){dunes(52,8,far);for(let j=0;j<5;j++)tree(4+j*19,52,11+j%3,"palm")}
    else if(zone===16||zone===26){dunes(54,10,far);fort(49,45,10,far);}
    else if([19,23,29].includes(zone)){for(let j=0;j<7;j++){const X=j*13+3,h=7+(j*11%12);block(X,0,50,9,h,6,far,1);taper([X,h,50],[X,h+4,50],4,.5,far,5)}}
    else dunes(55,13,far);
    output=tile;
    if(zone===16){
      const ochre=rgb("#cd804e"),pink=rgb("#e8a36e"),lapis=rgb("#51527d");
      fort(14,22,7.8,ochre);fort(54,32,9.5,pink);
      for(let j=0;j<8;j++){const x=7+j*2;block(x,4.6,18.6,1.7,.25,.98,linen,1);
        for(const dx of [-.65,.65])taper([x+dx,4.8,18.4],[x+dx,6.7,18.4],.11,.08,pink,6);
        arch(x,6.05,18.3,.56,.18,linen);block(x,6.7,18.55,1.8,.18,1.05,pink,1);}
      for(const [X,Y,Z] of [[9.5,8.7,22],[14,8,22],[18.5,8.7,22],[54,9.7,32]]){
        for(const q of [-1,1])taper([X+q*.81,Y,Z],[X+q*.81,Y+1.55,Z],.12,.09,linen,6);
        taper([X,Y+1.5,Z],[X,Y+1.72,Z],1.28,1.34,linen,8);dome(X,Y+1.73,Z,1.19,gold);}
      for(let j=0;j<4;j++){const X=4+j*22;solid(X,-.7,32,10,3.1,5,gold,9);
        if(j===1)tree(X+5,12,5,"palm");if(j===2){kiosk(X+4,11,lapis);pennants(X+2,14,5);}}
    }
    if(zone===17){for(let j=0;j<8;j++){const x=4+j*10.7;tree(x,7+(j%3)*3,7+(j*3)%7,"palm");}
      for(const x of [12,46,79]){solid(x,-1,40,7,4.8,4,green,9,0,9);
        for(let j=0;j<5;j++)solid(x-4+j*1.8,2.5+(j%2),39,2.6,2.0,1.7,j%2?green:leafLight,3,.18,8);}
      for(const x of [17,23,29,69])tree(x,6+x%3,2.1+x%2,"fern");
      for(const x of [19,56]){const z=x===19?15:20;hull(x+4,z+5,.9);mast(x+4,z+5);
        for(const q of [-1,1])for(const p of [-1,1])taper([x+q*2,0,z+p*1.6],[x+q*2,3.25,z+p*1.6],.17,.12,chestnut,6);
        block(x,1.3,z,4.9,.24,3.8,chestnut,1);block(x,1.55,z,4.1,1.65,2.9,brass,1);block(x,1.57,z-1.5,1.15,1.48,.15,slate);
        taper([x,3.03,z],[x,4.9,z],3.55,.32,brass,8);taper([x,3.16,z],[x,3.35,z],3.55,3.25,linen,8);}
      for(let j=0;j<3;j++){const X=6+j*31;solid(X,.03,8,2.7,.57,1.4,far,9,0,7);
        for(let k=0;k<3;k++)solid(X+k*.65,.21,12+k%2,.8,.25,.6,leafLight,7,0,6);}}
    if(zone===18||zone===28){if(zone!==18)booths(cyan,true);   // the Parade has toon stalls instead
      for(let j=0;j<4;j++){const X=6+j*22;pennants(X,14,7,j%2>0);
      if(zone!==18){solid(X,3.6,9,1.15,1.45,.42,gold);for(const q of [-1,1])solid(X+q*.45,3.9,8.65,.20,.19,.10,iron);}}}
    if(zone===19||zone===29){viaduct(16,zone===19?chestnut:iron);for(let j=0;j<5;j++){const X=7+j*17;
      block(X,0,10,1.3,4.6,1.0,iron);spindle(X,4.65,10,2+j%3*.45,j%2?gold:brass,true);
      if(zone===29){block(X+4,0,12,.25,9,.3,brass);solid(X+4,2.1,12,.65,1,.42,brass,3,.6);}
      else{kiosk(X+6,20,ruby);lantern(X,7,11,.5)}}}
    if(zone===20){
      const steel=rgb("#495675"),amber=rgb("#e9b95f"),glass=rgb("#394460");
      for(const [X,Z,N] of [[8,22,4],[29,29,3],[54,22,5],[73,27,3]]){
        let Y=0;for(let j=0;j<N;j++){const W=10-j*1.65,ht=j===0?6:2.4;
          block(X,Y,Z,W,ht,4.8-j*.48,j%2?steel:glass,1);block(X,Y+ht-.1,Z,W+.3,.18,5-j*.48,stone);
          for(let n=0;n<Math.floor(W/1.35);n++){const dx=-W*.5+.75+n*1.35;
            block(X+dx,Y+.55,Z-2.43+j*.24,.29,ht-.8,.12,(n+j)%4?amber:cyan,5);}
          Y+=ht;}
        taper([X,Y,Z],[X,Y+3.8,Z],.45,.04,steel,5);}
      // Iron fire escapes and water tanks sit on the buildings. The street stays open below.
      const ironwork=rgb("#364455"),oxidized=rgb("#706075"),lampGlass=rgb("#edba7d"),brickwork=rgb("#604954");
      for(const X of [12,62]){
        const z=13.6,ht=X===12?6.4:7.8;block(X,0,z,8.3,ht,4.3,brickwork,1);
        for(let k=0;k<3;k++){const yy=1.7+k*2.0;block(X+.2,yy,z-2.45,5.8,.12,.92,ironwork,1);
          block(X+.2,yy+.69,z-2.88,5.8,.065,.07,ironwork);
          for(let n=0;n<6;n++)block(X-2.55+n*1.08,yy,z-2.86,.05,.69,.06,ironwork);
          for(const q of [-1,1]){block(X+q*1.65,yy+.1,z-2.19,1.13,1.14,.10,k===1&&q===1?lampGlass:glass,k===1&&q===1?5:0);
            block(X+q*1.65,yy+.11,z-2.26,.075,1.15,.07,ironwork);}
          if(k<2){const dx=k%2?-1:1;taper([X-1.9*dx,yy+.12,z-2.75],[X+1.9*dx,yy+2.1,z-2.75],.09,.08,ironwork,4);
            for(let j=0;j<7;j++)block(X-1.9*dx+dx*.55*j,yy+.24+j*.28,z-2.68,.48,.07,.56,ironwork);}}
        for(const q of [-1,1])for(const p of [-1,1])taper([X+q*1.53,ht,z+p*1.26],[X+q*1.24,ht+2.3,z+p*1.12],.09,.08,ironwork,5);
        taper([X,ht+2.15,z],[X,ht+4.90,z],1.82,1.82,oxidized,12);
        for(let j=0;j<3;j++)taper([X,ht+2.22+j*1.16,z],[X,ht+2.32+j*1.16,z],1.86,1.86,ironwork,12);
        taper([X,ht+4.9,z],[X,ht+5.79,z],2.0,.10,slate,12);
      }
      // A clock face and flying buttresses pick out the courthouse through the rain.
      const X=41,Z=21;block(X,0,Z,8.7,11.0,4.3,steel,1);
      for(const q of [-1,1]){taper([X+q*5,0,Z-1],[X+q*3.05,8.15,Z-1],.73,.43,slate,6);
        taper([X+q*3.35,10.4,Z],[X+q*3.35,14.5,Z],1.12,.03,slate,5);}
      taper([X,10.8,Z],[X,15.5,Z],3.9,.12,glass,5);
      const cy=8.55,cz=Z-2.22;taper([X,cy,cz+.1],[X,cy,cz-.09],1.62,1.62,ironwork,20);
      taper([X,cy,cz-.1],[X,cy,cz-.16],1.40,1.40,lampGlass,20,5);
      for(let j=0;j<12;j++){const ang=j*Math.PI/6,dx=Math.sin(ang),dy=Math.cos(ang);
        taper([X+dx*1.12,cy+dy*1.12,cz-.21],[X+dx*1.32,cy+dy*1.32,cz-.21],.047,.047,ironwork,4);}
      taper([X,cy,cz-.24],[X-.64,cy+.51,cz-.24],.074,.049,slate,5);
      taper([X,cy,cz-.25],[X+.33,cy+1.02,cz-.25],.054,.034,slate,5);
      for(const x of [29,75]){const y=1.04,z=7.9;block(x,0,z,.54,y,.54,rgb("#92535c"),1);solid(x,y+.12,z,.33,.21,.33,rgb("#995564"));
        block(x+2.2,0,z,2.65,.52,.81,ironwork,1);for(let j=0;j<4;j++)block(x+1.22+j*.54,.55,z,.22,.12,.65,steel);}


      spire(41,33,11);viaduct(15,slate);
      for(let j=0;j<7;j++){const X=3+j*12;block(X,0,6.8,.2,3.8,.2,steel);lantern(X,4,6.8,.45);}
      for(const X of [16,65]){block(X,0,10,7.5,3.5,3.5,glass,1);block(X,2.8,8.17,6.8,.37,.21,rgb("#ce718a"),5);
        for(let j=0;j<3;j++)block(X-2.1+j*2.1,.25,8.2,1.45,1.9,.14,steel);}
    }
    if(zone===30){
      for(let j=0;j<5;j++){const X=4+j*18;spire(X,25+(j%2)*9,8+j%3*4);
        arch(X,5.5,10,3.3,.80,stone);for(const q of [-1,1]){block(X+q*3.7,0,10,.72,5.55,.83,stone,1);
          taper([X+q*3.7,5.5,10],[X+q*3.7,9.1,10],.55,.03,slate,5);}
        taper([X,7.95,10],[X,7.2,10],.08,.08,iron,5);taper([X,7.3,10],[X,5.15,10],.52,1.38,brass,10);
        taper([X,5.27,10],[X,4.99,10],1.38,1.5,gold,10);solid(X,4.85,10,.24,.35,.24,brass,3,.17);}
      for(let j=0;j<7;j++){const X=j*13;block(X,0,6.2,11,.42,.56,slate);lantern(X+5,1.2,6.2,.34);}
    }
    if(zone===21){for(let j=0;j<7;j++){const X=5+j*13;fort(X,17,4+j%3,rgb(j%2?"#d97776":"#a97489"));spindle(X,2.0,7,1.5,j%2?gold:cyan);if(!(j%2))pennants(X,10,8);}}
    if(zone===22){for(let j=0;j<5;j++){const X=7+j*18;block(X,.35,10,9,.37,4,chestnut);hull(X,11,1.05);mast(X+2,11);
      for(const s of [-1,1])taper([X+s*3,0,8],[X+s*3,1.4,8],.20,.17,chestnut,5);}}
    if(zone===23){for(let j=0;j<10;j++){const X=3+j*8.8;block(X,0,9,.72,8,1,slate);
      block(X,7.4,10,1,1,8,slate);block(X,0,8.38,.23,7.5,.24,j%2?cyan:ruby,5);block(X,7.6,8,.4,.20,5,j%2?cyan:ruby,5);}
      block(44,.22,14,88,.18,1.5,iron);vehicle(26,14,false);}
    if(zone===24){booths(gold,true);for(let j=0;j<4;j++){const X=3+j*22;pennants(X,10,6);for(let k=0;k<7;k++)solid(X+k*.48,2.8+Math.cos(k)*.3,8,.24,.72,.24,k%2?gold:ruby,3,.35,6);}}
    if(zone===25){for(const X of [14,59]){for(let j=0;j<6;j++)block(X,j*1.12,16,16-j*2,1.14,10-j,stone,1);fort(X,19,7,far);tree(X+13,10,12,"palm");}
      for(let j=0;j<8;j++)tree(j*11,26,13+j%4);}
    if(zone===26){for(const X of [13,42,72]){stairs(X,8);for(let j=0;j<3;j++){arch(X-4+j*4,6.5,17,1.65,.5,linen);block(X-6+j*4,0,17,.6,6.6,.6,far,1)}}
      block(44,.03,13,87,.08,3,cyan,7);}
    if(zone===27){for(let j=0;j<11;j++){const X=3+j*8.2;solid(X,0,15,4,5+(j%3)*2,3,slate,9,0,7);
      for(let k=0;k<3;k++)taper([X+k*.7,0,7],[X+k*.6+.25,1.1+k*.63,7],.35,.03,k%2?gold:cyan,5,5);}}
  }

  // A stage for the far row of toon set pieces: every scenery triangle that lies wholly beyond the first depth moves
  // back by the second, which opens clear ground between the path life and the 3D scenery.
  const stage=WORLD_STAGE[zone];
  if(stage)for(let i=0;i+33<=tile.length;i+=33)if(tile[i+2]>=stage[0]&&tile[i+13]>=stage[0]&&tile[i+24]>=stage[0]){tile[i+2]+=stage[1];tile[i+13]+=stage[1];tile[i+24]+=stage[1]}
  return {tile:new Float32Array(tile),far:new Float32Array(rings),P};
}

function worldCamera(w,d,flight=0){
  const sz=14, ratio=(floor-CENTER)/FOCAL, basePitch=.075, tang=Math.tan(basePitch);
  const baseY=sz*(ratio+tang)/(1-ratio*tang);
  const unit=FOCAL/(sz*Math.cos(basePitch)+baseY*Math.sin(basePitch));
  const k=flight*flight*(3-2*flight), pitch=basePitch+k*.91, yaw=k*.24;
  const camZ=-sz-5*k,camY=baseY+26*k;
  // Aim the establishing shot at the runner. In side view the feet project to the collision line.
  const cx=d/unit+(w/2)/unit+k*((px-w/2)/unit-4);
  return {cx,cy:camY,cz:camZ,pitch,yaw,unit,w};
}
function viewPoint(pos,cam){
  const x=pos[0]-cam.cx,y=pos[1]-cam.cy,z=pos[2]-cam.cz,sy=Math.sin(cam.yaw),cy=Math.cos(cam.yaw);
  const a=x*cy-z*sy,b=x*sy+z*cy,sp=Math.sin(cam.pitch),cp=Math.cos(cam.pitch);
  const depth=b*cp-y*sp;
  return [cam.w/2+FOCAL*a/depth,CENTER-FOCAL*(y*cp+b*sp)/depth,depth];
}
const worldVertex=`
attribute vec3 pos,normal,color;attribute vec2 spec;
uniform vec3 eye;uniform vec4 lens;uniform float shift,t;uniform vec2 aspect;
varying vec3 tint,point,norm;varying float material,depth;
void main(){
 vec3 p=pos+vec3(shift,0.,0.);float m=spec.x,w=spec.y;
 if((m>2.5&&m<4.5)||(m>9.5&&m<16.)){p.x+=w*(.28*sin(t*1.65+p.z*.16)+.18*sin(t*2.15+p.x*.2));p.z+=w*.14*cos(t*1.43+p.x*.17);}
 if(m>4.5&&m<5.5){p.y+=w*.42*sin(t*.85+p.x*.3);p.x+=w*.34*sin(t*.64+p.z);}
 if(m>5.5&&m<6.5)p.x+=w*8.*sin(t*.24+shift*.1);
 vec3 v=p-eye;float a=v.x*lens.w-v.z*lens.z,b=v.x*lens.z+v.z*lens.w;
 float d=b*lens.y-v.y*lens.x; float h=v.y*lens.y+b*lens.x;
 gl_Position=vec4(a*aspect.x,h*aspect.y+d*(1.-2.*193./420.),d*1.005-.65,d);
 point=p;norm=normal;tint=color;material=m;depth=d;
}`;
const worldFragment=`
precision highp float;
varying vec3 tint,point,norm;varying float material,depth;uniform vec3 haze;uniform float t,night,rain;
uniform sampler2D leaves,walls;
float hsh(vec2 p){vec3 a=fract(vec3(p.xyx)*.1031);a+=dot(a,a.yzx+33.33);return fract((a.x+a.y)*a.z);}
void main(){
 vec3 n=normalize(norm);float light=max(0.,dot(n,normalize(vec3(-.56,.83,-.42))));
 float a=material;vec3 col=tint*(.66+.40*light+max(0.,n.y)*.065);
 vec2 q=abs(n.y)>.60?point.xz:vec2(abs(n.x)>.65?point.z:point.x,point.y);
 if(a>9.5){
   bool plant=a<16.;float cell=floor(a-(plant?10.:20.)+.1);
   vec2 uv=(vec2(mod(cell,3.),floor(cell/3.))+mix(vec2(.006),vec2(.994),clamp(tint.rg,0.,1.)))/vec2(3.,2.);
   vec4 sampleColor=plant?texture2D(leaves,uv):texture2D(walls,uv);
   if(sampleColor.a<.40)discard;
   col=sampleColor.rgb*tint.b*(plant?.91+.10*light:.89+.17*light);
 }else if(a>.5&&a<1.5){
   vec2 uv=q*vec2(.83,1.65);uv.x+=mod(floor(uv.y),2.)*.5;
   vec2 f=fract(uv);float edge=min(min(f.x,1.-f.x),min(f.y,1.-f.y));
   float tile=hsh(floor(uv));col*=.88+tile*.14+.07*smoothstep(.02,.065,edge);
   col*=.89+.11*smoothstep(.012,.035,edge);
   col+=rain*max(n.y,0.)*.075*(.45+.55*sin(q.x*3.2+q.y*13.+t));
 }else if(a>6.5&&a<7.5){
   float w=sin(point.x*1.8+point.z*5.7+t*2.+1.5*sin(point.z*1.4-t*.4));
   float glint=pow(max(w,0.),11.);col=mix(tint,haze,.18)+glint*(.08+.07*sin(point.x*.7));
 }else if(a>8.5){
   vec2 rockUV=(vec2(2.,1.)+.012+.976*fract(vec2(point.x+point.z*.55,-point.y)*vec2(.12,.14)))/vec2(3.,2.);
   col=mix(tint,texture2D(walls,rockUV).rgb,.64)*(.73+.36*light);
 }else if(a>7.5){
   float grain=hsh(floor(q*7.));col*=.96+grain*.055+.045*sin(q.x*.69+1.2*sin(q.y*.61));
 }else if(a>4.5&&a<5.5){col=tint*(1.05+.09*sin(t*2.+point.x));}
 else if(a>2.5&&a<3.5){col*=.97+.055*sin(point.y*5.+point.z*4.);}
 float fog=1.-exp(-max(0.,depth-12.)*(.006+night*.0017));
 gl_FragColor=vec4(mix(col,haze,min(.81,fog)),1.);
}`;
const skyVertex=`attribute vec2 pos;varying vec2 uv;void main(){uv=pos*.5+.5;gl_Position=vec4(pos,0.,1.);}`;
const skyFragment=`
precision highp float;varying vec2 uv;uniform vec3 top,air;uniform vec2 shape;uniform float t,night,planet,storm;
float hash(vec2 p){vec3 a=fract(vec3(p.xyx)*.1031);a+=dot(a,a.yzx+33.33);return fract((a.x+a.y)*a.z);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+1.),f.x),f.y);}
void main(){
 float v=uv.y+shape.y*.52;vec3 c=mix(air,top,smoothstep(.30,1.02,v));
 vec2 p=vec2(uv.x*shape.x,v);vec2 cl=p*vec2(2.7,6.2)+vec2(t*.018,0.);
 float f=noise(cl)*.57+noise(cl*2.05)*.28+noise(cl*4.14)*.15;
 float cloud=smoothstep(.44,.76,f)*smoothstep(.29,.78,v);
 c=mix(c,mix(air,vec3(.91,.87,.83),.42-storm*.3),cloud*(.43+storm*.29));
 vec2 sun=vec2((uv.x-.72)*shape.x,v-.79);float r=length(sun);
 vec3 suncol=mix(vec3(1.,.86,.57),vec3(.78,.88,.93),night);
 c+=suncol*exp(-r*13.)*.18;c=mix(c,suncol,1.-smoothstep(.048,.052,r));
 if(planet>.5){float ring=length(vec2(sun.x+sun.y*.22,(sun.y-sun.x*.27)*4.5));c+=vec3(.84,.47,.26)*(1.-smoothstep(.003,.008,abs(ring-.091)));}
 vec2 st=p*110.;float star=step(.987,hash(floor(st)))*(1.-smoothstep(.02,.18,length(fract(st)-.5)));
 c+=night*star*(.62+.28*cos(t+floor(st.x)));gl_FragColor=vec4(c,1.);
}`;
function worldProgram(gl,vs,fs){
  const program=gl.createProgram();
  for(const [type,code] of [[gl.VERTEX_SHADER,vs],[gl.FRAGMENT_SHADER,fs]]){
    const shader=gl.createShader(type);gl.shaderSource(shader,code);gl.compileShader(shader);
    if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(shader));
    gl.attachShader(program,shader);gl.deleteShader(shader);
  }
  gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));
  return {p:program,u:Object.fromEntries(Array.from({length:gl.getProgramParameter(program,gl.ACTIVE_UNIFORMS)},(_,i)=>{
    const name=gl.getActiveUniform(program,i).name;return [name,gl.getUniformLocation(program,name)]}))};
}
function makeGpu(canvas){
  const gl=canvas.getContext("webgl",{alpha:false,depth:true,antialias:true,preserveDrawingBuffer:false,powerPreference:"default"});
  if(!gl)return null;
  const terrain=worldProgram(gl,worldVertex,worldFragment),sky=worldProgram(gl,skyVertex,skyFragment);
  const fields=["pos","normal","color","spec"].map(name=>gl.getAttribLocation(terrain.p,name));
  const skyPos=gl.getAttribLocation(sky.p,"pos");
  function upload(array){const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,array,gl.STATIC_DRAW);return {b,n:array.length/11}}
  const skyBuf=upload(new Float32Array([-1,-1,3,-1,-1,3]));
  const maps=[worldImages.leaves,worldImages.walls].map((im,i)=>{
    const tex=gl.createTexture();gl.activeTexture(gl.TEXTURE0+i);gl.bindTexture(gl.TEXTURE_2D,tex);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array([78,108,75,0]));
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
    return {tex,im,ready:false};
  });
  let lastZone=-1,buffers=null;
  return function draw(zone,cam,t,w,h){
    if(gl.isContextLost())return false;
    if(zone!==lastZone){if(buffers){gl.deleteBuffer(buffers.tile.b);gl.deleteBuffer(buffers.far.b)}
      const mesh=buildWorld(zone);buffers={tile:upload(mesh.tile),far:upload(mesh.far)};lastZone=zone;}
    if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h}
    const P=WORLD_STYLES[zone], night=[9,10,11,12,15,20,23,25,27,29,30].includes(zone)?1:0;
    gl.viewport(0,0,w,h);gl.disable(gl.DEPTH_TEST);gl.useProgram(sky.p);
    for(const loc of fields)gl.disableVertexAttribArray(loc);
    gl.bindBuffer(gl.ARRAY_BUFFER,skyBuf.b);gl.enableVertexAttribArray(skyPos);gl.vertexAttribPointer(skyPos,2,gl.FLOAT,false,0,0);
    const u=sky.u;gl.uniform3fv(u.top,rgb(P[0]));gl.uniform3fv(u.air,rgb(P[1]));gl.uniform2f(u.shape,w/h,cam.pitch-.075);
    gl.uniform1f(u.t,t);gl.uniform1f(u.night,night);gl.uniform1f(u.planet,zone===13?1:0);gl.uniform1f(u.storm,zone===3||zone===15?1:0);gl.drawArrays(gl.TRIANGLES,0,3);
    gl.disableVertexAttribArray(skyPos);gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.clear(gl.DEPTH_BUFFER_BIT);gl.useProgram(terrain.p);
    const v=terrain.u;gl.uniform3f(v.eye,cam.cx,cam.cy,cam.cz);gl.uniform4f(v.lens,Math.sin(cam.pitch),Math.cos(cam.pitch),Math.sin(cam.yaw),Math.cos(cam.yaw));
    for(let k=0;k<maps.length;k++){const m=maps[k];gl.activeTexture(gl.TEXTURE0+k);gl.bindTexture(gl.TEXTURE_2D,m.tex);
      if(!m.ready&&m.im?.naturalWidth){gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,m.im);
        gl.generateMipmap(gl.TEXTURE_2D);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);m.ready=true;}}
    gl.uniform1i(v.leaves,0);gl.uniform1i(v.walls,1);
    gl.uniform2f(v.aspect,2*FOCAL/cam.w,2*FOCAL/H);gl.uniform3fv(v.haze,rgb(P[1]));
    gl.uniform1f(v.t,t);gl.uniform1f(v.night,night);gl.uniform1f(v.rain,zone===3?1:0);
    for(const loc of fields)gl.enableVertexAttribArray(loc);
    for(const [buf,depth] of [[buffers.far,82],[buffers.tile,52]]){
      gl.bindBuffer(gl.ARRAY_BUFFER,buf.b);
      fields.forEach((loc,k)=>gl.vertexAttribPointer(loc,k===3?2:3,gl.FLOAT,false,44,k*12));
      const span=cam.w*.5*(depth+22)/FOCAL+36;
      for(let j=Math.floor((cam.cx-span)/88)-1;j<=Math.floor((cam.cx+span)/88)+1;j++){
        gl.uniform1f(v.shift,j*88);gl.drawArrays(gl.TRIANGLES,0,buf.n);
      }
    }
    return true;
  };
}
// Software mode uses the same world-space meshes, a lower-detail model, and a painter's
// depth sort. Base ground is clipped separately so the near plane never cuts a hole in it.
function softwareWorld(ctx,zone,cam,t,w,h){
  const P=WORLD_STYLES[zone].map(rgb), css=c=>"rgb("+c.map(v=>Math.round(cap(v,0,1)*255)).join(",")+")";
  ctx.save();ctx.setTransform(w/cam.w,0,0,h/H,0,0);
  const horizon=CENTER-FOCAL*Math.tan(cam.pitch), sky=ctx.createLinearGradient(0,0,0,Math.max(2,horizon+35));
  sky.addColorStop(0,css(P[0]));sky.addColorStop(1,css(P[1]));ctx.fillStyle=sky;ctx.fillRect(0,0,cam.w,H);
  ctx.fillStyle=css(P[3]);ctx.fillRect(0,Math.max(0,horizon),cam.w,H);
  paintGround(ctx,cam,zone);
  const mesh=softwareWorld.zone===zone?softwareWorld.cache:buildWorld(zone,true);softwareWorld.zone=zone;softwareWorld.cache=mesh;
  const polys=[];
  for(const [verts,dist] of [[mesh.far,80],[mesh.tile,45]]){
    const extent=cam.w*.5*(dist+20)/FOCAL+20,first=Math.floor((cam.cx-extent)/88)-1,end=Math.floor((cam.cx+extent)/88)+1;
    for(let j=first;j<=end;j++)for(let i=0;i<verts.length;i+=33){
      const mat=verts[i+9],sx=j*88;
      if(Math.abs(verts[i+1]-verts[i+12])<.0001&&Math.abs(verts[i+1]-verts[i+23])<.0001&&
         Math.abs(verts[i+1])<.04+.11&&Math.max(verts[i],verts[i+11],verts[i+22])-Math.min(verts[i],verts[i+11],verts[i+22])>=87.9)continue;
      const points=[];
      for(let n=i;n<i+33;n+=11){let x=verts[n]+sx,y=verts[n+1],z=verts[n+2],weight=verts[n+10];
        if(mat===3||mat===4)x+=weight*.38*Math.sin(t*1.65+z*.16);
        if(mat===5)y+=weight*.44*Math.sin(t*.85+x*.3);
        if(mat===6)x+=weight*8*Math.sin(t*.24+sx*.1);
        points.push(viewPoint([x,y,z],cam));}
      if(points.some(p=>p[2]<.65)||points.every(p=>p[0]<-1)||points.every(p=>p[0]>cam.w+1)||points.every(p=>p[1]<0)||points.every(p=>p[1]>H))continue;
      const z=points.reduce((s,p)=>s+p[2],0)/3, lighting=.68+.42*Math.max(0,-.56*verts[i+3]+.83*verts[i+4]-.42*verts[i+5]);
      const color=Array.from(verts.subarray(i+6,i+9),v=>v*(mat===5?1.12:lighting));
      if(mat>=10){
        const im=mat<16?worldImages.leaves:worldImages.walls;if(!im?.naturalWidth)continue;
        const cell=mat-(mat<16?10:20),uv=[];
        for(let k=i;k<i+33;k+=11)uv.push([(cell%3+.006+verts[k+6]*.988)*im.width/3,(Math.floor(cell/3)+.006+verts[k+7]*.988)*im.height/2]);
        polys.push([z,points,null,uv,im]);
      }else polys.push([z,points,css(mix3(color,P[1],Math.min(.77,Math.max(0,z-12)*.006)))]);
    }
  }
  polys.sort((a,b)=>b[0]-a[0]);for(const [,p,col,uv,im] of polys){
    ctx.beginPath();ctx.moveTo(p[0][0],p[0][1]);ctx.lineTo(p[1][0],p[1][1]);ctx.lineTo(p[2][0],p[2][1]);ctx.closePath();
    if(!uv){ctx.fillStyle=col;ctx.fill();continue}
    const [u,v]=uv[0],du=uv[1][0]-u,dv=uv[1][1]-v,eu=uv[2][0]-u,ev=uv[2][1]-v,det=du*ev-dv*eu;
    if(!det)continue;
    const vec=i=>[((p[1][i]-p[0][i])*ev-(p[2][i]-p[0][i])*dv)/det,((p[2][i]-p[0][i])*du-(p[1][i]-p[0][i])*eu)/det];
    const [a,c]=vec(0),[b,d]=vec(1);ctx.save();ctx.clip();ctx.transform(a,b,c,d,p[0][0]-a*u-c*v,p[0][1]-b*u-d*v);
    ctx.drawImage(im,0,0);ctx.restore();
  }
  ctx.restore();
}
let worldGPU, worldFallback, fallbackTime=-1, fallbackKey="", liveCamera;
function renderWorld(zone,d,intro){
  const canvas=$("scene3"),cam=worldCamera(width,d,intro);liveCamera=cam;
  const w=c.width,h=c.height;
  if(worldGPU===undefined){
    try{worldGPU=makeGpu(canvas)}catch{worldGPU=null}
    canvas.addEventListener("webglcontextlost",e=>{e.preventDefault();worldGPU=null});
    canvas.addEventListener("webglcontextrestored",()=>{worldGPU=undefined});
  }
  if(worldGPU&&worldGPU(zone,cam,ambientTime,w,h)){canvas.hidden=false;return}
  canvas.hidden=true;
  if(!worldFallback)worldFallback=document.createElement("canvas");
  const update=zone+":"+w+":"+h;
  if(fallbackKey!==update||ambientTime-fallbackTime>=.045){
    const ratio=Math.min(1,1050/w);
    const ww=Math.round(w*ratio),hh=Math.round(h*ratio);
    if(worldFallback.width!==ww||worldFallback.height!==hh){worldFallback.width=ww;worldFallback.height=hh}
    softwareWorld(worldFallback.getContext("2d"),zone,cam,ambientTime,ww,hh);fallbackTime=ambientTime;fallbackKey=update;
  }
  pen.drawImage(worldFallback,0,0,width,H);
}

function worldAtmosphere(zone,t,cam){
  const reduced=reducedMotion?.matches;
  const jungle=zone===15,rain=zone===3||jungle;
  if(rain){
    if(jungle){const mist=pen.createLinearGradient(0,160,0,326);mist.addColorStop(0,"#89d2b000");mist.addColorStop(.6,"#91cab41c");mist.addColorStop(1,"#36676500");box(0,160,width,166,mist)}
    for(let i=0;i<(jungle?33:51);i++){
      const x=((i*151.9-(reduced?0:t*45))%width+width)%width, y=(i*73.5+(reduced?0:t*(jungle?125:174)))%H;
      stroke([x,y,x-2.7,y+7+i%4],"#d6eeed48",1);
    }
    if(jungle&&!reduced){const pulse=Math.max(0,1-Math.abs(t%19.7-9.2)/.26);if(pulse>0)box(0,0,width,H,"rgba(201,224,217,"+(pulse*.085)+")")}
  }
  for(let j=0;j<(jungle?20:10);j++){
    const z=8+(j*23)%34, xx=(Math.floor(cam.cx/76)*76+(j*19.8)%76);
    const x=xx+(xx<cam.cx-36?76:xx>cam.cx+40?-76:0);
    const p=viewPoint([x+Math.sin(t*.54+j)*1.2,3.2+(j*3.1)%11+Math.sin(t*1.1+j)*.37,z],cam);
    if(p[0]<-14||p[0]>width+14||p[2]<1)continue;
    if(jungle||zone===11||zone===10){const r=cap(42/p[2],.6,2.4);oval(p[0],p[1],r*2.3,r*2.3,"#ffdf763c");oval(p[0],p[1],r,r,"#fff2a0")}
    else if(zone===2||zone===9){
      const r=cap(240/p[2],4,10);poly(j%2?"#fb9c61":"#50c8bb",[p[0],p[1]-r,p[0]+r*.7,p[1],p[0],p[1]+r,p[0]-r*.7,p[1]]);
      stroke([p[0],p[1]+r,p[0]-3,p[1]+r*1.6,p[0]+1,p[1]+r*2],"#db9e7a",1);
    }else if(zone===13){
      const r=cap(45/p[2],.9,2);oval(p[0],p[1]+37,r*2.6,r,"#ffd2a787");
    }else if(j<4){const flap=Math.sin(t*5.7+j)*2.7;stroke([p[0]-4,p[1]-flap,p[0],p[1],p[0]+4,p[1]-flap],"#425764ab",1.4)}
  }
}
// Near-camera props use shaded polygon meshes with a tilted orthographic camera. Their
// centreline stays fixed to the same ground, drop and spotlight coordinates as gameplay.
function smallModel(kind,x,y,t,scale=1){
  const faces=[],yaw=-.42,tilt=.22;
  const project=p=>[p[0]*Math.cos(yaw)-p[2]*Math.sin(yaw),-p[1]*Math.cos(tilt)+(p[0]*Math.sin(yaw)+p[2]*Math.cos(yaw))*Math.sin(tilt),p[0]*Math.sin(yaw)+p[2]*Math.cos(yaw)-p[1]*.18];
  function face(v,c){const n=unit3(cross3(vsub(v[1],v[0]),vsub(v[2],v[0]))), f=.69+.38*Math.abs(n[0]*-.43+n[1]*.78+n[2]*-.45);
    const p=v.map(project);faces.push([p.reduce((s,k)=>s+k[2],0)/p.length,p,"rgb("+rgb(c).map(k=>Math.round(cap(k*f,0,1)*255)).join(",")+")"])}
  function hull(rings,c,n=10){
    const point=(r,i)=>[r[0],r[1]+r[2]*Math.cos(i*2*Math.PI/n),r[4]+r[3]*Math.sin(i*2*Math.PI/n)];
    for(let j=1;j<rings.length;j++)for(let k=0;k<n;k++)face([point(rings[j-1],k),point(rings[j-1],k+1),point(rings[j],k+1),point(rings[j],k)],c)
  }
  function plate(list,c){face(list,c);face(list.map(a=>[a[0],a[1]-.9,a[2]]).reverse(),c)}
  const he=kind==="heli";
  if(he){
    hull([[-48,3,1,1,0],[-8,0,5,4,0],[1,1,11,9,0],[14,0,11,10,0],[26,-2,7,8,0],[31,-4,.2,.2,0]],"#f16651");
    hull([[8,4,8,8,0],[18,2,9,10,0],[27,-1,6,7,0],[30,-2,.1,.1,0]],"#53aeb6");
    plate([[-49,2,0],[-55,15,0],[-50,15,0],[-42,3,0]],"#ffc75c");
    for(const z of [-6,6]){hull([[-8,-12,1,1,z],[26,-12,1,1,z]],"#46515b",5);face([[-4,-7,z],[-1,-12,z],[2,-12,z],[-1,-7,z]],"#535861")}
    face([[2,8,-1],[4,8,-1],[4,16,-1],[2,16,-1]],"#465466");
    for(let j=0;j<4;j++){const a=t*28+j*Math.PI/2;plate([[3,16,0],[3+Math.cos(a)*42,16,Math.sin(a)*42],[3+Math.cos(a)*42-Math.sin(a)*2.6,16,Math.sin(a)*42+Math.cos(a)*2.6]],"#626a73")}
  }else{
    hull([[-45,2,.6,.6,0],[-26,2,3,3,0],[1,1,7,7,0],[21,1,7,7,0],[29,2,4,4,0],[30,2,1,1,0]],"#32b7b6");
    hull([[-6,7,1,2,0],[4,7,7,5,0],[13,6,5,5,0],[17,7,.5,1,0]],"#406d92");
    for(const dir of [-1,1]){
      plate([[-8,1,2*dir],[12,1,2*dir],[-2,2,37*dir],[-12,2,39*dir]],"#f7bd4d");
      plate([[-10,1,31*dir],[0,1,30*dir],[-2,2,37*dir],[-12,2,39*dir]],"#e35253");
      plate([[-39,3,0],[-29,3,0],[-35,4,12*dir],[-44,4,13*dir]],"#f1c565");
    }
    plate([[-42,3,0],[-45,17,0],[-41,17,0],[-30,3,0]],"#d8585e");
    const a=t*38;for(const d of [-1,1])face([[31,2,0],[31,2+d*15*Math.cos(a),d*15*Math.sin(a)],[31,2+d*15*Math.cos(a)+1.7,d*15*Math.sin(a)+1.8]],"#585868");
  }
  if(he){
    for(const side of [-1,1]){
      const z=side*9;plate([[-6,0,z],[8,-3,z],[19,-1,z*.90],[8,0,z]],"#ffe2a2");
      plate([[12,9,side*5],[14,8,side*7],[21,1,z],[19,0,z]],"#26475d");
    }
    hull([[-27,2,3,3,0],[-24,2,3.2,3.2,0]],"#ffecaa",8);
    for(let j=0;j<3;j++){const a=t*27+j*2.094;face([[-48,7,2],[-48+Math.cos(a)*8,7+Math.sin(a)*8,2],[-48+Math.cos(a)*8-1,7+Math.sin(a)*8+1.6,3]],"#294b5a")}
    hull([[19,-8,2.4,2.4,4],[22,-8,2.6,2.6,4]],"#ffe195",8);
  }else{
    for(const side of [-1,1]){
      const z=side*6;plate([[-24,2,side*3],[17,-1,z],[22,1,z],[1,3,z]],"#fff1b4");
      plate([[-11,1,side*21],[5,1,side*20],[3,1.5,side*23],[-11,1.5,side*24]],"#fff2b5");
      face([[-3,-3,side*3],[-7,-10,side*6],[-5,-10,side*6],[-1,-3,side*3]],"#344f62");
      hull([[-8,-10,2,1.6,side*6],[-4,-10,2,1.6,side*6]],"#3e4254",8);
    }
    hull([[21,1,7.2,7.2,0],[24,1,6.7,6.7,0]],"#ea7160",12);
  }
  pen.save();pen.translate(x,y);pen.scale(scale,scale);faces.sort((a,b)=>b[0]-a[0]);
  for(const [,points,col] of faces)poly(col,points.flatMap(p=>p.slice(0,2)));pen.restore();
}

const propCache=new Map();
function obstacleSprite(art,shape,zone){
  const key=[art,shape,zone].join("/");
  if(propCache.has(key))return propCache.get(key);
  const canvas=document.createElement("canvas");canvas.width=132;canvas.height=190;
  const ctx=canvas.getContext("2d"), faces=[];
  function facet(points,color){
    const n=unit3(cross3(vsub(points[1],points[0]),vsub(points[2],points[0])));
    const f=.72+.34*Math.max(0,-.54*n[0]+.78*n[1]-.48*n[2]);
    const v=points.map(([x,y,z])=>[x*.946-z*.325,-y*.985+(x*.325+z*.946)*.171,x*.325+z*.946-y*.17]);
    faces.push({v,z:v.reduce((s,p)=>s+p[2],0)/v.length,c:"rgb("+rgb(color).map(k=>Math.round(cap(k*f,0,1)*255)).join(",")+")"});
  }
  function rings(mesh,color,N=10){
    const point=(row,k)=>[row[0]+row[3]*Math.cos(k*2*Math.PI/N),row[1],row[2]+row[4]*Math.sin(k*2*Math.PI/N)];
    for(let j=1;j<mesh.length;j++)for(let k=0;k<N;k++)facet([point(mesh[j-1],k),point(mesh[j],k),point(mesh[j],k+1),point(mesh[j-1],k+1)],color);
    facet(Array.from({length:N},(_,k)=>point(mesh.at(-1),k)),color);
  }
  function brick(x,y,z,w,h,d,col){
    const pts=[[-1,0,-1],[-1,1,-1],[1,1,-1],[1,0,-1],[-1,0,1],[-1,1,1],[1,1,1],[1,0,1]].map(([a,b,c])=>[x+a*w/2,y+b*h,z+c*d/2]);
    for(const ids of [[0,1,2,3],[3,2,6,7],[7,6,5,4],[4,5,1,0],[1,5,6,2]])facet(ids.map(k=>pts[k]),col);
  }
  function bulb(x,y,z,r,h,color){
    rings([[x,y,z,r*.36,r*.30],[x,y+h*.36,z,r,r*.83],[x,y+h*.65,z,r*.91,r*.8],[x,y+h,z,r*.17,r*.15]],color);
  }
  // Landmarks use the same faceted projection and silhouette bounds as the other solid obstacles.
  // Bright caps and dark plinths stay legible against similarly coloured buildings.
  const ring=(x,y,z,r,h,color,n=14)=>rings([[x,y,z,r,r*.83],[x,y+h,z,r,r*.83]],color,n);
  const urn=(x,y,z,r,h,color)=>rings([[x,y,z,r*.54,r*.46],[x,y+h*.28,z,r,r*.83],[x,y+h*.69,z,r*.91,r*.77],[x,y+h,z,r*.64,r*.55]],color,14);
  if(art==="kiln"||art==="brick"&&zone===1){
    brick(0,0,0,34,4,22,"#593f4d");brick(0,4,0,32,3,21,"#ffd07b");
    for(let j=0;j<3;j++)for(let k=0;k<2;k++)brick(k*13-6.5+(j%2?1:-1),7+j*8.1,0,12.7,7.9,17,k===j%2?"#e97542":"#ff9958");
    brick(0,31,0,34,3.5,22,"#653b49");brick(0,34.5,0,32,3.5,22,"#ffda82");
    for(const k of [-9,0,9])facet([[k-3,21,-8.8],[k,26,-8.8],[k+3,21,-8.8],[k,17,-8.8]],"#fff1a3");
  }else if(art==="basket"||art==="tea"){
    if(art==="basket"){
      urn(0,0,0,17,23,"#c78542");for(const y of [4,10,16,21])ring(0,y,0,15.5,1.6,"#ffca72");
      for(let k=0;k<8;k++){const a=k*2.4;bulb(Math.cos(a)*9,21+Math.floor(k/4)*5,Math.sin(a)*7,5.7,10,k%3?"#ffae3f":"#a2c850")}
    }else{
      brick(0,0,0,30,31,22,"#275c58");brick(0,28,0,31,4,23,"#e8bc70");
      for(const k of [-10,10])brick(k,0,-11.4,2.8,31,1,"#f2c477");
      facet([[-6,17,-12],[1,23,-12],[7,22,-12],[3,15,-12],[-4,13,-12]],"#b9ed89");
    }
  }else if(art==="reel"||art==="drum"||art==="wheel"){
    const bright=art==="reel"?"#dd668e":art==="drum"?"#d96847":"#498b94";
    ring(0,0,0,16,5,"#614751");ring(0,4,0,art==="reel"?10:15,25,bright);
    for(let y=7;y<29;y+=4)ring(0,y,0,art==="reel"?11:15.3,1.1,art==="wheel"?"#a8d6cc":"#ffcb75");
    ring(0,28,0,16,4,"#ffce7c");ring(0,32,0,art==="reel"?3:12,art==="reel"?7:1,"#925258");
    if(art==="wheel")for(const k of [-8,8])brick(k,0,-11,3,22,2,"#fbc36a");
  }else if(art==="sluice"||art==="beacon"||art==="cone"){
    brick(0,0,0,34,4,24,"#34435e");
    if(art==="sluice"){
      brick(0,4,0,28,26,17,"#356775");for(let k=-10;k<12;k+=5)brick(k,7,-9.3,2.3,19,1.4,"#a3d4cf");
      brick(0,30,0,32,4,20,"#ffcc68");
    }else if(art==="beacon"){
      ring(0,4,0,11,7,"#687590",7);urn(0,11,0,13,16,"#7a72ae");ring(0,27,0,10,3,"#caf6bd");
      bulb(0,30,0,6,11,"#95ffcd");
    }else{
      rings([[0,4,0,14,11],[0,32,0,3.8,3]],"#ff7550",9);
      rings([[0,15,0,10.1,8],[0,20,0,8,6.4]],"#fff1a1",9);
    }
  }else if(art==="lotus"||art==="lantern"||art==="hive"){
    ring(0,0,0,12,4,"#514a5b");
    if(art==="lotus"){
      urn(0,4,0,14,15,"#4b8d84");
      for(let j=0;j<8;j++){const a=j*2.4;bulb(Math.cos(a)*7,16+j%2*2,Math.sin(a)*6,5,15+j%3*3,j%2?"#fa8fb3":"#f8bdcb")}
    }else{
      const wax=art==="hive";urn(0,4,0,16,29,wax?"#bd954a":"#ed8850");
      for(const y of [9,15,21,27])ring(0,y,0,y===9||y===27?13:15.8,1.6,wax?"#f3d773":"#ffe594");
      ring(0,32,0,11,3,"#69515a");if(wax)bulb(5,10,-11,3.5,6,"#514a3c");else bulb(0,35,0,3,6,"#f7ce72");
    }
  }else if(art==="lash"||art==="stump"||art==="bollard"||art==="stone"){
    if(art==="lash"){
      for(let j=0;j<5;j++){const x=(j-2)*5;ring(x,0,j%2*4,4.5,29+(j*7+shape)%13,j%2?"#b1bb64":"#8aa45d",9)}
      for(const y of [8,20])brick(0,y,2,30,3,14,"#e8ae72");
    }else if(art==="bollard"){
      ring(0,0,0,15,5,"#634b50");ring(0,5,0,9,22,"#487d80");ring(0,27,0,14,5,"#f0c17c");
      for(const y of [10,13,16])ring(0,y,0,10.5,1.9,"#e5a75f");
    }else if(art==="stone"){
      for(let j=0;j<3;j++){const x=(j-1)*9,h=j===1?36:21;
        rings([[x,0,0,9,7],[x-2,h*.4,0,10,8],[x+2,h*.83,0,6,5],[x+5,h,0,.4,.5]],j%2?"#d76850":"#f19b72",5)}
    }else{
      for(let j=0;j<5;j++){const a=j*1.256;bulb(Math.cos(a)*11,0,Math.sin(a)*7,6,17,"#94704b")}
      ring(0,4,0,12,24,"#916746",9);ring(0,28,0,12,2,"#ebbc79",9);
      for(const j of [-1,1])bulb(j*9,15,j,4,13,j<0?"#6fbb65":"#a2d879");
    }
  }else if(["ribbed","column","flower","paddle"].includes(art)){
    const green=art==="paddle"?"#619652":"#599154";
    if(art==="paddle"){
      bulb(0,0,0,8,27,green);bulb(-4,20,0,9,26,"#77aa5b");bulb(1,40,0,7,19,green);bulb(10,23,1,5,16,"#86b666");
    }else{
      rings([[0,0,0,8,7.5],[0,10,0,10,8],[0,43,0,9,7.7],[0,55,0,6.2,5.6],[0,59,0,.7,.7]],green,14);
      for(const side of [-1,1]){
        const h=side>0?26+(shape%3)*4:18;
        rings([[side*4,h-4,0,4,3],[side*12,h,0,6.2,4.8],[side*15,h+4,0,5,4.4],[side*15,h+12+shape%2*3,0,3.9,3.8],[side*15,h+16+shape%2*3,0,.5,.5]],side>0?"#6eaa60":"#54864c",9);
      }
    }
    for(let k=0;k<28;k++){const a=k*2.399,yy=4+k*1.7,xx=Math.cos(a)*8,zz=Math.sin(a)*7;
      facet([[xx,yy,zz],[xx+Math.cos(a)*3,yy+3,zz+Math.sin(a)*2.5],[xx+.55,yy-.8,zz-.21]],"#f1db97")}
    if(art==="flower")for(let k=0;k<6;k++){const a=k*Math.PI/3;bulb(Math.cos(a)*3,54+shape%3,Math.sin(a)*2.3,2.7,6.0,"#f48499")}
  }else if(art==="crate"||art==="brick"){
    if(art==="brick")for(let j=0;j<4;j++)for(let k=0;k<2;k++)brick(k*11-5.5+(j%2?1:-1),j*7.5,0,10.6,7,15,j%2?"#bc795d":"#d1936c");
    else{brick(0,0,0,27,32,20,"#ac714b");
      for(let j=0;j<4;j++)brick(-10+j*6.6,1,-10.4,5.8,30,.6,j%2?"#d29b63":"#bd8052");
      for(const y of [1,26])brick(0,y,-10.7,29,4,1.6,"#e9b478");
      facet([[-13,3,-12],[-9,3,-12],[13,28,-12],[9,28,-12]],"#ebba80")}
  }else if(["barrel","pipe","vent","urn"].includes(art)){
    const urn=art==="urn",metal=art==="pipe"||art==="vent",body=metal?"#7b9daf":urn?"#c87d60":"#b57750";
    const rows=urn?[[7,0],[13,9],[14,20],[7,29],[6,36],[9,39]]:[[9,0],[11,3],[12,17],[11,32],[10,35]];
    rings(rows.map(([r,y])=>[0,y,0,r,r]),body,14);
    if(!urn)for(const y of [5,26])rings([[0,y,0,11.7,11.7],[0,y+2.6,0,11.8,11.8]],"#576975",14);
    const [r,y]=rows.at(-1);rings([[0,y+.1,0,r*.69,r*.69],[0,y+.22,0,r*.69,r*.69]],urn?"#64413f":"#344854",14);
    if(art==="vent")for(const x of [-5,0,5])brick(x,10,-11.5,1.3,13,1,"#80ead3");
  }else if(art==="boulder"||art==="crystal"){
    const gem=art==="crystal";
    for(let j=0;j<3;j++){const h=(j===1?39:23)+shape%4*2,x=(j-1)*8;
      rings([[x,0,j%2*2,6.1,6],[x-1,h*.41,0,8,7],[x+1,h*.73,0,6,6],[x+3,h,0,.5,.6]],gem?(zone===mars?"#77c8bd":"#a58eca"):"#aa8068",6)}
  }else if(["root","reed","log"].includes(art)){
    for(let k=0;k<4;k++){const x=(k-1.5)*5,y=16+(k===1?18:4)+(k+shape)%3*3,rr=art==="reed"?1.6:3.5;
      rings([[x,0,0,rr*1.4,rr],[x-2,y*.5,0,rr,rr],[x+(k-1)*1.6,y,1,rr*.7,rr*.7]],art==="reed"?"#708955":"#96714f",7);
      if(art==="reed")bulb(x+(k-1)*1.6,y-2,1,2.8,7,"#a87849")}
    if(art==="log")bulb(0,0,-1,12,16,"#a17c53");
  }else return null;
  let xmin=Infinity,ymin=Infinity,xmax=-Infinity,ymax=-Infinity;
  for(const f of faces)for(const [x,y] of f.v){xmin=Math.min(xmin,x);xmax=Math.max(xmax,x);ymin=Math.min(ymin,y);ymax=Math.max(ymax,y)}
  ctx.setTransform(128/(xmax-xmin),0,0,186/(ymax-ymin),2-xmin*128/(xmax-xmin),2-ymin*186/(ymax-ymin));
  faces.sort((a,b)=>b.z-a.z);
  for(const {v,c} of faces){ctx.beginPath();ctx.moveTo(v[0][0],v[0][1]);for(let i=1;i<v.length;i++)ctx.lineTo(v[i][0],v[i][1]);ctx.closePath();ctx.fillStyle=c;ctx.fill()}
  if(propCache.size>=80)propCache.delete(propCache.keys().next().value);propCache.set(key,canvas);return canvas;
}

function drawFlyby(d,pan,zoom){
  if(!g.flight)return;
  const t=secondsAt(d)-g.flight.start;
  if(t<-.75||t>5.7)return;
  const pilotX=t=>width*.18+(t+.08)*Math.min(width*.12,85);
  const pilotY=t=>76+14*Math.sin(t*.83);
  for(let i=0;i<2;i++){
    const end=2.8+i*1.7, release=end-1.35, age=t-release;
    if(age<-.42||age>2.2)continue;
    const at=distanceAt(g.flight.start+end)+px+(i?11:-13);
    const screenX=pan+(at-d)*zoom;
    if(age<1.35){
      const a=cap(age/1.35,0,1), pulse=.55+.3*Math.cos(age*13);
      pen.save();pen.globalAlpha=pulse;
      oval(screenX,floor,64*zoom,5*zoom,"#fa9f686c");
      stroke([screenX-28*zoom,floor-3,screenX+28*zoom,floor-3],"#ffe693",2);pen.restore();
      if(age>=0){
        // The canister leaves the prop plane at its actual release position and falls to the marker.
        const startD=distanceAt(g.flight.start+release);
        const startX=pilotX(release)-6;
        const advected=pan+(at-startD)*zoom;
        const x=screenX+(startX-advected)*(1-a);
        const y=pilotY(release)+7+(floor-pilotY(release)-7)*a*a;
        pen.save();pen.translate(x,y);pen.rotate(-.35+a*.8);
        oval(0,0,5.5,8,"#45465e");box(-4,-8,8,3,"#ed985f");box(-2,-2,4,3,"#ffd57b");pen.restore();
      }
    }else{
      boom(screenX,floor,(age-1.35)/.85,zoom);
    }
  }
  const entrance=cap((t+.75)/.7,0,1), exit=cap((t-3.95)/1.6,0,1);
  smallModel("plane",pilotX(t)-(1-entrance)*width*.38+exit*width*.6,pilotY(t),g.time,1.66);
}
function drawSpotlight(d,pan,zoom){
  if(!g.survey||g.level===mars)return;
  const t=secondsAt(d)-(runSeconds-10);
  if(t<0)return;
  const a=cap(t/1.55,0,1), eased=a*a*(3-2*a), targetX=pan+px*zoom;
  const x=width+80+(Math.min(width*.46,targetX+140)-(width+80))*eased;
  const y=96+Math.sin(ambientTime*2.2)*3;
  const center=floor-(g.h+26)*zoom;
  const cone=pen.createLinearGradient(x,y,targetX,center+30);cone.addColorStop(0,"#fff3b619");cone.addColorStop(1,"#fff4a75e");
  path(cone,p=>{p.moveTo(x+16,y+11);p.lineTo(targetX-35,center+29);p.quadraticCurveTo(targetX,center+45,targetX+36,center+29);p.closePath()});
  oval(targetX,floor+1,37,5,"#fff3b34c");smallModel("heli",x,y,ambientTime,1.68);
}

function counterScene(){
  const k=cinema.kind,t=cap((Date.now()-cinema.started)/chompTime,0,1);
  const reduced=!!reducedMotion?.matches;
  const peak=cap((t-.25)/.26,0,1), escape=cap((t-.52)/.44,0,1);
  const span=Math.min(width*.28,154),mid=width*.49,ground=285;
  const z=Math.min(1.85,width/252), air=["eagle","kite","langur"].includes(k);
  const glow=k==="alien"?"#94ffdf":k==="pursuit"?"#ff8ac9":"#ffda81";
  box(0,0,width,H,"#1a1c36a8");
  oval(mid,205,span+55,110,softShade(mid,205,span+62,glow+"8e"));
  oval(mid,ground+4,span+42,9,"#2821387c");
  const player=mid-span*.69+peak*span*.5;
  dino(player,ground-Math.sin(peak*Math.PI)*17,z*(.68+peak*.71),false,false,false,false,peak>.58&&escape<.3);
  const away=escape*escape;
  pen.save();
  pen.translate(mid+span*.61-peak*span*.34+away*(width*.64+150),
    ground-(air?24:0)-(k==="alien"?away*78:air?away*57:Math.sin(escape*Math.PI)*19));
  if(escape>.18){pen.scale(-1,1)}
  pen.rotate((k==="pursuit"?-.18:k==="cobra"?.25:air?-.38:.11)*Math.sin(escape*Math.PI));
  drawFoe(k,0,0,z*.91,false,t*11,air?.9:1);pen.restore();
  if(reduced)return;
  if(escape>0&&escape<1){
    const hx=mid+span*.19,hy=ground-49;
    for(let j=0;j<6;j++){
      const f=cap((escape-j*.045)*1.4,0,1),a=(j-2.5)*.54;
      pen.save();pen.globalAlpha=(1-f)*.9;const x=hx+Math.cos(a)*span*f,y=hy+Math.sin(a)*65*f;
      if(air){pen.translate(x,y);pen.rotate(f*3+j);oval(0,0,8,2.2,j%2?"#f3d095":"#9c7a79")}
      else if(k==="pursuit"||k==="boar"){oval(x,y+30,4+f*12,4+f*8,j%2?"#ac97aa":"#d5b4a1")}
      else star(x,y,3+f*3,glow);pen.restore();
    }
    if(escape<.32)star(hx,hy,8+escape*49,"#fff3d2");
  }
}

const box=(x,y,w,h,fill)=>{pen.fillStyle=fill;pen.fillRect(x,y,w,h)};
function oval(x,y,rx,ry,fill){
  pen.fillStyle=fill;pen.beginPath();pen.ellipse(x,y,rx,ry,0,0,Math.PI*2);pen.fill();
}
function path(fill, f){pen.beginPath();f(pen);pen.fillStyle=fill;pen.fill()}
function poly(fill,coords){path(fill,p=>{p.moveTo(coords[0],coords[1]);for(let i=2;i<coords.length;i+=2)p.lineTo(coords[i],coords[i+1]);p.closePath()})}
function stroke(points,color,w){
  pen.beginPath();pen.moveTo(points[0],points[1]);for(let i=2;i<points.length;i+=2)pen.lineTo(points[i],points[i+1]);
  pen.strokeStyle=color;pen.lineWidth=w;pen.lineCap="round";pen.lineJoin="round";pen.stroke();
}
function gradient(x1,y1,x2,y2,light,mid,dark){
  const g=pen.createLinearGradient(x1,y1,x2,y2);
  g.addColorStop(0,light);g.addColorStop(.53,mid);g.addColorStop(1,dark);return g;
}
function softShade(x,y,r,fill){
  const g=pen.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,fill);g.addColorStop(1,fill.slice(0,7)+"00");return g;
}

function star(x,y,r,color){
  poly(color,[x,y-r,x+r*.25,y-r*.22,x+r,y,x+r*.25,y+r*.22,x,y+r,x-r*.25,y+r*.22,x-r,y,x-r*.25,y-r*.22]);
}
function sparkles(x,y,age){
  pen.save();
  pen.globalAlpha=1-cap(age/.9,0,1);
  for(let i=0;i<12;i++){
    const angle=i*Math.PI/6+age*1.8, radius=19+age*105+(i%3)*7;
    star(x+Math.cos(angle)*radius,y+Math.sin(angle)*radius,3+i%4,i%2?"#fff0a9":"#ffe179");
  }
  pen.restore();
}
function burst(x,y,age,colors,starDust=false){
  if(age<0||age>=1)return;
  pen.save();
  for(let i=0;i<24;i++){
    const a=i*2.4, r=5+age*(32+i*3.1);
    const left=x+Math.cos(a)*r, top=y+Math.sin(a)*r*.68+age*age*25;
    pen.globalAlpha=(1-age)*(i%3===0?.95:.64);
    if(starDust&&i%3!==0)star(left,top,2+i%5,colors[i%colors.length]);
    else oval(left,top,2+i%4+age*5,2+i%3+age*4,colors[i%colors.length]);
  }
  pen.restore();
}
function chompScene(){
  const {kind,won,started}=cinema;
  const phase=cap((Date.now()-started)/chompTime,0,1), center=width*.5;
  const action=reducedMotion?.matches?(phase<.46?0:1):cap((phase-.16)/.29,0,1);
  const impact=cap((phase-.42)/.18,0,1), after=cap((phase-.55)/.32,0,1);
  const zoom=Math.min(2.36,width/225), gap=Math.min(width*.24,162), y=282;
  const x=center-gap+(won?62:20)*action, foeX=center+gap-(won?36:64)*action;
  const tint=!won?"#ff796d":kind==="red"?"#ffcd65":"#c5a1ff";
  box(0,0,width,H,"#291a489e");
  oval(center,206,Math.min(width*.49,370),134,softShade(center,206,Math.min(width*.49,370),tint+"ce"));
  oval(center,y+7,gap+37,15,"#37274c9c");
  pen.save();
  if(!won){pen.translate((foeX-zoom*43-x)*impact,-zoom*52*impact-18*Math.sin(impact*Math.PI));pen.translate(x,y);pen.scale(Math.max(.002,1-impact),Math.max(.002,1-impact));pen.translate(-x,-y)}
  dino(x,y-(won?Math.sin(after*Math.PI)*12:0),won?zoom:zoom*.56,false,false,false,!won,won&&action>.66&&phase<.81);
  pen.restore();
  pen.save();
  if(won){pen.translate((x+zoom*36-foeX)*impact,-zoom*49*impact-25*Math.sin(impact*Math.PI));pen.translate(foeX,y);pen.rotate(-impact*.64);pen.scale(Math.max(.002,1-impact),Math.max(.002,1-impact));pen.translate(-foeX,-y)}
  if(!won||impact<1)drawFoe(kind,foeX+(kind==="red"?0:after*16),y,won?zoom*.68:zoom*.93,(!won&&kind==="red"&&action>.62)||false,phase*7);
  pen.restore();
  if(!reducedMotion?.matches){
    const hitX=center+(won?12:-15), hitY=y-(won?74:61);
    if(phase>=.4&&phase<.54)star(hitX,hitY,14+impact*17,"#fff0c6");
    const colors=won?(kind==="red"?["#ffe681","#ffae66","#fff5d5"]:["#d5acff","#f6dcff","#ffdc6a"]):
      kind==="red"?["#ff6156","#df3b50","#ff995e","#a33458"]:["#f6a55c","#c4a3ff","#fff09b"];
    burst(hitX,hitY,(phase-.42)/.55,colors,won);
  }
}
function celebration(){
  if(reducedMotion?.matches)return;
  const colors=["#ffde62","#fc9cd7","#d8b8ff","#91f5dc","#fff5d0"];
  const center=width*.5;
  const age=(performance.now()-celebrationStart)/1450, spread=Math.min(width*.28,235);
  for(let j=0;j<48;j++){const q=((ambientTime*.28+j*.173)%1),x=((j*.618)%1)*width+Math.sin(q*8+j)*13,y=q*(H+65)-30;
    pen.save();pen.translate(x,y);pen.rotate(q*6+j);box(-2.2,-4,4.4,7,colors[j%5]);pen.restore()}
  burst(center-spread,236,age,colors,true);burst(center+spread,236,age*.89,colors,true);
  pen.save();
  for(let i=0;i<34;i++){
    const age=(ambientTime*(.22+i%3*.04)+i*.173)%1, side=i%2?1:-1;
    const x=center+side*(32+age*Math.min(width*.47,465))+Math.sin(i*2.12)*52;
    const y=180+Math.sin(i*3.55)*100+(1-age)*122;
    pen.globalAlpha=Math.sin(age*Math.PI)*.91;
    const color=colors[i%colors.length];
    if(i%3===0||i%7===0){star(x,y,3+i%7,color);oval(x-side*8,y+6,2,2,color)}
    else oval(x,y,1.1+i%3,1+i%2,color);
  }
  pen.restore();
}

function dino(x,y,s,red,walking,air,upset,munch){
  if(!red){drawRider(x,y,s,walking,air,upset,munch,g?.level||me.selected);return}
  let frame=munch?13+Math.round(.5-.5*Math.cos(ambientTime*17)):air?12:walking?Math.floor((g?.time||0)*16)%12:15,tilt=0;
  // Boss wind-up: rear back while drawing breath, then lunge with jaws open.
  if(redAct!=null&&!munch){if(redAct<=1.88&&redAct>1.30){frame=15;tilt=-.17*cap((1.88-redAct)/.35,0,1)}else if(redAct<=1.30&&redAct>.5){frame=13;tilt=.09}}
  pen.save();pen.translate(x,y);pen.scale(-s,s);pen.rotate(tilt);if(upset)pen.rotate(Math.sin(ambientTime*26)*.045);
  // Zoomed moments use the large cropped strip: stand, leap, jaws, jaws.
  const slot={15:0,12:1,13:2,14:3}[frame],big=s>=1.5&&slot!=null?fetchSheet("chomp/red"):null;
  if(big?.naturalWidth){const fw=big.width/4,k=1.22/1.5,b=[45.83,11.67,153.33,148];pen.drawImage(big,slot*fw,0,fw,big.height,-91*1.22+b[0]*k,-104*1.22+b[1]*k,b[2]*k,b[3]*k)}
  else drawSheet(fetchSheet("red"),frame,0,0,1.22);pen.restore();
}
function inked(fill,outline,draw){
  pen.beginPath();draw(pen);pen.closePath();pen.fillStyle=fill;pen.fill();
  pen.strokeStyle=outline;pen.lineWidth=1.65;pen.lineJoin="round";pen.stroke();
}
function drawFoe(kind,x,y,scale,munch=false,flap=0,dive=1){
  if(kind==="tiger"||kind==="cat"){
    const leap=dive>.75||munch,f=leap?12+Math.min(3,Math.floor(Math.max(0,dive-.75)*15)):Math.floor(Math.abs(flap)*1.7)%12;
    pen.save();pen.translate(x,y);pen.scale(-1,1);drawSheet(fetchSheet(kind),f,0,0,scale*(kind==="tiger"?1.28:1.3));pen.restore();return;
  }
  if(kind==="boar"||kind==="croc"){
    const leap=dive>.75||munch,f=leap?12+Math.min(3,Math.floor(Math.max(0,dive-.75)*15)):Math.floor(Math.abs(flap)*1.7)%12;
    pen.save();pen.translate(x+(kind==="croc"?14*scale:0),y);pen.scale(-1,1);drawSheet(fetchSheet(kind),f,0,0,scale*(kind==="boar"?1.5:1.3));pen.restore();return;
  }
  if(flyerNames.includes(kind)){
   const primate=kind==="langur",f=cap(dive,0,1),offset=(primate?45:kind==="bat"?23:26)+(1-f)*(primate?32:55);
   const s=scale*(primate?.99:kind==="bat"?1.30:1.24),t=flap/9,yaw=primate?.70:.86;
   if(primate){
    // The sheet keeps the gripping hand at one point, so the rope always meets it.
    const k=s*1.12,yy=y-(offset-34)*scale,gx=x+6*k,gy=yy-97*k;
    stroke([gx-15,gy-105,gx-5,gy-41,gx,gy],"#58452d",2.8);stroke([gx-14,gy-105,gx-4,gy-41,gx,gy],"#a38b5d",.85);
    pen.save();pen.translate(x,yy);pen.scale(-1,1);drawSheet(fetchSheet("langur"),f>.72?12+Math.min(3,Math.floor((f-.72)*14)):Math.floor(Math.abs(flap)*1.25)%12,0,0,k);pen.restore();return;
   }
   if(["eagle","kite","owl","bat"].includes(kind)){
    // Sheet birds: 0-11 flap, 12-15 swoop. The bird sits 36 units above the sheet's ground line.
    const k=scale*(kind==="bat"||kind==="owl"?1.62:1.7);pen.save();pen.translate(x,y-(offset+34)*scale+36*k);pen.scale(-1,1);drawSheet(fetchSheet(kind),f>.72?12+Math.min(3,Math.floor((f-.72)*14)):Math.floor(Math.abs(flap)*1.5)%12,0,0,k);pen.restore();return;
   }
   pen.save();pen.translate(x,y-(offset-34)*scale);pen.scale(-1,1);drawSheet(fetchSheet("ape"),Math.floor(Math.abs(flap)*1.25)%12,0,0,s*1.12);pen.restore();return;
  }
  if(kind==="clock"){
    // The sentinel sheet uses the runner layout: 0-9 march, 12 lunge.
    pen.save();pen.translate(x,y);pen.scale(-1,1);drawSheet(fetchSheet("clock"),dive>.75||munch?12:Math.floor(Math.abs(flap)*1.6)%10,0,0,scale*1.34);pen.restore();return;
  }
  if(kind==="alien"){
    const leap=dive>.75||munch;pen.save();pen.translate(x,y);pen.scale(-1,1);drawSheet(fetchSheet("stalker"),leap?12+Math.min(3,Math.floor(Math.max(0,dive-.75)*15)):Math.floor(Math.abs(flap)*1.7)%12,0,0,scale*1.5);pen.restore();return;
  }
  if(["clock","crab"].includes(kind)){drawSheet(fetchSheet(kind),Math.floor(Math.abs(flap)*1.6)%12,x,y,scale*(kind==="crab"?1.13:1));return}
  if(kind==="cobra"){
    pen.save();pen.translate(x+8*scale,y);pen.scale(-1,1);drawSheet(fetchSheet("cobra"),dive>.75||munch?12+Math.min(3,Math.floor(Math.abs(flap)*.9)%4):Math.floor(Math.abs(flap)*1.4)%12,0,0,scale*1.38);pen.restore();return;
  }
  if(kind==="anaconda"){
    const im=fetchSheet("anaconda");if(im?.naturalWidth){pen.save();pen.translate(x,y);pen.scale(-1,1);drawSheet(im,Math.floor(Math.abs(flap)*1.6)%12,0,0,scale*1.08);pen.restore()}
    return
  }
  if(kind==="pursuit"){pursuitCar(x,y,145*scale,flap);return}
  if(kind==="red")dino(x,y,scale,true,mode==="play",false,false,munch);
}
function medkit(x,y,scale=1){
  pen.save();pen.translate(x,y);pen.rotate(-.15);pen.scale(scale,scale);
  path("#dd4138",p=>p.roundRect(-7,-20,14,11,4));
  path("#ffe0ad",p=>p.roundRect(-4,-17,8,7,2));
  path("#ad3e3c",p=>p.roundRect(-16,-12,34,29,6));
  path(gradient(-14,-15,14,18,"#ff9a69","#ff694f","#df4347"),p=>p.roundRect(-17,-14,32,29,6));
  stroke([-11,-10,9,-10],"#ffc591",1.4);
  stroke([-7,1,6,1],"#b64b42",5);stroke([-.5,-5,-.5,8],"#b64b42",5);
  stroke([-7,0,6,0],"#fff9da",4.6);stroke([-.5,-6,-.5,6],"#fff9da",4.6);
  pen.restore();
}
function cactus(x,w,h,seed,shape){
  const m=x+w/2;
  oval(m+5,floor+3,Math.min(22,w*.63),4.5,"#4a372a49");
  const variant=shape??Math.floor(seed*13)%6, bend=variant%3-1, arm=floor-h*(.63+variant%3*.06);
  const coat=gradient(x,floor-h,x+w,floor,variant%2?"#aad383":"#b6cc6e","#54834f","#2d5746");
  if(variant===0||variant===5){
    const radius=w*.42;
    oval(m,floor-h*.48,radius+1,h*.49,"#345645");
    oval(m,floor-h*.48,radius-1,h*.47,coat);
    for(let i=-2;i<=2;i++)stroke([m+i*3,floor-h+6,m+i*5,floor-h*.51,m+i*3,floor-6],"#c7df8e7a",1.25);
    if(variant===5)oval(m+radius*.37,arm,radius*.46,h*.22,coat);
  }else if(variant===3){
    oval(m,floor-h*.25,w*.31,h*.25,"#345645");oval(m,floor-h*.25,w*.27,h*.23,coat);
    oval(m-4,floor-h*.65,w*.29,h*.22,coat);oval(m+w*.19,floor-h*.8,w*.24,h*.2,coat);
    for(let i=0;i<5;i++)oval(m-6+i%3*4,floor-h*(.2+i*.16),1.1,1.1,"#d9ec97");
  }else{
    const trunk=[m,floor-6,m,floor-h*.48,m+bend*3,floor-h+8];
    stroke(trunk,"#345645",17);stroke(trunk,coat,14);
    const far=[m-2,floor-h*.40,m-10,floor-h*.55,m-11,arm];
    const near=[m+3,floor-h*.38,m+10,floor-h*.48,m+11,arm+5];
    stroke(far,"#325540",7);stroke(far,coat,4.5);
    if(variant!==1){stroke(near,"#325540",7);stroke(near,coat,4.5)}
    stroke([m-2,floor-9,m-2+bend*3,floor-h+10],"#c7df8e",1.8);
  }
  for(let j=floor-13;j>floor-h+8;j-=9){
    const thorn=j%2?-1:1,x=m+thorn*7+bend*2;
    poly("#eddfb4",[x,j,x+thorn*4,j-4,x,j-1.3]);
    oval(m+3,j+1,.9,1.1,"#e8e9b3");
  }
  if(Math.floor(seed)%4===0||variant===5){
    const x=m+bend*3,y=floor-h+1, color=variant%2?"#ff79a0":"#ff9673";
    for(let k=0;k<5;k++){
      const a=k*Math.PI*.4;
      oval(x+Math.cos(a)*3.8,y+Math.sin(a)*3.2,3.6,2.7,color);
    }
    oval(x,y,2.3,2.2,"#ffe795");
  }
}
function obstacleArt(x,w,h,o,part,l){
  if(o.art&&o.art!=="wreck"&&drawProp(o,x,w,h))return;
  if(o.art==="bell"||o.art==="shell"){
    const metal=o.art==="bell",cx=x+w*.5;oval(cx,floor+1,w*.55,3,"#36334765");
    pen.save();pen.translate(x,floor);pen.scale(w/40,h/55);
    if(metal){oval(20,-48,4.5,6,"#a07043");inked(gradient(2,-52,37,-2,"#fff29e","#e7a838","#976442"),"#674959",p=>{p.moveTo(2,-5);p.quadraticCurveTo(11,-18,10,-35);p.bezierCurveTo(12,-54,29,-54,31,-33);p.quadraticCurveTo(30,-17,38,-5);p.closePath()});oval(20,-5,18,3,"#9c7648");oval(20,-3,4,3,"#f6be69")}
    else{for(let j=0;j<9;j++){pen.save();pen.translate(20,-6);pen.rotate((j-4)*.134);oval(0,-22,4.0,24,j%2?"#ffbd9e":"#f98e7b");pen.restore()}oval(20,-5,12,5,"#d98374")}
    pen.restore();return;
  }
  const mesh=obstacleSprite(o.art,((o.shape||0)+part)%6,l);if(mesh){oval(x+w*.54,floor+1,w*.61,3.1,"#312d3b55");pen.drawImage(mesh,x,floor-h,w,h);return}
  if(["wreck","tire","stall"].includes(o.art)){streetHazard(x,w,h,o.art,o.shape);return}
  if(!o.art){cactus(x,w,h,o.x+part,o.shape);return}
  const seed=(o.shape+part)%6;
  if(["flower","paddle","column","ribbed"].includes(o.art)){
    const forms={flower:[0,5,3],paddle:[3,5,3],column:[1,2,4],ribbed:[0,2,4]};
    cactus(x,w,h,o.art==="flower"?4*Math.floor(o.x):o.x+part,forms[o.art][seed%3]);
    if(o.art==="paddle"||o.art==="flower"){
      const pos=x+w*(seed%2?.23:.72), top=floor-h*(.56+.04*(seed%3));
      oval(pos,top,w*.14,h*.14,gradient(pos-4,top-7,pos+4,top+8,"#d8e58e","#69aa75","#326666"));
      if(o.art==="flower")for(let k=0;k<5;k++){const a=k*1.257;oval(pos+Math.cos(a)*3,top-h*.13+Math.sin(a)*3,2.9,2.4,["#ffc86a","#ff83ac","#d2a1ff"][l%3])}
    }
    return;
  }
  oval(x+w*.55,floor+2,w*.65,3.8,"#382e3c60");
  pen.save();pen.translate(x,floor);pen.scale(w/38,h/64);
  const side="#473a47", wood=gradient(0,-60,38,0,"#ffcd87","#c77e50","#80534e");
  function roundBox(a,b,wide,high,r,fill){path(fill,p=>p.roundRect(a,b,wide,high,r))}
  switch(o.art){
    case "urn":
      inked(gradient(0,-52,37,-35,"#f8bb7c","#ca6957","#843e52"),side,p=>{
        p.moveTo(11,-62);p.lineTo(27,-62);p.quadraticCurveTo(23,-46,29,-39);p.bezierCurveTo(45,-22,33,-4,26,-1);
        p.lineTo(11,-1);p.bezierCurveTo(1,-8,-5,-25,9,-40);p.quadraticCurveTo(16,-48,11,-62)});
      oval(19,-61,10,3,"#f2be87");oval(19,-62,7,1.4,"#714154");stroke([5,-24,18,-22,34,-25],"#f1c08b",2.5);break;
    case "brick":case "crate":case "barrier":
      box(1,-61,30,61,o.art==="barrier"?"#db7861":o.art==="crate"?wood:"#bc6e65");
      poly(side,[31,-61,37,-55,37,0,31,0]);poly("#ffd699",[1,-61,7,-64,32,-64,37,-55,31,-59]);
      if(o.art==="brick")for(let k=0;k<4;k++){box(1,-48+k*14,30,2,"#edba93");box(9+k%2*13,-59+k*14,2,12,"#e5ad8b")}
      else if(o.art==="crate"){stroke([4,-54,27,-7],"#ffca8a",3.8);stroke([5,-7,26,-54],"#d69a68",3);box(0,-58,31,5,"#e4ac79");box(0,-8,31,6,"#ddaa73")}
      else for(let k=0;k<3;k++)poly("#fff0c5",[1,-49+k*20,16,-58+k*20,30,-58+k*20,2,-39+k*20]);
      break;
    case "barrel":case "pipe":case "vent":
      roundBox(3,-60,32,60,5,gradient(2,-24,36,-24,"#b8d0c5",o.art==="barrel"?"#b66b50":"#638496","#3c465b"));
      oval(19,-59,16,5,"#b4c4b5");oval(19,-60,11,2.6,"#435663");
      for(let j=0;j<3;j++)roundBox(2,-46+j*17,34,3,1,"#465164");
      if(o.art==="vent"){for(let k=0;k<3;k++)box(11+k*6,-37,2,18,"#86ffe6")}
      break;
    case "reed":case "root":case "log":
      for(let k=0;k<3;k++){
        const a=6+k*11, tall=k===1?60:37+(seed+k)%3*5, bend=(k-1)*3;
        stroke([a,-3,a+bend,-tall*.52,a-bend,-tall],o.art==="reed"?"#476e58":"#694641",o.art==="reed"?5:9);
        stroke([a-1,-5,a+bend-1,-tall*.52,a-bend-1,-tall],"#d8ab6d",1.9);
        oval(a-bend,-tall,4,2.8,"#f1ca8d");
        if(o.art==="reed")oval(a-bend,-tall+5,3.5,7,"#9a613f");
      }
      if(o.art==="log"){oval(17,-13,17,12,wood);oval(24,-13,9,10,"#e8b278");oval(24,-13,4.5,6,"#ad7452")}
      break;
    default:{
      const gem=o.art==="crystal", bright=gem?(l===mars?"#98f9e3":"#c2b3ff"):"#e4a882";
      poly(gem?"#696ab2":"#8c605c",[1,-6,4,-38,17,-64,30,-51,37,-18,31,0,5,0]);
      poly(bright,[4,-38,17,-64,20,-32,10,-9,2,-6]);
      poly(gem?"#899cdb":"#bd8066",[17,-64,30,-51,34,-22,20,-32]);stroke([18,-58,21,-32,12,-6],bright,1.2);break;
    }
  }
  pen.restore();
}
let cameraZoom=1;
// Sharpness: the play picture is drawn at the screen's own density, up to a pixel budget. A device that cannot keep a
// smooth pace steps the budget down and remembers it; each new visit tries one step sharper again.
const gfxSteps=[4.6e6,3.2e6,2.3e6,1.8e6,1.3e6];let gfxStep=0,gfxSlow=0,gfxSeen=0,gfxTime=0,gfxPrev=0;
try{gfxStep=Math.max(0,Math.min(gfxSteps.length-1,(+localStorage.getItem("hop-crew-gfx")||0)-1))}catch{}
function gfxTick(now){
  const ms=now-gfxPrev;gfxPrev=now;if(mode!=="play"||document.hidden||ms<=0||ms>250)return;
  gfxSeen++;gfxTime+=ms;if(ms>23)gfxSlow++;if(gfxTime<1300)return;
  if(gfxSlow>gfxSeen*.6&&gfxStep<gfxSteps.length-1){gfxStep++;try{localStorage.setItem("hop-crew-gfx",gfxStep)}catch{}}
  gfxSeen=gfxSlow=gfxTime=0;
}
function render(){
  const w=c.clientWidth,h=c.clientHeight;
  if(!w||!h)return;
  // Keep the world in the same logical units after rotation and bound high-density canvas work.
  const dpr=Math.min(window.devicePixelRatio||1,3,Math.sqrt(gfxSteps[gfxStep]/(w*h)));
  const ww=Math.round(w*dpr),hh=Math.round(h*dpr);
  if(c.width!==ww||c.height!==hh){c.width=ww;c.height=hh}
  width=w*H/h;pen.setTransform(hh/H,0,0,hh/H,0,0);
  const d=g?.d||0,l=g?.level||me.selected, playerH=g?.h||0;
  pen.clearRect(0,0,width,H);
  const openingRatio=introLeft/introDuration;
  const zone=sceneZone(l,d);renderWorld(zone,d,openingRatio);worldAtmosphere(zone,ambientTime,liveCamera);districtAir(zone,ambientTime);ambientLife(zone,ambientTime,d);neonLife(d,ambientTime,zone);
  if(introLeft>0){
    const p=viewPoint([(d+px)/liveCamera.unit,0,0],liveCamera);
    const scale=cap(FOCAL/p[2]/liveCamera.unit,.27,1);
    oval(p[0],p[1]+1,25*scale,3*scale,"#352e395c");drawRider(p[0],p[1],scale,false,false,false,false,l);
    return;
  }
  laneDetail(zone+1,d);
  // Pull the foreground camera back during the growth animation. Physics stays in world coordinates.
  const powered=mode==="play"&&g?.power>0;
  const bossNear=mode==="play"&&!!g&&g.items.some(o=>o.boss&&!o.done&&!o.pass&&encounterLead(o)<2.7&&encounterLead(o)>.85);
  const targetZoom=powered ? .62 : bossNear ? .84 : 1;
  cameraZoom+=((targetZoom-cameraZoom)*(reducedMotion?.matches?1:.23));
  const pan=(1-cameraZoom)*Math.min(350,width*.64), farEdge=(width-pan)/cameraZoom;
  pen.save();pen.translate(pan,floor*(1-cameraZoom));pen.scale(cameraZoom,cameraZoom);
  forkSigns(d);drawDeck(d,farEdge);pen.translate(0,-rideHeight(d));if(g)detourSeals(secondsAt(d),d);drawShow(d);drawGang(d);
  if(g?.goal!=null&&g.goal-d<farEdge+75)finishGate(g.goal-d);
  if(g)for(const o of g.items){
    if(isEncounter(o)&&(o.done||o.pass)){
      if(o.exitTime!=null)drawExit(o);continue
    }
    if(o.charmed)charmBurst(o,o.x-d);
    if(o.kind==="mine"&&o.brokenAt!=null)boom(o.x-d+19,floor-2,(g.time-o.brokenAt)/.7,.8);
    if(o.burned){scatterProp(o,o.x-d);continue}
    const x=o.x-d;
    if(x+o.w<-30||x>farEdge+45||o.done&&(isPickup(o)||(isEncounter(o)&&(o.exitTime==null||g.time-o.exitTime>.64))))continue;
    const y=floor-22+Math.sin(g.time*5)*6;
    if(o.kind==="charm"){charmArt(o,x);continue}
    if(o.kind==="token"){tokenArt(o,x);continue}
    if(["signal","feather","treasure"].includes(o.kind)){rareToken(o,x,y);continue}
    if(o.kind==="mine"){if(!o.done){oval(x+19,floor-4,19,7,"#534969");oval(x+19,floor-8,12,4,"#bd9253");oval(x+19,floor-10,3,2,Math.sin(g.time*7)>0?"#ffbe68":"#ef6861")}continue}
    if(o.kind==="shield"){shieldArt(x+16,floor-19,15,g.time,true);continue}
    if(o.kind==="ember"){emberArt(x+15,floor-17,g.time);continue}
    if(o.kind==="boost"){
      oval(x+14,y,19,19,"#bf92ff84");poly("#7246db",[x+14,y-14,x+28,y,x+14,y+15,x,y]);
      poly("#c49aff",[x+14,y-14,x+23,y,x+14,y+10,x+5,y]);star(x+14,y,6,"#fff2ff");continue;
    }
    if(o.kind==="health"){
      oval(x+16,floor+3,19,4,"#64433458");
      oval(x+16,y,25,25,softShade(x+16,y,28,"#ffe38b75"));
      medkit(x+16,y,1);continue;
    }
    if(isEncounter(o)){
      if(mode==="chomp"&&o.kind===cinema.kind)continue;drawVenom(o,x);
      const dive=cap(1-(x-px-55)/370,0,1), scale=o.kind==="red"?redHeight/93:o.kind==="pursuit"?1:1.16;
      oval(x+o.w/2,floor+3,o.kind==="eagle"?29+dive*12:57,8,"#5c302e55");
      pen.save();
      const feint=o.kind==="alien"&&o.move==="low"?dive*89:0;
      redAct=o.kind==="red"?fireStage(o):null;drawFoe(o.kind,x+o.w/2,floor-feint,scale,false,g.time*9,dive);redAct=null;
      pen.restore();bossFlame(o,x);continue;
    }
    if(o.kind==="trap"){drawTrap(o,x);continue}
    for(const [a,b] of boxes(o))obstacleArt(a-d,b-a,o.h,o,a===o.x?0:2,l);
  }
  else{
    // Before a run starts, show two of this path's own obstacles instead of the old placeholder cacti.
    const arts=routeHazards[l-1]||[],a=Math.max(px+60,width*.62),b=width*.88;
    if(!drawProp({art:arts[0]},a,31,37))cactus(a,31,37,2);if(!drawProp({art:arts[1]||arts[0]},b,31,82))cactus(b,31,82,3);
  }
  if(g&&mode!=="chomp")renderAid();
  if(!caughtBy&&mode!=="chomp"){
    const contact=1-cap(playerH/230,0,.72);
    const baseScale=1+Math.min(.19,(l-1)*.024);
    const powerAge=boostTime-(g?.power||0);
    const grow=g?.power>0?Math.sin(cap(powerAge/.38,0,1)*Math.PI/2):0;
    const scale=baseScale+(megaSize-baseScale)*grow;
    const shadow=(31+33*grow)*contact;
    const finishShift=reducedMotion?.matches?0:Math.sin(cap(finishMoment()/.78,0,1)*Math.PI*.5)*Math.min(68,width*.13);
    oval(px+finishShift,floor+3,shadow+8,6,softShade(px+finishShift,floor+3,shadow+8,"#51382966"));
    const stretch=juice(playerH);
    pen.save();pen.translate(px+finishShift,floor-playerH);pen.scale(stretch[0],stretch[1]);
    const crouch=mode==="play"&&ducking();
    dino(0,0,scale,false,(mode==="play"||finishMoment()>0&&finishMoment()<.78)&&playerH===0,playerH>0,mood>0,false);pen.restore();
    if(g?.shield)shieldArt(px-5,floor-playerH-(crouch?22:39)*scale,(crouch?46:54)*scale,g.time);
    if(g?.shieldBurst!=null&&g.time-g.shieldBurst<.48)burst(px,floor-playerH-34,(g.time-g.shieldBurst)*1.8,["#ffe589","#fff9c8","#edaf4f"],true);
    if(g?.power>0&&powerAge<.9)sparkles(px,floor-playerH-31*scale,powerAge);
  }
  if(mood>0&&mode==="play"){stroke([px+25,floor-playerH-68,px+30,floor-playerH-74],"#963e2c",2);stroke([px+19,floor-playerH-70,px+22,floor-playerH-77],"#963e2c",2)}
  pen.restore();
  foregroundLife(zone,d,ambientTime);hitFlash();
  if(g&&mode!=="chomp"){pen.save();pen.translate(0,-rideHeight(d)*cameraZoom);drawFlame(pan,cameraZoom);pen.restore();drawFlyby(d,pan,cameraZoom);drawSpotlight(d,pan,cameraZoom)}
  if(g&&mode==="play"&&g.flashUntil>g.time){const a=(g.flashUntil-g.time)/.65;box(0,0,width,4,"rgba(255,104,108,"+a+")")}
  const bubble=$("gain"), gainAge=g&&gain?g.time-gain.since:1;
  bubble.hidden=mode!=="play"||gainAge>=1;
  if(!bubble.hidden){
    bubble.textContent="+"+gain.points;
    bubble.style.left=(pan+(px+25)*cameraZoom)*h/H+"px";
    bubble.style.top=Math.max(68,(floor-(gain.h+75+gainAge*34)*cameraZoom)*h/H)+"px";
    bubble.style.opacity=1-cap((gainAge-.55)/.45,0,1);
  }
  if(mode==="chomp"){if(cinema.kind==="red"||!cinema.won)chompScene();else counterScene()}
  if(["finished","levelup","replayComplete"].includes(mode))celebration();
  updateBoostPrompt();syncFieldUI();powerUI();
  const threat=mode==="play"?nextThreat():null, wreck=mode==="play"&&g?activeWreck():null;
  const remaining=threat?encounterLead(threat):3, live=remaining<=1.02;
  const cue=$("encounterCue");cue.hidden=!threat&&!wreck;
  if(!cue.hidden){
    const action=threat?encounterHint[threat.move||encounters[threat.kind].move]:"Triple jump";
    $("rivalName").textContent=threat?encounters[threat.kind].name:((wreck.shape??1)%2?"Three-car carrier":"Two-car carrier");
    $("rivalMove").textContent=threat?(breathCue(threat)||(live?action+" now":"Get ready · "+action)):(g.vault?"Jumps "+(1+g.vault.spent+g.vault.queued)+"/3":"Tap Jump three times");
    cue.classList.toggle("go",!threat||live);
    $("rivalClock").style.transform="scaleX("+(threat?cap(remaining/(live?1.02:2.65),0,1):1)+")";
  }
  let msg="";
  if(mode==="chomp"){
    if(cinema.won)msg=cinema.kind==="red"?me.petName+" wins!  +"+cinema.points:"Counter!  +100 · 1 booster · 1 pack";
    else msg=encounterName(cinema.kind)+" got you!";
  }else if(mode==="play"){
    const phase=g.flight?secondsAt(d)-g.flight.start:-9;
    const drop=[2.8-phase,4.5-phase].find(v=>v>0&&v<1.33);
    msg=drop?(drop<.65?"Jump the blast!":"Air raid · watch the ground"):toastFor>0?toast:"";
  }
  if(msg!==shown){shown=msg;$("notice").textContent=msg;$("notice").hidden=!msg}
}
function updateRescueTimer(){
  const time=cap(rescue.suspended?rescue.remaining:rescue.closes-Date.now(),0,rescueTime), bar=$("rescueTimer");
  if(time===0){loseRescue();return}
  bar.firstElementChild.style.transform="scaleX("+(time/rescueTime)+")";
  bar.setAttribute("aria-valuenow",time);
}
function frame(now){
  ambientTime=now/1000;gfxTick(now);
  if(mode==="rescue")updateRescueTimer();
  if(mode==="chomp"&&Date.now()-cinema.started>=chompTime){
    const {won}=cinema;
    cinema=null;clock=0;last=now;
    setMode(won?(document.hidden?"paused":"play"):"dead");save();
  }
  if(mode==="play"&&introLeft>0){
    introLeft=Math.max(0,introLeft-Math.min(.1,last?(now-last)/1000:0));clock=0;if(!introLeft)endIntro();
  }else if(mode==="play"){
    clock+=last?Math.min(.05,(now-last)/1000)*pace()*finalPush():0;
    while(clock>=dt&&mode==="play"){clock-=dt;tick()}
  }
  last=now;if(!pathSettings.open&&!$("champions").open)render();requestAnimationFrame(frame);
}
// Each path has its own material, performer, palette and three-beat dodge pattern.
// A low pulse travels above a crouched rider. A lob lands on the road.
const fieldShows = [
  ["Kiln courtyard","Kiln sparks","kiln","#ffad66","#54ddd4",["lob","high","low"],"kiln"],
  ["Mango harvest","Falling mangoes","tree","#ffcb56","#8ed999",["lob","lob","low"],"basket"],
  ["Rooftop fliers","Runaway kite reels","kite","#fd7896","#75deed",["high","low","high"],"reel"],
  ["Monsoon outfall","Storm sluice","pipe","#72e3f4","#f9d36c",["low","high","low"],"sluice"],
  ["Lotus ferry","Lotus seed pods","lotus","#ffa1c8","#82dbc4",["lob","low","lob"],"lotus"],
  ["Tea garden","Rolling tea bales","mill","#c5e58c","#f1a968",["low","low","high"],"tea"],
  ["Red earth cutting","Quarry rockfall","rock","#ffa570","#d4d888",["lob","high","lob"],"stone"],
  ["Bamboo crossing","Bridge bandits","bandit","#c5eb8d","#e9ae6a",["high","low","low"],"lash"],
  ["River steps","Ferry wash","ferry","#78e4ea","#eeaa78",["low","lob","low"],"bollard"],
  ["Festival lane","Spark-wheel parade","wheel","#ff9bce","#ffdf75",["high","lob","high"],"drum"],
  ["Lantern roofs","Drifting lanterns","lamp","#ffd669","#fd889c",["high","high","lob"],"lantern"],
  ["Firefly court","Glow moths","moth","#c5f687","#8bd5f2",["high","low","high"],"hive"],
  ["Neon causeway","Signal crew","crew","#ff86b7","#6ff9df",["low","high","lob"],"cone"],
  ["Mars relay","Orbital sentry","drone","#a9f6cb","#ff936f",["high","low","lob"],"beacon"],
  ["Kolkata street","Street gang","kolkata","#ffcd69","#71d5d0",["low","lob","high"],"wheel"],
  ["Amazon floodplain","Canopy ape troop","apes","#a2ef70","#ff9e67",["high","lob","low"],"stump"]
];
fieldShows.push(...newFields);
// Run-local effects advance in simulation seconds. Inventory and one-shot hits survive pause/reload.
const specialCast=["spool","builder","racer","florist","jaguar","keeper","ray","mask","owl","tower","cat","desert","crab","drummer","clock","bat"];
function announcePower(label){
  g.activation={at:g.time,label};soundFX("charge");
}
function districtAir(zone,t){
  if(reducedMotion?.matches)t=1.5;
  if(zone===20||zone===30){
    nightStreet(t,liveCamera);const cx=width*.61+Math.sin(t*.23)*width*.075, cy=73+Math.sin(t*.19)*12;
    pen.save();const beam=pen.createLinearGradient(0,68,0,210);beam.addColorStop(0,"#e9e5ae48");beam.addColorStop(1,"#d4d4ca05");
    poly(beam,[width*.32,213,cx-29,cy,cx+29,cy,width*.335,213]);oval(cx,cy,30,13,"#f0e7bd87");
    oval(cx,cy,9,6,"#fff6cf");pen.restore();
    for(let j=0;j<9;j++){const x=(width*2+j*103-t*(10+j%4*3))%(width+50)-20,y=82+j*9+Math.sin(t*1.1+j)*7,flap=Math.sin(t*7+j)*4;
      poly("#21233b",[x-7,y-flap,x-4,y-1,x,y+1,x+4,y-1,x+7,y-flap,x+3,y+2,x,y+4,x-3,y+2]);}
  }else if(zone===17||zone===27){
    for(let i=0;i<14;i++){const x=(i*83+t*(9+i%4))%(width+20),y=floor-42+(i%5)*3+Math.sin(t*2+i)*1.5;stroke([x-4,y+1,x,y,x+5,y],"#c9fff478",1.3);}
  }else if(zone===16||zone===26){
    for(let i=0;i<13;i++){const x=(i*93+t*(17+i%5))%(width+35),y=floor-9-i%4*7-Math.sin(t*.8+i)*4;stroke([x-4,y+1,x,y,x+3,y],"#ffe0a392",1.1);}
  }else if(zone===18||zone===28){for(let i=0;i<14;i++){const x=(i*73+t*14)%(width+20),y=65+(i*43+t*(8+i%4))%190;pen.save();pen.translate(x,y);pen.rotate(i+t);box(-2,-1,4,2,i%2?"#fbd066":"#f2777e");pen.restore()}}
}
function fieldCast(k,t,x,y,retreat){
 const frame=Math.floor(t*(k==="ray"?6:12))%(k==="clock"?10:12),air=["bat","ray","owl"].includes(k);
 pen.save();pen.translate(x,y-(air?43+Math.sin(t*3.4)*7:0));pen.scale(retreat?1:-1,1);
 if(k==="bat"||k==="owl")drawSheet(fetchSheet(k),frame,0,-39+36*1.5,1.5);else {const image=fetchSheet(k);drawSheet(image,frame,0,0,k==="jaguar"||k==="crab"?1.10:k==="clock"?1.2:k==="ray"?1.35:.90);}pen.restore();
}
function sealCorridors(){
  return [36.8,57.2].map(t=>[distanceAt(t-.72)+px,distanceAt(t+.48)+px]);
}
function prepareDetour(){
  // At the sign, the first seal is still several seconds away. Clear only the landing
  // windows ahead of it, including obstacles generated for the main road on a wide display.
  for(const [lo,hi] of sealCorridors()){
    g.items=g.items.filter(o=>isPickup(o)||o.x>=hi||o.x+o.w<lo);
  }
}
function detourSeals(t,d){
  if(!g?.show||g.show.branch!=="spur"||!detours[g.level]||t<FSTART||t>FEND)return;
  for(let i=0;i<3;i++){
    if(g.show.picked&(1<<i))continue;
    const x=distanceAt(charmTimes[i])+px-d;if(x< -20||x>width+20)continue;
    oval(x,floor-16,9,11,"#ad7440");oval(x,floor-17,7,9,"#ffdb72");star(x,floor-17,4.3,"#fff4c2");
  }
  // A resident and a rejoin marker give the two quieter stretches their own landmarks.
  const x=distanceAt(53.7)+px-d;
  if(x> -65&&x<width+65){pen.save();pen.translate(x,floor-12);pen.scale(.65,.65);fieldCast(detours[g.level][2],t,0,0,false);pen.restore()}
  const post=distanceAt(60.6)+px-d;
  if(post>-60&&post<width+60){box(post-1,floor-58,4,58,"#676157");box(post-23,floor-62,48,18,"#243c4c");stroke([post-14,floor-52,post+12,floor-52,post+5,floor-58],"#ffdd91",2.4);}
}
function rareSlot(run,n){
 const s=run.specialSeed??run.rng,placed=run.placedRelics||{};
 if(!placed.treasure&&(me.found||0)<3&&s%5===0&&n>=10+(s%4))return "treasure";
 if(!placed.signal&&(bonusRank(run.level)||spurAt(run.level,secondsAt(run.next??0)))&&s%4===1&&n>=14+(s%3))return "signal";
 if(!placed.feather&&n>=4+(s%3))return "feather";
 return "";
}
function rareToken(o,x,y){
 const style={feather:["#5074cc","#c5ffff"],treasure:["#bc7142","#ffe386"],signal:["#343758","#ffdf76"]}[o.kind];
 oval(x+16,floor+1,11,2.6,"#3b324747");oval(x+16,y,17,17,softShade(x+16,y,20,style[1]+"88"));
 if(o.bellSignal){oval(x+16,y,19,15,"#ffd65c");poly("#3a3350",[x+16,y-9,x+22,y-4,x+23,y+4,x+26,y+7,x+6,y+7,x+9,y+4,x+10,y-4]);oval(x+16,y+8,2.6,2.2,"#3a3350");return}
 if(o.kind==="treasure"){box(x+1,y-7,29,18,gradient(x,y-6,x+30,y+9,style[1],style[0],"#895736"));box(x+1,y,29,2,"#ffe18b");box(x+13,y-2,5,6,"#ffe163")}
 else if(o.kind==="feather"){pen.save();pen.translate(x+13,y);pen.rotate(.54);oval(0,0,6.4,13,style[0]);oval(2,-2,4.3,10,style[1]);stroke([-1,13,2,-10],"#fffbd4",1.5);pen.restore()}
 else{oval(x+15,y,14,11,style[0]);star(x+15,y,7,style[1])}
}
// Use the same short projectile trajectory for drawing and contact. A raised head gives
// a cue before release. Once a shot passes the runner it cannot hit again after a reload.
function venomShot(o,d){const age=g.time-o.spit,range=82;return {age,x:o.x-d+11-Math.min(range,Math.max(0,age)*285),h:o.kind==="cobra"?20+32*(1-cap(age/.36,0,1))**2:18+Math.sin(cap(age/.36,0,1)*Math.PI)*10}}
// The cobra spits from its raised head; the anaconda strikes from the ground.
function venomTick(o,d,h){
 if(!["cobra","anaconda"].includes(o.kind)||o.venomHit||o.done||o.pass)return;
 const lead=o.x-(d+px);if(lead<182&&lead>15&&!o.hissed){o.hissed=true;soundFX("hiss")}
 if(o.spit==null&&lead<=111&&lead>22){o.spit=g.time;save()}
 if(o.spit==null)return;const shot=venomShot(o,d);if(shot.age>.36)return;
 if(Math.abs(shot.x-px)<=18){o.venomHit=true;if(h<shot.h+3)takeDamage(7,"venom",o);save()}
}
function drawVenom(o,x){
 if(!["cobra","anaconda"].includes(o.kind)||o.done||o.pass)return;
 if(o.hissed&&o.spit==null){const f=(g.time*4)%1;oval(x+11,floor-(o.kind==="cobra"?52:19),3.8+f,2.85,"#b7ff6f");return}
 if(o.spit==null)return;const shot=venomShot(o,g.d);if(shot.age<0||shot.age>.36)return;
 const xx=shot.x,yy=floor-shot.h;const up=o.kind==="cobra"?Math.min(9,(yy-(floor-52))*-.5+1):2;stroke([xx+13,yy-up,xx,yy],"#426337",4.1);stroke([xx+12,yy-up,xx,yy],"#c5fb60",2.3);
 oval(xx,yy,4.5,3.4,"#94ef55");oval(xx-1,yy-1,1.6,1,"#f4ffad");
}
function helperTick(){
 const aid=g.aid;if(!aid)return;
 const age=g.time-aid.at;
 if(!aid.fired&&age>=.64){
  aid.fired=true;const target=aid.gangBeat==null?g.items.find(o=>o.x===aid.target&&!o.done&&!o.pass):null;
  if(aid.gangBeat!=null&&g.gang){g.gang.disarmed=(g.gang.disarmed||0)|(1<<aid.gangBeat);soundFX("pop");reward(25,false)}
  if(target){target.done=true;target.burned=true;target.brokenAt=g.time;if(isEncounter(target)){escapeStamp(target,"flame");tally("rivals");if(target.boss)tally("boss","Beaten")}reward(25,false);soundFX("pop")}save();
 }
 if(age>3.1)g.aid=null;
}
function summonIfReady(){
 if(!g.signal||g.aid||g.level===21&&g.gang&&secondsAt(g.d)<19.5)return;
 const o=g.items.find(o=>!o.done&&!o.pass&&!isPickup(o)&&o.x-g.d-px>speed()*1.00&&o.x-g.d-px<speed()*1.35);
 if(!o)return;g.signal=false;g.aid={at:g.time,target:o.x,hero:g.level===21?"tower":"friend"};if(g.aid.hero==="tower")me.metKeeper=true;announcePower(g.aid.hero==="tower"?"The keeper answered the bell":"A friend answered the signal");save();
}
function renderAid(){
 const aid=g?.aid;if(!aid)return;const age=g.time-aid.at,keeper=aid.hero==="tower";
 const xx=age<.63?-75+(px+120)*cap(age/.63,0,1):age<2.2?px+45:px+45-(px+130)*cap((age-2.2)/.9,0,1);
 const acting=age>.39&&age<1.12,waving=age>1.25&&age<2.2;
 const f=keeper?(acting?(age<.6?13:14):waving?15:Math.floor(g.time*12)%12):(acting?13:waving?13+Math.floor(g.time*6)%2:Math.floor(g.time*17)%10);
 pen.save();pen.translate(xx,floor);pen.scale(age>2.2?-1:1,1);drawSheet(fetchSheet(keeper?"tower":friendKey()),f,0,0,keeper?1.02:1.08);pen.restore();
 if(age>.39&&age<.81){
   const ex=aid.gangBeat!=null?gangX(secondsAt(g.d))-22:aid.target-g.d,ey=floor-25,k=(age-.39)/.42,sx=xx+16,sy=floor-58;
   const bx=sx+(ex-sx)*k,by=sy+(ey-sy)*k-34*Math.sin(k*Math.PI);
   oval(bx,by,9,9,"#ffe58a55");oval(bx,by,4.6,4.6,keeper?"#ffd65c":"#fff2b0");stroke([bx-(ex-sx)*.06,by+4,bx,by],"#fff2b088",2);
 }
}
function useFeather(){
 if(!g?.feather||mode!=="play"||introLeft||g.h>0||g.v>0)return;
 g.feather=false;startLeap();g.v=Math.max(g.v,790);announcePower("Super jump!");save();hud();
}
function powerUI(){
 const e=$("powerNotice"),a=g?.activation,age=a?g.time-a.at:4;
 e.hidden=!(mode==="play"&&age>=0&&age<2.1);
 if(!e.hidden&&e.dataset.at!==String(a.at)+a.label){e.dataset.at=String(a.at)+a.label;e.textContent="★  "+a.label;e.animate?.([{transform:"translate(-50%,7px) scale(.88)",opacity:.2},{transform:"translate(-50%,0) scale(1)",opacity:1}],{duration:220})}
 const b=$("superJump");b.hidden=!g?.feather;b.disabled=mode!=="play"||introLeft>0||g.h>0;
}
const tourOrder=[...storyIds,...bonusIds];
function beginTour(){
 if(!pathSettings.open)return;
 const n=Number.isInteger(me.tourCursor)?cap(me.tourCursor,0,tourOrder.length-1):0;
 pathSettings.close();resumeOnDismiss=false;thumbJobs.length=0;
 if(g&&!g.settled&&g.tour===n){if(g.stageReady){start();return}start();return}
 settleRun();me.tourCursor=n;me.selected=tourOrder[n];g=create();g.tour=n;caughtBy=gain=null;shot=mood=toastFor=0;spawn();setMode("play");beginIntro();save();
}
function tourFinish(){
 if(!Number.isInteger(g.tour))return false;
 const n=g.tour,rank=storyRank(g.level);
 if(rank===me.stage&&!me.storyComplete){if(rank===C.length)me.storyComplete=true;else me.stage=rank+1}
 g.health=Math.min(maxInventory,g.health+1);g.buffer=0;g.stageReady=true;
 if(n===tourOrder.length-1){delete me.tourCursor;setMode("finished")}
 else{me.tourCursor=n+1;setMode("levelup")}save();return true;
}

const beatImpact=[42.65,44.40,46.15], charmTimes=[36.8,43.49,57.2];
const hitTypes={high:{title:"Duck",damage:8},low:{title:"Jump",damage:14},lob:{title:"Jump the landing",damage:22}};
function makeShow(seed){
  return {sequence:(seed>>>8)%3,branch:null,hits:0,charms:0,picked:0,settled:false,repelled:null};
}
function ducking(){return !!g&&g.h<1&&((g.duckUntil||0)>g.time||duckHeld)}
let duckHeld=false;
function duck(){
  if(mode!=="play"||introLeft||g.h>0)return;
  g.duckUntil=g.time+1.05;g.buffer=0;
}
function ventDuck(){duckHeld=false}
function beatKind(i){
  const spec=currentField();
  return spec[5][(i+g.show.sequence+(g.show.branch==="spur"?1:0))%3];
}
function showBounds(){return [distanceAt(38.1)+px,distanceAt(49.3)+px]}
function installShowPickup(){
  g.items.push({kind:"shield",x:distanceAt(39.45)+px,w:32,h:35});
}
function grantShield(){
  g.shield=1;
  if([8,13,15,16].includes(g.level))g.embers=Math.min(3,(g.embers||0)+1);
  soundFX("charge");toast=[8,13,15,16].includes(g.level)?"Gold shield + crew flare":"Gold shield · guards one hit";toastFor=2.1;
}
function blockHit(){
  if(!g.shield)return false;
  g.shield=0;g.shieldBurst=g.time;toast="Shield held!";toastFor=1.3;soundFX("pop");hud();save();return true;
}
function showTarget(){
  if(!g?.show||g.show.repelled!=null||secondsAt(g.d)<40.55||secondsAt(g.d)>46.35)return null;
  const x=presenterX(secondsAt(g.d));if(x<px+10||x>width+10)return null;
  // A marker outside all generated object positions identifies the roaming performer across reloads.
  return {kind:"performer",x:-1,w:52,h:78};
}
function mobilePerformer(){
  if(specialCast.includes(currentField()[2]))return true;
  return ["crew","bandit","kolkata","apes","moth","drone","kite","tram","ferry"].includes(currentField()[2]);
}
function anchorX(i,t){
  const launch=beatImpact[i]-1.2;
  return Math.min(width-32,px+213)+distanceAt(launch)-distanceAt(t);
}
function presenterX(t){
  if(!mobilePerformer()){
    const n=[0,1,2].find(i=>anchorX(i,t)>px+12);
    return anchorX(n??2,t);
  }
  const edge=Math.min(width-44,px+230);
  const entry=1-cap((t-39.85)/1.5,0,1);
  const elapsed=g.show.repelled==null?Math.max(0,t-46.7):Math.max(0,t-g.show.repelled);
  return edge+entry*entry*(width+70-edge)+elapsed*elapsed*(width+160);
}
function firePerformer(){
  if(!g.show||g.show.repelled!=null)return false;
  g.show.repelled=secondsAt(g.d);
  // Already airborne hazards finish their flight. Future launches are canceled.
  tally("rivals");reward(55,false);toast=g.level===city?"Signal crew retreats!  +55":"Encounter dispersed  +55";toastFor=1.6;
  return true;
}
function activeBeat(i){return g.show.repelled==null||g.show.repelled>=beatImpact[i]-1.20}
function tickShow(d,h,prior){
  const f=g.show;if(!f)return;
  const t=secondsAt(d)+1e-7;
  if(!forks[g.level]&&t>=38.4&&f.branch===null){f.branch="main";save()}
  if(t<FSTART||f.settled)return;
  for(let i=0;i<3;i++){
    const bit=1<<i;
    if(f.branch==="spur"&&!(f.picked&bit)&&t>=charmTimes[i]){
      f.picked|=bit;
      if(h===0&&prior===0){f.charms++;soundFX("pickup");toast="Trail seal  "+f.charms+"/3";toastFor=1}
      save();
    }
    if(f.hits&bit||t<beatImpact[i])continue;
    f.hits|=bit;
    if(activeBeat(i)){
      const type=beatKind(i);
      const hit=type==="high"?h<78&&!ducking():h<(type==="lob"?57:37);
      if(hit){takeDamage(hitTypes[type].damage,type==="lob"?"blast":"crew");if(mode!=="play")return}
      else{soundFX("pickup");reward(8,false)}
    }
    save();
  }
  if(t>=(f.branch==="spur"?FEND:48.55)){
    f.settled=true;
    if(f.branch==="spur"&&f.charms>=2){reward(65,false);soundFX("clear");toast="Side trail cleared   +65";toastFor=2.2}
    else if(f.branch==="spur"){toast="Back on the main path";toastFor=1.5}
    save();
  }
}
function syncFieldUI(){
  const play=mode==="play"&&g&&!introLeft,t=g?secondsAt(g.d):0,f=g?.show;
  const title=spurAt(g?.level,t)?detours[g.level][1]:routes[(g?.level||me.selected)-1];if($("zone").textContent!==title)$("zone").textContent=title;
  const picker=$("forkDecision"),names=g&&forks[g.level],open=!!(mode==="fork"&&names&&f&&f.branch===null);
  picker.hidden=!open;
  if(open){const card=$("forkPostcard");if(card.dataset.level!==String(g.level)){card.dataset.level=String(g.level);card.replaceChildren(makeThumb(routes.length+branchIds.indexOf(g.level)+1));workThumbs()}$("forkDetail").textContent=detours[g.level][7]+"  ·  30 sec. Two seals earn 65 points.";$("takeMain").textContent=names[0]+" →";$("takeSpur").textContent=names[1]+" ↗"}
  $("shieldBadge").hidden=!g?.shield;
  const target=play?nextThreat():null;
  const duckBtn=$("duck");duckBtn.disabled=!play;
  const pressed=!!play&&ducking();
  if(duckBtn._pressed!==pressed){duckBtn._pressed=pressed;duckBtn.setAttribute("aria-pressed",String(pressed))}
  const i=play&&f?beatImpact.findIndex((at,i)=>activeBeat(i)&&t>=at-1.30&&t<at):-1;
  duckBtn.classList.toggle("duck-cue",!!(breathCue(target)||target?.move==="low"||i>=0&&beatKind(i)==="high"));
  const tag=$("fieldCue");
  const gangLine=play?gangCue():"";if(gangLine){tag.hidden=false;tag.textContent=gangLine;duckBtn.classList.toggle("duck-cue",gangLine.startsWith("Duck"));return}
  const show=play&&f&&t>=39.95&&t<47.25;
  tag.hidden=!show;
  if(show){
    const title=currentField()[1],trail=f.branch==="spur"?" · Seals "+f.charms+"/3":"";
    const msg=i>=0?hitTypes[beatKind(i)].title+"!":f.repelled!=null?"Retreating":title;
    const line=msg+trail;if(tag.textContent!==line)tag.textContent=line;
  }
}
$("takeMain").onclick=()=>chooseFork("main");$("takeSpur").onclick=()=>chooseFork("spur");
const duckButton=$("duck");
duckButton.onpointerdown=e=>{if(e.button!==0)return;e.preventDefault();duck();if(mode==="play"&&!introLeft){duckHeld=true;duckButton.setPointerCapture?.(e.pointerId)}};
duckButton.onpointerup=ventDuck;duckButton.onlostpointercapture=ventDuck;duckButton.onpointercancel=ventDuck;
duckButton.onclick=e=>{if(!e.detail)duck()};
window.addEventListener("blur",ventDuck);
document.addEventListener("keyup",e=>{if(e.code==="ArrowDown"||e.code==="KeyS")ventDuck()});

// Sprite-local attachment points follow the juvenile's baked twelve-frame gait.
function shieldArt(x,y,rad,t,token=false){
  pen.save();pen.translate(x,y);
  if(token){
    pen.translate(0,Math.sin(t*4)*3);
    oval(0,0,23,23,softShade(0,0,23,"#ffdd6dc4"));
    inked(gradient(-9,-13,9,13,"#fff4bc","#ffce55","#e2973d"),"#8b5a34",p=>{
      p.moveTo(0,-15);p.lineTo(14,-9);p.quadraticCurveTo(14,7,0,16);p.quadraticCurveTo(-14,8,-14,-9);p.closePath()});
    stroke([-8,-7,0,-10,8,-7],"#fff6d2",2);star(0,0,6,"#fff3bb");
  }else{
    const fill=pen.createRadialGradient(-rad*.32,-rad*.38,1,0,0,rad);
    fill.addColorStop(0,"#fff2bb2e");fill.addColorStop(.68,"#ffdf6207");fill.addColorStop(.92,"#ffca392d");fill.addColorStop(1,"#ffed9c9e");
    oval(0,0,rad,rad,fill);pen.beginPath();pen.arc(0,0,rad,0,Math.PI*2);pen.strokeStyle="#ffe59bd9";pen.lineWidth=1.8;pen.stroke();
    pen.beginPath();pen.arc(0,0,rad-3,3.74,4.69);pen.strokeStyle="#fff9d3";pen.lineWidth=2.5;pen.stroke();
    star(Math.cos(t*1.6)*rad,Math.sin(t*1.6)*rad,3.3,"#fff6c5");
  }
  pen.restore();
}
function escapeStamp(o,outcome){
  o.exitTime=g.time;o.exitD=g.d;o.outcome=outcome;
}
function scatterProp(o,x){
  const age=g.time-o.brokenAt;if(!(age>=0&&age<.72)||x>width+30||x+o.w<-40)return;
  const pieces=Math.min(12,Math.max(5,Math.ceil(o.w/16)));
  for(let i=0;i<pieces;i++){
    const n=Math.sin(i*2.39+o.x),side=i/(pieces-1)-.5,gravity=310;
    const lift=Math.max(0,(64+i%3*12)*age-gravity*age*age*.5);
    const xx=x+o.w*(.5+side*.88)+side*age*46, yy=floor-lift-(1-Math.min(1,age/.32))*(i%3)*o.h*.18;
    pen.save();pen.translate(xx,yy);pen.rotate(n*age*4);
    poly(i%2?"#b46d54":"#e99f69",[-4,-4,2,-5,5,-2,3,1,-4,0]);
    stroke([-3,-4,2,-4.8],"#ffd28f",1.15);pen.restore();
  }
}
function patrolX(o,t){return o.x-o.exitD+o.w/2-(780+speedAt(o.exitD)*1.8)*t-210*t*t}
function patrolPass(o,h){
  const t=g.time-o.exitTime,x=patrolX(o,t),reach=Math.abs(x-px);
  if(reach<65&&h<(reach<28?44:23))o.pass.clean=false;
  if(x+74>px-16)return;
  const pass=o.pass;delete o.pass;
  if(pass.clean&&pass.charged){resolveEncounter(o,true);return}
  endDodge(o,pass.clean);
}
function endDodge(o,clear){
  o.done=true;o.evaded=clear;g.power=0;
  if(clear){
    g.clean=(g.clean||0)+1;const drop=g.clean%3===0&&me.boosters<2;
    if(drop)me.boosters++;
    tally("rivals");if(o.boss)tally("boss","Dodged");reward(35,false);toast=drop?"Three clean escapes · charge +1":"Clean escape  +35";toastFor=1.6;
  }else{g.streak=0;g.clean=0;takeDamage(contactRate()||25,"contact",o)}
  save();hud();
}
function drawExit(o){
  if(o.cinematicExit||mode==="chomp"&&cinema?.kind===o.kind)return;
  const t=g.time-o.exitTime;if(t<0||t>2.3)return;
  const at=o.x-o.exitD+o.w*.5,air=["langur","eagle","kite","bat","owl"].includes(o.kind);
  if(o.kind==="alien"){alienEscape(o);return}
  if(o.kind==="pursuit"){
    const x=o.outcome==="flame"?at-22*Math.sin(Math.min(1,t/.32)*Math.PI)+Math.max(0,t-.23)**2*(width+200):patrolX(o,t);
    if(x<-115||x>width+110&&t>.6)return;
    oval(x,floor+2,63,4,"#362b4b66");pursuitCar(x,floor,145,g.time*17);
    for(let k=0;k<3;k++){const q=(t*3+k/3)%1;oval(x+65+q*35,floor-12-q*4,2+q*5,1.4+q*2,"#9aeada64")}
    return;
  }
  const startH=o.kind==="alien"&&o.move==="low"?89:0;
  const recoil=o.outcome==="counter"||o.outcome==="flame";
  const kick=recoil?Math.sin(Math.min(1,t/.35)*Math.PI):0;
  const run=Math.max(0,t-(recoil?.22:0));
  let x=at-(recoil?18*t:0)-run*(air?170:210)-run*run*104;
  let y=floor-startH-(air?run*run*72:0)-kick*15;
  if(o.kind==="langur"){
    // The rope stays attached to a canopy anchor while the animal sweeps through its arc.
    const a=Math.min(1.28,run*1.48),r=105;
    x=at-Math.sin(a)*r-run*105;y=floor-(1-Math.cos(a))*r-run*15-kick*12-Math.max(0,run-.67)**2*132;
    /* The animated palm socket in drawFoe supplies the swinging rope. */
  }else if(!air&&o.kind!=="cobra"&&o.kind!=="croc"&&o.kind!=="anaconda"){
    y-=Math.abs(Math.sin(run*12))*Math.min(9,run*34);
  }
  if(x<-160)return;
  const scale=o.kind==="red"?redHeight/93:1.16;
  oval(x,floor+2,48,4,"#392e3e40");
  pen.save();pen.translate(x,y);pen.rotate(kick*-.15+(air&&o.kind!=="langur"?-.18*Math.min(run,1):0));
  drawFoe(o.kind,0,0,scale,false,g.time*(air?12:15),cap(1-run*.7,0,1));pen.restore();
  if(kick>.05){star(x+22,y-(air?112:64),3+kick*4,"#ffe9a3");star(x+36,y-(air?103:57),2+kick*3,"#ffba79")}
}

// A shallow raised deck splits from the road and rejoins it before normal obstacles return.
// Physics measures jump height above the local deck. The same profile places the rider's feet.
function deckHeight(level,t){
  if(t<=FSTART||t>=FEND)return 0;
  const rise=cap((t-FSTART)/1.12,0,1),fall=cap((FEND-t)/1.20,0,1),p=Math.min(rise,fall);
  return (level===16?29:level===13?24:19)*p*p*(3-2*p);
}
function rideHeight(d){return g?.show?.branch==="spur"&&forks[g.level]?deckHeight(g.level,secondsAt(d)):0}
function drawDeck(d,farEdge){
  if(!g?.show||!forks[g.level])return;
  const level=g.level,section=g.show,t=secondsAt(d);if(t<31||t>FEND+1)return;
  const x0=Math.max(-20,distanceAt(FSTART)+px-d),x1=Math.min(farEdge+20,distanceAt(FEND)+px-d);
  if(x1<=x0)return;
  const side=section.branch==="spur",spec=side?detours[level]:fieldShows[level-1],offset=side?0:9;
  const surface=x=>floor-offset-deckHeight(level,secondsAt(d+x-px))*(side?1:.75);
  const points=[];for(let x=x0;x<x1;x+=16)points.push([x,surface(x)]);points.push([x1,surface(x1)]);
  path(level===16?"#4a5849":level===13?"#35394f":"#796653",p=>{
    p.moveTo(x0,points[0][1]);for(const [x,y] of points)p.lineTo(x,y);
    for(let j=points.length-1;j>=0;j--)p.lineTo(points[j][0],points[j][1]+(side?9:6));p.closePath()});
  const rim=side?spec[4]:"#b8ac8f";stroke(points.flat(),rim,side?2.4:1.5);
  for(let x=x0+((103-(d+x0)%103)%103);x<x1;x+=103){
    const y=surface(x);stroke([x,y+6,x,floor-offset+4,x+12,y+6],"#4e4a4b",2);
  }
}
// All foreground effects use the rider's logical road coordinates, including on rotation.
function trailArchitecture(t,d,spec){
  if(!forks[g.level]||t<36.3||t>49.8)return;
  const spur=g.show.branch==="spur",metal=g.level===13,forest=g.level===16;
  if(!spur){
    const sign=distanceAt(38.8)+px-d;
    if(sign>-85&&sign<width+100){
      box(sign,floor-69,5,69,"#534744");
      poly("#263d49",[sign-40,floor-85,sign+25,floor-85,sign+40,floor-73,sign+24,floor-61,sign-40,floor-61]);
      stroke([sign-22,floor-73,sign+19,floor-73,sign+9,floor-79],"#efdf9c",2.6);
    }
    return;
  }
  const start=distanceAt(38.9)+px-d,end=distanceAt(48.6)+px-d;
  const x0=Math.max(0,start),x1=Math.min(width,end);
  if(x1>x0){
    for(let x=start+9+Math.max(0,Math.floor(-start/40))*40;x<x1;x+=40){
      if(x<x0)continue;const y=floor+rideHeight(d)-deckHeight(g.level,secondsAt(d+x-px));
      stroke([x,y+3,x+5,y+5,x,y+7],spec[3],1.3);
    }
  }
  for(let j=0;j<9;j++){
    const x=start+j*(end-start)/8;if(x<-70||x>width+70)continue;
    const top=floor-(j===0||j===8?148:121);
    if(forest){
      poly("#566a59",[x-12,floor,x-9,top+6,x+5,top,x+10,floor]);
      stroke([x-7,top+9,x-5,top+54,x,top+66],"#9bb090",3);
      for(let k=0;k<4;k++)oval(x+Math.sin(j+k)*11,top+k*7,7,3,k%2?"#6c915b":"#94ab63");
    }else{
      box(x-3,top,6,floor-top,metal?"#49425d":"#826353");
      box(x-2,top,1.4,floor-top,metal?"#ff89bc":"#eac687");
      stroke([x-11,top+21,x,top+4,x+12,top+21],spec[4],2);
    }
    if(j%2===0){
      stroke([x-26,top+5,x,top+10,x+26,top+4],metal?"#736899":"#715349",2);
      for(let k=-1;k<=1;k++){const xx=x+k*15,yy=top+10-Math.abs(k)*3;
        if(g.level===3)poly(spec[3],[xx,yy,xx+5,yy+5,xx,yy+12,xx-4,yy+5]);
        else if(g.level===15){for(let m=0;m<3;m++)oval(xx,yy+m*3,3,2,m===1?"#ffbe49":"#ff8b4f")}
        else oval(xx,yy,2.5,3.4,spec[4]);
      }
    }
  }
}
function fieldPerformer(t,spec,x){
  if(x>width+95||x<-80)return;
  if(specialCast.includes(spec[2])){fieldCast(spec[2],t,x,floor,g.show.repelled!=null||t>46.7);return}
  const k=spec[2],a=spec[3],b=spec[4],wind=Math.sin(t*4),run=g.show.repelled!=null||t>46.7;
  const air=["drone","kite","moth"].includes(k),shoulder=floor-12,y=shoulder-(air?78+wind*6:0);
  oval(x,shoulder+1,34,4,"#342e464b");pen.save();pen.translate(x,y);
  const iron="#445060",dark="#394656";
  if(["crew","bandit","kolkata","apes"].includes(k)){
    drawCrew(k,t,run);
  }else if(k==="drone"){
    oval(0,-4,28,12,gradient(-16,-16,16,7,b,"#688998",dark));
    for(const q of [-1,1]){stroke([q*12,-8,q*25,-16,q*32,-16],iron,4);oval(q*32,-16,12,2,a)}
    oval(-7,0,6,4,a);oval(-9,-1,2,2,"#fff4c9");
  }else if(k==="frog"||k==="moth"){
    for(const q of [-1,1]){
      if(k==="moth"){pen.save();pen.rotate(q*(.26+wind*.17));oval(q*16,-6,15,8,b);oval(q*13,2,8,5,a);pen.restore()}
      else{const xx=q*13;oval(xx,-6-Math.abs(wind)*3,10,7,"#437b60");stroke([xx,-7,xx+q*8,-2,xx+q*12,-2],a,3)}
    }
    oval(0,-14,12,k==="frog"?10:5,gradient(-8,-22,6,-8,a,"#83a958","#455e55"));
    for(const q of [-1,1]){oval(q*6,-22,3.5,3.9,b);oval(q*6-1,-22,1.2,2,dark)}
  }else if(k==="tram"||k==="ferry"){
    const boat=k==="ferry";
    if(boat){box(-44,-3,88,4,"#83cdce");poly(iron,[-40,-13,41,-13,30,-2,-27,-2])}
    else{for(const q of [-23,23]){oval(q,-5,5,5,dark);oval(q,-5,2.3,2.3,"#bacac4")}}
    box(-31,-31,61,boat?17:23,boat?"#bf9065":"#c69b4b");
    for(let j=-25;j<24;j+=12){box(j,-28,9,11,"#4f7e85");box(j,-28,2,9,"#badbc7")}
    box(-34,-34,67,4,iron);stroke([-30,-13,28,-13],a,2);oval(-29,-16,2,2,"#fff3a2");
    if(boat)stroke([12,-34,12,-49,24,-45,13,-42],b,2);
  }else if(k==="tree"||k==="bamboo"||k==="lotus"){
    for(let j=0;j<5;j++){
      const xx=(j-2)*8,top=-35-(j%3)*7,s=wind*(j+2)*.7;
      stroke([xx*.5,0,xx*.8,-18,xx+s,top],k==="bamboo"?"#a1a75d":"#596a44",k==="tree"?4:2.8);
      for(const q of [-1,1])oval(xx+s+q*5,top+3,7,3,q===1?"#91bc62":"#5d9863");
      if(k!=="bamboo")oval(xx+s,top,k==="lotus"?6:4.5,k==="lotus"?4:6,a);
    }
  }else if(k==="kite"){
    stroke([0,0,3,12,12,23,7,37,15,47],a,1.5);
    poly(a,[-26,-6,-3,-28,25,-5,0,17]);poly(b,[-3,-28,0,17,25,-5]);
    stroke([-26,-6,25,-5,-3,-28,0,17],dark,1.2);
  }else{
    // These sources share their solid obstacle's construction and palette at a larger scale.
    const map={kiln:"kiln",pipe:"sluice",rock:"stone",mill:"tea",wheel:"drum",lamp:"lantern"};
    pen.save();pen.translate(-26,-floor);obstacleArt(0,52,51,{art:map[k]||"beacon",shape:1},0,g.level);pen.restore();
    if(k==="wheel"||k==="mill"){pen.save();pen.translate(0,-40);pen.rotate(t*1.7);for(let j=0;j<5;j++){pen.rotate(Math.PI*.4);poly(a,[0,-2,19,-6,24,-2,5,2])}oval(0,0,4,4,b);pen.restore()}
    if(k==="kiln")for(let j=0;j<4;j++){const p=(t*.75+j*.25)%1;oval(-4+p*10,-47-p*23,2-p,2.4-p,"#ffe08a")}
  }
  pen.restore();
}
function drawBeat(i,t,spec){
  if(!activeBeat(i))return;
  const kind=beatKind(i),after=t-beatImpact[i],u=cap(1+after/1.2,0,1);
  if(after< -1.2||after>.62)return;
  const launch=beatImpact[i]-1.2,base=mobilePerformer()?presenterX(launch):anchorX(i,launch);
  const [src,sourceH]=throwOrigin(spec[2],i,base)||[base,["moth","kite","drone"].includes(spec[2])?90:36];
  const x=src+(px-src)*u,y=floor-(sourceH*(1-u)+(kind==="high"?57:kind==="low"?18:3)*u+(kind==="lob"?76:4)*Math.sin(Math.PI*u));
  if(kind==="lob"&&after<0){
    pen.save();pen.globalAlpha=.5+u*.45;oval(px,floor,8+u*20,3.5,"#fead65");stroke([px-8,floor-2,px+8,floor-2],"#ffe5a1",1.2);pen.restore();
  }
  if(after<0){
    if(["crew","bandit","kolkata","apes"].includes(spec[2])){stroke([x+12,y+1,x+3,y],spec[4],2);crewAmmo(spec[2],x,y,t,spec[3])}
    else if(kind==="lob"){oval(x,y,7,7,gradient(x-4,y-5,x+5,y+5,"#fff1c1",spec[3],"#664956"));star(x+4,y-7,3,spec[4])}
    else{stroke([x+15,y+1,x+4,y],spec[4],4);oval(x,y,6,4,spec[3]);oval(x-2,y-1,2,1.8,"#fff9da")}
  }else if(kind==="lob"){
    boom(px,floor,after/.62,.62,spec[3]);
  }else{
    const tail=px-after*350;if(tail>-18){stroke([tail+12,y,tail,y],spec[4],3);oval(tail,y,5,3,spec[3])}
  }
}
function drawShow(d){
  if(!g?.show)return;
  const t=secondsAt(d),spec=currentField();if(t<35||t>50.1)return;
  if(g.show.branch!=="spur")trailArchitecture(t,d,spec);
  if(t<39.55)return;
  if(mobilePerformer())fieldPerformer(t,spec,presenterX(t));
  else for(let k=0;k<3;k++)fieldPerformer(t,spec,anchorX(k,t));
  for(let i=0;i<3;i++){
    drawBeat(i,t,spec);
  }
}

// Perspective-clipped ground planes keep the road visible on the software renderer too.
// The near-plane depth is linear along a world edge, so clipping stays stable during the intro.
function paintGround(ctx,cam,zone){
  const P=WORLD_STYLES[zone],water=[4,7,8,15,17,22,26,27].includes(zone),cityRoad=[0,2,3,8,9,10,11,12,14,18,19,20,21,23,24,28,29,30].includes(zone);
  function strip(z0,z1,y,color){
    const extent=Math.max(240,cam.w*.60),x=cam.cx;
    const quad=[[x-extent,y,z0],[x+extent,y,z0],[x+extent,y,z1],[x-extent,y,z1]];
    const clip=[];
    for(let k=0;k<4;k++){
      const a=quad[k],b=quad[(k+1)%4],da=viewPoint(a,cam)[2],db=viewPoint(b,cam)[2];
      if(da>=.7)clip.push(a);
      if((da>=.7)!==(db>=.7)){const f=(.7-da)/(db-da);clip.push(a.map((v,j)=>v+(b[j]-v)*f))}
    }
    if(clip.length<3)return;
    ctx.beginPath();clip.forEach((p,i)=>{const [u,v]=viewPoint(p,cam);if(i)ctx.lineTo(u,v);else ctx.moveTo(u,v)});
    ctx.closePath();ctx.fillStyle=color;ctx.fill();
  }
  const mix=(a,b,k)=>"rgb("+mix3(rgb(a),rgb(b),k).map(v=>Math.round(255*v)).join(",")+")";
  strip(-42,110,-.14,P[3]);
  if(water)strip(10,45,-.01,zone===15?"#385e59":"#588d94");
  if([3,12,14].includes(zone))strip(5,11,.01,mix(P[3],"#41485b",.43));
  strip(-6,4.4,.02,mix(P[3],cityRoad?"#403a4a":"#63563a",zone===12?.55:.15));
}
function laneDetail(level,d){
  const night=[10,11,12,13,16,21,24,26,28,30,31].includes(level);
  const paved=[1,3,4,9,10,11,13,15,19,20,21,22,24,25,29,30,31].includes(level);
  const bands=pen.createLinearGradient(0,floor-2,0,H);
  bands.addColorStop(0,night?"#131c3515":"#fff3c515");bands.addColorStop(.67,"#221f3407");bands.addColorStop(1,"#17202d32");
  box(0,floor-2,width,H-floor+2,bands);
  if(paved){
    const glow=level===13?"#6edbd249":level===1?"#ffcc8e68":"#ffe3ba4a";
    stroke([0,floor+4,width,floor+4],glow,1.1);
    const tile=level===13?114:72;
    for(let x=-(d%tile)-tile;x<width+tile;x+=tile){
      if([4,13,15].includes(level)){
        stroke([x,floor+42,x+tile*.38,floor+42],glow,2);
        if(level===13)stroke([x+4,floor+5,x+19,floor+5],"#ff86a96c",2);
      }else{
        stroke([x,floor+5,x-12,floor+23,x+23,floor+23],"#6c52612e",1);
        stroke([x+25,floor+24,x+14,floor+43,x+51,floor+43],"#fff1c52c",1);
      }
    }
  }else{
    const start=Math.floor(d/33);
    for(let i=start;i<start+Math.ceil(width/33)+1;i++){
      const hash=Math.imul(i+17,2654435761)>>>0,x=i*33-d,y=floor+8+(hash%33);
      oval(x,y,2+hash%3,.8+(hash%2)*.4,night?"#c5dc972e":"#493d4438");
      if(i%3===0)stroke([x+4,y-1,x+8,y-1.5],"#ffe7ad4a",1);
    }
  }
}

// Do not introduce a field session on top of hazards already saved inside its corridor.
if(g&&(old.rules||0)<10){
  g.shield=0;g.duckUntil=0;
  g.show=(g.next<showBounds()[0]-1100&&secondsAt(g.d)<32)?makeShow(g.rng):null;
  for(const o of g.items)if(o.done&&isEncounter(o)&&o.exitTime!=null&&o.exitD==null)o.exitD=g.d;
}
// Articulated foreground cast. Meshes stay in bone-local coordinates and share one depth buffer.
/* OGL 1.0.11 · oframe/ogl @ 385ce65c352c70734a36dc98c787fdd1d30ddb3b · Unlicense. https://github.com/oframe/ogl */
const OGL=(()=>{const modules={};
modules.Vec3Func=(()=>{
const EPSILON = 0.000001;

/**
 * Calculates the length of a vec3
 *
 * @param {vec3} a vector to calculate length of
 * @returns {Number} length of a
 */
function length(a) {
    let x = a[0];
    let y = a[1];
    let z = a[2];
    return Math.sqrt(x * x + y * y + z * z);
}

/**
 * Copy the values from one vec3 to another
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the source vector
 * @returns {vec3} out
 */
function copy(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    return out;
}

/**
 * Set the components of a vec3 to the given values
 *
 * @param {vec3} out the receiving vector
 * @param {Number} x X component
 * @param {Number} y Y component
 * @param {Number} z Z component
 * @returns {vec3} out
 */
function set(out, x, y, z) {
    out[0] = x;
    out[1] = y;
    out[2] = z;
    return out;
}

/**
 * Adds two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
function add(out, a, b) {
    out[0] = a[0] + b[0];
    out[1] = a[1] + b[1];
    out[2] = a[2] + b[2];
    return out;
}

/**
 * Subtracts vector b from vector a
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
function subtract(out, a, b) {
    out[0] = a[0] - b[0];
    out[1] = a[1] - b[1];
    out[2] = a[2] - b[2];
    return out;
}

/**
 * Multiplies two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
function multiply(out, a, b) {
    out[0] = a[0] * b[0];
    out[1] = a[1] * b[1];
    out[2] = a[2] * b[2];
    return out;
}

/**
 * Divides two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
function divide(out, a, b) {
    out[0] = a[0] / b[0];
    out[1] = a[1] / b[1];
    out[2] = a[2] / b[2];
    return out;
}

/**
 * Scales a vec3 by a scalar number
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the vector to scale
 * @param {Number} b amount to scale the vector by
 * @returns {vec3} out
 */
function scale(out, a, b) {
    out[0] = a[0] * b;
    out[1] = a[1] * b;
    out[2] = a[2] * b;
    return out;
}

/**
 * Calculates the euclidian distance between two vec3's
 *
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {Number} distance between a and b
 */
function distance(a, b) {
    let x = b[0] - a[0];
    let y = b[1] - a[1];
    let z = b[2] - a[2];
    return Math.sqrt(x * x + y * y + z * z);
}

/**
 * Calculates the squared euclidian distance between two vec3's
 *
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {Number} squared distance between a and b
 */
function squaredDistance(a, b) {
    let x = b[0] - a[0];
    let y = b[1] - a[1];
    let z = b[2] - a[2];
    return x * x + y * y + z * z;
}

/**
 * Calculates the squared length of a vec3
 *
 * @param {vec3} a vector to calculate squared length of
 * @returns {Number} squared length of a
 */
function squaredLength(a) {
    let x = a[0];
    let y = a[1];
    let z = a[2];
    return x * x + y * y + z * z;
}

/**
 * Negates the components of a vec3
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a vector to negate
 * @returns {vec3} out
 */
function negate(out, a) {
    out[0] = -a[0];
    out[1] = -a[1];
    out[2] = -a[2];
    return out;
}

/**
 * Returns the inverse of the components of a vec3
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a vector to invert
 * @returns {vec3} out
 */
function inverse(out, a) {
    out[0] = 1.0 / a[0];
    out[1] = 1.0 / a[1];
    out[2] = 1.0 / a[2];
    return out;
}

/**
 * Normalize a vec3
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a vector to normalize
 * @returns {vec3} out
 */
function normalize(out, a) {
    let x = a[0];
    let y = a[1];
    let z = a[2];
    let len = x * x + y * y + z * z;
    if (len > 0) {
        //TODO: evaluate use of glm_invsqrt here?
        len = 1 / Math.sqrt(len);
    }
    out[0] = a[0] * len;
    out[1] = a[1] * len;
    out[2] = a[2] * len;
    return out;
}

/**
 * Calculates the dot product of two vec3's
 *
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {Number} dot product of a and b
 */
function dot(a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

/**
 * Computes the cross product of two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
function cross(out, a, b) {
    let ax = a[0],
        ay = a[1],
        az = a[2];
    let bx = b[0],
        by = b[1],
        bz = b[2];

    out[0] = ay * bz - az * by;
    out[1] = az * bx - ax * bz;
    out[2] = ax * by - ay * bx;
    return out;
}

/**
 * Performs a linear interpolation between two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @param {Number} t interpolation amount between the two inputs
 * @returns {vec3} out
 */
function lerp(out, a, b, t) {
    let ax = a[0];
    let ay = a[1];
    let az = a[2];
    out[0] = ax + t * (b[0] - ax);
    out[1] = ay + t * (b[1] - ay);
    out[2] = az + t * (b[2] - az);
    return out;
}

/**
 * Performs a frame rate independant, linear interpolation between two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @param {Number} decay decay constant for interpolation. useful range between 1 and 25, from slow to fast.
 * @param {Number} dt delta time
 * @returns {vec3} out
 */
function smoothLerp(out, a, b, decay, dt) {
    const exp = Math.exp(-decay * dt);
    let ax = a[0];
    let ay = a[1];
    let az = a[2];

    out[0] = b[0] + (ax - b[0]) * exp;
    out[1] = b[1] + (ay - b[1]) * exp;
    out[2] = b[2] + (az - b[2]) * exp;
    return out;
}

/**
 * Transforms the vec3 with a mat4.
 * 4th vector component is implicitly '1'
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the vector to transform
 * @param {mat4} m matrix to transform with
 * @returns {vec3} out
 */
function transformMat4(out, a, m) {
    let x = a[0],
        y = a[1],
        z = a[2];
    let w = m[3] * x + m[7] * y + m[11] * z + m[15];
    w = w || 1.0;
    out[0] = (m[0] * x + m[4] * y + m[8] * z + m[12]) / w;
    out[1] = (m[1] * x + m[5] * y + m[9] * z + m[13]) / w;
    out[2] = (m[2] * x + m[6] * y + m[10] * z + m[14]) / w;
    return out;
}

/**
 * Same as above but doesn't apply translation.
 * Useful for rays.
 */
function scaleRotateMat4(out, a, m) {
    let x = a[0],
        y = a[1],
        z = a[2];
    let w = m[3] * x + m[7] * y + m[11] * z + m[15];
    w = w || 1.0;
    out[0] = (m[0] * x + m[4] * y + m[8] * z) / w;
    out[1] = (m[1] * x + m[5] * y + m[9] * z) / w;
    out[2] = (m[2] * x + m[6] * y + m[10] * z) / w;
    return out;
}

/**
 * Transforms the vec3 with a mat3.
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the vector to transform
 * @param {mat3} m the 3x3 matrix to transform with
 * @returns {vec3} out
 */
function transformMat3(out, a, m) {
    let x = a[0],
        y = a[1],
        z = a[2];
    out[0] = x * m[0] + y * m[3] + z * m[6];
    out[1] = x * m[1] + y * m[4] + z * m[7];
    out[2] = x * m[2] + y * m[5] + z * m[8];
    return out;
}

/**
 * Transforms the vec3 with a quat
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the vector to transform
 * @param {quat} q quaternion to transform with
 * @returns {vec3} out
 */
function transformQuat(out, a, q) {
    // benchmarks: https://jsperf.com/quaternion-transform-vec3-implementations-fixed

    let x = a[0],
        y = a[1],
        z = a[2];
    let qx = q[0],
        qy = q[1],
        qz = q[2],
        qw = q[3];

    let uvx = qy * z - qz * y;
    let uvy = qz * x - qx * z;
    let uvz = qx * y - qy * x;

    let uuvx = qy * uvz - qz * uvy;
    let uuvy = qz * uvx - qx * uvz;
    let uuvz = qx * uvy - qy * uvx;

    let w2 = qw * 2;
    uvx *= w2;
    uvy *= w2;
    uvz *= w2;

    uuvx *= 2;
    uuvy *= 2;
    uuvz *= 2;

    out[0] = x + uvx + uuvx;
    out[1] = y + uvy + uuvy;
    out[2] = z + uvz + uuvz;
    return out;
}

/**
 * Get the angle between two 3D vectors
 * @param {vec3} a The first operand
 * @param {vec3} b The second operand
 * @returns {Number} The angle in radians
 */
const angle = (function () {
    const tempA = [0, 0, 0];
    const tempB = [0, 0, 0];

    return function (a, b) {
        copy(tempA, a);
        copy(tempB, b);

        normalize(tempA, tempA);
        normalize(tempB, tempB);

        let cosine = dot(tempA, tempB);

        if (cosine > 1.0) {
            return 0;
        } else if (cosine < -1.0) {
            return Math.PI;
        } else {
            return Math.acos(cosine);
        }
    };
})();

/**
 * Returns whether or not the vectors have exactly the same elements in the same position (when compared with ===)
 *
 * @param {vec3} a The first vector.
 * @param {vec3} b The second vector.
 * @returns {Boolean} True if the vectors are equal, false otherwise.
 */
function exactEquals(a, b) {
    return a[0] === b[0] && a[1] === b[1] && a[2] === b[2];
}

return {length,copy,set,add,subtract,multiply,divide,scale,distance,squaredDistance,squaredLength,negate,inverse,normalize,dot,cross,lerp,smoothLerp,transformMat4,scaleRotateMat4,transformMat3,transformQuat,angle,exactEquals};})();
modules.Vec3=(()=>{
const Vec3Func=modules.Vec3Func;

class Vec3 extends Array {
    constructor(x = 0, y = x, z = x) {
        super(x, y, z);
        return this;
    }

    get x() {
        return this[0];
    }

    get y() {
        return this[1];
    }

    get z() {
        return this[2];
    }

    set x(v) {
        this[0] = v;
    }

    set y(v) {
        this[1] = v;
    }

    set z(v) {
        this[2] = v;
    }

    set(x, y = x, z = x) {
        if (x.length) return this.copy(x);
        Vec3Func.set(this, x, y, z);
        return this;
    }

    copy(v) {
        Vec3Func.copy(this, v);
        return this;
    }

    add(va, vb) {
        if (vb) Vec3Func.add(this, va, vb);
        else Vec3Func.add(this, this, va);
        return this;
    }

    sub(va, vb) {
        if (vb) Vec3Func.subtract(this, va, vb);
        else Vec3Func.subtract(this, this, va);
        return this;
    }

    multiply(v) {
        if (v.length) Vec3Func.multiply(this, this, v);
        else Vec3Func.scale(this, this, v);
        return this;
    }

    divide(v) {
        if (v.length) Vec3Func.divide(this, this, v);
        else Vec3Func.scale(this, this, 1 / v);
        return this;
    }

    inverse(v = this) {
        Vec3Func.inverse(this, v);
        return this;
    }

    // Can't use 'length' as Array.prototype uses it
    len() {
        return Vec3Func.length(this);
    }

    distance(v) {
        if (v) return Vec3Func.distance(this, v);
        else return Vec3Func.length(this);
    }

    squaredLen() {
        return Vec3Func.squaredLength(this);
    }

    squaredDistance(v) {
        if (v) return Vec3Func.squaredDistance(this, v);
        else return Vec3Func.squaredLength(this);
    }

    negate(v = this) {
        Vec3Func.negate(this, v);
        return this;
    }

    cross(va, vb) {
        if (vb) Vec3Func.cross(this, va, vb);
        else Vec3Func.cross(this, this, va);
        return this;
    }

    scale(v) {
        Vec3Func.scale(this, this, v);
        return this;
    }

    normalize() {
        Vec3Func.normalize(this, this);
        return this;
    }

    dot(v) {
        return Vec3Func.dot(this, v);
    }

    equals(v) {
        return Vec3Func.exactEquals(this, v);
    }

    applyMatrix3(mat3) {
        Vec3Func.transformMat3(this, this, mat3);
        return this;
    }

    applyMatrix4(mat4) {
        Vec3Func.transformMat4(this, this, mat4);
        return this;
    }

    scaleRotateMatrix4(mat4) {
        Vec3Func.scaleRotateMat4(this, this, mat4);
        return this;
    }

    applyQuaternion(q) {
        Vec3Func.transformQuat(this, this, q);
        return this;
    }

    angle(v) {
        return Vec3Func.angle(this, v);
    }

    lerp(v, t) {
        Vec3Func.lerp(this, this, v, t);
        return this;
    }

    smoothLerp(v, decay, dt) {
        Vec3Func.smoothLerp(this, this, v, decay, dt);
        return this;
    }

    clone() {
        return new Vec3(this[0], this[1], this[2]);
    }

    fromArray(a, o = 0) {
        this[0] = a[o];
        this[1] = a[o + 1];
        this[2] = a[o + 2];
        return this;
    }

    toArray(a = [], o = 0) {
        a[o] = this[0];
        a[o + 1] = this[1];
        a[o + 2] = this[2];
        return a;
    }

    transformDirection(mat4) {
        const x = this[0];
        const y = this[1];
        const z = this[2];

        this[0] = mat4[0] * x + mat4[4] * y + mat4[8] * z;
        this[1] = mat4[1] * x + mat4[5] * y + mat4[9] * z;
        this[2] = mat4[2] * x + mat4[6] * y + mat4[10] * z;

        return this.normalize();
    }
}

return {Vec3};})();
modules.Renderer=(()=>{
const { Vec3 }=modules.Vec3;

// TODO: Handle context loss https://www.khronos.org/webgl/wiki/HandlingContextLost

// Not automatic - devs to use these methods manually
// gl.colorMask( colorMask, colorMask, colorMask, colorMask );
// gl.clearColor( r, g, b, a );
// gl.stencilMask( stencilMask );
// gl.stencilFunc( stencilFunc, stencilRef, stencilMask );
// gl.stencilOp( stencilFail, stencilZFail, stencilZPass );
// gl.clearStencil( stencil );

const tempVec3 = /* @__PURE__ */ new Vec3();
let ID = 1;

class Renderer {
    constructor({
        canvas = document.createElement('canvas'),
        width = 300,
        height = 150,
        dpr = 1,
        alpha = false,
        depth = true,
        stencil = false,
        antialias = false,
        premultipliedAlpha = false,
        preserveDrawingBuffer = false,
        powerPreference = 'default',
        autoClear = true,
        webgl = 2,
    } = {}) {
        const attributes = { alpha, depth, stencil, antialias, premultipliedAlpha, preserveDrawingBuffer, powerPreference };
        this.dpr = dpr;
        this.alpha = alpha;
        this.color = true;
        this.depth = depth;
        this.stencil = stencil;
        this.premultipliedAlpha = premultipliedAlpha;
        this.autoClear = autoClear;
        this.id = ID++;

        // Attempt WebGL2 unless forced to 1, if not supported fallback to WebGL1
        if (webgl === 2) this.gl = canvas.getContext('webgl2', attributes);
        this.isWebgl2 = !!this.gl;
        if (!this.gl) this.gl = canvas.getContext('webgl', attributes);
        if (!this.gl) console.error('unable to create webgl context');

        // Attach renderer to gl so that all classes have access to internal state functions
        this.gl.renderer = this;

        // initialise size values
        this.setSize(width, height);

        // gl state stores to avoid redundant calls on methods used internally
        this.state = {};
        this.state.blendFunc = { src: this.gl.ONE, dst: this.gl.ZERO };
        this.state.blendEquation = { modeRGB: this.gl.FUNC_ADD };
        this.state.cullFace = false;
        this.state.frontFace = this.gl.CCW;
        this.state.depthMask = true;
        this.state.depthFunc = this.gl.LEQUAL;
        this.state.premultiplyAlpha = false;
        this.state.flipY = false;
        this.state.unpackAlignment = 4;
        this.state.framebuffer = null;
        this.state.viewport = { x: 0, y: 0, width: null, height: null };
        this.state.textureUnits = [];
        this.state.activeTextureUnit = 0;
        this.state.boundBuffer = null;
        this.state.uniformLocations = new Map();
        this.state.currentProgram = null;

        // store requested extensions
        this.extensions = {};

        // Initialise extra format types
        if (this.isWebgl2) {
            this.getExtension('EXT_color_buffer_float');
            this.getExtension('OES_texture_float_linear');
        } else {
            this.getExtension('OES_texture_float');
            this.getExtension('OES_texture_float_linear');
            this.getExtension('OES_texture_half_float');
            this.getExtension('OES_texture_half_float_linear');
            this.getExtension('OES_element_index_uint');
            this.getExtension('OES_standard_derivatives');
            this.getExtension('EXT_sRGB');
            this.getExtension('WEBGL_depth_texture');
            this.getExtension('WEBGL_draw_buffers');
        }
        this.getExtension('WEBGL_compressed_texture_astc');
        this.getExtension('EXT_texture_compression_bptc');
        this.getExtension('WEBGL_compressed_texture_s3tc');
        this.getExtension('WEBGL_compressed_texture_etc1');
        this.getExtension('WEBGL_compressed_texture_pvrtc');
        this.getExtension('WEBKIT_WEBGL_compressed_texture_pvrtc');

        // Create method aliases using extension (WebGL1) or native if available (WebGL2)
        this.vertexAttribDivisor = this.getExtension('ANGLE_instanced_arrays', 'vertexAttribDivisor', 'vertexAttribDivisorANGLE');
        this.drawArraysInstanced = this.getExtension('ANGLE_instanced_arrays', 'drawArraysInstanced', 'drawArraysInstancedANGLE');
        this.drawElementsInstanced = this.getExtension('ANGLE_instanced_arrays', 'drawElementsInstanced', 'drawElementsInstancedANGLE');
        this.createVertexArray = this.getExtension('OES_vertex_array_object', 'createVertexArray', 'createVertexArrayOES');
        this.bindVertexArray = this.getExtension('OES_vertex_array_object', 'bindVertexArray', 'bindVertexArrayOES');
        this.deleteVertexArray = this.getExtension('OES_vertex_array_object', 'deleteVertexArray', 'deleteVertexArrayOES');
        this.drawBuffers = this.getExtension('WEBGL_draw_buffers', 'drawBuffers', 'drawBuffersWEBGL');

        // Store device parameters
        this.parameters = {};
        this.parameters.maxTextureUnits = this.gl.getParameter(this.gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS);
        this.parameters.maxAnisotropy = this.getExtension('EXT_texture_filter_anisotropic')
            ? this.gl.getParameter(this.getExtension('EXT_texture_filter_anisotropic').MAX_TEXTURE_MAX_ANISOTROPY_EXT)
            : 0;
    }

    setSize(width, height) {
        this.width = width;
        this.height = height;

        this.gl.canvas.width = width * this.dpr;
        this.gl.canvas.height = height * this.dpr;

        if (!this.gl.canvas.style) return;
        Object.assign(this.gl.canvas.style, {
            width: width + 'px',
            height: height + 'px',
        });
    }

    setViewport(width, height, x = 0, y = 0) {
        if (this.state.viewport.width === width && this.state.viewport.height === height) return;
        this.state.viewport.width = width;
        this.state.viewport.height = height;
        this.state.viewport.x = x;
        this.state.viewport.y = y;
        this.gl.viewport(x, y, width, height);
    }

    setScissor(width, height, x = 0, y = 0) {
        this.gl.scissor(x, y, width, height);
    }

    enable(id) {
        if (this.state[id] === true) return;
        this.gl.enable(id);
        this.state[id] = true;
    }

    disable(id) {
        if (this.state[id] === false) return;
        this.gl.disable(id);
        this.state[id] = false;
    }

    setBlendFunc(src, dst, srcAlpha, dstAlpha) {
        if (
            this.state.blendFunc.src === src &&
            this.state.blendFunc.dst === dst &&
            this.state.blendFunc.srcAlpha === srcAlpha &&
            this.state.blendFunc.dstAlpha === dstAlpha
        )
            return;
        this.state.blendFunc.src = src;
        this.state.blendFunc.dst = dst;
        this.state.blendFunc.srcAlpha = srcAlpha;
        this.state.blendFunc.dstAlpha = dstAlpha;
        if (srcAlpha !== undefined) this.gl.blendFuncSeparate(src, dst, srcAlpha, dstAlpha);
        else this.gl.blendFunc(src, dst);
    }

    setBlendEquation(modeRGB, modeAlpha) {
        modeRGB = modeRGB || this.gl.FUNC_ADD;
        if (this.state.blendEquation.modeRGB === modeRGB && this.state.blendEquation.modeAlpha === modeAlpha) return;
        this.state.blendEquation.modeRGB = modeRGB;
        this.state.blendEquation.modeAlpha = modeAlpha;
        if (modeAlpha !== undefined) this.gl.blendEquationSeparate(modeRGB, modeAlpha);
        else this.gl.blendEquation(modeRGB);
    }

    setCullFace(value) {
        if (this.state.cullFace === value) return;
        this.state.cullFace = value;
        this.gl.cullFace(value);
    }

    setFrontFace(value) {
        if (this.state.frontFace === value) return;
        this.state.frontFace = value;
        this.gl.frontFace(value);
    }

    setDepthMask(value) {
        if (this.state.depthMask === value) return;
        this.state.depthMask = value;
        this.gl.depthMask(value);
    }

    setDepthFunc(value) {
        if (this.state.depthFunc === value) return;
        this.state.depthFunc = value;
        this.gl.depthFunc(value);
    }

    setStencilMask(value) {
        if (this.state.stencilMask === value) return;
        this.state.stencilMask = value;
        this.gl.stencilMask(value);
    }

    setStencilFunc(func, ref, mask) {
        if (
            this.state.stencilFunc === func &&
            this.state.stencilRef === ref &&
            this.state.stencilFuncMask === mask
        )
            return;
        this.state.stencilFunc = func || this.gl.ALWAYS;
        this.state.stencilRef = ref || 0;
        this.state.stencilFuncMask = mask || 0;
        this.gl.stencilFunc(func || this.gl.ALWAYS, ref || 0, mask || 0);
    }

    setStencilOp(stencilFail, depthFail, depthPass) {
        if (
            this.state.stencilFail === stencilFail &&
            this.state.stencilDepthFail === depthFail &&
            this.state.stencilDepthPass === depthPass
        )
            return;
        this.state.stencilFail = stencilFail;
        this.state.stencilDepthFail = depthFail;
        this.state.stencilDepthPass = depthPass;
        this.gl.stencilOp(stencilFail, depthFail, depthPass);
    }

    activeTexture(value) {
        if (this.state.activeTextureUnit === value) return;
        this.state.activeTextureUnit = value;
        this.gl.activeTexture(this.gl.TEXTURE0 + value);
    }

    bindFramebuffer({ target = this.gl.FRAMEBUFFER, buffer = null } = {}) {
        if (this.state.framebuffer === buffer) return;
        this.state.framebuffer = buffer;
        this.gl.bindFramebuffer(target, buffer);
    }

    getExtension(extension, webgl2Func, extFunc) {
        // if webgl2 function supported, return func bound to gl context
        if (webgl2Func && this.gl[webgl2Func]) return this.gl[webgl2Func].bind(this.gl);

        // fetch extension once only
        if (!this.extensions[extension]) {
            this.extensions[extension] = this.gl.getExtension(extension);
        }

        // return extension if no function requested
        if (!webgl2Func) return this.extensions[extension];

        // Return null if extension not supported
        if (!this.extensions[extension]) return null;

        // return extension function, bound to extension
        return this.extensions[extension][extFunc].bind(this.extensions[extension]);
    }

    sortOpaque(a, b) {
        if (a.renderOrder !== b.renderOrder) {
            return a.renderOrder - b.renderOrder;
        } else if (a.program.id !== b.program.id) {
            return a.program.id - b.program.id;
        } else if (a.zDepth !== b.zDepth) {
            return a.zDepth - b.zDepth;
        } else {
            return b.id - a.id;
        }
    }

    sortTransparent(a, b) {
        if (a.renderOrder !== b.renderOrder) {
            return a.renderOrder - b.renderOrder;
        }
        if (a.zDepth !== b.zDepth) {
            return b.zDepth - a.zDepth;
        } else {
            return b.id - a.id;
        }
    }

    sortUI(a, b) {
        if (a.renderOrder !== b.renderOrder) {
            return a.renderOrder - b.renderOrder;
        } else if (a.program.id !== b.program.id) {
            return a.program.id - b.program.id;
        } else {
            return b.id - a.id;
        }
    }

    getRenderList({ scene, camera, frustumCull, sort }) {
        let renderList = [];

        if (camera && frustumCull) camera.updateFrustum();

        // Get visible
        scene.traverse((node) => {
            if (!node.visible) return true;
            if (!node.draw) return;

            if (frustumCull && node.frustumCulled && camera) {
                if (!camera.frustumIntersectsMesh(node)) return;
            }

            renderList.push(node);
        });

        if (sort) {
            const opaque = [];
            const transparent = []; // depthTest true
            const ui = []; // depthTest false

            renderList.forEach((node) => {
                // Split into the 3 render groups
                if (!node.program.transparent) {
                    opaque.push(node);
                } else if (node.program.depthTest) {
                    transparent.push(node);
                } else {
                    ui.push(node);
                }

                node.zDepth = 0;

                // Only calculate z-depth if renderOrder unset and depthTest is true
                if (node.renderOrder !== 0 || !node.program.depthTest || !camera) return;

                // update z-depth
                node.worldMatrix.getTranslation(tempVec3);
                tempVec3.applyMatrix4(camera.projectionViewMatrix);
                node.zDepth = tempVec3.z;
            });

            opaque.sort(this.sortOpaque);
            transparent.sort(this.sortTransparent);
            ui.sort(this.sortUI);

            renderList = opaque.concat(transparent, ui);
        }

        return renderList;
    }

    render({ scene, camera, target = null, update = true, sort = true, frustumCull = true, clear }) {
        if (target === null) {
            // make sure no render target bound so draws to canvas
            this.bindFramebuffer();
            this.setViewport(this.width * this.dpr, this.height * this.dpr);
        } else {
            // bind supplied render target and update viewport
            this.bindFramebuffer(target);
            this.setViewport(target.width, target.height);
        }

        if (clear || (this.autoClear && clear !== false)) {
            // Ensure depth buffer writing is enabled so it can be cleared
            if (this.depth && (!target || target.depth)) {
                this.enable(this.gl.DEPTH_TEST);
                this.setDepthMask(true);
            }

            // Same for stencil
            if (this.stencil || !target || target.stencil) {
                this.enable(this.gl.STENCIL_TEST);
                this.setStencilMask(0xff);
            }

            this.gl.clear(
                (this.color ? this.gl.COLOR_BUFFER_BIT : 0) |
                    (this.depth ? this.gl.DEPTH_BUFFER_BIT : 0) |
                    (this.stencil ? this.gl.STENCIL_BUFFER_BIT : 0)
            );
        }

        // updates all scene graph matrices
        if (update) scene.updateMatrixWorld();

        // Update camera separately, in case not in scene graph
        if (camera) camera.updateMatrixWorld();

        // Get render list - entails culling and sorting
        const renderList = this.getRenderList({ scene, camera, frustumCull, sort });

        renderList.forEach((node) => {
            node.draw({ camera });
        });
    }
}

return {Renderer};})();
modules.Program=(()=>{
// TODO: upload empty texture if null ? maybe not
// TODO: upload identity matrix if null ?
// TODO: sampler Cube

let ID = 1;

// cache of typed arrays used to flatten uniform arrays
const arrayCacheF32 = {};

class Program {
    constructor(
        gl,
        {
            vertex,
            fragment,
            uniforms = {},

            transparent = false,
            cullFace = gl.BACK,
            frontFace = gl.CCW,
            depthTest = true,
            depthWrite = true,
            depthFunc = gl.LEQUAL,
        } = {}
    ) {
        if (!gl.canvas) console.error('gl not passed as first argument to Program');
        this.gl = gl;
        this.uniforms = uniforms;
        this.id = ID++;

        if (!vertex) console.warn('vertex shader not supplied');
        if (!fragment) console.warn('fragment shader not supplied');

        // Store program state
        this.transparent = transparent;
        this.cullFace = cullFace;
        this.frontFace = frontFace;
        this.depthTest = depthTest;
        this.depthWrite = depthWrite;
        this.depthFunc = depthFunc;
        this.blendFunc = {};
        this.blendEquation = {};
        this.stencilFunc = {};
        this.stencilOp = {};

        // set default blendFunc if transparent flagged
        if (this.transparent && !this.blendFunc.src) {
            if (this.gl.renderer.premultipliedAlpha) this.setBlendFunc(this.gl.ONE, this.gl.ONE_MINUS_SRC_ALPHA);
            else this.setBlendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
        }

        // Create empty shaders and attach to program
        this.vertexShader = gl.createShader(gl.VERTEX_SHADER);
        this.fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        this.program = gl.createProgram();
        gl.attachShader(this.program, this.vertexShader);
        gl.attachShader(this.program, this.fragmentShader);

        // Compile shaders with source
        this.setShaders({ vertex, fragment });
    }

    setShaders({ vertex, fragment }) {
        if (vertex) {
            // compile vertex shader and log errors
            this.gl.shaderSource(this.vertexShader, vertex);
            this.gl.compileShader(this.vertexShader);
            if (this.gl.getShaderInfoLog(this.vertexShader) !== '') {
                console.warn(`${this.gl.getShaderInfoLog(this.vertexShader)}\nVertex Shader\n${addLineNumbers(vertex)}`);
            }
        }

        if (fragment) {
            // compile fragment shader and log errors
            this.gl.shaderSource(this.fragmentShader, fragment);
            this.gl.compileShader(this.fragmentShader);
            if (this.gl.getShaderInfoLog(this.fragmentShader) !== '') {
                console.warn(`${this.gl.getShaderInfoLog(this.fragmentShader)}\nFragment Shader\n${addLineNumbers(fragment)}`);
            }
        }

        // compile program and log errors
        this.gl.linkProgram(this.program);
        if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
            return console.warn(this.gl.getProgramInfoLog(this.program));
        }

        // Get active uniform locations
        this.uniformLocations = new Map();
        let numUniforms = this.gl.getProgramParameter(this.program, this.gl.ACTIVE_UNIFORMS);
        for (let uIndex = 0; uIndex < numUniforms; uIndex++) {
            let uniform = this.gl.getActiveUniform(this.program, uIndex);
            this.uniformLocations.set(uniform, this.gl.getUniformLocation(this.program, uniform.name));

            // split uniforms' names to separate array and struct declarations
            const split = uniform.name.match(/(\w+)/g);

            uniform.uniformName = split[0];
            uniform.nameComponents = split.slice(1);
        }

        // Get active attribute locations
        this.attributeLocations = new Map();
        const locations = [];
        const numAttribs = this.gl.getProgramParameter(this.program, this.gl.ACTIVE_ATTRIBUTES);
        for (let aIndex = 0; aIndex < numAttribs; aIndex++) {
            const attribute = this.gl.getActiveAttrib(this.program, aIndex);
            const location = this.gl.getAttribLocation(this.program, attribute.name);
            // Ignore special built-in inputs. eg gl_VertexID, gl_InstanceID
            if (location === -1) continue;
            locations[location] = attribute.name;
            this.attributeLocations.set(attribute, location);
        }
        this.attributeOrder = locations.join('');
    }

    setBlendFunc(src, dst, srcAlpha, dstAlpha) {
        this.blendFunc.src = src;
        this.blendFunc.dst = dst;
        this.blendFunc.srcAlpha = srcAlpha;
        this.blendFunc.dstAlpha = dstAlpha;
        if (src) this.transparent = true;
    }

    setBlendEquation(modeRGB, modeAlpha) {
        this.blendEquation.modeRGB = modeRGB;
        this.blendEquation.modeAlpha = modeAlpha;
    }

    setStencilFunc(func, ref, mask) {
        this.stencilRef = ref;
        this.stencilFunc.func = func;
        this.stencilFunc.ref = ref;
        this.stencilFunc.mask = mask;
    }

    setStencilOp(stencilFail, depthFail, depthPass) {
        this.stencilOp.stencilFail = stencilFail;
        this.stencilOp.depthFail = depthFail;
        this.stencilOp.depthPass = depthPass;
    }

    applyState() {
        if (this.depthTest) this.gl.renderer.enable(this.gl.DEPTH_TEST);
        else this.gl.renderer.disable(this.gl.DEPTH_TEST);

        if (this.cullFace) this.gl.renderer.enable(this.gl.CULL_FACE);
        else this.gl.renderer.disable(this.gl.CULL_FACE);

        if (this.blendFunc.src) this.gl.renderer.enable(this.gl.BLEND);
        else this.gl.renderer.disable(this.gl.BLEND);

        if (this.cullFace) this.gl.renderer.setCullFace(this.cullFace);
        this.gl.renderer.setFrontFace(this.frontFace);
        this.gl.renderer.setDepthMask(this.depthWrite);
        this.gl.renderer.setDepthFunc(this.depthFunc);
        if (this.blendFunc.src) this.gl.renderer.setBlendFunc(this.blendFunc.src, this.blendFunc.dst, this.blendFunc.srcAlpha, this.blendFunc.dstAlpha);
        this.gl.renderer.setBlendEquation(this.blendEquation.modeRGB, this.blendEquation.modeAlpha);

        if (this.stencilFunc.func || this.stencilOp.stencilFail) this.gl.renderer.enable(this.gl.STENCIL_TEST);
        else this.gl.renderer.disable(this.gl.STENCIL_TEST);

        this.gl.renderer.setStencilFunc(this.stencilFunc.func, this.stencilFunc.ref, this.stencilFunc.mask);
        this.gl.renderer.setStencilOp(this.stencilOp.stencilFail, this.stencilOp.depthFail, this.stencilOp.depthPass);
    }

    use({ flipFaces = false } = {}) {
        let textureUnit = -1;
        const programActive = this.gl.renderer.state.currentProgram === this.id;

        // Avoid gl call if program already in use
        if (!programActive) {
            this.gl.useProgram(this.program);
            this.gl.renderer.state.currentProgram = this.id;
        }

        // Set only the active uniforms found in the shader
        this.uniformLocations.forEach((location, activeUniform) => {
            let uniform = this.uniforms[activeUniform.uniformName];

            for (const component of activeUniform.nameComponents) {
                if (!uniform) break;

                if (component in uniform) {
                    uniform = uniform[component];
                } else if (Array.isArray(uniform.value)) {
                    break;
                } else {
                    uniform = undefined;
                    break;
                }
            }

            if (!uniform) {
                return warn(`Active uniform ${activeUniform.name} has not been supplied`);
            }

            if (uniform && uniform.value === undefined) {
                return warn(`${activeUniform.name} uniform is missing a value parameter`);
            }

            if (uniform.value.texture) {
                textureUnit = textureUnit + 1;

                // Check if texture needs to be updated
                uniform.value.update(textureUnit);
                return setUniform(this.gl, activeUniform.type, location, textureUnit);
            }

            // For texture arrays, set uniform as an array of texture units instead of just one
            if (uniform.value.length && uniform.value[0].texture) {
                const textureUnits = [];
                uniform.value.forEach((value) => {
                    textureUnit = textureUnit + 1;
                    value.update(textureUnit);
                    textureUnits.push(textureUnit);
                });

                return setUniform(this.gl, activeUniform.type, location, textureUnits);
            }

            setUniform(this.gl, activeUniform.type, location, uniform.value);
        });

        this.applyState();
        if (flipFaces) this.gl.renderer.setFrontFace(this.frontFace === this.gl.CCW ? this.gl.CW : this.gl.CCW);
    }

    remove() {
        this.gl.deleteProgram(this.program);
    }
}

function setUniform(gl, type, location, value) {
    value = value.length ? flatten(value) : value;
    const setValue = gl.renderer.state.uniformLocations.get(location);

    // Avoid redundant uniform commands
    if (value.length) {
        if (setValue === undefined || setValue.length !== value.length) {
            // clone array to store as cache
            gl.renderer.state.uniformLocations.set(location, value.slice(0));
        } else {
            if (arraysEqual(setValue, value)) return;

            // Update cached array values
            setValue.set ? setValue.set(value) : setArray(setValue, value);
            gl.renderer.state.uniformLocations.set(location, setValue);
        }
    } else {
        if (setValue === value) return;
        gl.renderer.state.uniformLocations.set(location, value);
    }

    switch (type) {
        case 5126:
            return value.length ? gl.uniform1fv(location, value) : gl.uniform1f(location, value); // FLOAT
        case 35664:
            return gl.uniform2fv(location, value); // FLOAT_VEC2
        case 35665:
            return gl.uniform3fv(location, value); // FLOAT_VEC3
        case 35666:
            return gl.uniform4fv(location, value); // FLOAT_VEC4
        case 35670: // BOOL
        case 5124: // INT
        case 35678: // SAMPLER_2D
        case 36306: // U_SAMPLER_2D
        case 35680: // SAMPLER_CUBE
        case 36289: // SAMPLER_2D_ARRAY
            return value.length ? gl.uniform1iv(location, value) : gl.uniform1i(location, value); // SAMPLER_CUBE
        case 35671: // BOOL_VEC2
        case 35667:
            return gl.uniform2iv(location, value); // INT_VEC2
        case 35672: // BOOL_VEC3
        case 35668:
            return gl.uniform3iv(location, value); // INT_VEC3
        case 35673: // BOOL_VEC4
        case 35669:
            return gl.uniform4iv(location, value); // INT_VEC4
        case 35674:
            return gl.uniformMatrix2fv(location, false, value); // FLOAT_MAT2
        case 35675:
            return gl.uniformMatrix3fv(location, false, value); // FLOAT_MAT3
        case 35676:
            return gl.uniformMatrix4fv(location, false, value); // FLOAT_MAT4
    }
}

function addLineNumbers(string) {
    let lines = string.split('\n');
    for (let i = 0; i < lines.length; i++) {
        lines[i] = i + 1 + ': ' + lines[i];
    }
    return lines.join('\n');
}

function flatten(a) {
    const arrayLen = a.length;
    const valueLen = a[0].length;
    if (valueLen === undefined) return a;
    const length = arrayLen * valueLen;
    let value = arrayCacheF32[length];
    if (!value) arrayCacheF32[length] = value = new Float32Array(length);
    for (let i = 0; i < arrayLen; i++) value.set(a[i], i * valueLen);
    return value;
}

function arraysEqual(a, b) {
    if (a.length !== b.length) return false;
    for (let i = 0, l = a.length; i < l; i++) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}

function setArray(a, b) {
    for (let i = 0, l = a.length; i < l; i++) {
        a[i] = b[i];
    }
}

let warnCount = 0;
function warn(message) {
    if (warnCount > 100) return;
    console.warn(message);
    warnCount++;
    if (warnCount > 100) console.warn('More than 100 program warnings - stopping logs.');
}

return {Program};})();
modules.Geometry=(()=>{
// attribute params
// {
//     data - typed array eg UInt16Array for indices, Float32Array
//     size - int default 1
//     instanced - default null. Pass divisor amount
//     type - gl enum default gl.UNSIGNED_SHORT for 'index', gl.FLOAT for others
//     normalized - boolean default false

//     buffer - gl buffer, if buffer exists, don't need to provide data - although needs position data for bounds calculation
//     stride - default 0 - for when passing in buffer
//     offset - default 0 - for when passing in buffer
//     count - default null - for when passing in buffer
//     min - array - for when passing in buffer
//     max - array - for when passing in buffer
// }

// TODO: fit in transform feedback

const { Vec3 }=modules.Vec3;

const tempVec3 = /* @__PURE__ */ new Vec3();

let ID = 1;
let ATTR_ID = 1;

// To stop inifinite warnings
let isBoundsWarned = false;

class Geometry {
    constructor(gl, attributes = {}) {
        if (!gl.canvas) console.error('gl not passed as first argument to Geometry');
        this.gl = gl;
        this.attributes = attributes;
        this.id = ID++;

        // Store one VAO per program attribute locations order
        this.VAOs = {};

        this.drawRange = { start: 0, count: 0 };
        this.instancedCount = 0;

        // Unbind current VAO so that new buffers don't get added to active mesh
        this.gl.renderer.bindVertexArray(null);
        this.gl.renderer.currentGeometry = null;

        // Alias for state store to avoid redundant calls for global state
        this.glState = this.gl.renderer.state;

        // create the buffers
        for (let key in attributes) {
            this.addAttribute(key, attributes[key]);
        }
    }

    addAttribute(key, attr) {
        this.attributes[key] = attr;

        // Set options
        attr.id = ATTR_ID++; // TODO: currently unused, remove?
        attr.size = attr.size || 1;
        attr.type =
            attr.type ||
            (attr.data.constructor === Float32Array
                ? this.gl.FLOAT
                : attr.data.constructor === Uint16Array
                ? this.gl.UNSIGNED_SHORT
                : this.gl.UNSIGNED_INT); // Uint32Array
        attr.target = key === 'index' ? this.gl.ELEMENT_ARRAY_BUFFER : this.gl.ARRAY_BUFFER;
        attr.normalized = attr.normalized || false;
        attr.stride = attr.stride || 0;
        attr.offset = attr.offset || 0;
        attr.count = attr.count || (attr.stride ? attr.data.byteLength / attr.stride : attr.data.length / attr.size);
        attr.divisor = attr.instanced || 0;
        attr.needsUpdate = false;
        attr.usage = attr.usage || this.gl.STATIC_DRAW;

        if (!attr.buffer) {
            // Push data to buffer
            this.updateAttribute(attr);
        }

        // Update geometry counts. If indexed, ignore regular attributes
        if (attr.divisor) {
            this.isInstanced = true;
            if (this.instancedCount && this.instancedCount !== attr.count * attr.divisor) {
                console.warn('geometry has multiple instanced buffers of different length');
                return (this.instancedCount = Math.min(this.instancedCount, attr.count * attr.divisor));
            }
            this.instancedCount = attr.count * attr.divisor;
        } else if (key === 'index') {
            this.drawRange.count = attr.count;
        } else if (!this.attributes.index) {
            this.drawRange.count = Math.max(this.drawRange.count, attr.count);
        }
    }

    updateAttribute(attr) {
        const isNewBuffer = !attr.buffer;
        if (isNewBuffer) attr.buffer = this.gl.createBuffer();
        if (this.glState.boundBuffer !== attr.buffer) {
            this.gl.bindBuffer(attr.target, attr.buffer);
            this.glState.boundBuffer = attr.buffer;
        }
        if (isNewBuffer) {
            this.gl.bufferData(attr.target, attr.data, attr.usage);
        } else {
            this.gl.bufferSubData(attr.target, 0, attr.data);
        }
        attr.needsUpdate = false;
    }

    setIndex(value) {
        this.addAttribute('index', value);
    }

    setDrawRange(start, count) {
        this.drawRange.start = start;
        this.drawRange.count = count;
    }

    setInstancedCount(value) {
        this.instancedCount = value;
    }

    createVAO(program) {
        this.VAOs[program.attributeOrder] = this.gl.renderer.createVertexArray();
        this.gl.renderer.bindVertexArray(this.VAOs[program.attributeOrder]);
        this.bindAttributes(program);
    }

    bindAttributes(program) {
        // Link all attributes to program using gl.vertexAttribPointer
        program.attributeLocations.forEach((location, { name, type }) => {
            // If geometry missing a required shader attribute
            if (!this.attributes[name]) {
                console.warn(`active attribute ${name} not being supplied`);
                return;
            }

            const attr = this.attributes[name];

            this.gl.bindBuffer(attr.target, attr.buffer);
            this.glState.boundBuffer = attr.buffer;

            // For matrix attributes, buffer needs to be defined per column
            let numLoc = 1;
            if (type === 35674) numLoc = 2; // mat2
            if (type === 35675) numLoc = 3; // mat3
            if (type === 35676) numLoc = 4; // mat4

            const size = attr.size / numLoc;
            const stride = numLoc === 1 ? 0 : numLoc * numLoc * 4;
            const offset = numLoc === 1 ? 0 : numLoc * 4;

            for (let i = 0; i < numLoc; i++) {
                this.gl.vertexAttribPointer(location + i, size, attr.type, attr.normalized, attr.stride + stride, attr.offset + i * offset);
                this.gl.enableVertexAttribArray(location + i);

                // For instanced attributes, divisor needs to be set.
                // For firefox, need to set back to 0 if non-instanced drawn after instanced. Else won't render
                this.gl.renderer.vertexAttribDivisor(location + i, attr.divisor);
            }
        });

        // Bind indices if geometry indexed
        if (this.attributes.index) this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.attributes.index.buffer);
    }

    draw({ program, mode = this.gl.TRIANGLES }) {
        if (this.gl.renderer.currentGeometry !== `${this.id}_${program.attributeOrder}`) {
            if (!this.VAOs[program.attributeOrder]) this.createVAO(program);
            this.gl.renderer.bindVertexArray(this.VAOs[program.attributeOrder]);
            this.gl.renderer.currentGeometry = `${this.id}_${program.attributeOrder}`;
        }

        // Check if any attributes need updating
        program.attributeLocations.forEach((location, { name }) => {
            const attr = this.attributes[name];
            if (attr.needsUpdate) this.updateAttribute(attr);
        });

        // For drawElements, offset needs to be multiple of type size
        let indexBytesPerElement = 2;
        if (this.attributes.index?.type === this.gl.UNSIGNED_INT) indexBytesPerElement = 4;

        if (this.isInstanced) {
            if (this.attributes.index) {
                this.gl.renderer.drawElementsInstanced(
                    mode,
                    this.drawRange.count,
                    this.attributes.index.type,
                    this.attributes.index.offset + this.drawRange.start * indexBytesPerElement,
                    this.instancedCount
                );
            } else {
                this.gl.renderer.drawArraysInstanced(mode, this.drawRange.start, this.drawRange.count, this.instancedCount);
            }
        } else {
            if (this.attributes.index) {
                this.gl.drawElements(
                    mode,
                    this.drawRange.count,
                    this.attributes.index.type,
                    this.attributes.index.offset + this.drawRange.start * indexBytesPerElement
                );
            } else {
                this.gl.drawArrays(mode, this.drawRange.start, this.drawRange.count);
            }
        }
    }

    getPosition() {
        // Use position buffer, or min/max if available
        const attr = this.attributes.position;
        // if (attr.min) return [...attr.min, ...attr.max];
        if (attr.data) return attr;
        if (isBoundsWarned) return;
        console.warn('No position buffer data found to compute bounds');
        return (isBoundsWarned = true);
    }

    computeBoundingBox(attr) {
        if (!attr) attr = this.getPosition();
        const array = attr.data;
        // Data loaded shouldn't haave stride, only buffers
        // const stride = attr.stride ? attr.stride / array.BYTES_PER_ELEMENT : attr.size;
        const stride = attr.size;

        if (!this.bounds) {
            this.bounds = {
                min: new Vec3(),
                max: new Vec3(),
                center: new Vec3(),
                scale: new Vec3(),
                radius: Infinity,
            };
        }

        const min = this.bounds.min;
        const max = this.bounds.max;
        const center = this.bounds.center;
        const scale = this.bounds.scale;

        min.set(+Infinity);
        max.set(-Infinity);

        // TODO: check size of position (eg triangle with Vec2)
        for (let i = 0, l = array.length; i < l; i += stride) {
            const x = array[i];
            const y = array[i + 1];
            const z = array[i + 2];

            min.x = Math.min(x, min.x);
            min.y = Math.min(y, min.y);
            min.z = Math.min(z, min.z);

            max.x = Math.max(x, max.x);
            max.y = Math.max(y, max.y);
            max.z = Math.max(z, max.z);
        }

        scale.sub(max, min);
        center.add(min, max).divide(2);
    }

    computeBoundingSphere(attr) {
        if (!attr) attr = this.getPosition();
        const array = attr.data;
        // Data loaded shouldn't haave stride, only buffers
        // const stride = attr.stride ? attr.stride / array.BYTES_PER_ELEMENT : attr.size;
        const stride = attr.size;

        if (!this.bounds) this.computeBoundingBox(attr);

        let maxRadiusSq = 0;
        for (let i = 0, l = array.length; i < l; i += stride) {
            tempVec3.fromArray(array, i);
            maxRadiusSq = Math.max(maxRadiusSq, this.bounds.center.squaredDistance(tempVec3));
        }

        this.bounds.radius = Math.sqrt(maxRadiusSq);
    }

    remove() {
        for (let key in this.VAOs) {
            this.gl.renderer.deleteVertexArray(this.VAOs[key]);
            delete this.VAOs[key];
        }
        for (let key in this.attributes) {
            this.gl.deleteBuffer(this.attributes[key].buffer);
            delete this.attributes[key];
        }
    }
}

return {Geometry};})();
return {Renderer:modules.Renderer.Renderer,Geometry:modules.Geometry.Geometry,Program:modules.Program.Program};})();
// Rest-pose sculpting uses the same coordinates for geometry, joint pivots, IK and effect sockets.
// Heads gain volume while the feet and the gameplay hitboxes keep their original ground line.
// Cache the affine scales for each side of the two height regions.
const sculptScales=new Map();

// Built as closed, lit volumes. Wing arms, folded tips and the langur's grip move independently.


const flyerNames=["langur","ape","bat","owl","eagle","kite"];



// Adjustable pace advances the fixed-step accumulator. Jumps, encounters, venom and score
// still use the same simulation clock, including the three-input carrier jump.
const speedOptions=[1,1.15,1.3],burstOptions=[.5,1,1.5,2],contactOptions=[0,15,35,60];
function optionNumber(value,allowed,fallback){const n=Number(value);return allowed.includes(n)?n:fallback}
function pace(){return optionNumber(me.runPace,speedOptions,1)}
function burstRate(){return optionNumber(me.explosionRate,burstOptions,1)}
function contactRate(){return optionNumber(me.contactCost,contactOptions,0)}
function streetStrike(o){
 const cost=contactRate();if(!cost)return false;
 o.done=true;o.brokenAt=g.time;o.burned=true;g.streak=0;takeDamage(cost,"contact",o);
 if(mode==="play"){g.flashUntil=g.time+.52;save()}return true;
}
function fireStage(o,d=g.d){return secondsAt(o.x-px-19*size())-secondsAt(d)}
function breathTick(o,d,h){
 if(o.kind!=="red"||o.done||o.pass||o.breathSpent)return;
 const lead=fireStage(o,d);
 if(lead<=1.88&&lead>1.28&&!o.inhale){o.inhale=true;soundFX("inhale")}
 if(lead<=1.3&&lead>.78&&!o.exhaled){o.exhaled=true;soundFX("breath")}
 if(lead<=.78){o.breathSpent=true;if(o.exhaled&&h<72&&!ducking())takeDamage(20,"flame",o);save()}
}
function breathCue(o){const lead=o&&o.kind==="red"?fireStage(o):0;
 return lead>=.77&&lead<=1.88?(lead>1.3?"Breath coming · get low":"Duck under the flame!"):null;}
const crewTimes=[13.8,16.1,18.45];
function gangBeat(i){return ["high","low","lob"][i]}
function gangWindow(){return [distanceAt(9.7)+px,distanceAt(20.5)+px]}
function seedGang(){
 if(g.gang?.placed)return;
 g.gang={...(g.gang||{}),placed:true,hits:g.gang?.hits||0};
 if(!me.metKeeper)g.items.push({kind:"signal",bellSignal:true,x:distanceAt(10.85)+px,w:32,h:30});
}
function gangTick(d,h){
 if(g.level!==21||!g.gang)return;const t=secondsAt(d),crew=g.gang;
 if(t<10.2||t>20)return;
 if(!crew.intro){crew.intro=true;toast="Blackout Crew · the lights went out";toastFor=2.25;soundFX("outage");}
 if(g.signal&&!g.aid&&t>=11.75&&t<16.8){const i=crewTimes.findIndex((at,j)=>at>t+1.02&&!(crew.hits&(1<<j)));if(i>=0){
  g.signal=false;g.aid={at:g.time,hero:"tower",gangBeat:i,target:d+px+150};me.metKeeper=true;announcePower("The keeper rang the midnight bell");save();}}
 for(let i=0;i<3;i++){const bit=1<<i;if(crew.hits&bit||t+1e-6<crewTimes[i])continue;crew.hits|=bit;
  if(!(crew.disarmed&bit)){const type=gangBeat(i),hit=type==="high"?h<75&&!ducking():h<(type==="low"?30:48);
   if(hit)takeDamage(type==="lob"?12:10,type==="lob"?"blast":"crew");else reward(8,false);}
  save();if(mode!=="play")return;
 }
}
function gangCue(){
 if(g?.level!==21||!g.gang||mode!=="play")return "";const t=secondsAt(g.d);if(t<10.8||t>19.75)return "";
 const i=crewTimes.findIndex((at,i)=>t>=at-1.48&&t<at+.12&&!(g.gang.disarmed&(1<<i)));
 if(i>=0)return ["Duck · sweeping searchlight","Jump · rolling canister","Jump · flash charge"][i];
 return t>18.6?"Blackout Crew retreating":"Blackout Crew";
}
function gangX(t){const at=Math.min(width-67,px+235),e=cap((t-10.3)/1.75,0,1),r=cap((t-18.65)/1.48,0,1);
 return at+(1-e)**2*(width+85-at)+r*r*(width+120);}
// The Blackout Crew: three toon townsfolk and their van. They arrive, each throws once, and they drive off.
function gangVan(x,y,leaving){
 const im=fetchSheet("street/crewvan");
 if(im?.naturalWidth){const fw=im.width/4,k=1.7;oval(x,y+9,62,6,"#181b2a85");pen.save();pen.translate(x,y+8);if(!leaving)pen.scale(-1,1);pen.drawImage(im,(Math.floor((g?.time||0)*12)%4)*fw,0,fw,im.height,-91*k,-104*k,256/1.5*k,112*k);pen.restore();return}
 pen.save();pen.translate(x,y);oval(4,2,55,5,"#181b2a85");box(-48,-39,95,32,"#343c51");for(const q of [-27,29])oval(q,-6,6.4,6.4,"#202431");pen.restore();
}
function drawGang(d){
 if(g?.level!==21||!g.gang)return;const t=secondsAt(d);if(t<10.3||t>20.25)return;
 const x=gangX(t),escape=t>18.6;gangVan(x+34,floor-8,escape);
 const members=[["bandit",46,-3,.74],["crew",-44,-1,.78],["bandit",1,2,.84]];
 for(const [j,[sheet,dx,dy,s]] of members.entries()){
  const active=crewTimes[j]-t,running=escape||t<11.65,throwing=!running&&active>-.2&&active<1.45;
  const frame=running?Math.floor((g.time+j*.25)*12)%12:throwing?12+cap(Math.floor((1.45-active)/1.65*4),0,3):12;
  oval(x+dx,floor+dy+2,15*s,3*s,"#00000050");pen.save();pen.translate(x+dx,floor+dy);if(!escape)pen.scale(-1,1);drawSheet(fetchSheet(sheet),frame,0,0,s);pen.restore();
 }
 for(let i=0;i<3;i++){
  const after=t-crewTimes[i],u=cap(1+after/1.22,0,1);
  if(after< -1.22||after>.6)continue;
  const disarmed=!!(g.gang.disarmed&(1<<i)),sx=gangX(crewTimes[i]-1.22)+members[i][1]-13,xx=sx+(px-sx)*u;
  const y=floor-(i===0?53:i===1?8:5+51*Math.sin(Math.PI*u));
  if(disarmed){if(after<0){stroke([xx-6,y,xx+6,y],"#92d7e4",1.8);star(xx,y,3,"#fbe2aa")}continue;}
  if(i===0){if(after<=.32){pen.save();pen.globalAlpha=.28+u*.27;poly("#ffe1a3",[sx,floor-45,xx-8,y-5,xx-8,y+5]);pen.restore();oval(xx,y,4.8,3,"#fff1ce")}}
  else if(after<=0){
   if(i===2)oval(px,floor,7+u*11,2.3,"#ff9b7977");
   // a rolling drum, or a lobbed charge with a lit fuse
   pen.save();pen.translate(xx,y);pen.rotate(i===1?-u*14:u*5);
   if(i===1){oval(0,0,9,8,"#3f4660");box(-9,-2.4,18,1.6,"#ffcf5a");box(-9,2,18,1.6,"#ffcf5a");oval(0,0,3,2.6,"#2a3046")}
   else{oval(0,0,6.6,6.6,"#3a3350");oval(-2,-2,2.4,1.8,"#6a628a");stroke([3,-5,6,-9],"#c9a070",1.6);star(6.5,-10,2.6+Math.sin(g.time*30)*1,"#ffd95a")}
   pen.restore();
  }
  else if(i===2)boom(px,floor,after/.6,.6);
 }
}
function nightStreet(t,cam){
 const still=reducedMotion?.matches,clock=still?0:t;
 const time=g?secondsAt(g.d):0,outage=g?.level===21&&time>=10.55&&time<19.15;
 const alpha=outage?.18+.025*Math.cos(clock*1.2):.068;box(0,0,width,floor,"rgba(8,13,30,"+alpha+")");
 for(let i=0;i<23;i++){const x=((i*127.31-clock*37)%(width+30)+width+30)%(width+30)-10,y=(i*43.9+clock*(105+i%5*8))%floor;
  stroke([x,y,x-2.3,y+5.8],"#a4c5d82a",.75);}
 for(let i=0;i<5;i++){const x=((i*193.1-(g?.d||0)*.60)%(width+120)+width+120)%(width+120)-40;
  const yy=floor+14+(i%3)*10;oval(x,yy,12+i*1.8,1.4,i%2?"#e2b7784a":"#8bbdd153");}
 const z=8.35,base=Math.floor(cam.cx/88)*88;
 for(const X of [base-28,base+27,base+60,base+115]){const pt=viewPoint([X,.25,z],cam);
  if(pt[2]<=1||pt[0]<-25||pt[0]>width+25)continue;for(let j=0;j<4;j++){const v=(clock*.36+j*.25)%1;
   const dx=Math.sin(v*3+j)*v*8;oval(pt[0]+dx,pt[1]-v*25,2+v*7,1.4+v*3.5,"rgba(174,188,205,"+(.085*(1-v))+")");}}
}
// Original route arrangements use short synthesized instruments, a four-bar progression
// and a separate clock for subdivisions. Effects and the score keep their own mute switches.
const nightMusic={tick:()=>false,prepare(){},halt(){},preview(){},endPreview(){},playing:()=>false};


function settingsExtras(){
 for(const [id,property,options,def] of [["runPace","runPace",speedOptions,1],["blastLevel","explosionRate",burstOptions,1],["contactLevel","contactCost",contactOptions,0]]){
  const control=$(id);control.value=String(optionNumber(me[property],options,def));
 }
 $("damageHint").textContent=contactRate()?"Obstacle and animal collisions cost "+contactRate()+"% vitality. Health packs can revive you at zero.":"Classic collisions offer a health-pack revive on road obstacles. A missed animal dodge usually costs 25% vitality.";
}
function setupExtras(){
 for(const [id,property,options,def] of [["runPace","runPace",speedOptions,1],["blastLevel","explosionRate",burstOptions,1],["contactLevel","contactCost",contactOptions,0]]){
  $(id).onchange=e=>{me[property]=optionNumber(e.target.value,options,def);settingsExtras();save();};
 }
 $("resetRules").onclick=()=>{Object.assign(me,{runPace:1,explosionRate:1,contactCost:0});settingsExtras();save()};
}

const bakedCast={"bandit":"@@asset:sprites/bandit.webp@@","kolkata":"@@asset:sprites/kolkata.webp@@","crew":"@@asset:sprites/crew.webp@@","anaconda":"@@asset:sprites/anaconda.webp@@","desert":"@@asset:sprites/desert.webp@@","spool":"@@asset:sprites/spool.webp@@","builder":"@@asset:sprites/builder.webp@@","racer":"@@asset:sprites/racer.webp@@","florist":"@@asset:sprites/florist.webp@@","keeper":"@@asset:sprites/keeper.webp@@","mask":"@@asset:sprites/mask.webp@@","drummer":"@@asset:sprites/drummer.webp@@","crab":"@@asset:sprites/crab.webp@@","ray":"@@asset:sprites/ray.webp@@","clock":"@@asset:sprites/clock.webp@@","jaguar":"@@asset:sprites/jaguar.webp@@","bot/classic":"@@asset:sprites/bot_classic.webp@@","bot/scarf":"@@asset:sprites/bot_scarf.webp@@","bot/royal":"@@asset:sprites/bot_royal.webp@@","boy/street":"@@asset:sprites/boy_street.webp@@","boy/festival":"@@asset:sprites/boy_festival.webp@@","boy/explorer":"@@asset:sprites/boy_explorer.webp@@","boy/sport":"@@asset:sprites/boy_sport.webp@@","dino/plain":"@@asset:sprites/dino_plain.webp@@","dino/scarf":"@@asset:sprites/dino_scarf.webp@@","dino/cap":"@@asset:sprites/dino_cap.webp@@","dino/shades":"@@asset:sprites/dino_shades.webp@@","pixel/plain":"@@asset:sprites/pixel_plain.webp@@","pixel/up":"@@asset:sprites/pixel_up.webp@@","calf":"@@asset:sprites/calf.webp@@","horse":"@@asset:sprites/horse.webp@@","ghost":"@@asset:sprites/ghost.webp@@","hatch":"@@asset:sprites/hatch.webp@@","red":"@@asset:sprites/red.webp@@","cat":"@@asset:sprites/cat.webp@@","tower":"@@asset:sprites/tower.webp@@","girl/tropic":"@@asset:sprites/girl_tropic.webp@@","girl/stripe":"@@asset:sprites/girl_stripe.webp@@","girl/star":"@@asset:sprites/girl_star.webp@@","girl/sunset":"@@asset:sprites/girl_sunset.webp@@","tiger":"@@asset:sprites/tiger.webp@@","langur":"@@asset:sprites/langur.webp@@","ape":"@@asset:sprites/ape.webp@@"};
// Front three-quarter portraits for story scenes (one row of four frames each).
Object.assign(bakedCast,{"front/boy/street":"@@asset:sprites/front_boy_street.webp@@","front/boy/festival":"@@asset:sprites/front_boy_festival.webp@@","front/boy/explorer":"@@asset:sprites/front_boy_explorer.webp@@","front/boy/sport":"@@asset:sprites/front_boy_sport.webp@@","front/girl/tropic":"@@asset:sprites/front_girl_tropic.webp@@","front/girl/stripe":"@@asset:sprites/front_girl_stripe.webp@@","front/girl/star":"@@asset:sprites/front_girl_star.webp@@","front/girl/sunset":"@@asset:sprites/front_girl_sunset.webp@@","front/dino/plain":"@@asset:sprites/front_dino_plain.webp@@","front/dino/scarf":"@@asset:sprites/front_dino_scarf.webp@@","front/dino/cap":"@@asset:sprites/front_dino_cap.webp@@","front/dino/shades":"@@asset:sprites/front_dino_shades.webp@@","front/bot/classic":"@@asset:sprites/front_bot_classic.webp@@","front/bot/scarf":"@@asset:sprites/front_bot_scarf.webp@@","front/bot/royal":"@@asset:sprites/front_bot_royal.webp@@","front/pixel/plain":"@@asset:sprites/front_pixel_plain.webp@@","front/pixel/up":"@@asset:sprites/front_pixel_up.webp@@","front/calf":"@@asset:sprites/front_calf.webp@@","front/horse":"@@asset:sprites/front_horse.webp@@","front/ghost":"@@asset:sprites/front_ghost.webp@@","front/hatch":"@@asset:sprites/front_hatch.webp@@"});
// Sharp side close-ups for zoomed moments, the townsfolk of the story scenes, and the toon cobra.
Object.assign(bakedCast,{"close/boy/street":"@@asset:sprites/close_boy_street.webp@@","close/boy/festival":"@@asset:sprites/close_boy_festival.webp@@","close/boy/explorer":"@@asset:sprites/close_boy_explorer.webp@@","close/boy/sport":"@@asset:sprites/close_boy_sport.webp@@","close/girl/tropic":"@@asset:sprites/close_girl_tropic.webp@@","close/girl/stripe":"@@asset:sprites/close_girl_stripe.webp@@","close/girl/star":"@@asset:sprites/close_girl_star.webp@@","close/girl/sunset":"@@asset:sprites/close_girl_sunset.webp@@","close/dino/plain":"@@asset:sprites/close_dino_plain.webp@@","close/dino/scarf":"@@asset:sprites/close_dino_scarf.webp@@","close/dino/cap":"@@asset:sprites/close_dino_cap.webp@@","close/dino/shades":"@@asset:sprites/close_dino_shades.webp@@","close/bot/classic":"@@asset:sprites/close_bot_classic.webp@@","close/bot/scarf":"@@asset:sprites/close_bot_scarf.webp@@","close/bot/royal":"@@asset:sprites/close_bot_royal.webp@@","close/pixel/plain":"@@asset:sprites/close_pixel_plain.webp@@","close/pixel/up":"@@asset:sprites/close_pixel_up.webp@@","close/calf":"@@asset:sprites/close_calf.webp@@","close/horse":"@@asset:sprites/close_horse.webp@@","close/ghost":"@@asset:sprites/close_ghost.webp@@","close/hatch":"@@asset:sprites/close_hatch.webp@@","npc/potter":"@@asset:sprites/npc_potter.webp@@","npc/florist":"@@asset:sprites/npc_florist.webp@@","npc/picker":"@@asset:sprites/npc_picker.webp@@","npc/leader":"@@asset:sprites/npc_leader.webp@@","npc/mechanic":"@@asset:sprites/npc_mechanic.webp@@","npc/islander":"@@asset:sprites/npc_islander.webp@@","npc/cook":"@@asset:sprites/npc_cook.webp@@","npc/elder":"@@asset:sprites/npc_elder.webp@@","cobra":"@@asset:sprites/cobra.webp@@","stalker":"@@asset:sprites/stalker.webp@@","boar":"@@asset:sprites/boar.webp@@","props":"@@asset:sprites/props.webp@@","street":"@@asset:sprites/street.webp@@","street/taxi":"@@asset:sprites/street_pursuit_taxi.webp@@","street/hatch":"@@asset:sprites/street_pursuit_hatch.webp@@","street/van":"@@asset:sprites/street_pursuit_van.webp@@","street/scooter":"@@asset:sprites/street_scooter.webp@@","street/bike":"@@asset:sprites/street_bike.webp@@","scene":"@@asset:sprites/scene.webp@@","items":"@@asset:sprites/items.webp@@","street/floatowl":"@@asset:sprites/street_floatowl.webp@@","street/floattiger":"@@asset:sprites/street_floattiger.webp@@","street/floatfish":"@@asset:sprites/street_floatfish.webp@@","street/crewvan":"@@asset:sprites/street_pursuit_crewvan.webp@@","street/cow":"@@asset:sprites/street_cow.webp@@","street/goat":"@@asset:sprites/street_goat.webp@@","street/dog":"@@asset:sprites/street_dog.webp@@","street/camel":"@@asset:sprites/street_camel.webp@@","street/duck":"@@asset:sprites/street_duck.webp@@","street/rickshaw":"@@asset:sprites/street_rickshaw.webp@@","street/oxcart":"@@asset:sprites/street_oxcart.webp@@","street/rover":"@@asset:sprites/street_rover.webp@@","chomp/red":"@@asset:sprites/chomp_red.webp@@","wreck":"@@asset:sprites/pursuit_wreck.webp@@","pursuit":"@@asset:sprites/pursuit.webp@@","film/girl/tropic":"@@asset:sprites/film_girl_tropic.webp@@","film/boy/street":"@@asset:sprites/film_boy_street.webp@@","film/dino/plain":"@@asset:sprites/film_dino_plain.webp@@","eagle":"@@asset:sprites/eagle.webp@@","owl":"@@asset:sprites/owl.webp@@","bat":"@@asset:sprites/bat.webp@@","kite":"@@asset:sprites/kite.webp@@","croc":"@@asset:sprites/croc.webp@@"});
function warmCast(level){
  const k=fieldShows[level-1][2];for(const foe of routeFoes[level-1])if(specialCast.includes(foe)&&!flyerNames.includes(foe))fetchSheet(foe);if(specialCast.includes(k))fetchSheet(k);if(detours[level])fetchSheet(detours[level][2]);if(["crew","kolkata","bandit"].includes(k))fetchSheet(k);
  if(level===16)fetchSheet("anaconda");
  itemPic();fetchSheet("props");if(level===21){fetchSheet("street/crewvan");fetchSheet("bandit");fetchSheet("crew")}{fetchSheet("street");for(const o of [...(lifeCastOf(level-1)||[]),...(detours[level]&&lifeCastOf(routes.length+branchIds.indexOf(level))||[])])if(o.walk)fetchSheet(o.k);else if(o.scene)fetchSheet("scene");else if(!o.fixed)fetchSheet("street/"+o.k)}
  fetchSheet(riderKey(level));fetchSheet("close/"+riderKey(level));if(bossPath(level))fetchSheet("chomp/red");if(routeHazards[level-1].includes("wreck"))fetchSheet("wreck");for(const k of ["boar","croc","eagle","kite","owl","bat","pursuit"])if(routeFoes[level-1].includes(k))fetchSheet(k);if(routeFoes[level-1].includes("cobra"))fetchSheet("cobra");if(routeFoes[level-1].includes("alien"))fetchSheet("stalker");if(routeFoes[level-1].includes("clock"))fetchSheet("clock");if(me.rider===3)fetchSheet("pixel/up");fetchSheet("red");fetchSheet(level===21?"tower":friendKey());
  for(const k of routeFoes[level-1])if(["tiger","langur","cat"].includes(k))fetchSheet(k);if(level===16)fetchSheet("ape");
}
$("tourButton").onclick=beginTour;$("superJump").onclick=useFeather;if(g&&(old.rules||0)<13){
  g.placedRelics={};for(const o of g.items)if(["signal","feather","treasure"].includes(o.kind))g.placedRelics[o.kind]=true;
  if(g.level===21&&g.d+px<gangWindow()[0]){const [lo,hi]=gangWindow();g.items=g.items.filter(o=>o.x>=hi||o.x+o.w<lo);
   if(g.next>=lo){seedGang();g.next=Math.max(hi,g.next)}if(g.flight&&!g.sawPlane&&g.flight.start<21)g.flight.start=25;}
  else if(g.level===21)g.legacyNight=true;
}
setupExtras();setupSkin();setupFilm();setupStory();warmCast(g?.level||me.selected);
if(g?.show?.waiting&&g.show.branch===null&&mode==="menu")mode="fork";
setMode(mode);if(mode==="dead")save();requestAnimationFrame(frame);
// Installable copy: only where a service worker can run (https or localhost).
if("serviceWorker" in navigator&&/^https:$/.test(location.protocol))navigator.serviceWorker.register("sw.js").catch(()=>{});

