// ---- v18 opening film and results board ----
// The film is eight seconds: dawn, the crew sprinting in, the red dino's chase and fire, then the title.
let film=null;
const filmCast=[["girl/tropic",1.5,.78,1.12],["boy/street",1.9,.55,1.12],["dino/plain",2.3,.32,1.0],["bot/classic",0,0,1.04],["calf",0,0,1.05]];
// Two small encounters cross the screen: a cactus to hop and a low bird to slide under.
const filmHop=.44,cactusAt=(W,t)=>W+40-(t-2.2)*260,birdAt=(W,t)=>W+40-(t-3.2)*460;
const ease=k=>{k=cap(k,0,1);return 1-(1-k)*(1-k)*(1-k)};
function setupFilm(){
  const el=$("film");if(!el)return;
  $("filmPlay").onclick=()=>{unlockSound();if(!(document.fullscreenElement===gameFrame||fakeFull))toggleFullscreen();if(me.film===false||reducedMotion?.matches)closeFilm();else startFilm()};
  $("filmSkip").onclick=closeFilm;
  $("filmToggle").checked=me.film!==false;$("filmToggle").onchange=e=>{me.film=e.target.checked;save()};
  for(const row of filmCast){fetchSheet("close/"+row[0]);if(row[1])fetchSheet("film/"+row[0])}fetchSheet("red");
  // While the opening is up, keys belong to it and never reach the game underneath.
  window.addEventListener("keydown",e=>{if($("film").hidden)return;e.stopPropagation();if(["Enter"," ","Escape"].includes(e.key)){e.preventDefault();if(film)closeFilm();else $("filmPlay").click()}},true);
}
function startFilm(){
    $("filmStart").hidden=true;$("filmSkip").hidden=false;$("filmTitle").classList.remove("in");
  film={from:performance.now(),scored:false};requestAnimationFrame(filmFrame);
}
function closeFilm(){
  const was=film;film=null;$("film").hidden=true;$("filmTitle").classList.remove("in");
  if(was&&musicBus&&audioBus){const now=audioBus.currentTime;musicBus.gain.cancelScheduledValues(now);musicBus.gain.setTargetAtTime(.0001,now,.04);musicBus.gain.setTargetAtTime(.92,now+.7,.05)}
  c.focus({preventScroll:true});
}
function filmFrame(now){
  if(!film)return;
  const t=film.freeze??(now-film.from)/1000,canvas=$("filmCanvas"),ctx=canvas.getContext("2d"),ratio=Math.min(3,window.devicePixelRatio||1);ctx.imageSmoothingQuality="high";
  // The frame may still be switching to fullscreen, so the picture follows its box every frame.
  const cw=Math.max(320,Math.round(canvas.clientWidth*ratio)),ch=Math.max(200,Math.round(canvas.clientHeight*ratio));if(canvas.width!==cw||canvas.height!==ch){canvas.width=cw;canvas.height=ch}
  if(!film.scored&&t>.08){film.scored=true;filmScore()}
  if(t>8.6){closeFilm();return}
  // The picture is 420 units tall and never narrower than 560, so an upright phone gets a band, not a slice.
  const scale=Math.min(canvas.height/H,canvas.width/560),W=canvas.width/scale,top=(canvas.height/scale-H)/2,previous=pen;pen=ctx;
  try{ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle="#05060f";ctx.fillRect(0,0,canvas.width,canvas.height);ctx.setTransform(scale,0,0,scale,0,top*scale);ctx.save();ctx.beginPath();ctx.rect(0,0,W,H);ctx.clip();filmDraw(ctx,W,t);ctx.restore()}catch{}finally{pen=previous;ctx.setTransform(1,0,0,1,0,0)}
  $("filmTitle").style.paddingTop=Math.round((top+H*.1)*scale/ratio)+"px";
  if(t>5.85)$("filmTitle").classList.add("in");
  requestAnimationFrame(filmFrame);
}
function filmDraw(ctx,W,t){
  const mix=(a,b,k)=>a.map((v,i)=>Math.round(v+(b[i]-v)*k)),rgbOf=a=>"rgb("+a.join(",")+")";
  const dawn=ease(t/2.2),menace=cap((t-4.1)/.5,0,1),title=cap((t-5.7)/.35,0,1),run=Math.max(0,t-1.2),scroll=run*260+Math.max(0,t-4.6)*220;
  const shake=t>4.85&&t<5.7?[(Math.sin(t*91)*5),(Math.cos(t*77)*4)]:[0,0];
  ctx.save();ctx.translate(shake[0],shake[1]);
  // sky and sun
  const top=mix(mix([11,13,30],[52,84,176],dawn),[70,18,30],menace*.75),low=mix(mix([26,16,48],[255,170,104],dawn),[230,70,40],menace*.7);
  const sky=ctx.createLinearGradient(0,0,0,floor);sky.addColorStop(0,rgbOf(top));sky.addColorStop(1,rgbOf(low));ctx.fillStyle=sky;ctx.fillRect(-10,-10,W+20,H+20);
  for(let i=0;i<40;i++){ctx.globalAlpha=(1-dawn)*(.4+.6*Math.abs(Math.sin(t*1.3+i)));box((i*137.5)%W,8+(i*53.7)%190,i%6?1.3:2.2,i%6?1.3:2.2,"#fff6d8")}
  ctx.globalAlpha=1;
  const sunX=W*.72,sunY=310-190*dawn,glow=ctx.createRadialGradient(sunX,sunY,6,sunX,sunY,170);
  glow.addColorStop(0,"rgba(255,236,170,.9)");glow.addColorStop(.25,"rgba(255,190,110,.45)");glow.addColorStop(1,"rgba(255,170,90,0)");ctx.fillStyle=glow;ctx.fillRect(sunX-180,sunY-180,360,360);
  oval(sunX,sunY,34,34,"#fff0b8");
  // three layers of hills and a skyline of huts and palms
  for(let layer=0;layer<3;layer++){
    const speed=[.08,.18,.34][layer],base=[236,262,292][layer],amp=[34,26,18][layer],tone=mix([[38,44,96],[30,58,74],[24,48,44]][layer],[40,14,22],menace*.6);
    ctx.fillStyle=rgbOf(tone);ctx.beginPath();ctx.moveTo(-10,H);
    for(let x=-10;x<=W+10;x+=12){const u=(x+scroll*speed)*.008;ctx.lineTo(x,base-Math.sin(u*1.7+layer)*amp-Math.sin(u*4.1+layer*2)*amp*.35)}
    ctx.lineTo(W+10,H);ctx.closePath();ctx.fill();
  }
  const silh=rgbOf(mix([20,34,40],[36,10,16],menace*.6));
  for(let i=-1;i<Math.ceil(W/230)+2;i++){
    const x=i*230-(scroll*.5)%230,kind=((Math.floor(scroll*.5/230)+i)%3+3)%3;
    if(kind===0){poly(silh,[x,floor,x,floor-40,x+16,floor-72,x+32,floor-40,x+32,floor]);poly(silh,[x+34,floor,x+34,floor-30,x+62,floor-30,x+62,floor]);poly(silh,[x+30,floor-30,x+48,floor-52,x+66,floor-30])}
    else if(kind===1){stroke([x+20,floor,x+26,floor-78],silh,5);for(let k=0;k<6;k++){const a=-2.6+k*.45;stroke([x+26,floor-78,x+26+Math.cos(a)*34,floor-78+Math.sin(a)*22+8],silh,4)}}
    else{poly(silh,[x,floor,x+8,floor-34,x+50,floor-34,x+58,floor]);poly(silh,[x-6,floor-34,x+29,floor-58,x+64,floor-34])}
  }
  // ground with speed dashes
  const ground=ctx.createLinearGradient(0,floor,0,H);ground.addColorStop(0,rgbOf(mix([196,138,84],[120,40,34],menace*.6)));ground.addColorStop(1,rgbOf(mix([120,72,48],[60,18,22],menace*.6)));
  ctx.fillStyle=ground;ctx.fillRect(-10,floor,W+20,H-floor+10);box(-10,floor,W+20,3,"#ffffff2a");
  for(let i=0;i<Math.ceil(W/90)+2;i++){const x=i*90-(scroll*1.0)%90;box(x,floor+26,44,3,"#ffffff1f");box(x+30,floor+58,60,4,"#ffffff14")}
  // the red dino arrives behind the crew
  if(t>4.2){
    const k=ease((t-4.2)/.8),rx=-240+k*(W*.12+240),roar=t>4.9&&t<5.75;
    oval(rx,floor+5,110,12,"#00000055");drawSheet(fetchSheet("red"),roar?13:Math.floor(t*14)%12,rx,floor+2,2.25);
    if(roar){
      const p=cap((t-4.95)/.6,0,1),mx=rx+92,my=floor-150;ctx.save();ctx.globalCompositeOperation="lighter";
      for(let j=0;j<26;j++){const f=(j/26)*p,xx=mx+f*(W-mx+140),yy=my+f*70+Math.sin(j*1.9+t*17)*(6+f*26),r=14+f*150,fire=ctx.createRadialGradient(xx,yy,0,xx,yy,r);
        fire.addColorStop(0,"rgba(255,244,190,.5)");fire.addColorStop(.45,"rgba(255,150,50,.3)");fire.addColorStop(1,"rgba(220,50,20,0)");ctx.fillStyle=fire;ctx.beginPath();ctx.arc(xx,yy,r,0,6.283);ctx.fill()}
      ctx.restore();
    }
  }
  // the cactus and the low bird
  const cx=cactusAt(W,t),bx=birdAt(W,t);
  if(cx>-40&&cx<W+40){oval(cx,floor+3,16,3.5,"#00000040");box(cx-6,floor-44,12,44,"#3f9a52");oval(cx,floor-44,6,6,"#3f9a52");box(cx-17,floor-30,11,6,"#3f9a52");box(cx-17,floor-36,6,10,"#3f9a52");box(cx+6,floor-24,11,6,"#3f9a52");box(cx+11,floor-34,6,14,"#3f9a52");box(cx-2,floor-42,3,38,"#6fc27a")}
  if(bx>-60&&bx<W+60){const rise=Math.max(0,W*.5-bx)*1.5,by=floor-66-rise,flap=Math.sin(t*26)*13;oval(bx,by,13,6,"#2b2f4a");poly("#3b4166",[bx-4,by,bx+4,by,bx+3,by-6-flap,bx-14,by-10-flap]);poly("#3b4166",[bx-4,by,bx+4,by,bx+12,by-8+flap*.6]);poly("#ffb84a",[bx-12,by-1,bx-20,by+1,bx-12,by+3]);oval(bx-8,by-2,1.4,1.4,"#fff")}
  // the crew: three runners with room between them
  for(const [sheet,at,slot,size] of filmCast.slice(0,3)){
    if(t<at)continue;
    const k=ease((t-at)/.75),flee=Math.max(0,t-4.7),home=W*slot,x=-90+k*(home+90)+flee*flee*190,im=fetchSheet("film/"+sheet);
    const hopAt=2.2+(W+40-home)/260,p=(t-hopAt)/filmHop+.5,lift=p>0&&p<1?Math.sin(p*Math.PI)*66:0;
    const slideAt=3.2+(W+40-home)/460,low=slot>.5&&Math.abs(t-slideAt)<.2&&!lift;
    if(!lift)for(let d=0;d<4;d++){const life=((t*2.4+d*.25)%1);ctx.globalAlpha=(1-life)*.45;oval(x-22-life*46,floor-4-life*10,4+life*9,3+life*7,"#fff2dc")}
    ctx.globalAlpha=1;oval(x,floor+4,26-lift*.12,5-lift*.03,"#00000044");drawSheet(im,lift?12:low?15:Math.floor((t+at)*17)%10,x,floor+2-lift,size*1.25);
    const won=t-hopAt-filmHop/2;if(won>0&&won<.45){ctx.globalAlpha=1-won/.45;star(x+6,floor-96-won*50,7,"#ffe45c");ctx.globalAlpha=1}
    const ducked=t-slideAt-.2;if(slot>.5&&ducked>0&&ducked<.45){ctx.globalAlpha=1-ducked/.45;star(x+6,floor-96-ducked*50,7,"#74efc6");ctx.globalAlpha=1}
  }
  ctx.restore();
  // cinema bars, the presenter line, and the cut to the title
  const bar=34*(1-title);box(0,0,W,bar,"#05060f");box(0,H-bar,W,bar,"#05060f");
  if(t>.35&&t<2.1){ctx.globalAlpha=cap((t-.35)/.4,0,1)*cap((2.1-t)/.4,0,1);ctx.fillStyle="#f7f4ff";ctx.font="800 15px 'Baloo 2',ui-rounded,'Segoe UI',system-ui,sans-serif";ctx.textAlign="center";ctx.fillText("U T H O N   ·   G A M E   B U D D Y   P R E S E N T S",W/2,H*.5);ctx.globalAlpha=1}
  if(t>5.45){
    const k=cap((t-5.45)/.3,0,1);ctx.globalAlpha=k;const night=ctx.createRadialGradient(W/2,H*.42,20,W/2,H*.42,W*.75);night.addColorStop(0,"#3a2f8a");night.addColorStop(1,"#0d0f24");ctx.fillStyle=night;ctx.fillRect(0,0,W,H);
    for(let i=0;i<46;i++){const px2=(i*97.3+t*18*(i%3+1))%W,py=(i*61.7+t*60*(i%4+1))%H;ctx.save();ctx.translate(px2,py);ctx.rotate(t*3+i);box(-3,-1.5,6,3,["#ffd95a","#ff6f9f","#74efc6","#8f73ff"][i&3]);ctx.restore()}
    filmCast.forEach(([sheet,,,size],i)=>{const fit=Math.min(1,W/700),x=W/2+(i-2)*Math.min(130,W/5.2),hop=Math.abs(Math.sin(t*5+i*1.1))*16;size*=.82+.18*fit;oval(x,H-36,24,5,"#00000055");if(!drawStrip(fetchSheet("close/"+sheet),2+(Math.floor(t*5+i)%2),x,H-34-hop,size*1.2))drawSheet(fetchSheet(sheet),13+(Math.floor(t*5+i)%2),x,H-34-hop,size*1.2)});
    ctx.globalAlpha=1;
  }
  if(t>5.3&&t<5.9){ctx.globalAlpha=cap((t-5.3)/.18,0,1)*cap((5.9-t)/.3,0,1);box(0,0,W,H,"#fff3c4");ctx.globalAlpha=1}
  if(t>8.2){ctx.globalAlpha=cap((t-8.2)/.4,0,1);box(0,0,W,H,"#12142a");ctx.globalAlpha=1}
}

// ---- results board: what happened on this run, with a one-to-three star rating ----
const newTally=()=>({rivals:0,traps:0,hits:0,best:1,boss:""});
function tally(key,value=1){
  storyTally(key);if(!g||g.tutorial)return;const t=g.tally??=newTally();
  if(key==="boss")t.boss=value;else if(key==="best")t.best=Math.max(t.best,value);else t[key]+=value;
}
function starRating(){
  const t=g.tally||newTally();let stars=1;
  if(t.hits<=2&&!(g.rescues>0))stars++;
  if(stars===2&&(bossPath(g.level)?(t.boss==="Dodged"||t.boss==="Beaten"):t.hits===0))stars++;
  return stars;
}
function resultsBoard(m){
  const el=$("results");if(!el)return;
  const done=["levelup","finished","replayComplete"].includes(m),show=(done||m==="dead")&&!!g&&!g.tutorial;
  el.hidden=!show;if(!show)return;
  const t=g.tally||newTally(),stars=done?starRating():0;
  if(done){(me.stars??={})[g.level]=Math.max(me.stars[g.level]||0,stars)}
  $("stars").hidden=!done;[...$("stars").children].forEach((star,i)=>{star.classList.toggle("on",i<stars);star.style.animationDelay=(.25+i*.22)+"s"});
  const r=g.result,rows=[["Score",g.score],["Delivery",r?earlyText(r.bank):"Not delivered"],["Hidden parcels",Math.min(3,g.tokens||0)+" / 3"],["Rivals beaten",t.rivals],["Traps dodged",t.traps],["Hits taken",t.hits]];
  if(bossPath(g.level))rows.push(["Red dino",t.boss||(done?"Slipped past":"Not reached")]);
  if(r&&r.streak>1)rows.push(["Streak","×"+r.streak+(r.bonus?" +"+r.bonus:"")]);
  const list=$("tallyList");list.replaceChildren();
  for(const [label,value] of rows){const item=document.createElement("div"),k=document.createElement("small"),v=document.createElement("b");k.textContent=label;v.textContent=value;item.append(v,k);list.append(item)}
}
