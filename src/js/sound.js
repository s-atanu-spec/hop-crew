// ---- v18 sound: a stereo mix with room and echo, layered path music, and fanfares. All generated, no recordings. ----
let audioBus=null,mixBus=null,noiseBuffer=null,beatMark=-1,lastRivalSound=null;
let dryBus=null,musicBus=null,roomBus=null,echoBus=null;
function buildAudio(ac){
  mixBus=ac.createGain();mixBus.gain.value=(me.volume??90)/100*1.25;
  const guard=ac.createDynamicsCompressor();guard.threshold.value=-14;guard.knee.value=10;guard.ratio.value=4;guard.attack.value=.004;guard.release.value=.16;
  mixBus.connect(guard);guard.connect(ac.destination);
  dryBus=ac.createGain();dryBus.connect(mixBus);musicBus=ac.createGain();musicBus.gain.value=.92;musicBus.connect(mixBus);
  // Room: a short stereo impulse made from two different noise tails, so left and right never match.
  const len=Math.round(ac.sampleRate*1.6),impulse=ac.createBuffer(2,len,ac.sampleRate);
  for(let ch=0;ch<2;ch++){const data=impulse.getChannelData(ch);let seed=ch?977:331;
    for(let i=0;i<len;i++){seed=(Math.imul(1664525,seed)+1013904223)>>>0;const t=i/len;data[i]=(seed/2147483648-1)*Math.pow(1-t,2.7)*Math.min(1,i/(ac.sampleRate*.01))}}
  const hall=ac.createConvolver(),wet=ac.createGain();hall.buffer=impulse;wet.gain.value=.62;roomBus=ac.createGain();roomBus.connect(hall);hall.connect(wet);wet.connect(mixBus);
  // Echo: repeats bounce between the left and right speakers.
  echoBus=ac.createGain();const left=ac.createDelay(1),right=ac.createDelay(1),back=ac.createGain(),panL=ac.createStereoPanner(),panR=ac.createStereoPanner();
  left.delayTime.value=right.delayTime.value=.26;back.gain.value=.36;panL.pan.value=-.85;panR.pan.value=.85;
  echoBus.connect(left);left.connect(panL);panL.connect(mixBus);left.connect(right);right.connect(panR);panR.connect(mixBus);right.connect(back);back.connect(left);
  noiseBuffer=ac.createBuffer(1,Math.round(ac.sampleRate*.65),ac.sampleRate);
  const arr=noiseBuffer.getChannelData(0);let seed=187;
  for(let i=0;i<arr.length;i++){seed=(Math.imul(1664525,seed)+1013904223)>>>0;arr[i]=seed/2147483648-1}
}
function unlockSound(){
  if(!me.music&&!me.sfx)return;
  const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
  try{
    if(!audioBus){audioBus=new AC();buildAudio(audioBus)}
    if(audioBus.state==="suspended")audioBus.resume().catch(()=>{});
  }catch{/* Play stays available when the browser disables audio. */}
}
// One voice: an oscillator or filtered noise with its own envelope, stereo position, room and echo.
function voice(o){
  const ac=audioBus;if(!ac||(!ac.offlineTest&&(ac.state!=="running"||document.hidden)))return;
  const t=ac.currentTime+(o.at||0),len=o.len,env=ac.createGain(),nodes=[env];let src;
  if(o.wave==="noise"){
    src=ac.createBufferSource();src.buffer=noiseBuffer;src.loop=true;const f=ac.createBiquadFilter();f.type=o.band||"lowpass";
    f.frequency.setValueAtTime(o.f,t);f.frequency.exponentialRampToValueAtTime(Math.max(35,o.f2||o.f),t+len);if(o.q)f.Q.value=o.q;src.connect(f);f.connect(env);nodes.push(f);
  }else{
    src=ac.createOscillator();src.type=o.wave||"sine";src.frequency.setValueAtTime(o.f,t);if(o.f2&&o.f2!==o.f)src.frequency.exponentialRampToValueAtTime(Math.max(20,o.f2),t+len);
    let into=env;
    if(o.cut){const f=ac.createBiquadFilter();f.type="lowpass";f.frequency.setValueAtTime(o.cut,t);f.frequency.exponentialRampToValueAtTime(Math.max(140,o.cut2||o.cut*.45),t+len);f.Q.value=o.q||.8;f.connect(env);into=f;nodes.push(f)}
    src.connect(into);
    if(o.wide){const twin=ac.createOscillator();twin.type=src.type;twin.frequency.setValueAtTime(o.f,t);twin.detune.value=o.wide;twin.connect(into);twin.start(t);twin.stop(t+len+.03);nodes.push(twin)}
  }
  const attack=Math.min(o.attack||.008,len*.5),v=Math.max(.0002,o.vol);
  env.gain.setValueAtTime(.0001,t);env.gain.exponentialRampToValueAtTime(v,t+attack);
  if(o.hold)env.gain.setValueAtTime(v,t+len*o.hold);else env.gain.exponentialRampToValueAtTime(Math.max(.0002,v*.46),t+len*.4);
  env.gain.exponentialRampToValueAtTime(.0001,t+len);
  let tail=env;
  if(ac.createStereoPanner){const pan=ac.createStereoPanner();pan.pan.setValueAtTime(cap(o.pan||0,-1,1),t);if(o.pan2!=null)pan.pan.linearRampToValueAtTime(cap(o.pan2,-1,1),t+len);env.connect(pan);tail=pan;nodes.push(pan)}
  tail.connect(o.music?musicBus:dryBus);
  if(o.room){const send=ac.createGain();send.gain.value=o.room;tail.connect(send);send.connect(roomBus);nodes.push(send)}
  if(o.echo){const send=ac.createGain();send.gain.value=o.echo;tail.connect(send);send.connect(echoBus);nodes.push(send)}
  src.onended=()=>{try{src.disconnect();for(const n of nodes)n.disconnect()}catch{}};
  src.start(t);src.stop(t+len+.03);
}
function note(freq,end,length,volume,wave="sine",delay=0,pan=0,room=.12,echo=0){
  voice({f:freq,f2:end,len:length,vol:volume,wave,at:delay,pan,room,echo});
}
function soundFX(kind){
  if(!me.sfx)return;
  switch(kind){
    case "outage":note(138,46,.24,.13,"triangle");note(790,130,.19,.075,"noise");break;
    case "inhale":note(113,192,.25,.09,"triangle",0,.5,.3);voice({f:300,f2:1900,len:.5,vol:.05,wave:"noise",band:"bandpass",q:2,pan:.6,pan2:.3,room:.3});break;
    case "breath":voice({f:900,f2:240,len:.55,vol:.16,wave:"noise",pan:.55,pan2:-.5,room:.35});note(120,58,.4,.1,"sawtooth",0,.3,.3);break;
    case "hiss":note(3100,950,.16,.10,"noise",0,.4);break;
    case "jump":note(248,440,.13,.12,"triangle",0,-.35,.1);break;
    case "pickup":note(610,820,.13,.16,"sine",0,-.25,.2,.25);note(930,1030,.19,.12,"sine",.08,.25,.2,.25);break;
    case "rival":note(173,148,.19,.18,"triangle",0,.55,.3);note(220,181,.22,.16,"triangle",.12,.4,.3);break;
    case "charge":voice({f:150,f2:620,len:.35,vol:.19,wave:"triangle",pan:-.4,pan2:.2,room:.25,echo:.2});break;
    case "impact":note(110,40,.28,.26,"sine",0,-.1,.3);note(1650,130,.37,.18,"noise",0,.1,.4);break;
    case "flame":note(880,2300,.21,.15,"noise",0,-.3);note(2100,180,.32,.23,"noise",.1,.3,.3);break;
    case "pop":note(240,48,.18,.22,"sine",0,0,.2);break;
    case "drop":voice({f:1060,f2:145,len:.54,vol:.13,pan:-.6,pan2:.6,room:.2});break;
    case "plane":voice({f:86,f2:163,len:.75,vol:.13,wave:"sawtooth",cut:900,pan:.9,pan2:-.9,room:.2});break;
    case "rotor":for(let j=0;j<5;j++)note(149,62,.085,.16,"triangle",j*.1,.8-j*.4);break;
    case "clear":for(const [j,f] of [329.6,392,493.9,659.3].entries())note(f,f*1.004,j===3?.54:.24,.20,"triangle",j*.108,j%2?.5:-.5,.3,.3);break;
  }
}

// ---- path music ----
const modes={bhairav:[0,1,4,5,7,8,11],major:[0,2,4,5,7,9,11],minor:[0,2,3,5,7,8,10],dorian:[0,2,3,5,7,9,10],phrygian:[0,1,3,5,7,8,10],mixo:[0,2,4,5,7,9,10]};
const themes={
  village:{bpm:114,root:60,mode:"major",prog:[0,5,3,4],bass:[0,8,11],arp:[0,3,6,8,11,14],lead:"pluck",pad:.02,kit:"light"},
  jungle:{bpm:104,root:57,mode:"dorian",prog:[0,3,0,4],bass:[0,6,8,14],arp:[0,2,5,8,10,13],lead:"mallet",pad:.022,kit:"shaker"},
  city:{bpm:122,root:62,mode:"mixo",prog:[0,6,3,0],bass:[0,3,6,10,12],arp:[2,6,10,14],lead:"clav",pad:.018,kit:"full"},
  desert:{bpm:100,root:62,mode:"phrygian",prog:[0,1,0,6],bass:[0,8,10],arp:[0,4,7,12],lead:"reed",pad:.026,kit:"light"},
  mars:{bpm:92,root:57,mode:"minor",prog:[0,5,3,6],bass:[0],arp:[0,6,12],lead:"glass",pad:.034,kit:"sparse"},
  toy:{bpm:130,root:67,mode:"major",prog:[0,4,5,3],bass:[0,8],arp:[0,2,4,6,8,10,12,14],lead:"bell",pad:.012,kit:"light"},
  night:{bpm:96,root:55,mode:"minor",prog:[0,5,2,6],bass:[0,7,10],arp:[0,3,8,11],lead:"glass",pad:.03,kit:"sparse"},
  // Bonus paths each get their own sound.
  neon:{bpm:118,root:57,mode:"minor",prog:[0,5,2,6],bass:[0,2,4,6,8,10,12,14],arp:[0,2,4,6,8,10,12,14],lead:"synth",pad:.03,kit:"full",extra:"zap",fixed:true},
  relay:{bpm:88,root:52,mode:"dorian",prog:[0,3,5,0],bass:[0],arp:[0,5,10],lead:"glass",pad:.04,kit:"sparse",extra:"radio",fixed:true},
  kolkata:{bpm:108,root:62,mode:"bhairav",prog:[0,0,3,0],bass:[0,6,10],arp:[0,3,6,10,12],lead:"reed",pad:.016,kit:"tabla",extra:"tram",fixed:true},
  amazon:{bpm:98,root:55,mode:"dorian",prog:[0,3,6,4],bass:[0,6,8,14],arp:[0,2,5,8,10,13],lead:"mallet",pad:.024,kit:"shaker",extra:"birds",fixed:true},
  railway:{bpm:132,root:72,mode:"major",prog:[0,4,5,3],bass:[0,8],arp:[0,2,4,6,8,10,12,14],lead:"bell",pad:.01,kit:"light",extra:"train",fixed:true},
  midnight:{bpm:92,root:50,mode:"minor",prog:[0,5,3,4],bass:[0,6,10,14],arp:[2,7,10,15],lead:"clav",pad:.034,kit:"brush",extra:"clock",fixed:true}};
const bonusThemes={13:"neon",14:"relay",15:"kolkata",16:"amazon",20:"railway",21:"midnight"};
const hz=midi=>440*Math.pow(2,(midi-69)/12);
function themeFor(level){
  const kind=bonusThemes[level]||(level===11||level===12?"night":terrain[level-1]||"village"),base=themes[kind]||themes.village;
  return {...base,root:base.fixed?base.root:base.root+((level*5)%7)-3,seed:level*7919+13};
}
function degree(th,index){const scale=modes[th.mode],n=scale.length,oct=Math.floor(index/n);return th.root+scale[((index%n)+n)%n]+12*oct}
function leadVoice(th,midi,at,len,pan,vol){
  const f=hz(midi),o={f,len,at,pan,music:true};
  if(th.lead==="pluck")voice({...o,wave:"triangle",vol,room:.22,echo:.3});
  else if(th.lead==="mallet"){voice({...o,wave:"sine",vol:vol*1.1,len:len*.8,room:.3,echo:.18});voice({...o,f:f*4,wave:"sine",vol:vol*.18,len:.07})}
  else if(th.lead==="clav")voice({...o,wave:"square",vol:vol*.5,cut:2600,cut2:500,len:len*.7,room:.15,echo:.22});
  else if(th.lead==="reed")voice({...o,wave:"sawtooth",vol:vol*.5,cut:1900,cut2:900,attack:.03,hold:.6,room:.35,echo:.2});
  else if(th.lead==="synth")voice({...o,wave:"sawtooth",vol:vol*.55,cut:3400,cut2:600,q:4,len:len*.9,room:.25,echo:.4,wide:14});
  else if(th.lead==="bell"){voice({...o,f:f*2,wave:"sine",vol:vol*.8,len:len*1.5,room:.35,echo:.35});voice({...o,f:f*5.02,wave:"sine",vol:vol*.1,len:.12})}
  else voice({...o,wave:"sine",vol:vol*.9,len:len*1.8,attack:.02,room:.5,echo:.4,wide:9});
}
function playStep(th,step,at=0,state={}){
  const pos=step%16,bar=Math.floor(step/16),chord=th.prog[bar%4],stepLen=60/th.bpm/4,rnd=n=>hash(th.seed+n*1.37);
  const late=!!state.late,boss=!!state.boss,age=state.age??99;
  // drums
  if(th.kit==="tabla"){
    const low=[0,3,8,11],high=[2,4,6,7,10,12,14,15];
    if(low.includes(pos))voice({f:pos===8?150:110,f2:pos===8?70:160,len:.24,vol:.2,at,pan:-.25,room:.2,music:true});
    if(high.includes(pos))voice({f:pos%4===2?620:470,f2:pos%4===2?600:455,len:.07,vol:pos%4===0?.085:.055,wave:"triangle",at,pan:.35,room:.25,music:true});
  }
  if(th.kit==="brush"){
    if(pos===0||pos===10)voice({f:120,f2:48,len:.22,vol:.2,at,music:true});
    if(pos%4===2)voice({f:3800,f2:2600,len:.16,vol:.035,wave:"noise",band:"bandpass",q:.8,at,pan:.3,pan2:-.3,room:.4,music:true});
    if(pos===4||pos===12)voice({f:2000,f2:1200,len:.09,vol:.05,wave:"noise",at,pan:-.2,room:.5,music:true});
  }
  // each bonus path's own colour
  if(th.extra==="tram"&&pos===0&&bar%4===3)for(let k=0;k<2;k++)voice({f:1760,len:.5,vol:.05,wave:"sine",at:at+k*.22,pan:.7,room:.5,echo:.2,music:true});
  if(th.extra==="birds"&&pos===6&&rnd(bar+40)>.45)for(let k=0;k<3;k++)voice({f:2300+rnd(bar+k)*900,f2:3100+rnd(bar+k)*600,len:.07,vol:.03,wave:"sine",at:at+k*.09,pan:rnd(bar)>.5?.85:-.85,room:.6,music:true});
  if(th.extra==="zap"&&pos===14&&bar%2)voice({f:1800,f2:220,len:.22,vol:.035,wave:"sawtooth",cut:4000,at,pan:-.8,pan2:.8,echo:.4,music:true});
  if(th.extra==="radio"&&pos===4&&bar%2===0)for(let k=0;k<3;k++)voice({f:[1320,1760,1480][Math.floor(rnd(bar+k)*3)],len:.05,vol:.028,wave:"square",cut:3000,at:at+k*.11,pan:.75,room:.6,echo:.45,music:true});
  if(th.extra==="train"&&pos%4===0)voice({f:1500,f2:700,len:.06,vol:pos%8?.03:.05,wave:"noise",band:"bandpass",q:1.2,at,pan:pos%8?.5:-.5,music:true});
  if(th.extra==="train"&&pos===0&&bar%4===3)voice({f:880,f2:870,len:.45,vol:.04,wave:"square",cut:2400,at:at+.2,pan:-.5,room:.5,music:true});
  if(th.extra==="clock"&&pos===0&&bar%4===0)voice({f:196,len:2.6,vol:.07,wave:"sine",at,pan:.4,room:.8,echo:.2,music:true}),voice({f:588,len:1.4,vol:.02,wave:"sine",at,pan:.4,room:.8,music:true});
  const drums=th.kit!=="tabla"&&th.kit!=="brush";
  if(drums&&(th.kit!=="sparse"||pos===0)){
    if(pos===0||pos===8||(th.kit==="full"&&pos===10)||(th.kit==="shaker"&&pos===6))voice({f:150,f2:44,len:.2,vol:.26,at,music:true});
  }
  if(drums&&th.kit!=="sparse"&&(pos===4||pos===12)){voice({f:2400,f2:900,len:.13,vol:.1,wave:"noise",at,pan:-.15,room:.55,music:true});voice({f:190,f2:140,len:.09,vol:.07,wave:"triangle",at,music:true})}
  if(th.kit==="sparse"&&pos===8)voice({f:5200,f2:3000,len:.05,vol:.045,wave:"noise",band:"highpass",at,pan:-.4,room:.5,echo:.3,music:true});
  if(drums&&th.kit!=="sparse"&&(pos%2===0||late))voice({f:7200,f2:5200,len:pos===14?.16:.04,vol:pos%4===2?.05:.036,wave:"noise",band:"highpass",at,pan:pos%4===2?.62:-.62,room:.12,music:true});
  if(th.kit==="shaker")voice({f:5200,f2:3600,len:.035,vol:pos%2?.022:.036,wave:"noise",band:"bandpass",q:1.5,at,pan:.6,music:true});
  // bass
  const bassAt=th.bass.indexOf(pos);
  if(bassAt>=0){const up=bassAt>0&&pos>=10?4:0;voice({f:hz(degree(th,chord+up)-24),len:stepLen*(th.kit==="sparse"?7:2.6),vol:.15,wave:"triangle",cut:700,at,room:.05,music:true});
    if(th.kit==="full")voice({f:hz(degree(th,chord+up)-12),len:stepLen*1.6,vol:.05,wave:"sawtooth",cut:900,cut2:260,at,music:true})}
  // pad: one wide chord a bar
  if(pos===0&&age>3.5)[0,2,4].forEach((tone,i)=>voice({f:hz(degree(th,chord+tone)),len:stepLen*15.6,vol:th.pad*1.7,wave:"sawtooth",cut:1300,cut2:760,attack:.25,hold:.7,wide:13,at,pan:[-.9,.15,.9][i],room:.55,music:true}));
  // arp
  if(age>7&&!boss&&th.arp.includes(pos)){
    const k=th.arp.indexOf(pos),tone=[0,2,4,7,4,2,9,4][(k+bar*3+Math.floor(rnd(bar)*3))%8];
    leadVoice(th,degree(th,chord+tone)+(late?12:0),at,stepLen*1.7,(k%2?1:-1)*(.55+.35*rnd(pos+bar)),.07);
  }
  // melody: a two-bar phrase that returns with small changes
  if(age>18&&!boss){
    const phrase=bar%2,slot=pos+phrase*16,mask=[0,3,6,8,12,16,19,22,24,28];
    if(mask.includes(slot)){
      const i=mask.indexOf(slot),walk=[4,5,7,6,4,2,4,7,9,7],tweak=bar%4>=2&&i>6?Math.floor(rnd(i+bar)*3)-1:0;
      const midi=degree(th,chord+walk[(i+Math.floor(rnd(1)*4))%10]+tweak)+12,gap=(mask[i+1]??32)-slot;
      voice({f:hz(midi),len:stepLen*gap*.92,vol:.062,wave:th.lead==="reed"?"sawtooth":"triangle",cut:th.lead==="reed"?2200:5200,attack:.015,hold:.55,at,pan:.3,room:.3,echo:.22,wide:6,music:true});
      // A quieter copy a few milliseconds later on the other side widens the tune.
      voice({f:hz(midi)*1.003,len:stepLen*gap*.92,vol:.04,wave:"triangle",cut:4200,attack:.015,hold:.55,at:at+.014,pan:-.55,room:.3,music:true});
    }
  }
  // boss: low pulse and a rising alarm
  if(boss){
    if(pos%4===0)voice({f:hz(th.root-24),len:stepLen*3.4,vol:.16,wave:"sawtooth",cut:420,cut2:180,at,room:.2,music:true});
    if(pos%8===4)voice({f:hz(th.root+12),f2:hz(th.root+13),len:stepLen*3,vol:.045,wave:"square",cut:2000,at,pan:.5,pan2:-.5,echo:.3,music:true});
  }
}
function musicTick(){
  if(!audioBus||audioBus.state!=="running"||!g)return;
  const threat=nextThreat();
  if(threat&&lastRivalSound!==threat){soundFX("rival");lastRivalSound=threat}
  if(!me.music)return;
  const th=themeFor(g.level),step=Math.floor(g.time/(60/th.bpm/4));if(step===beatMark)return;beatMark=step;
  playStep(th,step,0,{late:g.d/courseLength>.62,boss:g.items.some(o=>o.boss&&!o.done&&!o.pass&&encounterLead(o)<3.2),age:g.tutorial?99:g.time});
}
function fanfare(at=0,root=60){
  const chord=(tones,t,len,vol)=>tones.forEach((m,i)=>voice({f:hz(root+m),len,vol,wave:"sawtooth",cut:3200,cut2:1100,attack:.02,hold:.6,wide:12,at:at+t,pan:[-.75,-.25,.25,.75][i%4],room:.5,music:true}));
  chord([0,4,7,12],0,.3,.07);chord([5,9,12,17],.32,.3,.07);chord([7,11,14,19],.64,.34,.075);chord([12,16,19,24],1.0,1.7,.085);
  [0,4,7,12,16,19,24,28].forEach((m,i)=>voice({f:hz(root+12+m),len:.16,vol:.07,wave:"triangle",at:at+i*.12,pan:i%2?.7:-.7,echo:.3,room:.2,music:true}));
  for(const t of [0,.64,1.0])voice({f:130,f2:50,len:.4,vol:.3,at:at+t,room:.3,music:true});
  for(let i=0;i<6;i++)voice({f:2600,f2:1400,len:.05,vol:.03+.014*i,wave:"noise",at:at+.66+i*.055,pan:.2,music:true});
  for(const side of [-1,1])voice({f:9000,f2:4200,len:1.5,vol:.07,wave:"noise",band:"highpass",at:at+1.0,pan:side*.8,room:.6,music:true});
  voice({f:hz(root-24),len:1.7,vol:.2,wave:"triangle",at:at+1.0,music:true});
  for(let i=0;i<10;i++)voice({f:hz(root+24+[0,4,7,12,16][i%5]),len:.3,vol:.04,wave:"sine",at:at+1.25+i*.11,pan:-1+i*.22,echo:.4,room:.4,music:true});
}
function finishMusic(){
  if(!me.music){soundFX("clear");return}
  fanfare(0,themeFor(g?.level||1).root);
}
// The opening film's score: a build, the boss roar, a fire sweep and the title hit.
function filmScore(){
  if(!audioBus||!(me.music||me.sfx))return;
  const th={...themes.village,seed:5};
  voice({f:55,len:4.2,vol:.1,wave:"sawtooth",cut:300,attack:1.2,hold:.8,room:.4,music:true});
  for(let s=0;s<40;s++)playStep(th,s+16,1.3+s*(60/th.bpm/4)*.92,{age:s<16?8:20});
  voice({f:400,f2:3000,len:1.0,vol:.06,wave:"noise",band:"bandpass",q:1.2,at:3.5,pan:-.8,pan2:.6,room:.4,music:true});
  voice({f:170,f2:52,len:1.2,vol:.3,wave:"sawtooth",cut:900,cut2:200,at:4.5,pan:-.7,pan2:.2,room:.5,music:true});
  voice({f:1500,f2:260,len:1.1,vol:.2,wave:"noise",at:4.55,pan:-.7,pan2:.3,room:.5,music:true});
  voice({f:900,f2:2600,len:.7,vol:.18,wave:"noise",at:5.3,pan:-.9,pan2:.9,room:.4,music:true});
  fanfare(5.75,60);
}
