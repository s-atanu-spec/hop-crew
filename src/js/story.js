// ---- v21 story: every path is a delivery for tonight's festival ----
// Before the run a short scene hands over the parcel. During the run a delivery clock moves with your play.
// At the finish a payoff scene hands it on, and an on-time delivery earns that path's sticker.
// job: [unused, what it is, who gives it, who is waiting]. The picture for each job is a tile of the items sheet (tools/bake/bake9.py).
const jobs={
  1:["","clay lamps","the potter","the lamp lighter"],2:["","ripe mangoes","the orchard keeper","the sweet maker"],
  3:["","festival kites","the kite maker","the rooftop club"],4:["","umbrellas","the tailor","the marching band"],
  5:["","flower garlands","the florist","the stage crew"],6:["","first-flush tea","the tea picker","the tea stall"],
  7:["","festival drums","the drum maker","the drummers"],8:["","bamboo poles","the bridge crew","the gate builders"],
  9:["","fresh fish","the boatman","the feast cook"],10:["","sweets","the sweet maker","the children's stall"],
  11:["","paper lanterns","the lantern maker","the rooftop riggers"],12:["","candles","the candle maker","the courtyard hosts"],
  17:["","festival colours","the dye trader","the painters"],18:["","coconuts","the islander","the drink stall"],
  19:["","the band's trumpet","the band leader","the parade"],
  13:["","power cells","the night mechanic","the sign crew"],14:["","a signal dish","mission control","the relay post"],
  15:["","tram tickets","the conductor","the Esplanade stop"],16:["","healing herbs","the forest guide","the river camp"],
  20:["","wind-up toys","the toy maker","the station master"],21:["","the clock-tower key","the night watchman","the tower keeper"]};
const townsfolk=["potter","florist","picker","leader","mechanic","islander","cook","elder"];
const givers={1:"potter",2:"picker",5:"florist",6:"picker",9:"islander",13:"mechanic",18:"islander",19:"leader",21:"elder"},receivers={2:"cook",4:"leader",9:"cook",10:"elder",19:"leader",20:"mechanic"};
const giverSheet=level=>"npc/"+(givers[level]||townsfolk[(level*3)%8]),receiverSheet=level=>{const pick=receivers[level]||townsfolk[(level*3+5)%8];return "npc/"+(("npc/"+pick)===giverSheet(level)?townsfolk[(level+2)%8]:pick)};
const bankStart=5,bankMax=12,bankCosts={hits:-2,rivals:1,traps:.5,revive:-3};
const scenesOn=()=>me.scenes!==false&&!reducedMotion?.matches;
const earlyText=s=>Math.abs(s).toFixed(1)+"s "+(s>0?"early":"late");

// ---- the delivery clock and the three hidden items ----
function storyTally(key){
  if(!g||g.tutorial||!(key in bankCosts))return;
  g.bank=cap((g.bank??bankStart)+bankCosts[key],-30,bankMax);
  if(g.bank<=0&&!g.lateSaid){g.lateSaid=true;toast="Running late! Clean escapes win time back";toastFor=2.2}
  storySync();
}
function storySync(){
  const chip=$("clockChip");if(!chip)return;
  storyLobby();
  const on=!!g&&!g.tutorial&&["play","paused","rescue","fork","chomp","menu"].includes(mode);chip.hidden=!on;if(!on)return;
  const bank=g.bank??bankStart,job=jobs[g.level];
  itemDot($("clockIcon"),g.level);$("clockText").textContent=earlyText(bank);chip.classList.toggle("late",bank<=0);
  [...$("clockPips").children].forEach((pip,i)=>pip.classList.toggle("on",i<(g.tokens||0)));
}
function tokenDue(x){
  if(g.tutorial)return false;
  g.tokenAt??=[.13+.1*roll(),.38+.1*roll(),.6+.1*roll()].map(k=>k*courseLength);
  if(x-(g.tokenLast??-1e9)<courseLength*.11)return false;   // keep the three well apart
  const i=g.tokenAt.findIndex((at,k)=>!((g.tokenPlaced||0)>>k&1)&&x>=at);if(i<0)return false;
  g.tokenPlaced=(g.tokenPlaced||0)|1<<i;g.tokenLast=x;return true;
}
function tokenFound(){
  g.tokens=(g.tokens||0)+1;const job=jobs[g.level];
  toast="Hidden parcel "+g.tokens+" of 3 found"+(g.tokens===3?" · gold sticker in reach":"");toastFor=1.9;storySync();
  if(me.sfx)for(let j=0;j<g.tokens;j++)note(880*Math.pow(1.26,j),880*Math.pow(1.26,j),.16,.1,"sine",j*.08,j-1,.3,.3);
}
// The picture for a delivery: one square tile of the items sheet, 7 across and 3 down, in path order.
let itemSheet=null,itemStyle=false;
const itemPic=()=>itemSheet||(itemSheet=texture(bakedCast.items));
function itemAt(ctx,id,x,y,size){
  const itemSheet=itemPic();if(!itemSheet?.naturalWidth)return;const t=itemSheet.width/7,k=size*1.38;
  ctx.drawImage(itemSheet,(id-1)%7*t,Math.floor((id-1)/7)*t,t,t,x-k/2,y-k/2,k,k);
}
function itemDot(el,id){
  if(!itemStyle){itemStyle=true;document.documentElement.style.setProperty("--items","url(data:image/webp;base64,"+bakedCast.items+")")}
  el.textContent="";el.classList.add("item-dot");el.style.backgroundPosition=((id-1)%7/6*100)+"% "+(Math.floor((id-1)/7)/2*100)+"%"}
function tokenArt(o,x){
  const t=g.time,mid=x+16,y=floor-26+Math.sin(t*4+o.x*.01)*4,near=cap(1-(x-px)/460,0,1);
  oval(mid,floor+2,10,2.4,"#00000030");
  pen.save();pen.globalAlpha=.3+near*.5;oval(mid,y,17,17,softShade(mid,y,20,"#fff3b0aa"));pen.restore();
  itemAt(pen,g.level,mid,y,24);
  pen.save();pen.globalAlpha=Math.max(0,Math.sin(t*3+o.x))**6;star(mid+11,y-12,4,"#ffffff");pen.restore();
}

// ---- the result of a delivery ----
function storyFinish(){
  if(!g||g.tutorial||g.result)return;
  const bank=g.bank??bankStart,onTime=bank>0,items=Math.min(3,g.tokens||0),sticker=onTime?(items===3?2:1):0;
  const had=(me.stickers??={})[g.level]||0;me.stickers[g.level]=Math.max(had,sticker);
  me.streak=onTime?(me.streak||0)+1:0;
  const bonus=onTime?Math.min(250,50*(me.streak-1)):0;
  if(bonus){g.score=Math.min(limit,g.score+bonus);me.earned=Math.min(limit,me.earned+bonus);if(g.replay)g.replayPoints=Math.min(limit,(g.replayPoints||0)+bonus);else me.pathPoints=Math.min(limit,me.pathPoints+bonus)}
  g.result={bank,onTime,items,sticker,streak:me.streak,bonus,fresh:sticker>had};
}
function storyLost(){if(g&&!g.tutorial&&!g.streakCut){g.streakCut=true;me.streak=0}}
const stickerCount=()=>{const s=me.stickers||{};return [storyIds.filter(id=>s[id]).length,storyIds.filter(id=>s[id]===2).length]};
function stickerLine(r){
  const job=jobs[g.level];
  return !r?"":r.sticker===2?"Gold sticker earned":r.sticker===1?"Sticker earned"+(r.items<3?" · find all 3 for gold":""):"Delivered late · no sticker this time";
}

function storyHint(m){
  const r=g?.result;if(r&&["levelup","finished","replayComplete"].includes(m)&&!g.tutorial)$("hint").textContent=stickerLine(r)+(m==="levelup"?" · Next: "+C[me.stage-1]:"");
}
// ---- scenes ----
let scene=null;
const palettes={village:["#ff9d5c","#ffe2a8","#c08a56","#8a5a3a"],jungle:["#1f6e5a","#a8e6a3","#5b6b33","#39441f"],city:["#e9785a","#ffd9a0","#7c6a80","#4d4257"],
  desert:["#f0a04b","#ffe7b0","#d9a45a","#a8733a"],mars:["#3a1528","#d86a4a","#8a3d28","#5a2418"],toy:["#6fc6ff","#fff1c1","#e0a860","#b97a3c"],night:["#141a44","#5a4aa8","#34325a","#1f1e3a"]};
function sceneLook(level){
  const k=bonusThemes[level]||(level===11||level===12?"night":terrain[level-1]);
  return palettes[{neon:"night",midnight:"night",relay:"mars",kolkata:"city",amazon:"jungle",railway:"toy"}[k]||k]||palettes.village;
}
// Zoomed moments use a sharper four-frame strip (idle, jump, cheer, cheer) when the pose has one.
function drawClose(key,frame,x,y,scale){
  const slot={10:0,11:0,12:1,13:2,14:3}[frame],id="close/"+key;if(slot==null||!(id in bakedCast))return false;
  return drawStrip(riderSheet(id,me.tint),slot,x,y,scale);
}
// Front portraits are baked large and cropped to the character. Each box is [x, y, width, height] in 256x168 cell pixels.
const frontBox={"front/boy/street":[101.67,19.17,72.5,141.0],"front/boy/festival":[101.67,19.17,72.5,141.0],"front/boy/explorer":[96.67,17.67,82.33,142.5],"front/boy/sport":[101.67,19.17,72.5,141.0],"front/girl/tropic":[96.67,17.67,82.33,142.5],"front/girl/stripe":[96.67,17.67,82.33,142.5],"front/girl/star":[96.67,17.67,82.33,142.5],"front/girl/sunset":[96.67,17.67,82.33,142.5],"front/dino/plain":[68.17,13.33,110.0,146.0],"front/dino/scarf":[68.17,13.33,110.0,146.0],"front/dino/cap":[68.17,9.17,110.0,150.17],"front/dino/shades":[68.17,13.33,110.0,146.0],"front/bot/classic":[99.17,14.33,74.67,145.67],"front/bot/scarf":[99.17,14.33,74.67,145.67],"front/bot/royal":[87.33,14.33,86.5,145.67],"front/pixel/plain":[101.67,19.17,72.5,141.0],"front/pixel/up":[101.67,19.17,72.5,141.0],"front/calf":[99.33,19.5,103.33,138.5],"front/horse":[103.5,2.83,80.0,156.5],"front/ghost":[100.0,59.83,67.5,76.5],"front/hatch":[68.17,8.83,110.0,150.5]};
function drawFront(id,frame,x,y,scale){
  const image=riderSheet(id,me.tint),b=frontBox[id];if(!image?.width||!b)return false;const fw=image.width/4,k=scale/1.5;
  pen.drawImage(image,frame%4*fw,0,fw,image.height,x-91*scale+b[0]*k,y-104*scale+b[1]*k,b[2]*k,b[3]*k);return true;
}
function drawStrip(image,frame,x,y,scale){
  if(!image?.width)return false;const cw=image.width/4;
  pen.drawImage(image,frame%4*cw,0,cw,image.height,x-91*scale,y-104*scale,256/1.5*scale,112*scale);return true;
}
function playScene(kind,done){
  if(!g||g.tutorial||!jobs[g.level]||!scenesOn()){
    if(kind==="open"&&g&&!g.tutorial&&jobs[g.level]){const job=jobs[g.level];toast="Deliver "+job[1]+" · beat the clock";toastFor=2.6}
    done?.();return;
  }
  const key=riderKey(g.level),front="front/"+key;
  scene={kind,from:performance.now(),done,level:g.level,job:jobs[g.level],key,front:front in bakedCast?front:null,result:g.result,cue:{},
    length:kind==="open"?6.6:g.level===19?9.0:6.6};
  fetchSheet(key);fetchSheet("close/"+key);if(scene.front)fetchSheet(scene.front);fetchSheet(giverSheet(g.level));fetchSheet(receiverSheet(g.level));
  $("scene").hidden=false;$("sceneSkip").focus({preventScroll:true});requestAnimationFrame(sceneFrame);
}
function endScene(){
  const s=scene;if(!s)return;scene=null;$("scene").hidden=true;s.done?.();
}
function sceneSay(tag,line,sub=""){
  if($("sceneLine").textContent!==line){$("sceneTag").textContent=tag;$("sceneLine").textContent=line;$("sceneSub").textContent=sub;const box=$("sceneWords");box.classList.remove("in");void box.offsetWidth;box.classList.add("in")}
}
function sceneFrame(now){
  const s=scene;if(!s)return;
  const t=s.freeze??(now-s.from)/1000,canvas=$("sceneCanvas"),ctx=canvas.getContext("2d"),ratio=Math.min(3,window.devicePixelRatio||1);
  if(t>s.length){endScene();return}
  const cw=Math.max(320,Math.round(canvas.clientWidth*ratio)),ch=Math.max(200,Math.round(canvas.clientHeight*ratio));if(canvas.width!==cw||canvas.height!==ch){canvas.width=cw;canvas.height=ch}
  // The picture is 420 units tall, or shorter than that on upright phones so the cast is never squeezed.
  const scale=Math.min(canvas.height/H,canvas.width/470),W=canvas.width/scale,tall=canvas.height/scale,lift=tall<=H+1?34:0,top=(tall-H)/2-lift,previous=pen;s.lift=lift;pen=ctx;
  try{ctx.imageSmoothingQuality="high";ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle="#0b0d1e";ctx.fillRect(0,0,canvas.width,canvas.height);ctx.setTransform(scale,0,0,scale,0,top*scale);
    ctx.save();ctx.beginPath();ctx.rect(0,0,W,H);ctx.clip();(s.kind==="open"?sceneOpen:sceneClose)(ctx,W,t,s);ctx.restore()}catch{}finally{pen=previous;ctx.setTransform(1,0,0,1,0,0)}
  requestAnimationFrame(sceneFrame);
}
function sceneBack(ctx,W,s,dim=0,drift=0){
  const [a,b,c,d]=sceneLook(s.level),sky=ctx.createLinearGradient(0,0,0,floor);sky.addColorStop(0,a);sky.addColorStop(1,b);ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
  oval(W*.76,110,30,30,"#fff3c4");ctx.save();ctx.globalAlpha=.3;oval(W*.76,110,64,64,softShade(W*.76,110,70,"#fff3c488"));ctx.restore();
  for(let layer=0;layer<2;layer++){ctx.fillStyle=layer?d:c;ctx.globalAlpha=layer?.9:.55;ctx.beginPath();ctx.moveTo(-10,H);
    for(let x=-10;x<=W+10;x+=14){const u=(x+drift*(layer?.5:.25)+s.level*90)*.009;ctx.lineTo(x,(layer?286:250)-Math.sin(u*1.9+layer)*26-Math.sin(u*4.3)*9)}ctx.lineTo(W+10,H);ctx.closePath();ctx.fill()}
  ctx.globalAlpha=1;const ground=ctx.createLinearGradient(0,floor,0,H);ground.addColorStop(0,c);ground.addColorStop(1,d);ctx.fillStyle=ground;ctx.fillRect(-10,floor,W+20,H-floor);box(-10,floor,W+20,3,"#ffffff30");
  if(dim){ctx.globalAlpha=dim;box(0,0,W,H,"#1a1c34");ctx.globalAlpha=1}
}
function sceneRunner(s,frame,x,y,size){oval(x,y+2,24*size,5*size,"#00000044");if(!drawClose(s.key,frame,x,y,size))drawSheet(riderSheet(s.key,me.tint),frame,x,y,size)}
function scenePerson(ctx,key,frame,x,y,size){
  // Townsfolk strips: 0 idle, 1 blink, 2 and 3 cheer. The old 12-15 "action" frames map onto the cheer pair.
  const slot=frame>=12?2+(frame%2):(ambientTime%3<.14?1:0);
  oval(x,y+2,22*size,5*size,"#00000044");ctx.save();ctx.translate(x,0);ctx.scale(-1,1);drawStrip(fetchSheet(key),slot,-14*size,y,size);ctx.restore();
}
function parcel(ctx,s,x,y,size=1){
  ctx.save();ctx.translate(x,y);ctx.scale(size,size);oval(0,0,19,19,"#fff8e6");ctx.lineWidth=3;ctx.strokeStyle="#ffb93c";ctx.beginPath();ctx.arc(0,0,19,0,6.283);ctx.stroke();itemAt(ctx,s.level,0,0,22);ctx.restore();
}
function closeUp(ctx,W,t,s,cheer,dim,dx=0){
  // The camera cuts to a front view, low and close.
  const [a,b]=sceneLook(s.level),glow=ctx.createRadialGradient(W*.5,H*.45,20,W*.5,H*.45,W*.8);glow.addColorStop(0,b);glow.addColorStop(1,a);ctx.fillStyle=glow;ctx.fillRect(0,0,W,H);
  for(let i=0;i<9;i++){ctx.globalAlpha=.08;const a2=i*.7+t*.25;poly("#ffffff",[W*.5,H*.5,W*.5+Math.cos(a2)*W,H*.5+Math.sin(a2)*W,W*.5+Math.cos(a2+.16)*W,H*.5+Math.sin(a2+.16)*W])}
  ctx.globalAlpha=1;if(dim){ctx.globalAlpha=dim;box(0,0,W,H,"#1a1c34");ctx.globalAlpha=1}
  const push=1+ease(t/1.6)*.08,size=3.1*push,x=W*.5-16+dx,y=H*.93+4*Math.sin(t*3);
  oval(x+10,H*.93,90,14,"#00000040");
  if(s.front)drawFront(s.front,cheer?2+(Math.floor(t*5)%2):(t%2.4<.14?1:0),x,y,size);
  else drawSheet(riderSheet(s.key,me.tint),cheer?13+(Math.floor(t*5)%2):10,x,y,size);
}
function confetti(ctx,W,t,amount){
  for(let i=0;i<amount;i++){const x=(i*97.3+t*22*(i%3+1))%W,y=(i*61.7+t*90*(i%4+1))%H;ctx.save();ctx.translate(x,y);ctx.rotate(t*3+i);box(-3.5,-1.8,7,3.6,["#ffd95a","#ff6f9f","#74efc6","#8f73ff"][i&3]);ctx.restore()}
}
function sceneOpen(ctx,W,t,s){
  const job=s.job,rank=storyRank(s.level),tag=(rank?"Delivery "+rank+" of "+storyIds.length:"Side job")+" · "+routes[s.level-1],fit=Math.min(1,W/560);
  if(t<2.7){
    // Shot 1, side on with a slow push-in: the hand-over.
    const push=1+ease(t/2.7)*.14,gx=W*.69,rx=-70+ease(t/1.15)*(W*.36+70),arrived=t>1.15;
    ctx.save();ctx.translate(W*.52,floor-50);ctx.scale(push,push);ctx.translate(-W*.52,-(floor-50));
    sceneBack(ctx,W,s);
    scenePerson(ctx,giverSheet(s.level),t>1.3&&t<2.3?12+(Math.floor(t*6)%4):10,gx,floor+2,1.3*fit+.1);
    sceneRunner(s,arrived?(t>2.25?13+(Math.floor(t*6)%2):10):12,rx,floor+2-(arrived?0:Math.abs(Math.sin(t/1.15*Math.PI*2))*36),1.3*fit+.1);
    const k=cap((t-1.5)/.75,0,1),px2=gx-34+(rx+30-(gx-34))*k,py=floor-88-Math.sin(k*Math.PI)*70;
    if(t<2.25)parcel(ctx,s,px2,py,1+Math.sin(k*Math.PI)*.25);else parcel(ctx,s,rx+4,floor-128-Math.abs(Math.sin(t*9))*8,1.1);
    ctx.restore();
    if(k>0&&!s.cue.hand){s.cue.hand=true;soundFX("pickup")}
    sceneSay(tag,"“Take these to "+job[3]+"!”","From "+job[2]+": "+job[1]);
  }else if(t<4.7){
    // Shot 2, front close-up: the runner and the parcel.
    const u=t-2.7;closeUp(ctx,W,u,s,u>1.1,0);parcel(ctx,s,W*.5+Math.min(120,W*.24),H*.5+Math.sin(u*4)*8,2.3);
    if(!s.cue.cut){s.cue.cut=true;soundFX("charge")}
    sceneSay(tag,"Deliver "+job[1],"The festival starts tonight. "+capital(job[3])+" is waiting.");
  }else{
    // Shot 3, side on: the rules of the run, then off they go.
    const u=t-4.7,rx=W*.3+u*u*W*.55;sceneBack(ctx,W,s,0,u*600);
    for(let i=0;i<6;i++){const x=((i*W/5-u*900)%(W+80)+W+80)%(W+80)-40;box(x,floor+30,50,3,"#ffffff2a")}
    const leap=Math.abs(Math.sin(u*6.5))*38;sceneRunner(s,12,rx,floor+2-leap,1.3*fit+.1);parcel(ctx,s,rx+4,floor-128-leap,1);
    if(!s.cue.go){s.cue.go=true;if(me.music){const th=themeFor(s.level),sl=60/th.bpm/4;for(let n=0;n<10;n++)playStep(th,n,n*sl,{age:20})}}
    sceneSay(tag,"⏱ Beat the clock","Hits cost time. Clean escapes win it back. Find the 3 hidden parcels for a gold sticker.");
  }
  if(t<.2||Math.abs(t-2.7)<.1||Math.abs(t-4.7)<.1){ctx.globalAlpha=.55*(1-Math.min(1,Math.min(Math.abs(t-2.7),Math.abs(t-4.7),t)/.1));box(0,0,W,H,"#ffffff");ctx.globalAlpha=1}
  if(t>s.length-.35){ctx.globalAlpha=cap((t-(s.length-.35))/.35,0,1);box(0,0,W,H,"#0b0d1e");ctx.globalAlpha=1}
}
const capital=text=>text.charAt(0).toUpperCase()+text.slice(1);
function stickerArt(ctx,id,x,y,r,state){
  // state 0 empty, 1 earned, 2 gold
  ctx.save();
  if(!state){ctx.setLineDash([r*.28,r*.2]);ctx.lineWidth=r*.09;ctx.strokeStyle="#ffffff66";ctx.beginPath();ctx.arc(x,y,r,0,6.283);ctx.stroke();ctx.globalAlpha=.25;itemAt(ctx,id,x,y,r*1.05);ctx.restore();return}
  oval(x+r*.06,y+r*.1,r*1.08,r*1.08,"#00000040");oval(x,y,r*1.08,r*1.08,state===2?"#ffcf3c":"#ffffff");oval(x,y,r*.92,r*.92,state===2?"#fff3c4":"#eef2ff");
  if(state===2){ctx.lineWidth=r*.07;ctx.strokeStyle="#c8860f";ctx.beginPath();ctx.arc(x,y,r*.99,0,6.283);ctx.stroke()}
  itemAt(ctx,id,x,y,r*1.12);if(state===2)star(x+r*.8,y-r*.8,r*.3,"#fff7c2");ctx.restore();
}
function sceneClose(ctx,W,t,s){
  const job=s.job,r=s.result||{onTime:true,bank:1,items:0,sticker:1,streak:1,bonus:0},tag=routes[s.level-1],fit=Math.min(1,W/560),dim=r.onTime?0:.34,parade=s.level===19;
  if(t<2.1){
    // Shot 1, side on: arriving and handing over.
    const push=1+ease(t/2.1)*.14,gx=W*.69,rx=-70+ease(t/1.0)*(W*.36+70),k=cap((t-1.15)/.7,0,1);
    ctx.save();ctx.translate(W*.52,floor-50);ctx.scale(push,push);ctx.translate(-W*.52,-(floor-50));
    sceneBack(ctx,W,s,dim);
    scenePerson(ctx,receiverSheet(s.level),k>=1&&r.onTime?12+(Math.floor(t*7)%4):10,gx,floor+2,1.3*fit+.1);
    const hopIn=t<1?Math.abs(Math.sin(t*Math.PI*2))*36:0;sceneRunner(s,t<1?12:k>=1&&r.onTime?13+(Math.floor(t*6)%2):10,rx,floor+2-hopIn,1.3*fit+.1);
    const px2=rx+4+(gx-30-(rx+4))*k,py=floor-128-hopIn+(40*k)-Math.sin(k*Math.PI)*46;parcel(ctx,s,px2,py,1+Math.sin(k*Math.PI)*.2);
    ctx.restore();
    if(k>0&&!s.cue.hand){s.cue.hand=true;soundFX("pickup")}
    sceneSay(tag,r.onTime?"“Right on time!”":"“You made it… just a bit late.”",capital(job[3])+" gets "+job[1]);
  }else if(t<4.0){
    // Shot 2, front close-up.
    const u=t-2.1;closeUp(ctx,W,u,s,r.onTime,dim);if(r.onTime)confetti(ctx,W,u,46);
    sceneSay(tag,"Delivered "+earlyText(r.bank),r.onTime?(r.streak>1?"Delivery streak ×"+r.streak+(r.bonus?" · +"+r.bonus:""):"First of a streak. Keep delivering without being caught."):"The clock ran out. Fewer hits keeps it on your side.");
  }else if(!parade||t<6.6){
    // Shot 3: the sticker spins in beside the runner, lands with a burst, then flies up to its place on the strip.
    const u=t-4.0,side=Math.min(125,W*.25),set=storyRank(s.level)?storyIds:bonusIds,owned=me.stickers||{},n=set.length;
    closeUp(ctx,W,u+1.9,s,r.onTime,dim+.18,-side*.55);
    const gap=Math.min(40,(W-24)/n),slotAt=i=>[W/2+(i-(n-1)/2)*gap,30+(s.lift||0)],mine=set.indexOf(s.level),landed=u>1.95;
    ctx.globalAlpha=cap(u/.3,0,1);box(0,0,W,60+(s.lift||0),"#0b0d1e99");
    set.forEach((id,i)=>{const [x,y]=slotAt(i);stickerArt(ctx,id,x,y,gap*.36,id===s.level?(landed?r.sticker:0):owned[id]||0)});ctx.globalAlpha=1;
    const home=[W*.5+side*.75,H*.44],fly=cap((u-1.5)/.45,0,1),drop=ease(cap(u/.45,0,1)),[sx,sy]=slotAt(mine);
    if(r.sticker){
      const x=u<1.5?W*.9+(home[0]-W*.9)*drop:home[0]+(sx-home[0])*ease(fly),y=u<1.5?-70+(home[1]+70)*drop:home[1]+(sy-home[1])*ease(fly)-Math.sin(fly*Math.PI)*40;
      const rad=u<1.5?(66+(1-drop)*70)*(1+.04*Math.sin(u*9)):66+(gap*.36-66)*ease(fly),spin=(1-drop)*9;
      if(!landed){ctx.save();ctx.translate(x,y);ctx.rotate(spin);stickerArt(ctx,s.level,0,0,rad,r.sticker);
        if(u>.5&&u<1.5){const sweep=((u-.5)*1.6)%1;ctx.globalAlpha=.5;ctx.beginPath();ctx.arc(0,0,rad*.92,0,6.283);ctx.clip();ctx.rotate(-.5);box(-rad*1.4+sweep*rad*2.8,-rad*1.2,rad*.3,rad*2.4,"#ffffff")}ctx.restore()}
      const hit=u-.45;if(hit>0&&hit<.9){for(let i=0;i<12;i++){const a=i*.5236,rr=74+hit*130;ctx.globalAlpha=1-hit/.9;star(home[0]+Math.cos(a)*rr,home[1]+Math.sin(a)*rr,7,i%2?"#ffe45c":"#ffffff")}ctx.globalAlpha=1}
      if(landed){const glow=u-1.95;ctx.globalAlpha=Math.max(0,1-glow/.5);star(sx,sy,10+glow*50,"#fff3a8");ctx.globalAlpha=1}
      if(u>.45)confetti(ctx,W,u,26);
      if(u>.45&&!s.cue.stamp){s.cue.stamp=true;soundFX("clear")}
      if(landed&&!s.cue.slot){s.cue.slot=true;soundFX("pickup")}
    }else{
      stickerArt(ctx,s.level,home[0],home[1],60,0);const [x,y]=slotAt(mine);ctx.globalAlpha=.5+.5*Math.sin(u*6);ctx.lineWidth=2;ctx.strokeStyle="#ffffff";ctx.beginPath();ctx.arc(x,y,gap*.44,0,6.283);ctx.stroke();ctx.globalAlpha=1;
      if(!s.cue.stamp){s.cue.stamp=true;soundFX("drop")}
    }
    sceneSay(tag,r.sticker===2?"Gold sticker!":r.sticker?"New sticker!":"No sticker this time",r.sticker===2?"All 3 hidden parcels found and delivered on time":r.sticker?(r.items<3?"Found "+r.items+" of 3 hidden parcels. All 3 makes it gold.":""):"Run it again and beat the clock to earn it.");
  }else{
    // The last path: everything that was delivered turns up in the parade.
    const u=t-6.6,owned=me.stickers||{};sceneBack(ctx,W,{level:12},0,u*120);confetti(ctx,W,u,60);
    const n=storyIds.length,step=Math.min(64,(W-40)/8),rows=[storyIds.slice(0,8),storyIds.slice(8)];
    rows.forEach((row,j)=>row.forEach((id,i)=>{const x=W/2+(i-(row.length-1)/2)*step,y=floor-212+j*66-Math.abs(Math.sin(u*4+i*.8+j))*10*(owned[id]?1:0);stickerArt(ctx,id,x,y,step*.4,owned[id]||0)}));
    for(let i=0;i<3;i++)sceneRunner(s,13+(Math.floor(t*5+i)%2),W*.5+(i-1)*Math.min(120,W*.26),floor+2-Math.abs(Math.sin(t*5+i))*14,1.05);
    if(!s.cue.parade){s.cue.parade=true;fanfare(0,62)}
    const [have,gold]=stickerCount();sceneSay("Poila Boishakh Parade","The festival begins!",have+" of "+n+" deliveries made it on time"+(gold?" · "+gold+" gold":"")+(have<n?". Empty spots can still be earned.":""));
  }
  const cuts=[2.1,4.0,parade?6.6:99];for(const cut of cuts)if(Math.abs(t-cut)<.1){ctx.globalAlpha=.55*(1-Math.abs(t-cut)/.1);box(0,0,W,H,"#ffffff");ctx.globalAlpha=1}
  if(t>s.length-.3){ctx.globalAlpha=cap((t-(s.length-.3))/.3,0,1);box(0,0,W,H,"#0b0d1e");ctx.globalAlpha=1}
}

// ---- the player's avatar: their runner, crowned once every festival sticker is earned ----
const crowned=()=>storyIds.every(id=>(me.stickers||{})[id]),allGold=()=>storyIds.every(id=>(me.stickers||{})[id]===2);
function crownArt(ctx,x,y,size,gems){
  ctx.save();ctx.translate(x,y);ctx.scale(size,size);ctx.rotate(-.08);
  poly("#c8860f",[-17,9,-19,-9,-9.5,0,0,-14,9.5,0,19,-9,17,9]);poly("#ffcf3c",[-15,7,-16.5,-6,-9,2,0,-10.5,9,2,16.5,-6,15,7]);box(-17,6,34,5,"#ffb428");box(-17,10,34,1.6,"#c8860f");
  for(const [px2,py,c] of [[-18,-10,"#ff5a6e"],[0,-15,"#5ad1ff"],[18,-10,"#ff5a6e"]])oval(px2,py,2.6,2.6,c);oval(0,8.2,2.4,2,"#ff5a6e");oval(-9,8.2,1.8,1.6,"#5ad1ff");oval(9,8.2,1.8,1.6,"#5ad1ff");
  if(gems)for(const [sx,sy] of [[-24,-18],[23,-20],[0,-26]])star(sx,sy,3.4,"#fff7c2");
  ctx.restore();
}
function paintAvatar(canvas){
  if(!canvas)return;const ctx=canvas.getContext("2d"),u=canvas.height/120,W=canvas.width/u,cx=W/2,key=riderKey(me.selected),front="front/"+key,king=crowned(),previous=pen;
  const im=front in bakedCast?riderSheet(front,me.tint):null;if(front in bakedCast)fetchSheet(front);
  ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,canvas.width,canvas.height);ctx.setTransform(u,0,0,u,0,0);ctx.imageSmoothingQuality="high";pen=ctx;let drawn=false;
  try{
    if(king){oval(cx,60,52,52,softShade(cx,60,56,"#ffe98a66"));oval(cx,111,40,8,"#8f1f33");oval(cx,107,38,8,"#e0455a");for(const side of [-1,1])oval(cx+side*37,109,4,4,"#ffcf3c")}
    else oval(cx,111,28,5,"#00000045");
    drawn=im?drawFront(front,king?2:0,cx+3,king?104:109,1.02):drawSheet(riderSheet(key,me.tint),king?13:10,cx+3,king?104:109,1.02);
    if(king)crownArt(ctx,cx,17,.95,allGold());
  }finally{pen=previous;ctx.setTransform(1,0,0,1,0,0)}
  // The portrait may still be decoding the first time; try again shortly.
  if(!drawn&&(canvas.tries=(canvas.tries||0)+1)<12)setTimeout(()=>paintAvatar(canvas),350);else if(drawn)canvas.tries=0;
}
function storyLobby(){
  const el=$("lobbyStickers");if(!el)return;const [have,gold]=stickerCount(),n=storyIds.length;
  el.textContent=crowned()?(allGold()?"All gold · crowned":"All "+n+" stickers · crowned"):have+" of "+n+" stickers";
  $("lobbyStreak").textContent=(gold?gold+" gold · ":"")+((me.streak||0)>1?"streak ×"+me.streak+" · ":"")+"map and sticker book";
  paintAvatar($("lobbyAvatar"));
}
// ---- journey map: one road, fifteen stops, a sticker at each ----
let mapChoice=0;
function openJourney(){
  if($("settings").disabled||scene)return;
  const owned=me.stickers||{},next=storyIds[Math.min(me.stage,storyIds.length)-1];mapChoice=unlocked(me.selected)?me.selected:next;
  const stop=id=>{
    const b=document.createElement("button"),dot=document.createElement("span"),name=document.createElement("small"),open=unlocked(id),rank=storyRank(id);
    const cleared=rank>0&&(rank<me.stage||rank===storyIds.length&&me.storyComplete),state=owned[id]||0;
    b.type="button";b.className="stop"+(state===2?" gold":state?" got":cleared?" late":open?" open":" locked")+(id===next&&!me.storyComplete?" next":"");b.dataset.id=id;b.disabled=!open;
    if(state||cleared||!rank)itemDot(dot,id);else dot.textContent=rank;name.textContent=routes[id-1];b.append(dot,name);
    b.setAttribute("aria-label",routes[id-1]+(state===2?", gold sticker":state?", sticker earned":cleared?", delivered late":open?", open":", locked"));
    b.onclick=()=>{mapChoice=id;mapPick()};return b;
  };
  const road=$("mapRoad");road.replaceChildren();
  for(let r=0;r<3;r++){const row=document.createElement("div");row.className="map-row"+(r%2?" back":"");for(const id of storyIds.slice(r*5,r*5+5))row.append(stop(id));road.append(row)}
  const side=$("mapSide");side.replaceChildren();for(const id of bonusIds)side.append(stop(id));
  // sticker book: every sticker in one place, festival first, then the side jobs
  const book=$("mapBook");book.replaceChildren();let total=0,golds=0;
  for(const id of [...storyIds,...bonusIds]){
    const state=owned[id]||0,tile=document.createElement("div"),dot=document.createElement("span"),name=document.createElement("small");total+=state?1:0;golds+=state===2?1:0;
    tile.className="book-sticker"+(state===2?" gold":state?" got":"");itemDot(dot,id);name.textContent=capital(jobs[id][1]);tile.append(dot,name);
    tile.setAttribute("aria-label",capital(jobs[id][1])+(state===2?", gold sticker":state?", sticker":", not earned yet"));book.append(tile);
  }
  $("bookCount").textContent=total+" of "+(storyIds.length+bonusIds.length)+(golds?" · "+golds+" gold":"");
  paintAvatar($("mapAvatar"));$("journeyCrown").hidden=!crowned();packSync();
  const [have,gold]=stickerCount();$("journeyHint").textContent=me.petName+" · "+have+" of "+storyIds.length+" festival stickers"+(gold?" · "+gold+" gold":"")+((me.streak||0)>1?" · streak ×"+me.streak:"");
  mapPick();$("journey").showModal();
}
function mapPick(){
  for(const b of $("journey").querySelectorAll(".stop"))b.setAttribute("aria-pressed",Number(b.dataset.id)===mapChoice);
  const job=jobs[mapChoice],state=(me.stickers||{})[mapChoice]||0;
  $("mapPick").textContent=routes[mapChoice-1]+": "+job[1]+" for "+job[3]+(state===2?" · gold":state?" · sticker earned":"");
}
function mapPlay(){
  const id=mapChoice;if(!unlocked(id))return;$("journey").close();
  if(mode==="levelup"&&id===(Number.isInteger(g?.tour)?tourOrder[g.tour+1]:storyIds[me.stage-1])){start();return}
  if((mode==="paused"||mode==="menu")&&g?.level===id){start();return}
  settleRun();delete me.tourCursor;me.selected=id;g=create();caughtBy=gain=null;shot=mood=toastFor=clock=0;spawn();
  playScene("open",()=>{setMode("play");beginIntro();save()});
}
// ---- sticker pack: once the festival set is complete, the stickers can be saved as pictures ----
const crcTable=(()=>{const t=new Uint32Array(256);for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;t[n]=c>>>0}return t})();
function crc32(bytes){let c=0xFFFFFFFF;for(let i=0;i<bytes.length;i++)c=crcTable[(c^bytes[i])&255]^(c>>>8);return (c^0xFFFFFFFF)>>>0}
// A plain zip with stored (uncompressed) entries; PNGs are already compressed.
function zipStore(files){
  const enc=new TextEncoder(),parts=[],central=[];let offset=0;
  for(const f of files){
    const name=enc.encode(f.name),crc=crc32(f.data),head=new DataView(new ArrayBuffer(30)),dir=new DataView(new ArrayBuffer(46));
    head.setUint32(0,0x04034b50,true);head.setUint16(4,20,true);head.setUint16(6,0x0800,true);head.setUint16(10,0,true);head.setUint16(12,0x21,true);head.setUint32(14,crc,true);head.setUint32(18,f.data.length,true);head.setUint32(22,f.data.length,true);head.setUint16(26,name.length,true);
    dir.setUint32(0,0x02014b50,true);dir.setUint16(4,20,true);dir.setUint16(6,20,true);dir.setUint16(8,0x0800,true);dir.setUint16(14,0x21,true);dir.setUint32(16,crc,true);dir.setUint32(20,f.data.length,true);dir.setUint32(24,f.data.length,true);dir.setUint16(28,name.length,true);dir.setUint32(42,offset,true);
    parts.push(head.buffer,name,f.data);central.push(dir.buffer,name);offset+=30+name.length+f.data.length;
  }
  const size=central.reduce((n,p)=>n+p.byteLength,0),end=new DataView(new ArrayBuffer(22));
  end.setUint32(0,0x06054b50,true);end.setUint16(8,files.length,true);end.setUint16(10,files.length,true);end.setUint32(12,size,true);end.setUint32(16,offset,true);
  return new Blob([...parts,...central,end.buffer],{type:"application/zip"});
}
const slug=text=>text.toLowerCase().replace(/^(the|a) /,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
async function stickerPictures(){
  try{await itemPic().decode()}catch{}
  const owned=me.stickers||{},out=[],list=[],toBytes=canvas=>new Promise(done=>canvas.toBlob(async blob=>done(new Uint8Array(await blob.arrayBuffer())),"image/png"));
  for(const id of [...storyIds,...bonusIds]){
    const state=owned[id]||0;if(!state)continue;
    const canvas=document.createElement("canvas"),ctx=canvas.getContext("2d"),previous=pen;canvas.width=canvas.height=512;pen=ctx;
    try{stickerArt(ctx,id,256,256,214,state)}finally{pen=previous}
    const name=String(out.length+1).padStart(2,"0")+"-"+slug(jobs[id][1])+(state===2?"-gold":"")+".png";
    out.push({name,data:await toBytes(canvas)});list.push({file:name,name:capital(jobs[id][1]),path:routes[id-1],gold:state===2});
  }
  const avatar=document.createElement("canvas");avatar.width=avatar.height=512;paintAvatar(avatar);out.push({name:"00-avatar.png",data:await toBytes(avatar)});
  out.push({name:"stickers.json",data:new TextEncoder().encode(JSON.stringify({pack:"Hop Crew",player:me.petName,stickers:list},null,1))});
  return out;
}
async function packZip(){
  if(!crowned())return;const hint=$("packHint");
  try{
    const blob=zipStore(await stickerPictures()),link=document.createElement("a");link.href=URL.createObjectURL(blob);link.download="hop-crew-stickers.zip";document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(link.href),4000);
    hint.textContent="Saved hop-crew-stickers.zip. Each sticker is a 512 pixel picture with a clear background.";
  }catch{hint.textContent="This browser would not save the file. Try Share pictures instead."}
}
async function packShare(){
  if(!crowned())return;
  try{
    const files=(await stickerPictures()).filter(f=>f.name.endsWith(".png")).map(f=>new File([f.data],f.name,{type:"image/png"}));
    if(navigator.canShare?.({files}))await navigator.share({files,title:"Hop Crew stickers"});else $("packHint").textContent="Sharing pictures is not available in this browser. Use Download instead.";
  }catch{/* The share sheet was closed. */}
}
function packSync(){
  const ready=crowned(),left=storyIds.filter(id=>!(me.stickers||{})[id]).length;
  $("packZip").disabled=$("packShare").disabled=!ready;$("packShare").hidden=!navigator.share;
  $("packHint").textContent=ready?"Your sticker pack is unlocked. Save the pictures to use them as stickers in your chats.":"Earn all "+storyIds.length+" festival stickers to unlock the sticker pack. "+left+" to go.";
}
function setupStory(){
  $("packZip").onclick=packZip;$("packShare").onclick=packShare;
  $("sceneSkip").onclick=endScene;$("openJourney").onclick=$("lobbyJourney").onclick=openJourney;$("closeJourney").onclick=()=>$("journey").close();$("mapPlay").onclick=mapPlay;
  $("sceneToggle").checked=me.scenes!==false;$("sceneToggle").onchange=e=>{me.scenes=e.target.checked;save()};
  window.addEventListener("keydown",e=>{if(!scene)return;e.stopPropagation();if(["Enter"," ","Escape"].includes(e.key)){e.preventDefault();endScene()}},true);
}
