// ---- v17 play pack: red dino boss, hidden traps, street surprises, clean-run multiplier, tutorial, rival gallery ----
// Terrain decides which traps a path can hide. One entry per path, in path order.
const terrain=["village","jungle","city","city","jungle","jungle","village","jungle","village","city","city","village","city","mars","city","jungle","desert","jungle","city","toy","city"];
const trapKinds={jungle:["pit","snare","swing"],village:["cart","dog","ball"],city:["cart","ball","string"],desert:["pit","snare"],toy:["ball","cart"],mars:[]};
const trapSpecs={
  pit:{w:66,h:16,need:"air",name:"Leaf pit",cost:20},snare:{w:34,h:16,need:"air",name:"Vine snare",cost:15},swing:{w:40,h:1,need:"duck",name:"Swinging log",cost:15},
  cart:{w:58,h:36,need:"air",name:"Runaway cart",cost:15},dog:{w:52,h:30,need:"air",name:"Street dog",cost:15},ball:{w:30,h:1,need:"duck",name:"Flying ball",cost:12},string:{w:26,h:1,need:"duck",name:"Kite string",cost:12}};
// The red dino is no longer a random rival: it waits near the end of the path.
for(const bag of routeFoes){const i=bag.indexOf("red");if(i>=0&&bag.length>1)bag.splice(i,1)}
const bossPath=level=>level!==city&&level!==mars;
const trapLead=o=>secondsAt(o.x-px-19*size())-secondsAt(g.d);
function makeTrap(x){
  const pool=trapKinds[terrain[g.level-1]]||[];if(!pool.length)return null;
  const trap=drawFromBag("traps",pool),s=trapSpecs[trap];
  return {kind:"trap",trap,x,w:s.w,h:s.h,need:s.need};
}
function placeBoss(x){
  if(me.boosters===0)g.items.push({kind:"boost",x,w:29,h:31});
  const entry=x+680;
  g.items.push({kind:"red",boss:true,x:entry,w:redWidth,h:redHeight,move:"double",taps:0,steady:0});
  g.bossPlaced=true;g.next=finishLine;
}
function mixMove(kind,base){
  if(kind==="red"||kind==="pursuit"||base==="low")return base;
  return roll()<.34?(base==="jump"?"double":"jump"):base;
}
function trapSound(trap){
  if(!me.sfx)return;
  if(trap==="pit"||trap==="snare"){note(2600,900,.10,.045,"noise");note(1900,700,.12,.04,"noise",.09)}
  else if(trap==="swing"){note(210,150,.22,.07,"sawtooth")}
  else if(trap==="dog"){note(520,380,.09,.11,"square");note(560,400,.09,.11,"square",.14)}
  else if(trap==="cart"){for(let j=0;j<3;j++)note(160,120,.06,.09,"triangle",j*.07)}
  else note(1250,1650,.09,.07,"sine");
}
function trapStep(o,left,right,h){
  const lead=trapLead(o);
  if(!o.told&&lead<.95){o.told=g.time;trapSound(o.trap)}
  if(left>o.x+o.w-5){if(!o.counted){o.counted=true;tally("traps")}return}
  if(right<o.x+5)return;
  if(o.need==="air"?h>=o.h:(h<6&&ducking()))return;
  o.done=true;o.sprung=g.time;g.streak=0;comboBreak();
  if(g.tutorial)return;
  if(g.shield){blockHit();return}
  takeDamage(trapSpecs[o.trap].cost,"trap",o);
}
// Clean-run multiplier: every six clean passes add a quarter, up to double. Any hit resets it.
const comboRate=()=>1+.25*Math.min(4,Math.floor((g?.combo||0)/6));
function comboBreak(){if(g&&g.combo){g.combo=0;comboSync()}}
function comboSync(){
  const chip=$("comboChip");if(!chip)return;const rate=comboRate();
  chip.hidden=!(g&&rate>1&&!g.tutorial);if(!chip.hidden)$("combo").textContent="×"+rate.toFixed(2).replace(/0$/,"");
}
const reviveCost=()=>rescuePrice*3**Math.min(4,g?.rescues||0), maxRevives=2;
function finalPush(){
  if(!g||g.tutorial||mode!=="play")return 1;
  const k=cap((g.d/courseLength-.62)/.2,0,1),ease=k*k*(3-2*k);
  if(k>0&&!g.pushSaid){g.pushSaid=true;toast="Final stretch · speed up!";toastFor=1.8}
  return 1+.14*ease;
}

// ---- trap and surprise art. x is the left edge on screen, floor is the road line. ----
function drawTrap(o,x){
  const t=g.time,mid=x+o.w/2,near=cap(1-(x-px)/330,0,1),lead=trapLead(o),sprung=o.sprung!=null?g.time-o.sprung:-1;
  const enter=cap(1-(lead-.45)/.55,0,1),ease=enter*enter*(3-2*enter);
  pen.save();
  if(o.trap==="pit"){
    if(sprung>=0){oval(mid,floor+3,o.w*.52,7,"#1c120e");for(let i=0;i<8;i++){const a=i*.8+1,r=sprung*90;pen.globalAlpha=cap(1-sprung*1.6,0,1);leaf(mid+Math.cos(a)*r*.6,floor-8-Math.abs(Math.sin(a))*r,a+sprung*9,i)}}
    else{oval(mid,floor+3,o.w*.5,5.5,"rgba(28,18,14,"+(.16+.34*near).toFixed(2)+")");
      for(let i=0;i<11;i++){const fx=x+6+(i*37%o.w)*.86,fy=floor+1+((i*13)%5)-2;leaf(fx,fy+Math.sin(t*9+i)*near*1.3,i*1.7+Math.sin(t*6+i)*.25*near,i)}
      if(near>.5)for(let i=0;i<2;i++){const k=(t*.9+i*.5)%1;pen.globalAlpha=(1-k)*.8;leaf(mid-12+i*22,floor-6-k*20,k*5+i,i+3)}}
  }else if(o.trap==="snare"){
    const lift=sprung>=0?Math.min(1,sprung*5):0;
    pen.strokeStyle="#56702a";pen.lineWidth=2.6;pen.lineCap="round";pen.beginPath();pen.moveTo(x-4,floor+2);pen.quadraticCurveTo(mid,floor-22-lift*26+Math.sin(t*7)*near,x+o.w+4,floor+2);pen.stroke();
    pen.strokeStyle="#8fb04a";pen.lineWidth=1;pen.beginPath();pen.moveTo(x-4,floor+1);pen.quadraticCurveTo(mid,floor-23-lift*26+Math.sin(t*7)*near,x+o.w+4,floor+1);pen.stroke();
    box(x-6,floor-3,4,7,"#5b4026");box(x+o.w+2,floor-3,4,7,"#5b4026");
    for(let p=0;p<5;p++)oval(mid+Math.cos(p*1.257)*3,floor-13-lift*13+Math.sin(p*1.257)*3,2.2,2.2,"#ff6f8f");oval(mid,floor-13-lift*13,1.6,1.6,"#ffe07a");
  }else if(o.trap==="swing"){
    const a=Math.sin(t*2.6+o.x)*(.18+.5*near)+(sprung>=0?-.9*Math.min(1,sprung*3):0),top=floor-250,len=198,lx=mid+Math.sin(a)*len,ly=top+Math.cos(a)*len;
    oval(lx,floor+3,24,4,"#2b1d1444");stroke([mid-8,top,lx-16,ly],"#6a5232",2.2);stroke([mid+8,top,lx+16,ly],"#6a5232",2.2);
    pen.translate(lx,ly);pen.rotate(-a*.5);pen.fillStyle="#7a4f2c";pen.beginPath();pen.ellipse(0,0,27,10,0,0,6.283);pen.fill();
    pen.fillStyle="#a06a3a";pen.beginPath();pen.ellipse(0,-3,24,5,0,0,6.283);pen.fill();oval(-25,0,4,9,"#d9a868");oval(-25,0,2,5,"#8a5a34");oval(8,-2,3,2,"#5a381f");
  }else if(o.trap==="cart"||o.trap==="dog"){
    // Rolls in from the far side of the road in the last second.
    const yy=floor-(1-ease)*34,sc=.72+.28*ease;pen.globalAlpha=cap(enter*3,0,1)*(sprung>=0?cap(1-sprung*2,0,1):1);
    oval(mid,yy+3,o.w*.5*sc,4,"#2b1d1455");pen.translate(mid,yy);pen.scale(sc,sc);
    if(o.trap==="cart"){
      box(-27,-28,54,17,"#8a5a34");box(-27,-30,54,4,"#b98048");box(-29,-13,58,3,"#5b3b22");stroke([27,-22,40,-34],"#5b3b22",3);
      for(const [fx,c] of [[-17,"#ff8a3c"],[-6,"#ffd45c"],[5,"#ff6f6f"],[16,"#8fd35a"]])oval(fx,-33,6.5,6,c);
      for(const wx of [-17,17]){oval(wx,-7,8.5,8.5,"#3a2a22");oval(wx,-7,5.5,5.5,"#c9a26a");for(let k=0;k<4;k++){const a=t*11+k*1.571;stroke([wx,-7,wx+Math.cos(a)*5,-7+Math.sin(a)*5],"#3a2a22",1.3)}}
    }else{
      const run=Math.sin(t*20),fur="#c98d52",dark="#8a5a30";
      for(const [lx,ph] of [[-13,0],[-8,3.1],[9,3.1],[14,0]])stroke([lx,-13,lx+Math.sin(t*20+ph)*7,-1],dark,3.4);
      oval(0,-17,19,9,fur);oval(-18,-24+run,8.5,7.5,fur);oval(-25,-22+run,4.5,3.5,"#f1d6ae");oval(-28,-23+run,1.6,1.4,"#2a1c16");
      poly(dark,[-16,-31+run,-12,-39+run,-10,-29+run]);oval(-20,-26+run,1.5,1.5,"#2a1c16");stroke([18,-20,27,-30+run*2],fur,3.2);
      box(-12,-20,3,6,"#e2504a");
    }
  }else if(o.trap==="ball"){
    const bounce=Math.abs(Math.sin(t*5.2+o.x*.01)),by=floor-34-bounce*26,spin=t*9;
    pen.globalAlpha=cap(enter*3,0,1)*(sprung>=0?cap(1-sprung*2.5,0,1):1);oval(mid,floor+3,11-bounce*3,3,"#2b1d1455");
    pen.translate(mid,by);pen.rotate(spin);oval(0,0,12,12,"#f25c54");pen.fillStyle="#fff4e0";pen.beginPath();pen.moveTo(0,0);pen.arc(0,0,12,0,1.05);pen.closePath();pen.fill();pen.beginPath();pen.moveTo(0,0);pen.arc(0,0,12,2.09,3.14);pen.closePath();pen.fill();pen.beginPath();pen.moveTo(0,0);pen.arc(0,0,12,4.19,5.24);pen.closePath();pen.fill();oval(0,0,3,3,"#ffd45c");
  }else if(o.trap==="string"){
    const sag=Math.sin(t*3+o.x)*2,x0=mid-150,y0=floor-190,x1=mid+26,y1=floor-6;
    box(x1-2,floor-62,4,64,"#5b4026");oval(x1,floor-63,4,3,"#8a5a34");
    pen.strokeStyle="rgba(250,244,214,"+(.35+.6*near).toFixed(2)+")";pen.lineWidth=1.5;pen.beginPath();pen.moveTo(x0,y0);pen.quadraticCurveTo(mid-40,floor-70+sag,x1,floor-58);pen.stroke();
    for(let k=1;k<4;k++){const f=k/4,fx=x0+(x1-x0)*f,fy=y0+(floor-58-y0)*f+18*f*(1-f)*2+sag*f;poly(["#ff6f8f","#ffd45c","#6fd3c6"][k-1],[fx,fy,fx+7,fy+3,fx+1,fy+9])}
    const gl=(t*1.4)%1;oval(x0+(x1-x0)*gl,y0+(floor-58-y0)*gl+10,2,2,"#ffffffcc");
  }
  pen.restore();
  if((o.trap==="cart"||o.trap==="dog"||o.trap==="ball")&&enter>0&&enter<.9&&sprung<0){
    const bx=mid,by=floor-74-Math.sin(t*14)*2;oval(bx,by,10,10,"#ffd23d");poly("#ffd23d",[bx-4,by+8,bx+4,by+8,bx,by+15]);box(bx-1.5,by-6,3,8,"#4a2a05");box(bx-1.5,by+4,3,3,"#4a2a05");
  }
}
function leaf(x,y,turn,i){
  pen.save();pen.translate(x,y);pen.rotate(turn);pen.fillStyle=["#6f9a3a","#b99a3a","#587f33","#8a6a2c"][i&3];pen.beginPath();pen.ellipse(0,0,6.4,2.9,0,0,6.283);pen.fill();
  pen.strokeStyle="#3d4f22";pen.lineWidth=.6;pen.beginPath();pen.moveTo(-6,0);pen.lineTo(6,0);pen.stroke();pen.restore();
}

// ---- red dino boss: wind-up, then a jet of fire at head height ----
let redAct=null;
function bossFlame(o,x){
  if(o.kind!=="red"||o.done||o.pass)return;
  const lead=fireStage(o);if(lead>1.88||lead<.5)return;
  const s=redHeight/93*1.22,srcX=x+o.w/2-46*s,srcY=floor-64*s,tarX=px+4,tarY=floor-50,t=g.time;
  pen.save();
  if(lead>1.30){   // inhale: embers stream into the open jaws
    const k=1-(lead-1.30)/.58;
    const glow=pen.createRadialGradient(srcX,srcY,2,srcX,srcY,26+k*30);glow.addColorStop(0,"rgba(255,196,90,"+(.35+.5*k).toFixed(2)+")");glow.addColorStop(1,"rgba(255,120,40,0)");pen.fillStyle=glow;pen.fillRect(srcX-60,srcY-60,120,120);
    for(let j=0;j<9;j++){const f=(t*2.6+j/9)%1,a=j*2.4+1,r=(1-f)*(46+j*4);oval(srcX-Math.abs(Math.cos(a))*r,srcY+Math.sin(a)*r*.6,2.4*(1-f)+.8,2.4*(1-f)+.8,j%2?"#ffd378":"#ff9a45")}
    pen.restore();return;
  }
  const p=cap((1.30-lead)/.46,0,1),fade=lead>=.78?1:cap((lead-.5)/.28,0,1);
  // A solid body first so the jet reads against a bright sky, then a glow on top.
  for(let pass=0;pass<3;pass++){
    pen.globalAlpha=fade*[.62,.8,.95][pass];pen.fillStyle=["#f0481c","#ff9a2e","#ffe680"][pass];
    for(let j=0;j<22;j++){
      const f=(j/22)*p,wob=Math.sin(j*1.9+t*17)*(2+f*10),xx=srcX+(tarX-srcX)*f,yy=srcY+(tarY-srcY)*f+wob,r=(9+f*30)*(.82+.18*Math.sin(j+t*23))*[1,.68,.38][pass];
      pen.beginPath();pen.ellipse(xx,yy,r*1.15,r*.8,0,0,6.283);pen.fill();
    }
  }
  pen.globalAlpha=1;pen.globalCompositeOperation="lighter";
  for(let j=0;j<12;j++){
    const f=(j/12)*p,xx=srcX+(tarX-srcX)*f,yy=srcY+(tarY-srcY)*f,r=22+f*46,core=pen.createRadialGradient(xx,yy,0,xx,yy,r);
    core.addColorStop(0,"rgba(255,220,140,"+(.22*fade).toFixed(2)+")");core.addColorStop(1,"rgba(255,90,30,0)");pen.fillStyle=core;pen.beginPath();pen.arc(xx,yy,r,0,6.283);pen.fill();
  }
  pen.globalCompositeOperation="source-over";pen.globalAlpha=fade;
  for(let j=0;j<10;j++){const f=((t*1.7+j/10)%1)*p,xx=srcX+(tarX-srcX)*f,yy=srcY+(tarY-srcY)*f-18*f-Math.sin(j*3+t*9)*14*f;oval(xx,yy,1.8,1.8,j%2?"#fff2a0":"#ff8a3c")}
  const lick=pen.createRadialGradient(tarX+40,floor,4,tarX+40,floor,150);lick.addColorStop(0,"rgba(255,150,60,"+(.22*p*fade).toFixed(2)+")");lick.addColorStop(1,"rgba(255,150,60,0)");pen.fillStyle=lick;pen.fillRect(tarX-120,floor-40,330,60);
  pen.restore();
}

// ---- tutorial: four taught moves on a private, harmless stretch of the first path ----
const coachSteps=[
  {at:3.6,make:"small",need:"jump",lead:.34,text:"Tap JUMP",sub:"Keyboard: Space or ↑",btn:"jump"},
  {at:8.0,make:"tall",need:"jump",lead:.40,text:"Tall one: tap JUMP",sub:"then tap again in the air",btn:"jump",then:{need:"air",text:"Tap JUMP again!",sub:"A second tap lifts you higher",btn:"jump"}},
  {at:12.8,make:"langur",need:"duck",lead:.66,text:"Hold DUCK",sub:"Keyboard: ↓ or S",btn:"duck"},
  {at:18.4,make:"tiger",need:"boost",lead:.98,text:"Tap BOOST",sub:"Keyboard: B. Use it when the banner turns green",btn:"boost",then:{need:"jump",lead:.36,text:"Now JUMP!",sub:"A boosted jump beats the rival",btn:"jump"}},
  {at:25.2,make:"red",need:"jump",lead:.42,text:"Red dino: tap JUMP",sub:"He breathes fire low, so go over it",btn:"jump",then:{need:"air",text:"Tap JUMP again!",sub:"Tip: a glinting clay pot hides a Star charm that beats him outright",btn:"jump"}}];
function startTutorial(){
  const run=freshRun(1);
  Object.assign(run,{tutorial:true,flight:null,survey:false,artifactSerial:-1,next:1e12,replay:true,coach:{i:0,phase:0,doneAt:null}});
  if(run.show)run.show.branch="main";
  for(const step of coachSteps){
    const x=distanceAt(step.at)+px;
    if(step.make==="small"||step.make==="tall")run.items.push({kind:step.make,x,w:30,h:step.make==="tall"?78:36,shape:0,art:routeHazards[0][0]});
    else{const e=encounters[step.make];run.items.push({kind:step.make,x,w:e.w,h:e.h,move:e.move,taps:0,steady:0,boss:step.make==="red"})}
  }
  g=run;caughtBy=gain=null;shot=mood=toastFor=0;clock=0;fetchSheet("langur");fetchSheet("tiger");fetchSheet("red");
  gameFrame.dataset.coach="1";setMode("play");coachShow(null);save();
}
function endTutorial(completed){
  me.tutorialDone=true;g=null;delete gameFrame.dataset.coach;coachShow(null);setMode("ready");
  if(completed){$("prompt").textContent="You're ready!";$("hint").textContent="Jump, duck and boost. Traps hide on the road, and the red dino waits near the finish.";}
  save();
}
function coachShow(step){
  const el=$("coach");if(!el)return;
  for(const id of ["jump","duck","boost"])$(id).classList.toggle("coach-target",!!step&&step.btn===id);
  el.hidden=!step;if(step){if($("coachText").textContent!==step.text){$("coachText").textContent=step.text;$("coachSub").textContent=step.sub}}
}
function coachGate(){
  const c=g.coach,el=$("coach");if(!c)return false;
  const step=coachSteps[c.i];
  if(!step){coachShow(null);if(c.doneAt==null)c.doneAt=g.time;else if(g.time>c.doneAt+1.5){endTutorial(true);return true}return false}
  const item=g.items.find(o=>Math.abs(o.x-(distanceAt(step.at)+px))<1);
  if(!item||(item.done&&!c.phase&&step.need!=="boost")){next();return false}
  const lead=secondsAt(item.x-px-19*size())-secondsAt(g.d),cur=c.phase?step.then:step;
  function next(){if(!c.phase&&step.then)c.phase=1;else{c.i++;c.phase=0}}
  el.classList.remove("wait");
  if(!c.phase&&lead>cur.lead+1.5){coachShow(null);return false}
  coachShow(cur);
  let waiting=false;
  if(cur.need==="jump"){if(lead<=cur.lead){if(g.h>0||g.v>0||g.buffer>0)next();else waiting=true}}
  else if(cur.need==="duck"){if(lead<=cur.lead){if(ducking())next();else waiting=true}}
  else if(cur.need==="boost"){if(lead<=cur.lead){if(g.power>0)next();else waiting=true}}
  else if(cur.need==="air"){if(g.h===0&&g.v===0&&g.age===0&&lead<-.2)next();else if(g.air&&g.age>=airTapAge+.03)waiting=true;else if(!g.air&&g.h>0)next()}
  el.classList.toggle("wait",waiting);
  return waiting;
}

// ---- rival gallery: every rival with the move that beats it ----
function buildRivalGrid(){
  const grid=$("rivalGrid");if(!grid||grid.dataset.built)return;grid.dataset.built="1";
  const order=["red","tiger","boar","cobra","croc","langur","eagle","kite","anaconda","crab","clock","owl","bat","cat","alien","pursuit"];
  for(const kind of order){
    const spec=encounters[kind];if(!spec)continue;
    const card=document.createElement("div"),cv=document.createElement("canvas"),name=document.createElement("strong"),move=document.createElement("span");
    card.className="rival-card";cv.width=240;cv.height=170;cv.setAttribute("aria-hidden","true");name.textContent=spec.name;
    move.className="move "+spec.move;move.textContent=kind==="red"?"Duck the flame, then double jump":encounterHint[spec.move];
    card.append(cv,name,move);grid.append(card);cv.dataset.kind=kind;
  }
  paintRivals();setTimeout(paintRivals,700);setTimeout(paintRivals,2200);
}
function paintRivals(){
  for(const cv of document.querySelectorAll("#rivalGrid canvas")){
    const kind=cv.dataset.kind,spec=encounters[kind],ctx=cv.getContext("2d"),previous=pen,air=flyerNames.includes(kind)||kind==="eagle"||kind==="kite";
    const fit=kind==="red"?.6:Math.min(1.5,200/spec.w,120/spec.h);
    pen=ctx;ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,240,170);
    try{ctx.translate(120,kind==="langur"?210:air?196:152);ctx.scale(fit,fit);drawFoe(kind,0,0,kind==="red"?redHeight/93:1.16,false,2,air&&kind!=="langur"?1:.4)}catch{}finally{pen=previous;ctx.setTransform(1,0,0,1,0,0)}
  }
}

// ---- v19 star charm: a hidden treasure that shows up on some runs, at a random spot, and beats the red dino outright ----
function charmDue(x){
  if(!bossPath(g.level)||g.charmPlaced||g.tutorial)return false;
  g.charmAt??=roll()<.6?courseLength*(.18+.46*roll()):-1;
  return g.charmAt>0&&x>=g.charmAt&&x<finishLine-2900;
}
function charmSync(){const chip=$("charmChip");if(chip)chip.hidden=!(g&&g.charm&&!g.tutorial)}
function charmFound(){
  g.charm=true;toast="Star charm found · it scares the red dino";announcePower("Star charm found");charmSync();
  if(me.sfx)for(const [j,f] of [784,988,1175,1568].entries())note(f,f,.22,.11,"sine",j*.07,j%2?.6:-.6,.35,.35);
}
function charmStrike(o){
  g.charm=false;o.done=true;o.burned=true;o.charmed=true;o.brokenAt=g.time;escapeStamp(o,"flame");
  tally("rivals");tally("boss","Beaten");reward(150,false);toast="Star charm! Red dino sent packing  +150";toastFor=2.4;charmSync();
  if(me.sfx){voice({f:300,f2:2400,len:.5,vol:.14,wave:"sawtooth",cut:3000,pan:-.6,pan2:.7,room:.4,echo:.3});soundFX("impact");soundFX("clear")}
  save();
}
// Hidden in plain sight: a clay pot by the road that only glints now and then.
function charmArt(o,x){
  const t=g.time,mid=x+16,near=cap(1-(x-px)/420,0,1),blink=Math.max(0,Math.sin(t*2.3+o.x*.01))**8;
  pen.save();pen.translate(mid,floor);pen.scale(1.4,1.4);pen.translate(-mid,-floor);
  oval(mid,floor+2,15,3.2,"#00000038");
  poly("#a85f38",[mid-11,floor,mid-13,floor-12,mid-8,floor-21,mid+8,floor-21,mid+13,floor-12,mid+11,floor]);
  poly("#c8794a",[mid-9,floor-2,mid-10,floor-12,mid-6,floor-19,mid-1,floor-19,mid-3,floor-2]);
  box(mid-9,floor-24,18,4,"#8a4a2c");box(mid-11,floor-14,22,2,"#f1c27a");
  pen.save();pen.globalAlpha=cap(blink+near*.55,0,1);star(mid+2,floor-31-Math.sin(t*4)*2,5+near*3,"#fff3a8");
  if(near>.3){pen.globalAlpha=near*.5;oval(mid,floor-30,16,16,softShade(mid,floor-30,18,"#ffe98a88"))}
  pen.restore();pen.restore();
}
function charmBurst(o,x){
  const age=g.time-o.brokenAt;if(age>1.1)return;
  const cx=x+o.w*.4,cy=floor-70,k=age/1.1;pen.save();pen.globalCompositeOperation="lighter";
  pen.globalAlpha=(1-k)*.85;oval(cx,cy,30+k*190,30+k*190,softShade(cx,cy,40+k*200,"#fff0a0aa"));
  for(let i=0;i<12;i++){const a=i*.5236+age*2,r=20+k*170;pen.globalAlpha=(1-k);star(cx+Math.cos(a)*r,cy+Math.sin(a)*r*.7,7*(1-k)+2,i%2?"#ffe45c":"#ffffff")}
  pen.restore();
}

// ---- v31 explosions: one toon blast used by plane bombs, thrown charges and mines ----
// q runs 0..1 over the life of the blast. size 1 is a plane bomb.
function boom(x,y,q,size=1,tint="#ffb347"){
  if(!(q>=0&&q<1))return;
  const s=size,grow=1-Math.pow(1-q,3),fade=q<.55?1:1-(q-.55)/.45;
  pen.save();
  // light on the ground and a shock ring
  pen.globalAlpha=(1-q)*.55;oval(x,y+2,(46+grow*40)*s,(7+grow*5)*s,"#ffd98a");
  pen.globalAlpha=(1-q)*.9;pen.lineWidth=(5-q*4)*s;pen.strokeStyle="#fff2c4";pen.beginPath();pen.ellipse(x,y+1,(18+grow*78)*s,(5+grow*15)*s,0,0,6.283);pen.stroke();
  // smoke that outlives the fire
  for(let i=0;i<7;i++){
    const a=i*.9+.4,r=(10+grow*34)*s,sx=x+Math.cos(a)*r*.9,sy=y-(14+grow*46+i*5)*s-Math.abs(Math.sin(a))*r*.5,rad=(9+grow*15+i%3*3)*s;
    pen.globalAlpha=Math.max(0,(q-.12)*1.4)*fade*.75;const smoke=pen.createRadialGradient(sx-rad*.3,sy-rad*.3,rad*.1,sx,sy,rad);smoke.addColorStop(0,"#8f8794");smoke.addColorStop(1,"#3b3644");pen.fillStyle=smoke;pen.beginPath();pen.arc(sx,sy,rad,0,6.283);pen.fill();
  }
  // the fireball: overlapping puffs, bright in the middle
  const heat=Math.max(0,1-q*1.55);
  if(heat>0)for(let i=0;i<9;i++){
    const a=i*.698+.2,r=(i?8+grow*30:0)*s,fx=x+Math.cos(a)*r,fy=y-(16+grow*26)*s-Math.sin(a)*r*.72,rad=((i?13:22)+grow*(i?13:20))*s;
    pen.globalAlpha=Math.min(1,heat*1.5);const fire=pen.createRadialGradient(fx,fy,rad*.08,fx,fy,rad);
    fire.addColorStop(0,"#fffbe0");fire.addColorStop(.32,"#ffe066");fire.addColorStop(.62,tint);fire.addColorStop(.86,"#e2542b");fire.addColorStop(1,"rgba(150,40,30,0)");
    pen.fillStyle=fire;pen.beginPath();pen.arc(fx,fy,rad,0,6.283);pen.fill();
  }
  // opening flash
  if(q<.16){pen.globalAlpha=1-q/.16;oval(x,y-18*s,(30+q*260)*s,(26+q*220)*s,"#fffdf0");star(x,y-18*s,(40+q*200)*s,"#ffffff")}
  // sparks and thrown bits
  for(let i=0;i<12;i++){
    const a=-Math.PI*(.08+.84*((i*.618)%1)),v=(120+((i*37)%70))*s,t=q*.7,px2=x+Math.cos(a)*v*t,py=y-12*s+Math.sin(a)*v*t+220*s*t*t;
    pen.globalAlpha=Math.max(0,1-q*1.25);
    if(i%3){pen.lineCap="round";pen.lineWidth=2.4*s;pen.strokeStyle=i%2?"#fff1a8":"#ffb04a";pen.beginPath();pen.moveTo(px2,py);pen.lineTo(px2-Math.cos(a)*9*s,py-Math.sin(a)*9*s-3*s*t);pen.stroke()}
    else{pen.save();pen.translate(px2,py);pen.rotate(q*9+i);box(-2.6*s,-2.6*s,5.2*s,5.2*s,"#4a3f48");pen.restore()}
  }
  pen.restore();
}

// ---- v33 road obstacles: baked toon props. The tables are written by tools/bake/bake7.py. ----
const PROP=/*@@PROP@@*/{"tile":[252,324],"items":{"kiln":[0,0,59,122,135,194],"kiln+":[1,0,72,41,109,275],"urn":[2,0,59,149,135,160],"urn+":[3,0,77,54,99,255],"flower":[4,0,66,146,117,170],"flower+":[5,0,70,40,113,276],"brick":[6,0,44,135,165,172],"brick+":[7,0,44,45,165,262],"basket":[8,0,58,162,137,154],"basket+":[9,0,58,41,137,275],"log":[0,1,11,145,231,164],"log+":[1,1,45,48,159,268],"root":[2,1,33,162,164,162],"root+":[3,1,47,39,153,285],"reel":[4,1,61,153,131,158],"reel+":[5,1,61,27,131,284],"crate":[6,1,42,185,169,122],"crate+":[7,1,42,59,179,248],"ribbed":[8,1,59,145,135,164],"ribbed+":[9,1,78,33,97,283],"sluice":[0,2,38,188,177,121],"sluice+":[1,2,60,5,133,304],"pipe":[2,2,8,187,228,127],"pipe+":[3,2,80,46,93,270],"barrel":[4,2,59,173,135,132],"barrel+":[5,2,59,42,135,263],"lotus":[6,2,56,205,141,105],"lotus+":[7,2,56,43,141,267],"reed":[8,2,61,167,125,152],"reed+":[9,2,45,50,154,269],"paddle":[0,3,21,148,212,161],"paddle+":[1,3,72,29,109,287],"tea":[2,3,42,155,169,155],"tea+":[3,3,42,38,169,272],"stone":[4,3,52,169,149,145],"stone+":[5,3,65,34,123,280],"crystal":[6,3,53,153,142,171],"crystal+":[7,3,38,45,172,279],"column":[8,3,53,152,147,157],"column+":[9,3,53,32,147,277],"boulder":[0,4,48,185,146,129],"boulder+":[1,4,65,52,123,262],"lash":[2,4,73,156,105,168],"lash+":[3,4,73,30,105,294],"bollard":[4,4,75,187,109,129],"bollard+":[5,4,75,31,109,285],"drum":[6,4,66,130,132,179],"drum+":[7,4,66,0,132,309],"lantern":[8,4,70,152,113,164],"lantern+":[9,4,70,17,113,299],"hive":[0,5,37,92,155,219],"hive+":[1,5,37,49,155,262],"tire":[2,5,57,85,139,222],"tire+":[3,5,57,35,139,272],"cone":[4,5,49,144,155,165],"cone+":[5,5,49,54,155,255],"beacon":[6,5,63,158,127,151],"beacon+":[7,5,63,23,127,286],"stall":[8,5,10,72,219,244],"stall+":[9,5,10,72,219,244],"wheel":[0,6,60,165,133,144],"wheel+":[1,6,56,84,141,225],"stump":[2,6,60,210,132,106],"stump+":[3,6,60,31,156,285],"shell":[4,6,56,160,141,152],"shell+":[5,6,71,14,108,310],"bell":[6,6,65,161,123,149],"bell+":[7,6,54,19,145,300],"cactus":[8,6,59,142,136,169],"cactus+":[9,6,53,29,147,295]}},STREET=/*@@STREET@@*/{"tile":[324,324],"items":{"diner":[0,0,12,61,301,248],"diner+":[1,0,12,61,301,248],"table":[2,0,86,129,153,187],"table+":[3,0,86,129,153,187],"vending":[4,0,103,118,119,191],"vending+":[5,0,103,118,119,191],"sign":[6,0,116,26,89,290],"sign+":[7,0,116,26,89,290],"busstop":[8,0,56,135,206,181],"busstop+":[9,0,56,135,206,181],"bench":[10,0,87,217,151,92],"bench+":[11,0,87,217,151,92],"chai":[12,0,64,104,197,205],"chai+":[13,0,64,104,197,205],"haystack":[14,0,76,145,173,173],"haystack+":[15,0,92,93,147,225],"signpost":[16,0,68,104,185,213],"signpost+":[17,0,68,104,185,213],"tent":[18,0,66,83,193,241],"tent+":[19,0,66,83,193,241],"flag":[20,0,138,34,80,282],"flag+":[21,0,138,34,80,282],"well":[22,0,90,106,145,210],"well+":[23,0,90,106,145,210],"fruitcart":[24,0,55,90,219,224],"fruitcart+":[25,0,55,90,219,224]}};
function drawProp(o,x,w,h){
  const im=fetchSheet("props"),base=PROP?.items[o.art];if(!im?.naturalWidth||!base)return false;
  const it=h/w>1.55&&PROP.items[o.art+"+"]||base,[tw,th]=PROP.tile,a=it[4]/it[5],dh=h*1.05,dw=cap(dh*a,w*.92,w*1.32);
  oval(x+w*.52,floor+1.5,dw*.54,3.2,"#312d3b55");
  pen.drawImage(im,it[0]*tw+it[2],it[1]*th+it[3],it[4],it[5],x+w/2-dw/2,floor-dh+1.5,dw,dh);return true;
}
// Scenery set pieces: large landmarks that stand in a far row behind the path life (tools/bake/bake8.py).
const SCENE=/*@@SCENE@@*/{"unit":3.0,"items":{"hut":[1458,1304,218,184,109,180],"hut+":[1678,1304,218,184,109,180],"temple":[1550,318,250,265,125,265],"temple+":[0,601,250,265,125,265],"horse":[1230,318,158,271,74,271],"horse+":[1390,318,158,271,74,271],"pots":[956,1860,205,127,103,123],"pots+":[1163,1860,205,127,103,123],"house":[464,1304,256,200,128,200],"house+":[722,1304,256,200,128,200],"gate":[1764,601,199,220,100,220],"gate+":[0,868,199,220,100,220],"tulsi":[994,1692,104,153,52,153],"tulsi+":[1100,1692,104,153,52,153],"lamp":[480,1692,65,165,24,165],"lamp+":[547,1692,65,165,24,165],"cot":[0,2120,156,57,68,52],"cot+":[158,2120,156,57,68,52],"wall":[1540,2008,227,85,119,85],"wall+":[1769,2008,227,85,119,85],"bigtent":[201,868,220,220,118,216],"bigtent+":[423,868,220,220,118,216],"restcamel":[614,1692,188,163,77,158],"restcamel+":[804,1692,188,163,77,158],"matka":[576,1860,188,138,105,134],"matka+":[766,1860,188,138,105,134],"fortgate":[800,601,220,250,110,250],"fortgate+":[1022,601,220,250,110,250],"stand":[1244,601,258,230,136,226],"stand+":[1504,601,258,230,136,226],"pgate":[1126,0,204,311,102,303],"pgate+":[1332,0,204,311,102,303],"bigstall":[1032,1090,217,206,119,202],"bigstall+":[1251,1090,217,206,119,202],"balloons":[1538,0,101,288,47,288],"balloons+":[1641,0,101,288,46,288],"mangotree":[624,0,249,313,120,294],"mangotree+":[875,0,249,313,120,294],"palm":[258,318,186,277,88,264],"palm+":[446,318,186,277,88,264],"banyan":[0,0,310,316,152,292],"banyan+":[312,0,310,316,152,292],"bambooclump":[634,318,296,274,148,266],"bambooclump+":[932,318,296,274,148,266],"teabush":[834,2008,351,108,181,103],"teabush+":[1187,2008,351,108,181,103],"teashed":[1370,1860,252,122,131,117],"teashed+":[1624,1860,252,122,131,117],"jungleplant":[903,868,272,219,132,220],"jungleplant+":[1177,868,272,219,132,220],"reeds":[686,1508,193,172,101,168],"reeds+":[881,1508,193,172,101,168],"watertank":[1076,1508,119,170,55,165],"watertank+":[1197,1508,119,170,55,165],"clothesline":[1766,1692,230,146,115,142],"clothesline+":[0,1860,230,146,115,142],"kiterack":[350,1508,166,179,69,172],"kiterack+":[518,1508,166,179,69,172],"stairhut":[0,1508,173,182,72,182],"stairhut+":[175,1508,173,182,72,182],"shopfront":[0,1692,238,166,118,166],"shopfront+":[240,1692,238,166,118,166],"bookstall":[1451,868,175,213,90,209],"bookstall+":[1628,868,175,213,90,209],"boat":[1318,1508,330,167,185,166],"boat+":[1650,1508,330,167,185,166],"stilthut":[184,1090,212,209,89,204],"stilthut+":[398,1090,212,209,89,204],"ferris":[1744,0,260,281,130,275],"ferris+":[0,318,256,281,128,275],"lanternrack":[612,1090,208,207,104,202],"lanternrack+":[822,1090,208,207,104,202],"habitat":[1206,1692,278,147,139,147],"habitat+":[1486,1692,278,147,139,147],"antenna":[252,601,95,264,41,264],"antenna+":[349,601,95,264,41,264],"solar":[0,2008,228,110,114,106],"solar+":[230,2008,228,110,114,106],"totem":[645,868,127,220,71,220],"totem+":[774,868,127,220,71,220],"beachhut":[1470,1090,251,203,102,198],"beachhut+":[1723,1090,251,203,102,198],"lounger":[0,1304,230,202,113,198],"lounger+":[232,1304,230,202,113,198],"blocks":[1805,868,182,212,80,212],"blocks+":[0,1090,182,212,80,212],"signal":[614,601,89,254,28,254],"signal+":[705,601,93,254,28,254],"station":[980,1304,237,187,123,187],"station+":[1219,1304,237,187,123,187],"newsstand":[232,1860,170,144,76,144],"newsstand+":[404,1860,170,144,76,144],"streetclock":[446,601,82,259,41,259],"streetclock+":[530,601,82,259,41,259],"crates":[460,2008,185,109,86,108],"crates+":[647,2008,185,109,86,108]}};
const sceneSize={hut:1.7,temple:1.95,horse:1.2,pots:1.3,house:2.8,gate:2.0,tulsi:1.2,lamp:2.0,cot:1.5,wall:1.8,bigtent:1.85,restcamel:1.45,matka:1.3,fortgate:2.6,stand:1.23,pgate:1.7,bigstall:1.65,balloons:1.35,
  mangotree:1.75,palm:2.2,banyan:1.9,bambooclump:1.7,teabush:1.3,teashed:2.2,jungleplant:1.3,reeds:1.2,watertank:1.6,clothesline:1.4,kiterack:1.3,stairhut:2.2,shopfront:2.4,bookstall:1.45,boat:1.5,stilthut:1.9,ferris:2.3,lanternrack:1.6,
  habitat:2.6,antenna:2.3,solar:1.6,totem:1.75,beachhut:1.7,lounger:1.3,blocks:1.3,signal:1.8,station:2.1,newsstand:1.9,streetclock:1.65,crates:1.25};
function drawScene(name,x,y,persp){
  const im=fetchSheet("scene"),it=SCENE?.items[name];if(!im?.naturalWidth||!it)return;
  const k=sceneSize[name.replace("+","")]*persp/SCENE.unit;
  oval(x+(it[2]/2-it[4])*k,y+1,it[2]*k*.47,Math.max(1.5,it[2]*k*.03),"#00000030");
  pen.drawImage(im,it[0],it[1],it[2],it[3],x-it[4]*k,y-it[5]*k,it[2]*k,it[3]*k);
}
// Street furniture is drawn standing on a ground line, at a given scale.
function drawStreet(name,x,y,scale){
  const im=fetchSheet("street"),it=STREET?.items[name];if(!im?.naturalWidth||!it)return;
  const [tw,th]=STREET.tile,unit=tw/108*1.5,w=it[4]/unit*scale,h=it[5]/unit*scale;
  pen.drawImage(im,it[0]*tw+it[2],it[3],it[4],it[5],x-w/2,y-h,w,h);
}
// ---- Neon Causeway street life ----
// Everything here has a true place in the 3D street: a depth (z, in world units behind the running lane), a ground
// speed, and a real size. It is projected through the same camera as the scenery, so it scales, scrolls and sits
// on the ground exactly as the street does, and it is drawn back to front. Each lane has one speed, so nothing
// passes through anything else. The 3D street keeps its lane (z 5 to 11) and pavement (z 11 to 14) clear for this.
const neonSize={walker:.69,taxi:1.45,hatch:1.45,van:1.5,scooter:1.2,bike:1.15,diner:1.9,table:1.55,"table+":1.55,vending:1.45,"vending+":1.45,sign:1.3,"sign+":1.3,busstop:1.95};
const neonCast=(()=>{
  const list=[],P=3000,walkers=["racer","crew","florist","spool","builder","keeper","mask","bandit","desert","kolkata","drummer","racer"];
  // cycle lane by the kerb, then the two traffic lanes
  [["bike",300],["bike",1650]].forEach(([k,at])=>list.push({k,at,z:5.6,v:150,ride:true}));
  [["taxi",0],["scooter",560],["hatch",1150],["van",1800],["scooter",2400]].forEach(([k,at])=>list.push({k,at,z:7.0,v:300,ride:true}));
  [["hatch",250],["taxi",900],["scooter",1500],["van",2050],["taxi",2650]].forEach(([k,at])=>list.push({k,at,z:9.4,v:-285,ride:true}));
  // pavement: people walking each way in their own file, then the diner, tables and street furniture behind them
  walkers.forEach((k,i)=>list.push({k,at:i*250+((i*97)%120),z:i%2?12.35:11.65,v:i%2?-42:42,walk:true}));
  [["diner",0],["table",150],["table+",260],["sign",420],["vending",640],["busstop",900],["sign+",1180],["vending+",1330],["table",1480],["diner",1700],["table+",1850],["sign",2080],["vending",2300],["busstop",2560],["table",2840]]
    .forEach(([k,at])=>list.push({k,at,z:13.2,v:0,fixed:true}));
  list.sort((a,b)=>b.z-a.z);list.period=P;return list;
})();
// ---- path life on every other path ----
// The same rules as Neon Causeway: a true depth, one ground speed per lane, a real size, the scenery camera, back to
// front. On these paths the life keeps to the open ground between the running lane and the first scenery, so it is
// always in front of everything in the 3D world. Depths come from a scan of each world (tools note in the README).
Object.assign(neonSize,{cow:1.15,goat:1.15,dog:1.1,camel:1.35,duck:.9,rickshaw:1.18,oxcart:1.25,floatowl:1.15,floattiger:1.15,floatfish:1.15,rover:1.05,bench:1.4,"bench+":1.4,chai:1.5,"chai+":1.5,haystack:1.6,"haystack+":1.6,signpost:1.4,"signpost+":1.4,tent:1.6,"tent+":1.6,flag:1.6,"flag+":1.6,well:1.45,"well+":1.45,fruitcart:1.45,"fruitcart+":1.45});
const lifeBands={open:{ride:[1.8,2.5],walk:[3.1,3.6],fixed:4.1},kerb:{ride:[2.0,3.2],walk:[5.0,5.45],fixed:5.85},jungle:{ride:null,walk:[1.7,2.2],fixed:2.8},shore:{ride:[1.7,2.3],walk:[2.9,3.4],fixed:3.9},court:{ride:[1.8,2.6],walk:[3.3,3.8],fixed:4.2},dune:{ride:[1.8,2.5],walk:[3.3,3.9],fixed:4.9},rail:{ride:[2.0,3.2],walk:[5.0,5.5],fixed:6.4}};
const strips=["cow","goat","dog","camel","duck","rickshaw","oxcart","rover","taxi","hatch","van","scooter","bike","floatowl","floattiger","floatfish"];
// zone: [band, walkers and animals at walking pace, riders, ride speed, furniture, far row [depth, set pieces], riders all go one way]
const lifePlan={
  0:["court",["keeper","goat","florist","kolkata","dog","builder"],["bike"],150,["chai","bench","flag","fruitcart"],[6.8,["hut","pots","mangotree","horse","tulsi","hut+","pots+","banyan"]]],
  1:["open",["florist","cow","spool","oxcart","keeper","goat"],["bike"],150,["haystack","fruitcart","signpost","bench"],[6.7,["mangotree","crates","hut","mangotree+","crates+","mangotree","hut+","banyan"]]],
  2:["kerb",["spool","racer","mask","dog","crew","florist"],["bike","scooter"],180,["bench+","flag","chai"],[8.4,["kiterack","watertank","clothesline","stairhut","kiterack+","clothesline+","watertank+","stairhut+"]]],
  3:["kerb",["kolkata","crew","builder","florist","keeper"],["rickshaw","bike","scooter"],170,["bench+","signpost","chai+"],[8.4,["shopfront+","bookstall","shopfront","streetclock","shopfront+","newsstand","shopfront","bookstall+"]]],
  4:["open",["florist","duck","keeper","duck","spool","goat"],["bike"],150,["bench","signpost","well"],[6.7,["reeds","boat","stilthut","reeds+","bambooclump","boat+","reeds","stilthut+"]]],
  5:["open",["keeper","cow","florist","oxcart","builder"],["bike"],150,["chai+","bench","haystack+"],[6.7,["teabush","teashed","teabush+","mangotree","teabush","teashed+","teabush+","banyan"]]],
  6:["open",["desert","goat","builder","oxcart","bandit","dog"],["bike"],150,["signpost+","tent","well"],[8,["hut","horse","pots","temple","hut+","pots+","horse+","hut"]]],
  7:["open",["builder","duck","keeper","duck","florist"],["bike"],150,["bench","flag+","signpost"],[6.7,["bambooclump","stilthut","boat","bambooclump+","reeds","stilthut+","bambooclump","boat+"]]],
  8:["open",["keeper","cow","florist","kolkata","dog","drummer"],["rickshaw","bike"],150,["chai","flag","bench","fruitcart+"],[6.7,["boat","temple","banyan","boat+","reeds","temple+","palm","pots"]]],
  9:["kerb",["drummer","mask","florist","kolkata","spool","racer","keeper"],["rickshaw"],130,["chai","flag","flag+","fruitcart"],[8.4,["ferris","bigstall","stand","pgate","balloons","bigstall+","stand+","lanternrack"]]],
  10:["kerb",["mask","spool","racer","keeper","florist"],["bike"],150,["bench+","flag+","chai+"],[8.4,["lanternrack","stairhut","watertank","lanternrack+","clothesline","stairhut+","lanternrack","watertank+"]]],
  11:["open",["keeper","dog","florist","tower","goat"],["bike"],150,["bench","well+","signpost"],[8,["house","lamp","tulsi","gate","wall","cot","lamp+","house+","tulsi+","wall+"]]],
  13:["open",["crew","racer","crew"],["rover","rover"],70,["signpost+","tent+"],[6.7,["habitat","solar","antenna","habitat+","solar+","antenna+","habitat","solar"]]],
  14:["kerb",["kolkata","crew","florist","builder","drummer","keeper"],["rickshaw","bike","rickshaw","scooter"],170,["chai","bench+","fruitcart","busstop"],[8.4,["shopfront","bookstall","banyan","shopfront","newsstand","bookstall+","streetclock","shopfront"]]],
  15:["jungle",["builder","dog","desert","keeper"],[],0,["tent+","signpost+"],[5.2,["jungleplant","totem","stilthut+","jungleplant+","bambooclump","totem+","jungleplant","palm"]]],
  16:["dune",["desert","camel","keeper","camel","drummer","goat"],["bike"],150,["tent","flag","well"],[8.6,["bigtent","restcamel","matka","fortgate","restcamel+","bigtent+","matka+","restcamel"]]],
  17:["shore",["racer","dog","spool","duck","florist"],["bike","scooter"],180,["bench+","tent+","signpost","fruitcart+"],[6.5,["palm","beachhut","lounger","boat","palm+","lounger+","beachhut+","palm"]]],
  18:["kerb",["drummer","mask","kolkata","florist","drummer","mask","spool"],["floatowl","floatfish","floattiger"],46,["flag","flag+","chai","fruitcart"],[[8.8,["stand","pgate","stand+","bigstall","balloons","stand","bigstall+","stand+","pgate+","balloons+","stand","stand+"]],[12.2,["bigstall","mangotree","bigstall+","ferris","bigstall","banyan","bigstall+","mangotree+"]]],true],
  19:["rail",["racer","mask","spool","dog","florist"],["bike","scooter"],180,["bench+","signpost+","flag+"],[8.4,["station","blocks","signal","blocks+","station+","signal+","blocks","signal"]]],
  20:["kerb",["tower","bandit","crew","kolkata","keeper"],["taxi","scooter","hatch"],290,["bench+","busstop","vending","sign+"],[8.4,["shopfront+","newsstand","streetclock","shopfront+","bookstall","newsstand+","shopfront+","streetclock+"]]],
  // side trails, in the order of the forks: Spool Alley, Boatbuilders' Pier, Afterglow Tunnel, Marigold Arcade, Jaguar Ruins,
  // Indigo Stepwell, Moonpool Grotto, Maskmakers' Lane, Escapement Loft, Clocktower Market
  21:["kerb",["spool","florist","kolkata","dog","keeper"],["bike"],150,["bench+","flag","chai"]],
  22:["kerb",["builder","dog","keeper","builder","duck"],["bike"],150,["bench","signpost","fruitcart"]],
  23:["kerb",["racer","crew","racer"],["scooter","bike"],200,["vending","sign","bench+"]],
  24:["open",["florist","kolkata","spool","florist","goat"],["rickshaw"],130,["chai","fruitcart","flag"]],
  25:["open",["builder","desert","dog","keeper"],[],0,["tent+","signpost+"]],
  26:["open",["keeper","desert","keeper","goat","camel"],[],0,["well","flag","tent"]],
  27:["open",["duck","duck","duck","duck"],[],0,[]],   // tidal pools: only ducks paddle here
  28:["open",["mask","drummer","mask","spool","kolkata"],["rickshaw"],130,["flag+","chai+","fruitcart+"]],
  29:["kerb",["racer","spool","builder","crew"],["bike"],150,["bench+","signpost+"]],
  30:["open",["tower","kolkata","bandit","keeper","florist"],["scooter"],200,["vending+","chai","bench+","sign"]]};
const lifeCasts={};
function lifeCastOf(zone){
  if(zone===12)return neonCast;if(zone in lifeCasts)return lifeCasts[zone];
  const plan=lifePlan[zone];if(!plan)return lifeCasts[zone]=null;
  const [bandName,walkers,riders,rideSpeed,fixed,far,oneWay]=plan,band=lifeBands[bandName],list=[],P=3000;
  // people and animals share two files at one walking pace; riders share two lanes at one riding pace
  walkers.forEach((k,i)=>{const lane=i%2,n=Math.ceil(walkers.length/2),slot=Math.floor(i/2);list.push({k,at:slot*P/n+lane*P/(2*n)+90,z:band.walk[lane],v:lane?-40:40,walk:!strips.includes(k),strip:strips.includes(k)})});
  if(band.ride)riders.forEach((k,i)=>{const lane=i%2,n=Math.ceil(riders.length/2),slot=Math.floor(i/2);list.push({k,at:slot*P/n+lane*P/(2*n)+500,z:band.ride[lane],v:lane&&!oneWay?-rideSpeed:rideSpeed,strip:true,ride:true})});
  // far rows of set pieces: one [depth, pieces] or several of them, each further back
  if(far)(Array.isArray(far[0])?far:[far]).forEach((row,r)=>row[1].forEach((k,i)=>list.push({k,at:(i+r*.5)*P/row[1].length+170,z:row[0],v:0,fixed:true,scene:true})));
  // furniture stands in a row at the back of the open ground, two of each across the loop
  const spots=fixed.length*2;for(let i=0;i<spots;i++)list.push({k:fixed[i%fixed.length],at:i*P/spots+((i*131)%140)+40,z:band.fixed,v:0,fixed:true});
  list.sort((a,b)=>b.z-a.z);list.period=P;return lifeCasts[zone]=list;
}
let neonLast=[],neonHorn=-9,lifeLayer=null;
// On dark paths the path life is drawn on its own layer and tinted with the night colour, so it sits in the scene.
const lifeNight={3:[30,40,80,.12],9:[40,24,70,.12],10:[24,22,80,.2],11:[10,40,70,.26],15:[8,44,40,.16],20:[26,20,84,.3],23:[40,16,90,.3],27:[10,36,84,.22],29:[60,34,30,.16],30:[26,20,84,.3]};
function neonLife(d,t,zone=12){
  const cam=liveCamera,cast=lifeCastOf(zone);if(!STREET||!cam||!cast)return;const W=width,P=cast.period,still=reducedMotion?.matches;if(still)t=2;
  const dim=lifeNight[zone];let main=null;
  if(dim){
    lifeLayer||=document.createElement("canvas");if(lifeLayer.width!==c.width||lifeLayer.height!==c.height){lifeLayer.width=c.width;lifeLayer.height=c.height}
    const L=lifeLayer.getContext("2d");L.setTransform(1,0,0,1,0,0);L.clearRect(0,0,c.width,c.height);L.setTransform(pen.getTransform());main=pen;pen=L;
  }
  pen.save();
  cast.forEach((o,i)=>{
    // game-space x of this thing right now, taken from the copy nearest the camera
    const X=d+wrap(o.at+o.v*t-d+1100,P)-1100,p=viewPoint([X/cam.unit,0,o.z],cam);if(p[2]<=1)return;
    const persp=FOCAL/p[2]/cam.unit,x=p[0],y=p[1];if(x<(o.scene?-260:-190)||x>W+(o.scene?260:190))return;
    if(o.scene){drawScene(o.k,x,y,persp);return}
    if(o.fixed){drawStreet(o.k,x,y,neonSize[o.k]*persp);return}
    if(o.walk){
      const k=neonSize.walker*persp;oval(x,y+1,13*k,2.6*k,"#00000040");
      pen.save();pen.translate(x,y);if(o.v<0)pen.scale(-1,1);drawSheet(fetchSheet(o.k),Math.floor(t*10+i*3)%12,0,0,k);pen.restore();return;
    }
    const im=fetchSheet("street/"+o.k),float=o.k.startsWith("float");
    if(im?.naturalWidth){
      const fw=im.width/4,k=neonSize[o.k]*persp,wide=float||["taxi","hatch","van","oxcart"].includes(o.k);
      oval(x+2*k,y+1,(wide?36:o.k==="duck"?7:17)*k,(wide?4:2.4)*k,"#00000045");
      pen.save();pen.translate(x,y);if(o.v<0)pen.scale(-1,1);pen.drawImage(im,(Math.floor(t*(float?5:o.ride?12:7)+i)%4)*fw,0,fw,im.height,-91*k,-104*k,256/1.5*k,112*k);pen.restore();
    }
    if(!o.ride||o.k==="rover"||float)return;
    // a horn or a bell now and then as something passes the middle of the street
    const mid=W*.5,was=neonLast[i];neonLast[i]=x;
    if(!still&&mode==="play"&&me.sfx&&was!=null&&(was-mid)*(x-mid)<0&&Math.abs(x-was)<60&&t-neonHorn>(zone===12?5:9)&&hash(i*7+Math.floor(t))>.4){neonHorn=t;streetSound(o.k==="rickshaw"?"bike":o.k,cap((x-mid)/mid,-1,1)+(o.v<0?-.3:.3))}
  });
  pen.restore();
  if(main){
    pen.setTransform(1,0,0,1,0,0);pen.globalCompositeOperation="source-atop";pen.fillStyle="rgba("+dim.join(",")+")";pen.fillRect(0,0,c.width,c.height);pen.globalCompositeOperation="source-over";
    pen=main;pen.save();pen.setTransform(1,0,0,1,0,0);pen.drawImage(lifeLayer,0,0);pen.restore();
  }
}
function streetSound(kind,pan){
  if(!audioBus)return;
  if(kind==="bike")for(const [j,f] of [1568,2093].entries())voice({f,len:.5,vol:.035,wave:"sine",at:j*.09,pan,room:.5,echo:.2});
  else if(kind==="scooter")for(let j=0;j<2;j++)voice({f:880,len:.09,vol:.04,wave:"square",cut:2600,at:j*.14,pan,room:.35});
  else for(const f of [392,494])voice({f,len:kind==="van"?.42:.26,vol:.032,wave:"square",cut:1800,attack:.01,hold:.8,pan,pan2:pan*.4,room:.45});
}
