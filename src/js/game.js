"use strict";
const $=id=>document.getElementById(id), c=$("world");
let pen=c.getContext("2d");
const H=420, floor=326, px=109, dt=1/120, gravity=1570, maxSpeed=390, key="dino-bluster-v1";
const redHeight=162, redWidth=205, megaSize=3.75, airTapAge=.085, inputBuffer=.18;
const rescuePrice=20, rescueTime=3000, boostTime=1.25, chompTime=2050;
// Stable IDs preserve saved runs when story chapters are added after existing bonus paths.
const storyIds=[1,2,3,4,5,6,7,8,9,10,11,12,17,18,19];
const bonusIds=[13,14,15,16,20,21];
const storyRank=id=>storyIds.indexOf(id)+1,bonusRank=id=>bonusIds.indexOf(id)+1;
const routes=["Terracotta Courtyard","Mango Grove","Kite Rooftops","Monsoon Lane","Lotus Pond","Tea Garden","Red Earth Trail","Bamboo Bridge","Riverside Ghat","Festival Lane","Lantern Rooftops","Firefly Courtyard","Neon Causeway","Mars Relay","Kolkata Street","Amazon Rainforest","Rajasthan Desert","Tropical Island Adventure","Poila Boishakh Parade","Clockwork Toy Railway","Midnight City"];
const C=storyIds.map(id=>routes[id-1]);
const FSTART=32,FEND=62;
const newFields=[
 ["Dune outpost","Caravan scouts","desert","#ffa536","#7cffe1",["low","lob","high"],"urn"],
 ["Emerald strand","Coconut crabs","crab","#ff846b","#59f5ec",["lob","low","high"],"reed"],
 ["Parade ground","Dhak procession","drummer","#ff926c","#fff18b",["high","low","lob"],"drum"],
 ["Clockworks","Wind-up sentinels","clock","#ffe289","#88e9f5",["low","high","lob"],"wheel"],
 ["Midnight City","Rooftop bats","bat","#ffc54a","#9ccaff",["high","lob","low"],"beacon"]
];
// Spur format: road, setting, cast, palette, pattern, obstacle, briefing.
const detours={
 3:["Kite bazaar","Spool Alley","spool","#fc7269","#70eade",["high","lob","low"],"reel","Weavers fly ribbon kites between stacked dye houses."],
 9:["Ferry road","Boatbuilders’ Pier","builder","#ffba65","#62d8cc",["low","lob","high"],"bollard","Boatwrights roll timber past unfinished wooden hulls."],
 13:["Causeway","Afterglow Tunnel","racer","#ff70cb","#65fcf5",["low","high","low"],"cone","Tunnel couriers race beneath electric pink light ribs."],
 15:["Tram road","Marigold Arcade","florist","#ffb02a","#f36592",["lob","high","low"],"basket","Flower sellers toss garlands under bright canvas awnings."],
 16:["River trail","Jaguar Ruins","jaguar","#ffc33f","#79efa3",["high","lob","low"],"stone","A spotted guardian stalks the terraced jungle sanctuary."],
 17:["Caravan road","Indigo Stepwell","keeper","#6ceadf","#ffb478",["low","lob","high"],"urn","Follow the water carriers through tiers of blue stone."],
 18:["Palm beach","Moonpool Grotto","ray","#9efaff","#ae97ff",["high","low","lob"],"crystal","A luminous ray glides between tidal pools and violet crystals."],
 19:["Parade road","Maskmakers’ Lane","mask","#ff855e","#ffdc61",["lob","high","lob"],"drum","Painted tiger masks bob above an artisans’ courtyard."],
 20:["Express track","Escapement Loft","owl","#ffd475","#80edeb",["high","low","high"],"wheel","A brass owl guards the great escapement wheels."],
 21:["Midnight avenue","Clocktower Market","tower","#d3c8fd","#ffe063",["high","lob","low"],"bell","The clock-tower keeper swings his lantern over the night market."]
};
const branchIds=Object.keys(detours).map(Number);
const branchProps={3:["reel","basket","crate"],9:["bollard","log","barrel"],13:["cone","beacon","pipe"],15:["basket","urn","flower"],16:["stone","root","stump"],17:["urn","stone","brick"],18:["crystal","shell","reed"],19:["drum","reel","urn"],20:["wheel","bell","pipe"],21:["bell","column","beacon"]};
const forks=Object.fromEntries(branchIds.map(id=>[id,detours[id].slice(0,2)]));
function spurAt(id,t){return !!detours[id]&&g?.level===id&&g.show?.branch==="spur"&&t>=FSTART&&t<FEND}
function sceneZone(id,d){return spurAt(id,secondsAt(d))?routes.length+branchIds.indexOf(id):id-1}
function currentField(){return spurAt(g.level,secondsAt(g.d))?detours[g.level]:fieldShows[g.level-1]}
const extraPalettes=[
 ["#236794","#ffcf89","#cf8357","#e3ab65","#70804b","#ffad35"],
 ["#1289bd","#bffbde","#2daab0","#ebc88b","#147655","#ff7956"],
 ["#368fb0","#ffdf94","#ac6863","#b9956c","#507762","#ff6358"],
 ["#41516e","#ffc688","#9c7666","#916d56","#437c76","#ffc864"],
 ["#0b142e","#626c99","#344468","#293047","#273f52","#ffce52"],
 ["#4a5096","#fec98f","#b87884","#ae7775","#387887","#fc6864"],
 ["#497b97","#ffbe7a","#73777a","#a5825a","#428c83","#ffac60"],
 ["#161335","#694997","#3c345e","#403654","#267186","#ff689e"],
 ["#b36282","#ffe0a2","#af746c","#b18a59","#4c855c","#ffaf39"],
 ["#153b46","#a5b48a","#486c58","#6e7553","#306047","#ffd14c"],
 ["#345e86","#f3b58e","#818a93","#678b99","#477e73","#ffbe77"],
 ["#173450","#6f9fa9","#406c83","#456071","#368c89","#a4f8ec"],
 ["#983e67","#ffd399","#ac706e","#b08866","#477a69","#ffba4e"],
 ["#283e55","#d39064","#735b56","#735d50","#2f7376","#ffd278"],
 ["#10132e","#706484","#403953","#393549","#3d4558","#f9c56a"]
];

// Active running time is shared by every path. The distance curve integrates the acceleration
// exactly, so a slower display and a faster display reach the same landmark on the same tick.
const runSeconds=25*60/routes.length, acceleration=164/runSeconds;
const distanceAt=t=>218*t+.5*acceleration*t*t;
const secondsAt=d=>(Math.sqrt(218*218+2*acceleration*Math.max(0,d))-218)/acceleration;
const speedAt=d=>218+acceleration*secondsAt(d);
const city=13, mars=14, kolkata=15, courseLength=distanceAt(runSeconds), finishLine=courseLength+px;
const routeFoes=[
  ["langur","cobra","red"],["tiger","langur","boar"],["eagle","langur","red"],
  ["eagle","cobra","boar"],["croc","eagle","cobra"],["tiger","boar","langur"],
  ["boar","cobra","red"],["croc","langur","tiger"],["eagle","croc","red"],
  ["langur","eagle","cobra"],["eagle","langur","red"],["tiger","boar","cobra"],
  ["pursuit"],["alien"],["kite"],["anaconda"],["cobra","eagle","boar"],["crab","croc","cobra"],["langur","boar","kite"],["clock","owl"],["bat","cat"]
];
const encounters={
  bat:{name:"Midnight bat",w:95,h:77,move:"low"},cat:{name:"Night-market cat",w:96,h:58,move:"jump"},owl:{name:"Clockwork owl",w:99,h:79,move:"low"},clock:{name:"Clockwork sentinel",w:78,h:76,move:"jump"},crab:{name:"King coconut crab",w:88,h:41,move:"jump"},
  red:{name:"Red Dino · Boss",w:redWidth,h:redHeight,move:"double"},
  eagle:{name:"Storm eagle",w:118,h:104,move:"low"},
  tiger:{name:"Bengal tiger",w:137,h:83,move:"jump"},
  boar:{name:"Tusker boar",w:112,h:74,move:"jump"},
  cobra:{name:"Hooded cobra",w:81,h:93,move:"double"},
  langur:{name:"Rooftop langur",w:122,h:88,move:"low"},
  croc:{name:"River mugger",w:145,h:68,move:"double"},
  pursuit:{name:"Neon interceptor",w:146,h:66,move:"jump"},
  alien:{name:"Relay stalker",w:137,h:99,move:"double"},
  anaconda:{name:"Floodplain anaconda",w:144,h:71,move:"double"},
  kite:{name:"Bazaar black kite",w:119,h:109,move:"low"}
};
const encounterHint={jump:"Jump",double:"Double jump",low:"Duck"};
function rollEvents(level,seed){
  // A separate seed keeps reloading or opening a path preview from changing the event deck.
  let x=seed>>>0;
  function next(){x=(Math.imul(x,1664525)+1013904223)>>>0;return x/4294967296}
  const survey=next()<.46, flyby=level!==mars&&next()<.49;
  const start=22+next()*9;
  return {survey,flight:flyby?{start,hits:[false,false]}:null};
}
function makeEncounter(x){
  const kinds=routeFoes[g.level-1], kind=drawFromBag("foes",kinds);
  const spec=encounters[kind];
  const move=kind==="alien"?drawFromBag("alienMoves",["jump","double","low"]):mixMove(kind,spec.move);
  // One introductory charge per path, with a safety supply before a red dino if inventory is empty.
  if(me.boosters===0&&(!g.supplyOffered||kind==="red")){
    g.items.push({kind:"boost",x,w:29,h:31});g.supplyOffered=true;
  }
  const entry=x+680;
  g.items.push({kind,x:entry,w:spec.w,h:spec.h,move,taps:0,steady:0});
  g.next=entry+spec.w+550;g.untilRed=4+Math.floor(roll()*3);
}
function encounterLead(o){return secondsAt(o.x-px-19*size())-secondsAt(g.d)}
function nextThreat(){
  return g?.items.find(o=>isEncounter(o)&&!o.done&&!o.pass&&encounterLead(o)<=2.65&&encounterLead(o)>=-.03);
}
function recordTap(){
  const o=nextThreat();
  if(o&&encounterLead(o)<=1.02){
    o.taps=(o.taps||0)+1;o.lastTap=g.time;
  }
}
function spendCharge(){
  if(mode!=="play"||(me.boosters<=0&&!g.tutorial)||g.power>0)return;
  const o=nextThreat();
  if(!o||encounterLead(o)>1.02)return;
  soundFX("charge");g.power=boostTime;announcePower(me.rider===3?"Pixel power activated":me.rider===8?"Mega trumpet!":"Mega power activated");o.charged=true;if(!g.tutorial)me.boosters--;save();hud();c.focus({preventScroll:true});
}
function handleRival(o,h){
  const move=o.move||encounters[o.kind].move;
  const clear=move==="low"?o.steady>=.075&&h<=6:
    (o.taps||0)>=(move==="double"?2:1)&&g.time-(o.lastTap??-3)<=.68&&h>=16;
  if(o.kind==="pursuit"){
    escapeStamp(o,"drive");o.pass={clean:clear,charged:!!o.charged&&g.power>0};save();return
  }
  if(clear&&o.charged&&g.power>0){resolveEncounter(o,true);return}
  if(!clear&&o.kind==="red"&&!g.shield&&!contactRate()){if(!beginRescue(o))resolveEncounter(o,false);return}
  escapeStamp(o,clear?"dodge":"hit");endDodge(o,clear);
}
function takeDamage(amount,source="impact",obstacle=null){
  if(g.tutorial||g.time<(g.safetyUntil||0)||blockHit())return;comboBreak();tally("hits");if(obstacle?.boss)tally("boss","Got you");
  if(source==="blast")amount=Math.round(amount*burstRate());if(source!=="blast"||amount!==10)soundFX("impact");
  g.vitality=Math.max(0,g.vitality-amount);g.flashUntil=g.time+.65;
  toast="−"+amount+"% vitality";toastFor=1.6;
  if(!g.vitality){if(!beginRescue(obstacle)){setMode("dead");save()}}
  else{hud();save()}
}
function flightTick(d,h){
  if(!g.flight)return;
  const flight=g.flight;
  for(let i=0;i<2;i++){
    const impact=flight.start+2.8+i*1.7;
    if(flight.hits[i]||secondsAt(d)+1e-7<impact)continue;
    flight.hits[i]=true;
    const target=distanceAt(impact)+px+(i?11:-13);
    soundFX("impact");if(Math.hypot(d+px-target,h+13)<71)takeDamage(10,"blast");
    if(mode!=="play")return;
  }
}
function flightReserve(){
  return g.flight?[distanceAt(g.flight.start-.8)+px,distanceAt(g.flight.start+5.9)+px]:null;
}
function freshRun(level=me.selected){
  const seed=Math.floor(Math.random()*4294967296);
  const run={specialSeed:seed,show:makeShow(seed),shield:0,duckUntil:0,embers:0,fire:null,artifactSerial:(seed%100)<22?4+(Math.floor(seed/100)%17):-1,artifactPlaced:false,d:0,h:0,v:0,air:false,age:0,buffer:0,time:0,power:0,health:me.health,level,score:0,banked:0,
    vitality:100,clean:0,supplyOffered:false,extraUsed:false,lastKick:-1,...rollEvents(level,seed),
    replay:!!bonusRank(level)||storyRank(level)<me.stage||me.storyComplete&&storyRank(level)===C.length,replayPoints:0,rescues:0,goal:finishLine,stageReady:false,settled:false,
    streak:0,rng:seed,next:565,untilRed:3,serial:0,items:[]};
  airSchedule(run);return run;
}
function seedCourse(){
  if(g.tutorial)return;
  const reserved=flightReserve(), field=g.show?showBounds():null, gaps=g.show?.branch==="spur"?sealCorridors():[];
  while(g.next<Math.min(g.d+Math.max(width+300,1300),finishLine-730)){
    const x=g.next, bossDue=bossPath(g.level)&&!g.bossPlaced, bossX=finishLine-1950;
    // Ordinary rivals keep clear of the stretch reserved for the boss.
    const encounter=g.untilRed<=0&&x+680+redWidth<finishLine-450&&!(bossDue&&x+1240>bossX);
    if(g.level===21&&!g.legacyNight){const [lo,hi]=gangWindow();if(x<hi&&x+(encounter?1090:730)>lo){seedGang();g.next=hi;continue}}
    const gap=gaps.find(([lo,hi])=>x<hi&&x+(encounter?1090:730)>lo);if(gap){g.next=gap[1];continue}
    if(reserved&&x<reserved[1]&&x+(encounter?1090:730)>reserved[0]){g.next=reserved[1];continue}
    if(field&&x<field[1]&&x+(encounter?1090:730)>field[0]){
      installShowPickup();g.next=field[1];continue
    }
    if(bossDue&&x>=bossX&&x+680+redWidth<finishLine-450){placeBoss(x);continue}
    const n=g.serial++;
    if(encounter){makeEncounter(x);continue}
    const bag=g.level===city?["pair","tall","pair","tall","small"]:["small","tall","small","pair","tall","pair"];
    let kind=n===0?"small":drawFromBag("sizes",bag);
    const alt=spurAt(g.level,secondsAt(x-px)), art=alt?drawFromBag("spurArt",branchProps[g.level]):drawFromBag("art",routeHazards[g.level-1]),shape=drawFromBag("shapes",[0,1,2,3,4,5]);
    const rate=speedAt(x-px);
    let w=kind==="pair"?pairWidth(rate)+shape*2:27+shape*2;
    let h=kind==="tall"?73+shape*3:kind==="pair"?39+shape:33+shape*2;
    if(g.level===1&&(art==="kiln"||art==="brick")&&kind!=="pair"){w=Math.max(40,w);h=Math.max(41,h)}
    if(art==="wreck"){kind="wreck";w=Math.round(rate*(shape%2?1.08:.85));h=50}
    if(art==="tire"){kind="small";w=49;h=57}
    if(art==="stall"){kind="small";w=60;h=53}
    if(x+w>=finishLine-390){g.next=finishLine;break}
    if(n>2&&n%11===3&&kind!=="wreck"){kind="mine";w=38;h=12}
    const trap=n>3&&n%6===4&&!alt&&kind!=="wreck"&&kind!=="mine"?makeTrap(x):null;
    if(trap){w=trap.w;g.items.push(trap)}else g.items.push({kind,x,w,h,shape,art});
    const ember=!g.artifactPlaced&&g.artifactSerial>=0&&n>=g.artifactSerial;
    const pack=!ember&&n%7===2;
    if(ember){g.items.push({kind:"ember",x:x+w+237,w:30,h:30});g.artifactPlaced=true}
    const charm=!ember&&!pack&&charmDue(x);if(charm){g.items.push({kind:"charm",x:x+w+235,w:32,h:33});g.charmPlaced=true}
    const token=!ember&&!pack&&!charm&&tokenDue(x);if(token)g.items.push({kind:"token",x:x+w+235,w:32,h:33});
    const rare=!ember&&!charm&&!token?rareSlot(g,n):"";if(rare){(g.placedRelics??={})[rare]=true}if(rare||pack)g.items.push({kind:rare||"health",x:x+w+235,w:32,h:33});
    g.next=x+w+(pack||ember||rare||charm||token?530:g.level===city?330:360)+Math.floor(roll()*125);g.untilRed--;
  }
}
function activeWreck(){
  return g.items.find(o=>o.kind==="wreck"&&!o.done&&o.x-g.d-px<speed()*.95&&o.x+o.w>g.d+px-20);
}

const routeHazards=[
  ["kiln","urn","flower","brick"],["basket","log","flower","root"],["reel","crate","ribbed","brick"],
  ["sluice","pipe","root","barrel"],["lotus","reed","paddle","log"],["tea","crate","root","ribbed"],
  ["stone","crystal","column","boulder"],["lash","reed","log","flower"],["bollard","urn","barrel","reed"],
  ["drum","crate","urn","flower"],["lantern","pipe","brick","barrel"],["hive","root","crystal","flower"],
  ["tire","cone","wreck","barrel"],["crystal","beacon","boulder","pipe"],["stall","wheel","barrel","brick"],["stump","log","boulder","reed"],["urn","stone","cactus","basket"],["reed","log","shell","root"],["drum","basket","wheel","reel"],["wheel","pipe","crate","bell"],["beacon","column","bell","barrel"]
];
const limit=1e9, targetPoints=225, maxInventory=999;
const blank={id:"d"+Math.random().toString(36).slice(2),name:"Player",points:0,earned:0,best:0,boosters:0,health:1,stage:1,pathPoints:0,selected:1,repeatHealth:true};
let old={};try{old=JSON.parse(localStorage.getItem(key)||"{}")||{}}catch{}
let me={...blank,...old.me}, records=Array.isArray(old.records)?old.records:[], g=old.run||null;
me.earned=Math.max(me.points,me.best,me.earned);
let rescue=g&&old.rescue?old.rescue:null, cinema=null;
let mode=g?"menu":"ready", width=900, shot=0, last=0, clock=0, mood=0, toast="", toastFor=0, shown="";
let caughtBy=null, gain=null;
let boostPrompt=false, ambientTime=0, celebrationStart=0, pathChoice=me.stage, fakeFull=false, lockedOrientation=false;
const gameFrame=$("gameFrame"), pathSettings=$("pathSettings");
const reducedMotion=window.matchMedia?.("(prefers-reduced-motion: reduce)");
const touchDisplay=window.matchMedia?.("(pointer: coarse)");
const cap=(x,a,b)=>Math.max(a,Math.min(b,x));
/*@@js:play.js@@*/
/*@@js:film.js@@*/
/*@@js:story.js@@*/
// ---- v14: runner picker, lobby cards, ambient scene life and movement polish ----
const runnerList=[
 {id:5,name:"Boy",note:"Kid runner",kind:"kid",size:1.12,view:[1.22,66]},{id:6,name:"Girl",note:"Explorer",kind:"girl",size:1.12,view:[1.22,66]},
 {id:0,name:"Dino",note:"Green dino",kind:"dino",size:1.02,view:[.98,84]},{id:7,name:"Tinku",note:"Wind-up robot",kind:"bot",size:1.04,view:[1.2,66]},
 {id:3,name:"Pixel Kid",note:"Boost: golden form",kind:"solo",size:1.12,view:[1.22,66],tag:"HERO"},
 {id:8,name:"Elephant Calf",note:"Boost: mega trumpet",kind:"solo",size:1.1,view:[1.05,66],tag:"HERO"},
 {id:4,name:"Terracotta Horse",note:"Hidden treasure",kind:"solo",size:.98,view:[.95,62],need:1,tag:"SECRET"},
 {id:9,name:"Little Ghost",note:"Hidden treasure",kind:"solo",size:1.2,view:[1.35,66],need:2,tag:"SECRET"},
 {id:10,name:"Golden Hatchling",note:"Hidden treasure",kind:"solo",size:1.15,view:[1.2,74],need:3,tag:"SECRET"}];
const wearSets={dino:[["plain","Original"],["scarf","Red scarf"],["cap","Blue cap"],["shades","Shades"]],
 kid:[["street","Street"],["festival","Festival"],["explorer","Explorer"],["sport","Sport"]],girl:[["tropic","Tropical"],["stripe","Stripes"],["star","Starry"],["sunset","Sunset"]],bot:[["classic","Classic"],["scarf","Red scarf"],["royal","Royal cape"]],solo:[]};
const tintDots=["#76bb42","#3fd0e6","#ff9a45","#b98cff"],soloSheets={3:"pixel/plain",8:"calf",4:"horse",9:"ghost",10:"hatch"};
const runnerOf=()=>runnerList.find(r=>r.id===me.rider)||runnerList[2],runnerKind=()=>runnerOf().kind;
const runnerOpen=r=>(r.need||0)<=(me.found||0);
function wearValue(){const k=runnerKind();return k==="kid"?me.kidWear:k==="girl"?me.girlWear:k==="bot"?me.botWear:me.wear}
function riderKey(level,powered){
  if(me.rider===5)return "boy/"+me.kidWear;if(me.rider===6)return "girl/"+me.girlWear;if(me.rider===7)return "bot/"+me.botWear;
  if(me.rider===3)return powered?"pixel/up":"pixel/plain";
  return soloSheets[me.rider]||"dino/"+me.wear;
}
// The friend who answers a signal is the kid you are not playing.
const friendKey=()=>me.rider===6?"boy/"+me.kidWear:"girl/"+me.girlWear;
function paintRunner(canvas,rider,level,scale,x,y){
  const ctx=canvas.getContext("2d");if(!ctx)return;
  const previous=pen,was=me.rider;pen=ctx;me.rider=rider;ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,canvas.width,canvas.height);ctx.setTransform(2,0,0,2,0,0);
  try{drawRider(x,y,scale,false,false,false,false,level)}catch{}finally{pen=previous;me.rider=was;ctx.setTransform(1,0,0,1,0,0)}
}
function buildRunnerUI(){
  const cards=$("runnerCards"),chips=$("wearChips"),dots=$("tintSwatches");if(!cards)return;
  cards.replaceChildren();
  for(const r of runnerList){
    const b=document.createElement("button"),cv=document.createElement("canvas"),name=document.createElement("strong"),note=document.createElement("small");
    const locked=!runnerOpen(r);
    b.type="button";b.className="runner-card";b.disabled=locked;b.setAttribute("aria-pressed",String(me.rider===r.id));b.setAttribute("aria-label",r.name+" · "+r.note);
    cv.width=cv.height=264;cv.setAttribute("aria-hidden","true");name.textContent=locked?"? ? ?":r.name;note.textContent=locked?"Find treasure "+r.need:r.note;b.append(cv,name,note);
    if(r.tag){const tag=document.createElement("span");tag.className="tag";tag.textContent=r.tag;b.append(tag)}
    b.onclick=()=>{me.rider=r.id;if(runnerList.some(o=>o.name===me.petName))me.petName=r.name;save();warmCast(g?.level||me.selected);refreshPet()};
    cards.append(b);if(!locked)paintRunner(cv,r.id,1,r.view[0],r.view[1],118);
  }
  const kind=runnerKind(),set=wearSets[kind];chips.replaceChildren();
  $("wearTitle").hidden=chips.hidden=!set.length;
  for(const [value,label] of set){
    const b=document.createElement("button");b.type="button";b.className="chip";b.textContent=label;b.setAttribute("aria-pressed",String(wearValue()===value));
    b.onclick=()=>{if(kind==="kid")me.kidWear=value;else if(kind==="girl")me.girlWear=value;else if(kind==="bot")me.botWear=value;else me.wear=value;save();warmCast(g?.level||me.selected);refreshPet()};
    chips.append(b);
  }
  dots.replaceChildren();$("tintTitle").hidden=dots.hidden=me.rider===10||me.rider===6||me.rider===3;
  tintDots.forEach((color,i)=>{
    const b=document.createElement("button");b.type="button";b.className="swatch";b.style.setProperty("--c",color);b.setAttribute("aria-label",tints[i]);b.setAttribute("aria-pressed",String(me.tint===i));
    b.onclick=()=>{me.tint=i;save();refreshPet()};dots.append(b);
  });
}
function lobbySync(){
  const pet=$("lobbyPet");if(!pet)return;
  const level=g?.level||me.selected;
  paintRunner(pet,me.rider,level,runnerOf().view[0]*.88,runnerOf().view[1]+34,104);
  $("lobbyName").textContent=me.petName;$("lobbyZone").textContent=routes[level-1];
  $("lobbyProgress").textContent=bonusRank(level)?"Bonus path":"Story path "+storyRank(level)+" of "+storyIds.length;
  if(lobbySync.level!==level){
    lobbySync.level=level;
    requestAnimationFrame(()=>{
      const ctx=$("lobbyThumb").getContext("2d"),zone=level-1;
      if(thumbnails[zone]){ctx.drawImage(thumbnails[zone],0,0);return}
      try{
        if(!previewCanvas){previewCanvas=document.createElement("canvas");try{previewGpu=makeGpu(previewCanvas)}catch{previewGpu=null}}
        const cam=worldCamera(240*H/116,365,0);
        if(previewGpu&&previewGpu(zone,cam,2.7,240,116))ctx.drawImage(previewCanvas,0,0);else softwareWorld(ctx,zone,cam,2.7,240,116);
      }catch{}
    });
  }
}
function refreshRunnerArt(){if(pathSettings.open&&settingsTab==="dino"){drawPetPreview();buildRunnerUI()}lobbySync();storyLobby()}
function setupSkin(){
  $("openRunner").onclick=()=>{if($("settings").disabled)return;openSettings();changeTab("dino")};
  $("openPaths").onclick=()=>{if(!$("settings").disabled)openSettings()};
  $("lobbyRunner").onclick=$("openRunner").onclick;$("lobbyPath").onclick=$("openPaths").onclick;
  $("howTo").onclick=()=>{if(mode==="ready"||mode==="dead")startTutorial()};
  $("skipCoach").onclick=()=>endTutorial(false);$("rivalBox").ontoggle=buildRivalGrid;
  lobbySync();
}

// Player dust, squash and stretch. Purely cosmetic: nothing here is saved or read by the rules.
const fxDust=[];let fxPrevH=0,fxSquash=0,fxLast=0,fxStep=0,fxHit=false;
function puff(n){for(let i=0;i<n;i++)fxDust.push({x:px-6+(Math.random()-.5)*26,y:floor-1,vx:-50+(Math.random()-.5)*150,vy:-22-Math.random()*46,r:3+Math.random()*3,a:.62,life:.46+Math.random()*.22,t:0})}
function juice(playerH){
  const now=ambientTime,step=Math.min(.05,Math.max(0,now-fxLast));fxLast=now;
  if(reducedMotion?.matches){fxDust.length=0;return [1,1]}
  if(mode==="play"&&!introLeft){
    if(fxPrevH===0&&playerH>0){fxSquash=-.15;puff(6)}
    else if(fxPrevH>0&&playerH===0){fxSquash=.2;puff(9)}
    else if(playerH===0){fxStep+=step;if(fxStep>.12){fxStep=0;fxDust.push({x:px-16,y:floor,vx:-70-Math.random()*40,vy:-14-Math.random()*22,r:2.4+Math.random()*2,a:.46,life:.42,t:0})}}
  }
  fxPrevH=playerH;fxSquash*=Math.pow(.0006,step);
  for(let i=fxDust.length-1;i>=0;i--){
    const p=fxDust[i];p.t+=step;if(p.t>=p.life){fxDust.splice(i,1);continue}
    p.x+=p.vx*step;p.y+=p.vy*step;p.vy+=46*step;const k=p.t/p.life,r=p.r*(1+k*1.7);
    oval(p.x,p.y,r,r*.8,"rgba(255,244,222,"+(p.a*(1-k)).toFixed(3)+")");
  }
  return [1+fxSquash*.9,1-fxSquash];
}
function hitFlash(){
  const hit=mode==="play"&&!!g&&g.flashUntil>g.time&&g.flashUntil-g.time>.3;
  if(hit!==fxHit){fxHit=hit;c.parentElement.classList.toggle("hit",hit)}
}

// Scene life. Each path lists: sky flyers, drifting particles, near-camera planting, butterflies, roadside birds.
const LIFE=[
 ["birds","dust","grass",1,"pigeons"],["parrots","leaves","flowers",1,"pigeons"],["birds","dust","rail",0,"pigeons"],["none","none","reeds",0,""],
 ["gulls","petals","reeds",1,"egrets"],["birds","mist","grass",1,""],["birds","sand","rocks",0,""],["birds","leaves","reeds",1,""],
 ["gulls","marigold","reeds",0,"egrets"],["balloons","petals","flowers",0,"pigeons"],["lanterns","none","rail",0,""],["none","dust","grass",0,""],
 ["drones","none","neon",0,""],["drones","sand","rocks",0,""],["birds","dust","rail",0,"pigeons"],["parrots","leaves","ferns",1,""],
 ["birds","sand","rocks",0,""],["gulls","leaves","flowers",1,"egrets"],["balloons","petals","flowers",1,"pigeons"],["balloons","dust","rail",0,""],["none","mist","rail",0,""]];
const lifeOf=zone=>LIFE[zone<routes.length?zone:(branchIds[zone-routes.length]||1)-1]||LIFE[0];
const nightCache=[],wrap=(v,m)=>((v%m)+m)%m,hash=n=>wrap(Math.sin(n*127.1)*43758.5453,1);
function isNight(zone){
  if(nightCache[zone]===undefined){const k=rgb(WORLD_STYLES[zone]?.[0]||"#88aacc");nightCache[zone]=k[0]*.3+k[1]*.59+k[2]*.11<.36}
  return nightCache[zone];
}
function roadBird(x,y,s,kind,q,t,a){
  pen.save();pen.translate(x,y);pen.scale(s,s);pen.globalAlpha=a;
  const white=kind==="egrets",body=white?"#fbfaf2":"#8591a8",dark=white?"#d7d4c6":"#566079";
  if(q>.02){const f=Math.sin(t*22)*7;pen.rotate(-.35);oval(0,-6,7,3.6,body);oval(6,-8,3,2.6,white?body:dark);
    poly(dark,[-3,-7,-10,-9-f,1,-8]);poly(body,[-1,-7,-5,-10-f*1.2,4,-8]);}
  else{const peck=Math.max(0,Math.sin(t*2.2))**6,leg=white?9:3,hx=6+peck*2,hy=-leg-(white?13:8)+peck*(white?12:7);
    stroke([-1,0,-1,-leg],"#c98a3a",1.2);stroke([2,0,2,-leg],"#c98a3a",1.2);
    oval(0,-leg-3.5,7,4.2,body);poly(dark,[-6,-leg-4,-11,-leg-2,-5,-leg-1.5]);
    if(white)stroke([4,-leg-5,hx,hy],body,2.4);
    oval(hx,hy,2.9,2.7,white?body:dark);poly("#e0a03a",[hx+2,hy-.8,hx+6,hy+.6,hx+2,hy+1]);oval(hx+.8,hy-.6,.6,.6,"#1c1c24")}
  pen.restore();
}
function ambientLife(zone,t,d){
  const still=reducedMotion?.matches;if(still)t=3.1;
  const [fly,fall,,flutter,crit]=lifeOf(zone),night=isNight(zone),W=width;
  pen.save();pen.lineCap="round";
  if(night){
    for(let i=0;i<34;i++){
      const x=wrap(i*97.3-d*.004,W+20)-10,y=8+(i*53.7)%150,tw=.35+.65*Math.abs(Math.sin(t*(.6+i%5*.23)+i));
      pen.globalAlpha=tw*.8;box(x,y,i%7?1.2:2,i%7?1.2:2,"#fff6d8");
    }
    pen.globalAlpha=1;const s=t%11;
    if(!still&&s<.7){const k=s/.7,x=W*(.2+.6*((Math.floor(t/11)*.37)%1))+k*120,y=24+k*46,trail=pen.createLinearGradient(x-70,y-27,x,y);
      trail.addColorStop(0,"rgba(255,250,220,0)");trail.addColorStop(1,"rgba(255,250,220,"+(1-k).toFixed(2)+")");pen.strokeStyle=trail;pen.lineWidth=1.6;pen.beginPath();pen.moveTo(x-70,y-27);pen.lineTo(x,y);pen.stroke()}
  }else{
    const storm=zone===3||zone===15,tone=storm?"#56657a":"#ffffff";pen.globalAlpha=storm?.26:.4;
    for(let i=0;i<4;i++){const x=wrap(i*311-t*(3+i*1.3)-d*.012,W+280)-140,y=26+(i*37)%70,s=.8+(i%3)*.28;
      oval(x,y,46*s,11*s,tone);oval(x-22*s,y+3*s,27*s,9*s,tone);oval(x+24*s,y+2*s,30*s,10*s,tone);oval(x+4*s,y-8*s,24*s,11*s,tone)}
    pen.globalAlpha=1;
  }
  if(fly==="birds"||fly==="gulls"||fly==="parrots"){
    const period=15,cyc=Math.floor(t/period),k=(t%period)/period,dir=cyc%2?-1:1,n=5+cyc%3,by=46+(cyc*29)%66;
    const ink=fly==="gulls"?"#fbfbf5":fly==="parrots"?"#2f9a55":night?"#0e1024":"#33384e";
    for(let i=0;i<n;i++){
      const row=Math.ceil(i/2),side=i%2?1:-1,x=(dir>0?-60:W+60)+dir*k*(W+260)-dir*row*13,y=by+side*row*6+Math.sin(t*1.3+i)*3,f=Math.sin(t*9+i*1.7)*4.5;
      pen.lineWidth=fly==="parrots"?2.3:1.8;pen.strokeStyle=ink;pen.beginPath();pen.moveTo(x-7,y-f);pen.quadraticCurveTo(x-3,y-1-f*.2,x,y);pen.quadraticCurveTo(x+3,y-1-f*.2,x+7,y-f);pen.stroke();
      if(fly==="parrots")oval(x+dir*1.5,y+.5,2.6,1.6,"#e8523f");
    }
  }else if(fly==="balloons"){
    for(let i=0;i<3;i++){
      const x=wrap(i*430+t*(5+i*2)-d*.02,W+160)-80,y=56+i*24+Math.sin(t*.5+i*2)*6,s=.7+i*.2,tone=["#ff7d6b","#ffd45c","#6fd3c6"][i];
      stroke([x-9*s,y+13*s,x-3*s,y+25*s],"#5b4a4a",.8);stroke([x+9*s,y+13*s,x+3*s,y+25*s],"#5b4a4a",.8);
      oval(x,y,15*s,18*s,tone);oval(x,y,6*s,18*s,"#ffffff66");oval(x-5*s,y-7*s,3*s,5*s,"#ffffff59");box(x-3.5*s,y+24*s,7*s,5*s,"#8a5a3a");
    }
  }else if(fly==="lanterns"){
    for(let i=0;i<9;i++){
      const x=wrap(i*173+Math.sin(t*.3+i)*20-d*.03,W+60)-30,y=196-wrap(t*(7+i%4*2)+i*41,200);
      pen.globalAlpha=cap(y/50,0,1);oval(x,y,10,10,"#ffb84a30");oval(x,y,3.3,4.3,"#ffd27a");oval(x,y+3.6,2.1,1,"#c9622b");
    }
    pen.globalAlpha=1;
  }else if(fly==="drones"){
    for(let i=0;i<3;i++){
      const x=wrap(i*377+t*(26+i*9)*(i%2?-1:1)-d*.03,W+120)-60,y=52+i*31+Math.sin(t*1.4+i*2)*5,on=Math.sin(t*6+i*2)>0;
      oval(x,y,7,2.6,"#2a2f4a");stroke([x-10,y-2,x+10,y-2],"#8b93b8",1);oval(x,y+2.2,on?2.2:1.2,on?2.2:1.2,i%2?"#ff5f8a":"#66f2ff");
      if(on)oval(x,y+2.2,6,6,i%2?"#ff5f8a33":"#66f2ff33");
    }
  }
  if(fall==="mist"){
    for(let i=0;i<3;i++){const x=wrap(i*380-t*(9+i*4)-d*.08,W+500)-250,y=232+i*17;pen.save();pen.translate(x,y);pen.scale(1,.17);
      const fog=pen.createRadialGradient(0,0,4,0,0,230);fog.addColorStop(0,night?"rgba(185,196,230,.2)":"rgba(255,255,255,.26)");fog.addColorStop(1,"rgba(255,255,255,0)");pen.fillStyle=fog;pen.beginPath();pen.arc(0,0,230,0,6.283);pen.fill();pen.restore()}
  }else if(fall!=="none"){
    const tones=fall==="leaves"?["#7fbf4a","#d9b23a","#5a9c3c"]:fall==="petals"?["#ff9fc0","#ffd1e0","#ff7fa8"]:["#ffb02a","#ff8a2a","#ffd45c"];
    for(let i=0;i<20;i++){
      const sp=18+(i%5)*9,x=wrap(i*137.5-t*(fall==="sand"?90+sp:22+i%4*7)-d*.35,W+40)-20;
      if(fall==="dust"){const y=70+wrap(i*61-t*(5+i%3*3),230),r=1.5+i%3*.6;pen.globalAlpha=.25+.3*Math.abs(Math.sin(t*1.3+i));oval(x,y,r,r,night?"#fff0a8":"#fff6dc");continue}
      if(fall==="sand"){const y=238+(i*23)%76+Math.sin(t*2+i)*3;pen.globalAlpha=.4;stroke([x-9,y+1,x,y,x+7,y-1],night?"#ffb89a":"#ffe7b8",1.2);continue}
      const y=wrap(i*71+t*sp,H*.83),turn=t*(1.2+i%3*.6)+i;
      pen.globalAlpha=.9;pen.save();pen.translate(x+Math.sin(t*1.7+i)*9,y);pen.rotate(turn);pen.scale(1,.35+.65*Math.abs(Math.sin(turn*1.3)));
      pen.fillStyle=tones[i%3];pen.beginPath();pen.ellipse(0,0,3.6,1.9,0,0,6.283);pen.fill();pen.restore();
    }
    pen.globalAlpha=1;
  }
  if(flutter&&!night){
    for(let i=0;i<3;i++){
      const x=wrap(i*290+60-d*.55+Math.sin(t*.7+i*2)*40,W+80)-40,y=236+Math.sin(t*1.9+i*1.3)*15-i*9,f=Math.abs(Math.sin(t*14+i));
      pen.fillStyle=["#ffcb47","#ff8fb5","#8fd3ff"][i];
      for(const s of [-1,1]){pen.beginPath();pen.ellipse(x+s*2.6*f,y-1,3.2*f+.4,3.6,s*.5,0,6.283);pen.fill()}
      box(x-.5,y-3,1,6,"#3b2a2a");
    }
  }
  if(crit&&liveCamera){
    const cam=liveCamera,ux=(d+px)/cam.unit,base=Math.floor(cam.cx/52);
    for(let k=base-1;k<=base+1;k++){
      const h1=hash(k+zone*13.3);if(h1>.62)continue;
      const wx=k*52+h1*30,q=still?0:cap((7-(wx-ux))/9,0,1),ease=q*q;
      for(let j=0;j<4;j++){
        const h2=hash(k*3.7+j*5.1),p=viewPoint([wx+j*1.5+h2+ease*(7+j*2.4),ease*(7+h2*5),5.4+h2*2.6-j*.2],cam);
        if(p[2]<1||p[0]<-30||p[0]>W+30)continue;
        roadBird(p[0],p[1],cap(FOCAL/p[2]/cam.unit,.3,1)*(crit==="egrets"?1.6:1.35),crit,q,t+j*1.7+k,1-cap((q-.7)/.3,0,1));
      }
    }
  }
  pen.restore();
}
function foregroundLife(zone,d,t){
  const kind=lifeOf(zone)[2],night=isNight(zone),W=width,gap=kind==="rail"||kind==="neon"?150:112,still=reducedMotion?.matches;
  if(still)t=1;
  const travel=d*1.45,off=wrap(travel,gap),first=Math.floor(travel/gap),n=Math.ceil(W/gap)+2,base=H+4;
  const leaf=night?"#10202b":"#1d5230",leaf2=night?"#1c3a44":"#3f9a46",leaf3=night?"#27505a":"#7cc35a";
  pen.save();pen.lineCap="round";
  if(kind==="rail"){box(0,H-34,W,5,night?"#151a2e":"#3a2f38");box(0,H-35,W,1.5,night?"#39456e":"#8a6f6a");box(0,H-15,W,4,night?"#151a2e":"#3a2f38")}
  for(let i=-1;i<n;i++){
    const id=first+i,h=hash(id+zone*7.7),x=i*gap-off+h*36,sway=Math.sin(t*1.6+id)*3;
    if(kind==="rail"){box(x,H-46,8,50,night?"#151a2e":"#3a2f38");box(x,H-46,2,50,night?"#39456e":"#8a6f6a");oval(x+4,H-47,6,3.4,night?"#39456e":"#6b5560");continue}
    if(kind==="neon"){const glow=id%2?"#ff5fb0":"#5ff2ff";box(x,H-40,9,44,"#141831");box(x+3,H-35,3,26,glow);oval(x+4.5,H-22,17,24,id%2?"#ff5fb026":"#5ff2ff26");continue}
    if(h>.8)continue;
    if(kind==="rocks"){const tone=night?"#1b1f33":"#4a3530",lit=night?"#343b5c":"#7a5a4c",w=26+h*30;
      poly(tone,[x-w,base,x-w*.7,H-18-h*14,x-w*.1,H-30-h*18,x+w*.5,H-22,x+w,base]);poly(lit,[x-w*.7,H-18-h*14,x-w*.1,H-30-h*18,x+w*.5,H-22,x+w*.1,H-20,x-w*.4,H-13]);continue}
    const blades=kind==="reeds"?5:kind==="ferns"?6:9,tall=kind==="reeds"?62+h*18:kind==="ferns"?44+h*14:30+h*20;
    for(let b=0;b<blades;b++){
      const fan=(b-(blades-1)/2)/blades,bx=x+fan*(kind==="reeds"?26:34),tip=bx+fan*(kind==="ferns"?46:22)+sway*(1+Math.abs(fan)),ty=base-tall*(1-Math.abs(fan)*.5);
      if(kind==="ferns"){pen.fillStyle=b%2?leaf2:leaf;pen.beginPath();pen.moveTo(bx-4,base);pen.quadraticCurveTo(bx+fan*10,ty-6,tip,ty+10);pen.quadraticCurveTo(bx+fan*28,ty+18,bx+4,base);pen.fill()}
      else if(kind!=="reeds"){pen.fillStyle=[leaf,leaf2,leaf3][b%3];pen.beginPath();pen.moveTo(bx-3.2,base);pen.quadraticCurveTo(bx+fan*4-2,(base+ty)/2,tip,ty);pen.quadraticCurveTo(bx+fan*4+3,(base+ty)/2,bx+3.2,base);pen.fill()}
      else{pen.strokeStyle=b%2?leaf2:leaf;pen.lineWidth=2.6;pen.beginPath();pen.moveTo(bx,base);pen.quadraticCurveTo(bx+fan*4,(base+ty)/2,tip,ty);pen.stroke();
        if(kind==="reeds"&&b%2===0){pen.save();pen.translate(tip,ty+5);pen.rotate(fan*.5+sway*.03);pen.fillStyle=night?"#2a2233":"#6a4630";pen.beginPath();pen.ellipse(0,0,2.8,8,0,0,6.283);pen.fill();pen.restore()}}
    }
    if(kind==="flowers"){const tones=["#ff7fa8","#ffd45c","#ff8a4a","#c79bff"];
      for(let b=0;b<3;b++){const fx=x+(b-1)*15+sway,fy=base-22-hash(id+b)*20;stroke([fx-sway*.5,base,fx,fy],leaf2,1.8);
        for(let p=0;p<5;p++)oval(fx+Math.cos(p*1.257)*3.6,fy+Math.sin(p*1.257)*3.6,2.6,2.6,tones[(id+b)&3]);oval(fx,fy,2,2,"#fff4b8")}}
  }
  const shade=pen.createLinearGradient(0,H-64,0,H);shade.addColorStop(0,"rgba(8,10,24,0)");shade.addColorStop(1,"rgba(8,10,24,.34)");box(0,H-64,W,64,shade);
  pen.restore();
}

const legacyStage=p=>cap(1+Math.floor((Math.sqrt(9+4*Math.max(0,p)/15)-3)/2),1,C.length);
// An ember is a single, saved shot. Resolve impact in simulation time so pausing,
// reloading or a slow frame cannot duplicate a hit, a pickup or its reward.
function flameTarget(){
  if(!g||mode!=="play"||introLeft>0)return null;
  const reach=Math.max(95,Math.min(490,width-px-30));
  return g.items.find(o=>!o.done&&!o.pass&&!isPickup(o)&&o.x-g.d-px>12&&o.x-g.d-px<reach)||showTarget();
}
function throwFlame(){
  if(!g?.embers||g.fire||mode!=="play")return;
  const o=flameTarget();if(!o)return;
  const from=g.d+px+24,lead=Math.max(0,o.kind==="performer"?presenterX(secondsAt(g.d))-px:o.x-from);
  const duration=cap(lead/1150,.005,.36);
  g.embers--;g.fire={target:o.x,start:g.time,end:g.time+duration,from,height:g.h+50,hit:false,performer:o.kind==="performer",aimX:o.kind==="performer"?g.d+presenterX(secondsAt(g.d)):0};
  soundFX("flame");save();hud();c.focus({preventScroll:true});
}
function fireTick(){
  const fire=g.fire;if(!fire)return;
  if(!fire.hit&&g.time+dt>=fire.end){
    const o=g.items.find(it=>it.x===fire.target&&!it.done&&!isPickup(it));
    fire.hit=true;
    if(fire.performer)firePerformer();
    if(o){
      o.done=true;o.burned=true;if(isEncounter(o))escapeStamp(o,"flame");else o.brokenAt=g.time;
      if(isEncounter(o)){tally("rivals");if(o.boss)tally("boss","Beaten")}reward(isEncounter(o)?55:25,false);toast=isEncounter(o)?"Rival driven off":"Obstacle cleared";toastFor=1.45;
      soundFX("pop");
    }
    save();
  }
  if(g.time>fire.end+.42)g.fire=null;
}
function emberArt(x,y,t){
  const pulse=1+.065*Math.sin(t*6);
  pen.save();pen.translate(x,y);pen.scale(pulse,pulse);
  oval(0,-1,26,25,softShade(0,-1,27,"#ffab436a"));
  poly("#933e40",[-12,2,-8,-10,1,-17,11,-8,13,3,0,15]);
  poly("#ffac3d",[-9,1,-5,-9,1,-15,2,4,0,11]);poly("#e76c38",[1,-15,9,-7,11,3,0,11,2,4]);
  poly("#fff4a1",[-3,0,0,-8,3,-3,4,1,0,6]);pen.restore();
}
function drawFlame(pan,zoom){
  const fire=g?.fire;if(!fire)return;
  const o=fire.performer?{kind:"performer",x:fire.aimX,w:0,h:69}:g.items.find(i=>i.x===fire.target);if(!o)return;
  const q=cap((g.time-fire.start)/(fire.end-fire.start),0,1);
  const source=fire.from, target=o.x+Math.min(o.w*.3,28), targetH=isEncounter(o)?o.h*.46:o.h*.58;
  const X=u=>pan+(source+(target-source)*u-g.d)*zoom;
  const Y=u=>floor-(fire.height+(targetH-fire.height)*u+Math.sin(u*Math.PI)*16)*zoom;
  if(!fire.hit){
    for(let j=9;j>=0;j--){const a=Math.max(0,q-j*.023),k=1-j/11;
      oval(X(a),Y(a)+Math.sin(j+g.time*36)*2,(4+k*10)*zoom,(2+k*6)*zoom,j>5?"#e667489c":j>2?"#ff9b36":"#fff0a4")}
  }else{
    const a=cap((g.time-fire.end)/.42,0,1);
    pen.save();pen.globalAlpha=1-a;
    for(let j=0;j<13;j++){const angle=j*2.4;
      oval(X(1)+Math.cos(angle)*a*54*zoom,Y(1)+Math.sin(angle)*a*43*zoom,2+(1-a)*5,2+(1-a)*4,j%2?"#ffaf47":"#ffe99c")}
    pen.restore();
  }
}
function alienEscape(o,x){
  const t=Math.max(0,g.time-o.exitTime);
  // The alien plants its forelegs, turns, and bounds away in the opposite direction.
  const skid=cap(t/.32,0,1),run=Math.max(0,t-.32);
  const origin=o.x-o.exitD;
  const xx=origin-17*Math.sin(skid*Math.PI*.7)+run*run*(width+o.w)/2.75;
  const bounce=run>0?Math.abs(Math.sin(run*7.4))*25:0;
  oval(xx+o.w/2,floor+1,37,4,"#4f303854");
  pen.save();pen.translate(xx+o.w/2,floor-bounce-(o.move==="low"?89*cap(1-(o.x-o.exitD-px-55)/370,0,1)*Math.max(0,1-t/.37):0));
  pen.scale(t>.29?-1:1,1);drawFoe("alien",0,0,1.16,false,g.time*11,1);pen.restore();
  if(t>.32&&t<1.55)for(let j=0;j<4;j++){
    const age=(run*1.8+j*.22)%1;pen.save();pen.globalAlpha=(1-age)*.6;
    oval(xx+o.w/2-22-age*39,floor-3-age*12,2+age*4,1+age*3,"#e8aa79");pen.restore();
  }
}
let introLeft=0, introDuration=2.45;
function beginIntro(){
  if(g)warmCast(g.level);
  if(!g||g.d>.01||g.introduced)return;
  g.introduced=true;introLeft=reducedMotion?.matches?0:introDuration;
  $("skipIntro").hidden=!introLeft;
  if(introLeft){
    $("openingName").textContent=routes[g.level-1];$("openingDino").textContent=me.petName;$("opening").hidden=false;
    $("encounterCue").hidden=$("gain").hidden=$("notice").hidden=true;shown="";
  }
}
function endIntro(){introLeft=0;clock=0;$("opening").hidden=true;$("skipIntro").hidden=true}
function airSchedule(run){
  if(run.level===mars)return;
  if(run.level===kolkata||!me.planeSeen||me.planeGap>=2)run.flight={start:run.level===kolkata?16:15+(run.rng%4),hits:[false,false]};
  if(run.level===kolkata||!me.heliSeen||me.heliGap>=2)run.survey=true;
  if(run.level===21&&run.flight)run.flight.start=24+(run.rng%3);
}
function rememberAir(){
  if(g.flight&&!g.sawPlane&&secondsAt(g.d)>=g.flight.start){
    g.sawPlane=true;me.planeSeen=true;me.planeGap=0;soundFX("plane");save();
  }
  if(g.survey&&g.level!==mars&&!g.sawHeli&&secondsAt(g.d)>=runSeconds-10){
    g.sawHeli=true;me.heliSeen=true;me.heliGap=0;soundFX("rotor");save();
  }
  if(g.flight){
    const t=secondsAt(g.d)-g.flight.start;
    for(let i=0;i<2;i++)if(t>=1.45+i*1.7&&!(g.dropSounds&(1<<i))){g.dropSounds=(g.dropSounds||0)|(1<<i);soundFX("drop")}
  }
}

// All audio is synthesized locally. Only a deliberate tap unlocks the context.
/*@@js:sound.js@@*/

const speed=()=>speedAt(g.d);
const size=()=>1+Math.min(.19,(g.level-1)*.024);
const firstJump=()=>535+Math.min(9,g.level-1)*4, airJump=()=>505+Math.min(9,g.level-1)*3;
const pairWidth=rate=>Math.round(rate*.36+12);
if(!old.rules||old.rules<4){
  me.stage=cap(g?.level??legacyStage(me.earned),1,C.length);
  me.pathPoints=cap(me.earned-15*(me.stage-1)*(me.stage+2),0,targetPoints-1);
  if(g){g.level=me.stage;g.banked=g.score;g.goal=null;g.stageReady=false}
}
if(g&&(!old.rules||old.rules<2)){
  g.buffer=0;
  for(const o of g.items)if(o.kind==="red")o.h=redHeight;
}
if(g&&g.health===undefined)g.health=1;
if(g&&g.rescues===undefined)g.rescues=0;
if(!old.rules||old.rules<5)me.selected=g?.level||me.stage;
if((old.rules||0)<12){if(me.storyComplete&&me.stage===12){me.storyComplete=false;me.stage=13}if(g&&!g.stageReady){g.goal=finishLine;g.specialSeed=g.rng}}
const unlocked=level=>Number.isInteger(level)&&(!!bonusRank(level)||storyRank(level)>0&&storyRank(level)<=me.stage);
if(!unlocked(me.selected))me.selected=storyIds[me.stage-1];
if(g&&old.rules<7&&!g.stageReady){
  g.goal=finishLine;g.d=Math.min(g.d,courseLength);
  g.items=g.items.filter(o=>o.x+o.w<finishLine-390);
  if(rescue&&!g.items.some(o=>o.x===rescue.obstacleX))rescue=null;
}
// Upgrade in-progress saves in place, including their current score, inventory and pending rescue.
if(g&&(old.rules||0)<8){
  g.vitality=100;g.clean=0;g.supplyOffered=false;g.extraUsed=false;g.lastKick=-1;
  g.goal=finishLine;g.foes=[];g.art=[];g.sizes=[];g.power=0;
  Object.assign(g,rollEvents(g.level,g.rng));
  // A migrated run may already have obstacles in the new flight corridor.
  g.flight=null;
  for(const o of g.items)if(isEncounter(o)){
    if(bonusRank(g.level)&&!o.done){o.kind=routeFoes[g.level-1][0];o.h=encounters[o.kind].h;o.w=encounters[o.kind].w}
    o.move=encounters[o.kind].move;o.taps=0;o.steady=0
  }
}
if(rescue){
  if(rescue.remaining!=null){rescue.closes=Date.now()+cap(rescue.remaining,0,rescueTime);rescue.suspended=false}
  if(Date.now()<rescue.closes)mode="rescue";
  else{mode="dead";rescue=null}
}
if(g?.stageReady&&mode==="menu")mode="levelup";
if(g&&old.rules<9){g.embers=0;g.fire=null;g.artifactSerial=-1;g.artifactPlaced=true;g.introduced=g.d>0;for(const o of g.items)if(o.exitTime!=null)o.exitD=g.d}
function save(){
  try{localStorage.setItem(key,JSON.stringify({rules:13,me,records,
    run:g?.settled?null:g,rescue:mode==="rescue"&&rescue?{...rescue,remaining:rescue.suspended?rescue.remaining:Math.max(0,rescue.closes-Date.now())}:null}))}catch{}
}
function roll(){g.rng=(Math.imul(1664525,g.rng)+1013904223)>>>0;return g.rng/4294967296}
function isEncounter(o){return Object.hasOwn(encounters,o.kind)}
function encounterName(kind){return "The "+encounters[kind].name.toLowerCase()}
function drawFromBag(name,choices){
  if(!g[name]?.length){
    const bag=choices.slice();
    for(let i=bag.length-1;i>0;i--){const j=Math.floor(roll()*(i+1));[bag[i],bag[j]]=[bag[j],bag[i]]}
    if(bag.length>1&&bag.at(-1)===g[name+"Last"]){
      const different=bag.findIndex(v=>v!==bag.at(-1));
      if(different>=0)[bag[different],bag[bag.length-1]]=[bag[bag.length-1],bag[different]];
    }
    g[name]=bag;
  }
  return g[name+"Last"]=g[name].pop();
}
const create=freshRun, spawn=seedCourse;
function boxes(o){
  return o.kind==="pair"?[[o.x,o.x+28],[o.x+o.w-29,o.x+o.w]]:[[o.x,o.x+o.w]];
}
function isPickup(o){return ["signal","feather","treasure","charm","token"].includes(o.kind)||o.kind==="boost"||o.kind==="health"||o.kind==="ember"||o.kind==="shield"}
function flyPoints(id,amount){
  const delta=$(id);delta.textContent="−"+amount;delta.hidden=false;
  delta.classList.remove("spent");void delta.offsetWidth;delta.classList.add("spent");
}
function settleRun(){
  if(!g||g.settled)return;
  const balance=cap(me.points+g.score-g.banked,-limit,limit), difference=balance-me.points;
  me.points=balance;me.best=Math.max(me.best,g.score);me.health=g.health;g.settled=true;
  if(difference<0)flyPoints("pointCost",-difference);
}
function pathPoints(){return g?.replay?g.replayPoints:me.pathPoints}
function reward(p,streak=true){
  if(g.tutorial){gain={points:p,since:g.time,h:g.h};return}
  g.combo=(g.combo||0)+1;const rate=comboRate();tally("best",rate);if(rate>1)p=Math.round(p*rate);
  if(streak&&++g.streak%3===0){p+=12;toast="Streak bonus · +12";toastFor=1.8}
  g.score=Math.min(limit,g.score+p);
  me.earned=Math.min(limit,me.earned+p);
  if(g.replay)g.replayPoints=Math.min(limit,g.replayPoints+p);
  else me.pathPoints=Math.min(limit,me.pathPoints+p);
  gain={points:p,since:g.time,h:g.h};
  if(g.combo%6===0&&g.combo<=24){toast="Clean run · ×"+rate.toFixed(2).replace(/0$/,"");toastFor=1.8}
  save();hud();
}
function startLeap(){
  soundFX("jump");g.duckUntil=0;ventDuck();
  g.v=firstJump();g.age=0;g.air=true;g.buffer=0;g.extraUsed=false;g.lastKick=g.time;g.vault=null;attachVault();recordTap();
}
function extendLeap(){
  soundFX("jump");
  g.v=airJump();g.air=false;g.buffer=0;g.lastKick=g.time;recordTap();
}
function jump(){
  if(introLeft){endIntro();return}
  if(mode!=="play")return;
  if(g.h===0&&g.v===0){startLeap();return}
  if(g.h>0||g.v>0){if(vaultInput())return}
  if(g.air&&g.age>=airTapAge){extendLeap();return}
  if(g.buffer<=0&&(g.air||(g.v<0&&g.h<33))){g.buffer=inputBuffer;return}
  mood=.45;
}
const boost=spendCharge;
// Lock onto the same carrier for the whole jump. A fast double tap in midair
// queues two separate impulses while leaving the takeoff and landing on the physics clock.
function nearbyCarrier(){
  const front=g.d+px;
  return g.items.find(o=>o.kind==="wreck"&&!o.done&&o.x-front<speed()*1.22&&o.x+o.w>front-21*size());
}
function attachVault(){
  const w=nearbyCarrier();if(!w)return null;
  return g.vault={end:w.x+w.w,goal:w.h+13,queued:0,spent:g.air?0:1,last:g.lastKick,gravity:gravity};
}
function vaultInput(){
  const v=g.vault||attachVault();
  if(!v||v.spent+v.queued>=2||g.d+px>v.end+22*size())return false;
  v.queued++;return true;
}
function vaultTick(){
  const v=g.vault;if(!v||!v.queued||g.time-v.last<.185)return;
  v.queued--;v.spent++;v.last=g.lastKick=g.time;g.buffer=0;g.air=false;g.extraUsed=v.spent===2;
  if(v.spent===1){v.gravity=1340;g.v=Math.max(360,airJump()-.9*g.h)}
  else{
    // Fit a parabola through the current foot position and the far bumper,
    // with headroom reserved for the camera even when all three taps were rapid.
    const remaining=Math.max(.32,secondsAt(v.end+26*size()-px)-secondsAt(g.d)+.035);
    const apex=Math.max(148,g.h+30),rise=Math.sqrt(apex-g.h),fall=Math.sqrt(apex-v.goal);
    v.gravity=cap(2*(rise+fall)**2/(remaining*remaining),260,gravity);
    g.v=Math.sqrt(2*v.gravity*(apex-g.h));
  }
  recordTap();soundFX("jump");g.jumpMark=g.time;
}
function recoverySite(obstacle){
  const margin=24*size(),ahead=20*size()+speed()*.47;
  let x=Math.max(g.d+px,obstacle?obstacle.x+obstacle.w+margin+14:0);
  const items=g.items.filter(o=>!o.done&&!isPickup(o)).sort((a,b)=>a.x-b.x);
  for(const o of items){
    if(o===obstacle||o.x+o.w<=x-margin)continue;
    if(o.x>x+ahead)break;
    x=o.x+o.w+margin+14;
  }
  return Math.min(finishLine,x);
}
function beginRescue(obstacle=null){
  if(g.health<1||g.settled||g.tutorial||(g.rescues||0)>=maxRevives)return false;
  rescue={obstacleX:obstacle?.x??null,remaining:rescueTime,closes:Date.now()+rescueTime};
  g.power=0;g.vault=null;caughtBy=null;cinema=null;
  setMode("rescue");save();return true;
}
function loseRescue(){if(mode!=="rescue")return;rescue=null;setMode("dead");save()}
function useHealth(){
  if(mode!=="rescue"||!rescue||g.health<1)return;
  if(!rescue.suspended&&Date.now()>=rescue.closes){loseRescue();return}
  const hit=g.items.find(o=>o.x===rescue.obstacleX),landing=recoverySite(hit);
  // A tightly spaced obstruction can extend the safe landing. Nothing passed
  // in this move awards a pickup, a free charge or clear points.
  for(const o of g.items)if(o===hit||o.x+o.w<landing-20*size()){o.done=true;delete o.pass}
  const cost=reviveCost();g.health--;g.rescues++;storyTally("revive");g.score=Math.max(-limit,g.score-cost);g.combo=0;
  g.vitality=70;g.d=landing-px;g.h=g.v=g.age=g.buffer=g.power=0;g.air=false;g.vault=null;g.streak=0;
  g.safetyUntil=g.time+.85;g.next=Math.max(g.next,landing+speed()*.48+24);
  clock=0;caughtBy=rescue=gain=null;flyPoints("scoreCost",cost);toast="Back on your feet!";toastFor=1.5;
  setMode("play");save();
}
function suspendRescue(){
  if(mode!=="rescue"||!rescue||rescue.suspended)return;
  rescue.remaining=Math.max(0,rescue.closes-Date.now());rescue.suspended=true;save();
}
function wakeRescue(){
  if(mode==="rescue"&&rescue?.suspended){rescue.closes=Date.now()+rescue.remaining;rescue.suspended=false;save()}
}
function forkStop(){
  if(!g.show||!forks[g.level]||g.show.branch!==null||secondsAt(g.d)+1e-7<32)return false;
  mode="fork";g.show.waiting=true;g.buffer=0;ventDuck();clock=0;setMode("fork");save();$("takeMain").focus({preventScroll:true});return true;
}
function chooseFork(which){
  if(mode!=="fork"||!g?.show||!forks[g.level]||g.show.branch!==null)return;
  g.show.branch=which==="spur"?"spur":"main";g.show.waiting=false;g.art=[];if(which==="spur"){prepareDetour();fetchSheet(detours[g.level][2]);for(const o of g.items)if(o.art&&o.kind!=="wreck"&&spurAt(g.level,secondsAt(o.x-px)))o.art=branchProps[g.level][(o.shape||0)%3]}clock=last=0;setMode("play");soundFX("pickup");save();
}

function finishPath(){
  if(g.stageReady||g.settled)return;
  storyFinish();finishMusic();if(g.level!==mars){if(!g.sawPlane)me.planeGap++;if(!g.sawHeli)me.heliGap++}
  if(tourFinish())return;
  if(g.replay){setMode("replayComplete");save();return}
  me.pathPoints=Math.max(0,me.pathPoints-targetPoints);
  if(storyRank(g.level)===C.length){g.health=Math.min(maxInventory,g.health+1);me.storyComplete=true;setMode("finished");save();return}
  me.stage=storyRank(g.level)+1;g.health=Math.min(maxInventory,g.health+1);
  g.stageReady=true;g.buffer=0;
  setMode("levelup");save();
}
function resolveEncounter(o,won){
  const surprise=o.kind!=="red";soundFX(won?"clear":"impact");
  g.buffer=0;cinema={kind:o.kind,won,started:Date.now(),points:0};
  if(won){
    o.done=true;o.cinematicExit=true;g.power=0;
    if(surprise&&!g.tutorial){g.health=Math.min(maxInventory,g.health+1);me.boosters=Math.min(maxInventory,me.boosters+1)}
    setMode("chomp");
    g.clean=(g.clean||0)+1;const before=g.score;
    reward(surprise?100:140,!surprise);
    cinema.points=g.score-before;
  }else{
    // Settle the loss before its animation so closing the page cannot replay the same collision.
    caughtBy=o;settleRun();setMode("chomp");save();
  }
}
function tick(){
  if(mode!=="play"||forkStop())return;
  if(g.coach&&coachGate())return;
  vaultTick();
  if(g.buffer>0){
    if(g.h===0&&g.v===0)startLeap();
    else if(g.air&&g.age>=airTapAge)extendLeap();
    else g.buffer=Math.max(0,g.buffer-dt);
  }
  spawn();
  const d=Math.min(courseLength,g.d+speed()*dt+.5*acceleration*dt*dt), prior=g.h, v=g.v-(g.vault&&g.d+px<=g.vault.end+28*size()?g.vault.gravity:gravity)*dt, h=Math.max(0,prior+v*dt);
  // The running hitbox follows the body and feet; the head and tail can hang over an edge.
  const x=d+px, power=Math.max(0,g.power-dt), s=size(), left=x-21*s,right=x+19*s;
  const expired=g.power>0&&power===0;
  fireTick();helperTick();summonIfReady();let rival=null;
  for(const o of g.items){
    if(o.done||isPickup(o))continue;
    if(isEncounter(o)){
      if(o.pass)continue;if(o.boss&&g.charm&&encounterLead(o)<1.7){charmStrike(o);continue}venomTick(o,d,h);if(mode!=="play")return;breathTick(o,d,h);if(mode!=="play")return;
      if(encounterLead(o)<.7)o.steady=h<6&&ducking()?(o.steady||0)+dt:0;
      if(right>=o.x&&left<=o.x+o.w){rival=o;break}
      continue;
    }
    if(o.kind==="trap"){trapStep(o,left,right,h);if(mode!=="play")return;continue}
    if(h>=o.h||!boxes(o).some(([a,b])=>right>a+3&&left<b-3))continue;
    if(g.tutorial){o.done=true;toast="Almost! Try the next one";toastFor=1.6;continue}
    if(o.kind==="mine"){o.done=true;o.burned=true;o.brokenAt=g.time;takeDamage(8,"blast",o);if(mode!=="play")return;continue}
    if(g.shield){
      o.done=true;o.burned=true;o.brokenAt=g.time;g.streak=0;blockHit();continue
    }
    if(streetStrike(o)){if(mode!=="play")return;continue}
    if(beginRescue(o))return;
    setMode("dead");save();return;
  }
  g.d=d;g.h=h;g.v=h>0?v:0;g.age=h>0?g.age+dt:0;g.time+=dt;g.power=power;
  if(h===0)g.vault=null;
  if(expired)hud();
  rememberAir();musicTick();flightTick(d,h);if(mode!=="play")return;
  gangTick(d,h);if(mode!=="play")return;tickShow(d,h,prior);if(mode!=="play")return;
  const passing=g.items.find(o=>o.pass);if(passing){patrolPass(passing,h);if(mode!=="play")return}
  if(rival){handleRival(rival,h);if(mode!=="play")return}

  for(const o of g.items){
    if(o.done)continue;
    if(isPickup(o)){
      if(right>=o.x&&left<=o.x+o.w){
        if(h>0||prior>0||v>0)o.missed=true;
        if(o.missed)continue;
        soundFX("pickup");
        o.done=true;
        if(o.kind==="charm"){charmFound()}
        else if(o.kind==="token"){tokenFound()}
        else if(o.kind==="feather"){g.feather=true;toast="Super jump ready";announcePower(toast)}
        else if(o.kind==="treasure"){me.found=Math.min(3,(me.found||0)+1);toast=runnerList.find(r=>r.need===me.found).name+" unlocked";announcePower(toast)}
        else if(o.kind==="signal"){g.signal=true;toast=g.level===21?"Bell signal activated":"Friend signal activated";announcePower(toast)}
        else if(o.kind==="shield"){grantShield();announcePower("Gold shield activated")}
        else if(o.kind==="ember"){g.embers=Math.min(3,(g.embers||0)+1);toast="Flame power activated";announcePower(toast)}
        else if(o.kind==="health"){g.health=Math.min(maxInventory,g.health+1);toast="Health pack +1"}
        else{me.boosters=Math.min(maxInventory,me.boosters+1);toast="Booster picked up"}
        toastFor=1.8;save();hud();
      }
    }else if(!isEncounter(o)&&left>=o.x+o.w-3){
      o.done=true;reward(o.kind==="small"?10:o.kind==="tall"?20:o.kind==="wreck"?50:30);
    }
  }
  const tail=g.items[0];if(tail&&tail.x+tail.w<g.d-250&&!(tail.exitTime!=null&&g.time-tail.exitTime<2.3))g.items.shift();
  if(d>=courseLength&&h===0){finishPath();return}
  const percent=Math.floor(100*d/courseLength);
  if(percent!==g.shownPercent){g.shownPercent=percent;updateTrack(percent)}
  mood=Math.max(0,mood-dt);toastFor=Math.max(0,toastFor-dt);
  shot+=dt;if(shot>=1){shot=0;save()}
}
function updateTrack(percent){
  const track=$("levelTrack");track.firstElementChild.style.width=percent+"%";
  track.setAttribute("aria-valuenow",percent);track.title=percent+"% of path";
}
function hud(){
  const level=g?.level||me.selected;
  $("score").textContent=g?.score||0;$("level").textContent=bonusRank(level)?"B"+bonusRank(level):storyRank(level);
  $("health").textContent=g?.health??me.health;$("boosters").textContent=me.boosters;
  $("points").textContent=me.points;$("best").textContent=Math.max(me.best,g?.score||0);$("zone").textContent=routes[level-1];
  const complete=mode==="finished"||mode==="replayComplete"||mode==="levelup";
  updateTrack(complete?100:Math.floor(100*(g?.d||0)/courseLength));
  $("vitality").textContent=(g?.vitality??100)+"%";
  $("vitalityBar").style.width=(g?.vitality??100)+"%";
  updateBoostPrompt();
  $("flame").hidden=!g?.embers;$("flame").textContent="Flame ×"+(g?.embers||0);
  try{lobbySync();comboSync()}catch{}
}
function updateBoostPrompt(){
  if($("flame"))$("flame").disabled=!g?.embers||!!g?.fire||!flameTarget();
  const o=mode==="play"?nextThreat():null;
  const ready=!!o&&encounterLead(o)<=1.02&&(me.boosters>0||g.tutorial)&&g.power<=0;
  const b=$("boost");b.disabled=!ready;
  if(ready!==boostPrompt){b.classList.toggle("boost-hot",ready);boostPrompt=ready}
  const label=g?.power>0?"Charged":ready?"Boost now":"Boost";
  if(b.textContent!==label)b.textContent=label;
}
function setMode(m){
  const celebrating=["levelup","finished","replayComplete"].includes(m);
  if(celebrating&&(mode!==m||!celebrationStart))celebrationStart=performance.now();
  mode=m;gameFrame.dataset.mode=m;if(m!=="play"){nightMusic.halt();ventDuck();}powerUI();syncFieldUI();
  if(["dead","finished","replayComplete"].includes(m))settleRun();
  gameFrame.classList.toggle("celebrating",celebrating);
  $("veil").hidden=["play","rescue","chomp","fork"].includes(m);
  $("rescue").hidden=m!=="rescue";
  $("jump").disabled=m!=="play";$("pause").disabled=m!=="play";
  $("board").disabled=m==="fork"||m==="rescue"||m==="chomp"||m==="levelup";
  $("settings").disabled=m==="fork"||m==="rescue"||m==="chomp";
  charmSync();$("levelStar").hidden=m!=="finished";$("dedication").hidden=!celebrating;resultsBoard(m);storySync();if(m==="dead")storyLost();if(celebrating&&g?.result&&!g.result.shown){g.result.shown=true;playScene("close")}
  $("tramTicket").hidden=!(m==="replayComplete"&&g?.level===kolkata);
  $("quit").hidden=m!=="paused";$("openJourney").hidden=$("openRunner").hidden=$("openPaths").hidden=!["ready","dead","menu","paused"].includes(m);$("howTo").hidden=!["ready","dead"].includes(m);
  if(g?.tutorial)gameFrame.dataset.coach="1";else{delete gameFrame.dataset.coach;coachShow(null)}$("neonShortcut").hidden=!["ready","dead","finished","menu","replayComplete"].includes(m);
  if(m!=="play"){
    const words={ready:["Ready to run?","Jump over road hazards. Tap or hold Duck for overhead attacks. Add Boost on green for a counter.","Start run"],
      paused:["Run paused","Your spot and progress are saved when browser storage is available.","Resume"],
      menu:["Back to the path?","Continue your saved run on "+routes[(g?.level??me.selected)-1]+".","Continue run"],
      levelup:["Path cleared!",(routes[(g?.level??1)-1]||"Path")+" · Health pack +1 · Next: "+(Number.isInteger(g?.tour)?routes[tourOrder[g.tour+1]-1]:C[me.stage-1])+".","Continue"],
      finished:["Journey complete!","Every story path cleared. The crew made it home.","Choose a path"],
      replayComplete:["Path cleared!",routes[(g?.level??me.selected)-1],"Choose a path"],
      dead:[caughtBy?encounterName(caughtBy.kind)+" got you!":"End of this run",
        "So close. Lifetime points "+me.points+".","Try again"]}[m];
    if(words){[$("prompt").textContent,$("hint").textContent,$("start").textContent]=words}storyHint(m);
  }
  if(celebrating)$("start").focus({preventScroll:true});
  if(m==="rescue"){
    $("rescueInfo").textContent=g.health+" pack"+(g.health===1?"":"s")+" available · Revive for "+reviveCost()+" points"+((g.rescues||0)+1>=maxRevives?" · last revive":"");
    updateRescueTimer();
    $("help").focus({preventScroll:true});
  }
  if(m==="play")c.focus({preventScroll:true});hud();
}
function start(){
  if(scene)return;
  if(mode==="ready"&&!me.tutorialDone){startTutorial();return}
  if(mode==="finished"||mode==="replayComplete"){openSettings();return}
  if(mode==="levelup"){
    const {score,banked,health,power,tour}=g;
    me.selected=storyIds[me.stage-1];
    if(Number.isInteger(tour))me.selected=tourOrder[tour+1];
    g={...create(),score,banked,health,power};if(Number.isInteger(tour))g.tour=tour+1;
  }else if(mode==="ready"||mode==="dead"){
    g=create();if(Number.isInteger(me.tourCursor)&&me.selected===tourOrder[me.tourCursor])g.tour=me.tourCursor;
  }
  const fresh=["levelup","ready","dead"].includes(mode);if(fresh){caughtBy=gain=null;shot=mood=toastFor=0;spawn()}
  const go=()=>{clock=0;setMode("play");beginIntro();save()};
  if(fresh)playScene("open",go);else go();
}
function pause(){if(mode==="play"){if(introLeft)endIntro();setMode("paused");save()}}
const tints=["Fern","Lagoon","Ember","Violet"];
const petDefaults={petName:"Dino",rider:0,tint:0,wear:"plain",kidWear:"street",girlWear:"tropic",botWear:"classic",themeMask:63,music:true,sfx:true,planeSeen:false,heliSeen:false,planeGap:0,heliGap:0};
for(const [key,value] of Object.entries(petDefaults))if(me[key]===undefined)me[key]=value;
if(me.earned>0||me.stage>1)me.tutorialDone=true;
me.found=cap(Number(me.found)||(me.webUnlocked?1:0),0,3)|0;delete me.webUnlocked;
me.rider=Number(me.rider)|0;if(me.rider===1||me.rider===2)me.rider=0;if(!runnerList.some(r=>r.id===me.rider&&runnerOpen(r)))me.rider=0;
if(!wearSets.dino.some(w=>w[0]===me.wear))me.wear="plain";
if(!wearSets.kid.some(w=>w[0]===me.kidWear))me.kidWear="street";if(!wearSets.girl.some(w=>w[0]===me.girlWear))me.girlWear="tropic";if(!wearSets.bot.some(w=>w[0]===me.botWear))me.botWear="classic";me.tint=cap(Number(me.tint)||0,0,3)|0;
let settingsTab="story",resumeOnDismiss=false,previewGpu,previewCanvas,thumbJobs=[],thumbQueued=false;
function makeThumb(level){
  const canvas=document.createElement("canvas");canvas.width=240;canvas.height=116;canvas.setAttribute("aria-hidden","true");
  const ctx=canvas.getContext("2d"),zone=level-1;
  if(thumbnails[zone])ctx.drawImage(thumbnails[zone],0,0);
  else{
    ctx.fillStyle=WORLD_STYLES[zone][0];ctx.fillRect(0,0,240,116);
    thumbJobs.push(()=>{
      if(!canvas.isConnected)return;
      if(!previewCanvas){previewCanvas=document.createElement("canvas");try{previewGpu=makeGpu(previewCanvas)}catch{previewGpu=null}}
      const cam=worldCamera(240*H/116,365,0);
      if(previewGpu&&previewGpu(zone,cam,2.7,240,116))ctx.drawImage(previewCanvas,0,0);
      else softwareWorld(ctx,zone,cam,2.7,240,116);
      thumbnails[zone]=canvas;
    });
  }
  return canvas;
}
function workThumbs(){
  if(thumbQueued)return;thumbQueued=true;
  function next(){const job=thumbJobs.shift();if(job)job();if(thumbJobs.length)requestAnimationFrame(next);else thumbQueued=false}
  requestAnimationFrame(next);
}
function routeCards(){
  const list=$("pathList");list.replaceChildren();thumbJobs.length=0;
  for(const level of (settingsTab==="bonus"?bonusIds:storyIds)){
    const available=unlocked(level), cleared=storyRank(level)>0&&(storyRank(level)<me.stage||storyRank(level)===C.length&&me.storyComplete);
    const b=document.createElement("button"),title=document.createElement("strong"),badge=document.createElement("span"),caption=document.createElement("span");
    b.type="button";b.className="path-card";b.disabled=!available;
    const tag=!available?"Locked":bonusRank(level)?"Bonus":cleared?"Cleared":"Current";
    b.setAttribute("aria-label",tag+" · "+routes[level-1]);b.setAttribute("aria-pressed",String(level===pathChoice));
    caption.className="path-caption";badge.className="path-number";
    badge.textContent=!available?"🔒":bonusRank(level)?"✦":cleared?"✓":String(storyRank(level));
    title.textContent=routes[level-1];caption.append(badge,title);b.append(makeThumb(level),caption);
    b.onclick=()=>{if(!unlocked(level))return;list.querySelector('[aria-pressed="true"]')?.setAttribute("aria-pressed","false");b.setAttribute("aria-pressed","true");pathChoice=level;updatePathButton()};
    list.append(b);
  }
  workThumbs();
}
function updatePathButton(){
  $("playPath").textContent=["difficulty","dino"].includes(settingsTab)?"Done":(g?.level===pathChoice&&!g.settled&&!g.stageReady?"Resume":"Play")+" · "+routes[pathChoice-1];
}
function changeTab(tab){
  settingsTab=tab;if(tab!=="dino")nightMusic.endPreview();
  for(const b of $("switches").querySelectorAll("button"))b.setAttribute("aria-pressed",String(b.dataset.view===tab));
  $("wardrobe").hidden=tab!=="dino";$("pathList").hidden=tab==="dino"||tab==="difficulty";$("customRules").hidden=tab!=="difficulty";
  $("pathHint").textContent=tab==="story"?me.stage+" of 15 story paths open":tab==="bonus"?"Six bonus paths open from Level 1":tab==="difficulty"?"Changes apply when you resume":"Your name, look and sound";
  if(tab==="bonus"&&!bonusRank(pathChoice))pathChoice=bonusRank(me.selected)?me.selected:13;
  if(tab==="story"&&!storyRank(pathChoice))pathChoice=storyIds[me.stage-1];
  $("tourButton").hidden=tab==="dino"||tab==="difficulty";$("tourButton").textContent=Number.isInteger(me.tourCursor)?"Continue tour · "+(me.tourCursor+1)+"/21":"25-minute tour";
  if(tab==="dino")refreshPet();else if(tab==="difficulty")settingsExtras();else routeCards();
  $("settingsScroll").scrollTop=0;updatePathButton();
}
function openSettings(){
  if(pathSettings.open||mode==="rescue"||mode==="chomp")return;
  resumeOnDismiss=mode==="play";pause();
  pathChoice=mode==="levelup"?(Number.isInteger(g?.tour)?tourOrder[g.tour+1]:storyIds[me.stage-1]):g?.level||me.selected;

  pathSettings.showModal();changeTab(bonusRank(pathChoice)?"bonus":"story");
}
function dismissSettings(){
  nightMusic.endPreview();
  pathSettings.close();thumbJobs.length=0;
  if(resumeOnDismiss&&mode==="paused")start();resumeOnDismiss=false;
}
function refreshPet(){
  settingsExtras();$("petName").value=me.petName;
  $("volume").value=me.volume??90;$("volumeOut").textContent=(me.volume??90)+"%";$("musicToggle").checked=me.music;$("sfxToggle").checked=me.sfx;drawPetPreview();buildRunnerUI();lobbySync();
}
function drawPetPreview(){
  const canvas=$("petPreview"),ctx=canvas.getContext("2d");if(!ctx)return;
  const previous=pen;pen=ctx;ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,canvas.width,canvas.height);ctx.setTransform(2,0,0,2,0,0);
  const glow=ctx.createRadialGradient(100,63,2,100,63,92);glow.addColorStop(0,"#435965");glow.addColorStop(1,"#1c2935");ctx.fillStyle=glow;ctx.fillRect(0,0,200,112);
  try{drawRider(runnerOf().view[1]+33,104,runnerOf().view[0]*.9,false,false,false,false,g?.level||me.selected)}finally{pen=previous;ctx.setTransform(1,0,0,1,0,0)}
}
// Only the current cast is decoded. Baked outfit frames include the body, fabric,
// moving limbs and bonus costume in one image, with their original depth ordering.
const sheetCache=new Map(),toneCache=new Map();
function fetchSheet(key){
  if(!sheetCache.has(key)){
    const im=texture(bakedCast[key]);if(!im)return null;
    im.onload=refreshRunnerArt;
    if(sheetCache.size>=30)sheetCache.delete(sheetCache.keys().next().value);
    sheetCache.set(key,im);
  }
  return sheetCache.get(key);
}
function riderSheet(key,tint){
  const im=fetchSheet(key);
  if(!im?.naturalWidth||!tint)return im;
  const id=key+"#"+tint;if(toneCache.has(id))return toneCache.get(id);
  const dest=document.createElement("canvas");dest.width=im.naturalWidth;dest.height=im.naturalHeight;
  const ctx=dest.getContext("2d");ctx.drawImage(im,0,0);
  const pixels=ctx.getImageData(0,0,dest.width,dest.height),p=pixels.data,body=[[1,1,1],[.27,.92,1],[1,.57,.27],[.82,.53,1]][tint];
  for(let i=0;i<p.length;i+=4){
    if(!p[i+3]||p[i+1]<=p[i]*1.11||p[i+1]<=p[i+2]*1.13)continue;
    const g=p[i+1],e=Math.min(1,(g-p[i])*.08),light=Math.max(0,Math.min(43,(g-148)*.43));
    for(let c=0;c<3;c++)p[i+c]+=(((g-light)*body[c]+light)-p[i+c])*e;
  }
  ctx.putImageData(pixels,0,0);if(toneCache.size>=3)toneCache.delete(toneCache.keys().next().value);toneCache.set(id,dest);return dest;
}
function drawSheet(image,frame,x,y,scale){
  if(!image?.width)return false;
  const cw=image.width/4,ch=image.height/4;   // sheets come at 256x168 cells, or sharper: 384x252, and 768x504 for runners
  pen.drawImage(image,frame%4*cw,Math.floor(frame/4)*ch,cw,ch,x-91*scale,y-104*scale,256/1.5*scale,112*scale);return true;
}
function drawRider(x,y,scale,walk,air,upset,munch,level){
  const powered=me.rider===3&&(g?.power>0||mode==="chomp"&&cinema?.won);
  const im=riderSheet(riderKey(level,powered),me.tint),t=(g?.time||0)+Math.min(.78,finishMoment()),low=mode==="play"&&!air&&ducking();
  const f=munch?13+Math.round(.5-.5*Math.cos(ambientTime*10)):low?15:air?12:walk?Math.floor(t*17)%10:(ambientTime%3.4<.14?11:10);
  pen.save();pen.translate(x,y);if(upset)pen.rotate(Math.sin(ambientTime*26)*.045);
  if(!(scale>=1.45&&drawClose(riderKey(level,powered),f,0,0,scale*runnerOf().size)))drawSheet(im,f,0,0,scale*runnerOf().size);
  if(powered){for(let j=0;j<3;j++){const a=ambientTime*2.6+j*2.094;star(Math.cos(a)*23*scale,(-42+Math.sin(a)*26)*scale,2.2*scale,"#ffe288")}}
  pen.restore();
}
const crewPoses={
  bandit:[[-30,0,.83],[23,-4,.76],[-2,1,1.03]],apes:[[-33,-3,.70],[25,0,.80],[-3,2,1.06]],
  kolkata:[[24,-4,.78],[-27,-1,.86],[0,2,1.04]],crew:[[21,-5,.81],[-18,0,.98]]
};
function throwOrigin(k,i,source){
  const team=crewPoses[k];if(!team)return null;
  const [x,y,z]=team[i%team.length],scale=z*(k==="apes"?.92:.78);
  return [source+x-23*scale,12-y+(k==="apes"?62:54)*scale];
}
function drawCrew(k,t,retreat){
  const sheet=fetchSheet(k==="apes"?"ape":k);if(!sheet?.naturalWidth)return;
  const phase=t*11;
  const formation=crewPoses[k];
  for(let j=0;j<formation.length;j++){
    const [x,y,z]=formation[j],motion=retreat?1:.25;
    let step=Math.floor((phase*motion+j*4)%12);
    const n=beatImpact.findIndex((at,i)=>activeBeat(i)&&t>=at-1.70&&t<at-.83);
    if(n>=0&&j===(n%formation.length)&&!retreat){
      const elapsed=t-(beatImpact[n]-1.20);step=elapsed<-.25?12:elapsed<0?13:elapsed<.16?14:15;
    }
    pen.save();pen.translate(x,y);pen.scale(retreat?1:-1,1);
    drawSheet(sheet,step,0,0,z*(k==="apes"?.98:.78));pen.restore();
  }
}
function forkSigns(d){
  if(!g?.show||!forks[g.level])return;
  const t=secondsAt(d);if(t<23||t>34)return;
  const spec=currentField(),bamboo=g.level===16||g.level===9;
  for(const [j,at] of [27.9,30.8,32.12].entries()){
    const x=distanceAt(at)+px-d;if(x<-110||x>width+110)continue;
    const y=floor-8;oval(x,y+1,14,2.8,"#3f30465c");
    box(x-2.8,y-69,6,69,bamboo?"#9a7d54":"#66727b");box(x-2.8,y-68,1.7,66,"#d6c69d");
    pen.save();pen.translate(x,y-67);
    inked(gradient(-17,-23,18,20,"#ffec9e","#f2b959","#cd8350"),"#594a4c",p=>{p.moveTo(0,-22);p.lineTo(23,0);p.lineTo(0,22);p.lineTo(-23,0);p.closePath()});
    stroke([0,12,0,1,-8,-7],"#363744",3.5);stroke([0,1,10,-8],"#363744",3.5);
    poly("#363744",[-12,-11,-4,-10,-11,-4]);poly("#363744",[13,-12,12,-4,6,-10]);
    if(j===2){box(-25,25,50,15,"#263c48");pen.fillStyle=spec[4];pen.textAlign="center";pen.font="800 10px system-ui";pen.fillText("FORK",0,36)}
    pen.restore();
  }
}
function finishGate(x){
  const y=floor,top=y-166,span=81,t=ambientTime;
  pen.save();pen.translate(x,0);
  for(const side of [-1,1]){
    const p=side*span;
    oval(p+3,y+2,14,4,"#3c35436b");
    box(p-5,top,10,166,gradient(p-6,0,p+7,0,"#ffe69d","#f2a75c","#a65353"));
    for(let i=0;i<7;i++){const yy=top+35+i*18;poly(i%2?"#345765":"#d65566",[p-5,yy,p+5,yy-5,p+5,yy,p-5,yy+6])}
    oval(p,top-7,8,8,gradient(p-5,top-14,p+4,top,"#fff8c0","#ffd56b","#d98846"));
    for(let j=0;j<3;j++){const sx=p+side*(4+j*11),yy=top+8+j*2;poly(j%2?"#79ded6":"#f4879c",[sx,yy,sx+side*10,yy+1,sx+side*(4+Math.sin(t*3+j)*2),yy+11])}
  }
  const band=gradient(0,top-7,0,top+32,"#fa8699","#c54f77","#823e68");
  inked(band,"#693e56",p=>{p.roundRect(-87,top-6,174,38,9)});
  for(let i=0;i<25;i++)for(let j=0;j<2;j++)box(-80+i*6.4,top+23+j*3.2,6.4,3.2,(i+j)%2?"#ffeccc":"#3d4856");
  pen.fillStyle="#fff7ce";pen.textAlign="center";pen.font="900 23px system-ui";pen.fillText("FINISH",0,top+17);
  for(const side of [-1,1])star(side*61,top+8,6.5+Math.sin(t*4)*.9,"#ffe48a");
  const snap=finishMoment();
  for(const side of [-1,1]){
    const loose=cap(snap*1.6,0,1),tip=side*(span*.84*loose),base=y-31;
    pen.beginPath();pen.moveTo(side*span,base);
    pen.quadraticCurveTo(side*span*.52,base+4+loose*10,tip,base+2+loose*(14+3*Math.sin(t*8)));
    pen.strokeStyle=side===1?"#f0788c":"#ffe095";pen.lineWidth=3.3;pen.stroke();
  }
  for(let row=0;row<9;row++)for(let j=0;j<2;j++)box(-6+j*6,y+row*6,6,6,(row+j)%2?"#ece7d0bc":"#4d465a8c");
  pen.restore();
}
function finishMoment(){
  return ["finished","levelup","replayComplete"].includes(mode)?Math.max(0,(performance.now()-celebrationStart)/1000):0;
}
function crewAmmo(k,x,y,t,accent){
  pen.save();pen.translate(x,y);pen.rotate(t*(k==="bandit"?9:6.5));
  if(k==="bandit"){pen.beginPath();pen.ellipse(0,0,7.3,4.6,.08,0,Math.PI*2);pen.strokeStyle="#f7cb7f";pen.lineWidth=2.3;pen.stroke()}
  else if(k==="apes"){oval(0,0,6,7,gradient(-4,-5,5,6,"#ffe69b","#d5984f","#8b6548"));oval(0,-6,1.3,2.7,"#85a96d")}
  else{oval(0,0,6,4.2,k==="crew"?"#9dffea":accent);star(-2,0,3.4,k==="crew"?"#eaffef":"#ffedaa")}
  pen.restore();
}
function selectPath(){
  if(!pathSettings.open||!unlocked(pathChoice))return;
  if(["difficulty","dino"].includes(settingsTab)){dismissSettings();return}
  resumeOnDismiss=false;thumbJobs.length=0;
  pathSettings.close();
  if(mode==="levelup"&&pathChoice===(Number.isInteger(g?.tour)?tourOrder[g.tour+1]:storyIds[me.stage-1])){start();return}
  if((mode==="paused"||mode==="menu")&&g?.level===pathChoice){start();return}
  settleRun();
  delete me.tourCursor;me.selected=pathChoice;g=create();caughtBy=gain=null;shot=mood=toastFor=clock=0;
  spawn();playScene("open",()=>{setMode("play");beginIntro();save()});
}
function syncFullscreen(){
  const full=document.fullscreenElement===gameFrame||fakeFull;
  gameFrame.classList.toggle("is-full",full);
  document.body.classList.toggle("game-full",full);
  const label=full?"Exit fullscreen":"Enter fullscreen", button=$("full");
  button.setAttribute("aria-pressed",full);button.setAttribute("aria-label",label);button.title=label;
  $("fullGlyph").setAttribute("d",full?"M9 3v6H3m18 0h-6V3m0 18v-6h6m-18 0h6v6":"M3 9V3h6m6 0h6v6m0 6v6h-6m-6 0H3v-6");
  if(!full&&lockedOrientation){screen.orientation?.unlock?.();lockedOrientation=false}
}
async function toggleFullscreen(){
  if(fakeFull){fakeFull=false;syncFullscreen();return}
  if(document.fullscreenElement===gameFrame){await document.exitFullscreen();return}
  try{
    await gameFrame.requestFullscreen();
    syncFullscreen();
    if(touchDisplay?.matches&&screen.orientation?.lock){
      try{
        await screen.orientation.lock("landscape");
        lockedOrientation=true;syncFullscreen();
      }catch{/* The fullscreen layout also rotates inside portrait viewports. */}
    }
  }catch{fakeFull=true;syncFullscreen()}
}
$("start").onclick=start;$("pause").onclick=pause;$("jump").onclick=jump;$("boost").onclick=boost;
$("settings").onclick=openSettings;$("playPath").onclick=selectPath;$("closeSettings").onclick=dismissSettings;pathSettings.addEventListener("cancel",e=>{e.preventDefault();dismissSettings()});
$("switches").onclick=e=>{const b=e.target.closest("button[data-view]");if(b)changeTab(b.dataset.view)};
$("petName").oninput=e=>{me.petName=e.target.value.trim().slice(0,22)||"Dino";save()};
for(const [id,key] of [["musicToggle","music"],["sfxToggle","sfx"]])$(id).onchange=e=>{me[key]=e.target.checked;if(key==="music"){if(!me.music){nightMusic.endPreview();nightMusic.halt();}}unlockSound();save()};
$("volume").oninput=e=>{me.volume=cap(Number(e.target.value),0,100);$("volumeOut").textContent=me.volume+"%";unlockSound();if(mixBus)mixBus.gain.setTargetAtTime(me.volume/100*1.35,audioBus.currentTime,.035);save()};
$("skipIntro").onclick=endIntro;$("flame").onclick=throwFlame;
document.addEventListener("click",unlockSound,true);
document.addEventListener("keydown",e=>{if(e.code==="KeyF"&&!pathSettings.open&&!$("champions").open)throwFlame();if(e.code==="Space")unlockSound()});


$("neonShortcut").onclick=()=>{
    if(g&&!g.settled&&g.level!==city){openSettings();changeTab("bonus");pathChoice=city;routeCards();updatePathButton();return}
    if(g&&!g.settled&&g.level===city){start();return}
    delete me.tourCursor;me.selected=city;g=null;setMode("ready");start();
  };
  $("full").onclick=toggleFullscreen;
document.addEventListener("fullscreenchange",syncFullscreen);
$("help").onclick=useHealth;
for(const id of ["pointCost","scoreCost"])$(id).addEventListener("animationend",()=>$(id).hidden=true);
$("quit").onclick=()=>{setMode("menu");save()};
c.addEventListener("pointerdown",event=>{if(event.button===0){event.preventDefault();c.focus({preventScroll:true});jump()}});
document.addEventListener("keydown",e=>{
  if(mode==="fork"){
    if(e.code==="Tab"){e.preventDefault();(document.activeElement===$("takeMain")?$("takeSpur"):$("takeMain")).focus()}
    if(e.code==="Digit1")chooseFork("main");if(e.code==="Digit2")chooseFork("spur");return
  }
  if(e.repeat||$("champions").open||pathSettings.open||/INPUT|TEXTAREA/.test(e.target.tagName))return;
  if(e.code==="Escape"&&fakeFull){fakeFull=false;syncFullscreen();return}
  if(e.code==="Escape"){if(mode==="play")pause();else if(mode==="paused")start()}
  if((e.code==="Space"||e.code==="ArrowUp")&&e.target.tagName!=="BUTTON"&&mode==="play"){e.preventDefault();jump()}
  if(e.code==="KeyB")boost();
  if((e.code==="ArrowDown"||e.code==="KeyS")&&mode==="play"&&!introLeft){e.preventDefault();duck();duckHeld=true}
});
document.addEventListener("visibilitychange",()=>{if(document.hidden){nightMusic.endPreview();nightMusic.halt();suspendRescue();pause()}else wakeRescue()});
window.addEventListener("pagehide",()=>{suspendRescue();save()});window.addEventListener("pageshow",wakeRescue);

function rows(){
  const body=$("rows");body.replaceChildren();
  for(const row of [me,...records].sort((a,b)=>b.best-a.best||b.points-a.points||a.name.localeCompare(b.name))){
    const tr=document.createElement("tr");
    for(const v of [row.name,row.stage??legacyStage(row.earned??row.points),row.boosters,row.best,row.points]){
      const td=document.createElement("td");td.textContent=v;tr.append(td);
    }
    body.append(tr);
  }
}
$("board").onclick=()=>{pause();$("name").value=me.name;rows();$("recordStatus").textContent="";$("champions").showModal()};
$("close").onclick=()=>$("champions").close();
$("name").onchange=()=>{me.name=$("name").value.trim().slice(0,24)||"Player";save();rows()};
$("showRecord").onclick=()=>{$("record").value=JSON.stringify({id:me.id,name:me.name,best:me.best,boosters:me.boosters,points:me.points,earned:me.earned,stage:me.stage});$("record").select()};
$("addRecord").onclick=()=>{
  try{
    const r=JSON.parse($("record").value);
    const earned=r?.earned??r?.points;
    const stage=r?.stage??legacyStage(earned);
    if(!r||typeof r.id!=="string"||!/^d[a-z0-9]{1,20}$/.test(r.id)||r.id===me.id||
      typeof r.name!=="string"||!r.name.trim()||r.name.length>24||
      ![r.best,r.boosters,earned].every(v=>Number.isSafeInteger(v)&&v>=0)||
      !Number.isSafeInteger(r.points)||r.points< -limit||!Number.isInteger(stage)||stage<1||stage>C.length||
      r.best>earned||r.points>earned||earned>limit||r.boosters>maxInventory)throw 0;
    records=[...records.filter(a=>a.id!==r.id),
      {id:r.id,name:r.name,best:r.best,points:r.points,earned,stage,boosters:r.boosters}].slice(-29);
    save();rows();$("recordStatus").textContent="Record added.";
  }catch{$("recordStatus").textContent="That record could not be added."}
};
