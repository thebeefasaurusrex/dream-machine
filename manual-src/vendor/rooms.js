// Dream Machine rooms: extracted verbatim from teamloop-live.html by extract-rooms.mjs.
// Do not edit the inside by hand; re-run the extractor instead.
// Needs persona-engine.js loaded first (COLORWAYS, rect, poly, tone, paintContext).
"use strict";
const DM_ROOMS = (function(){
const state = { colorway: "voidArcade", quiet: false };
let ctx = null;
const sceneWrap = null;
// ROOM_DEFS, ROOM_ORDER, STATION_NAMES (live app lines 719-764)
const ROOM_DEFS = {
  forgeFloor:{
    label:"DM Main Floor",icon:"01",accent:"#00E5FF",
    description:"Agents work the cabinet row under the cloud sign, browse the prize wall, break the token machine, and head out through prize pickup.",
    draw:drawForgeFloor,
    legend:[["#00E5FF","Cabinet row · active build"],["#B300FF","Prize wall · plan / research"],["#FF007F","Token machine · needs attention"],["#6EF3A5","Prize pickup · turn ended"],["#FFD166","Token line · not started"],["#8C91A8","Lounge · stale / idle"]],
    zones:{
      work:[[300,328],[405,328],[510,328],[615,328],[352,420],[492,420]],
      think:[[190,245],[245,245],[135,245]],
      attention:[[794,338],[840,390],[770,420]],
      complete:[[680,250],[790,250],[900,250]],
      idle:[[142,425],[200,438],[250,425]],
      queued:[[650,430],[700,430]]
    }
  },
  observatory:{
    label:"Signal Observatory",icon:"04",accent:"#B300FF",
    description:"Agents read the star map, work the antenna bank, investigate the anomaly beacon, and send completed signals through the uplink.",
    draw:drawObservatory,
    legend:[["#00E5FF","Antenna bank · active build"],["#B300FF","Star map · plan / research"],["#FF007F","Anomaly · needs attention"],["#6EF3A5","Uplink · turn ended"],["#FFD166","Queue · not started"],["#8C91A8","Dark matter sofa · stale / idle"]],
    zones:{work:[[305,338],[415,338],[525,338],[630,338],[380,430],[525,430]],think:[[120,250],[190,235],[250,260]],attention:[[810,345],[865,390],[775,420]],complete:[[690,230],[790,225],[890,240]],idle:[[120,435],[185,445],[245,425]],queued:[[640,440],[700,440]]}
  },
  agoraArchive:{
    label:"Agora Archive",icon:"05",accent:"#FFD166",
    description:"Agents gather around a crooked debate table, inspect scroll stacks, visit the objection podium, and file finished work in the glowing archive.",
    draw:drawAgoraArchive,
    legend:[["#00E5FF","Debate table · active build"],["#B300FF","Scroll stacks · plan / research"],["#FF007F","Objection · needs attention"],["#6EF3A5","Archive · turn ended"],["#FFD166","Queue · not started"],["#8C91A8","Philosopher pit · stale / idle"]],
    zones:{work:[[320,340],[420,320],[520,340],[620,320],[395,425],[545,425]],think:[[115,255],[180,235],[245,260]],attention:[[805,345],[860,390],[780,425]],complete:[[690,245],[790,235],[890,250]],idle:[[125,435],[190,445],[250,430]],queued:[[635,442],[700,442]]}
  },
  nullArcade:{
    label:"DM Pinball Row",icon:"02",accent:"#FF007F",
    description:"Agents lean on the pinball row, chase the high-score wall, feed the ticket eater, and slip out through the suspicious exit.",
    draw:drawNullArcade,
    legend:[["#00E5FF","Pinball row · active build"],["#B300FF","High scores · plan / research"],["#FF007F","Ticket eater · needs attention"],["#6EF3A5","Suspicious exit · turn ended"],["#FFD166","Queue · not started"],["#8C91A8","Soda machines · stale / idle"]],
    zones:{work:[[305,340],[415,340],[525,340],[635,340],[380,430],[525,430]],think:[[115,250],[185,235],[250,255]],attention:[[805,345],[860,390],[780,425]],complete:[[690,245],[790,235],[890,250]],idle:[[120,435],[185,445],[245,430]],queued:[[635,442],[700,442]]}
  },
  dmParty:{
    label:"DM Party Room",icon:"03",accent:"#6EF3A5",
    description:"Agents grab slices at the pizza counter, work the party tables under the balloons, feed the Ticket Eater 5000, and crash in the ball pit.",
    draw:drawDmParty,
    legend:[["#00E5FF","Party tables · active build"],["#B300FF","Pizza counter · plan / research"],["#FF007F","Ticket Eater 5000 · needs attention"],["#6EF3A5","Prize shelf · turn ended"],["#FFD166","Queue · not started"],["#8C91A8","Ball pit · stale / idle"]],
    zones:{work:[[320,340],[420,330],[520,340],[620,330],[395,425],[545,425]],think:[[115,250],[185,235],[250,255]],attention:[[805,345],[860,390],[780,425]],complete:[[690,245],[790,235],[890,250]],idle:[[125,435],[190,445],[250,430]],queued:[[635,442],[700,442]]}
  }
};
const ROOM_ORDER=["forgeFloor","nullArcade","dmParty","observatory","agoraArchive"];
const STATION_NAMES={forgeFloor:{work:"Cabinet Row",think:"Prize Wall",attention:"Token Machine",complete:"Prize Pickup",queued:"Token Line",idle:"Lounge"},observatory:{work:"Antenna Bank",think:"Star Map",attention:"Anomaly Beacon",complete:"Uplink",queued:"Queue",idle:"Dark Matter Sofa"},agoraArchive:{work:"Debate Table",think:"Scroll Stacks",attention:"Objection Podium",complete:"Glowing Archive",queued:"Queue",idle:"Philosopher Pit"},nullArcade:{work:"Pinball Row",think:"High Scores",attention:"Ticket Eater",complete:"Suspicious Exit",queued:"Queue",idle:"Soda Machines"},dmParty:{work:"Party Tables",think:"Pizza Counter",attention:"Ticket Eater 5000",complete:"Prize Shelf",queued:"Queue",idle:"Ball Pit"}};
// hash32 (line 788)
function hash32(value){let h=2166136261;for(const ch of String(value)){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0}
// pixel font + room art primitives + the five room drawers + ambient (lines 817-1139)
const PIXEL_FONT={
  A:"01110/10001/10001/11111/10001/10001/10001",B:"11110/10001/10001/11110/10001/10001/11110",C:"01111/10000/10000/10000/10000/10000/01111",D:"11110/10001/10001/10001/10001/10001/11110",E:"11111/10000/10000/11110/10000/10000/11111",F:"11111/10000/10000/11110/10000/10000/10000",G:"01111/10000/10000/10111/10001/10001/01111",H:"10001/10001/10001/11111/10001/10001/10001",I:"11111/00100/00100/00100/00100/00100/11111",J:"00111/00010/00010/00010/10010/10010/01100",K:"10001/10010/10100/11000/10100/10010/10001",L:"10000/10000/10000/10000/10000/10000/11111",M:"10001/11011/10101/10101/10001/10001/10001",N:"10001/11001/10101/10011/10001/10001/10001",O:"01110/10001/10001/10001/10001/10001/01110",P:"11110/10001/10001/11110/10000/10000/10000",Q:"01110/10001/10001/10001/10101/10010/01101",R:"11110/10001/10001/11110/10100/10010/10001",S:"01111/10000/10000/01110/00001/00001/11110",T:"11111/00100/00100/00100/00100/00100/00100",U:"10001/10001/10001/10001/10001/10001/01110",V:"10001/10001/10001/10001/10001/01010/00100",W:"10001/10001/10001/10101/10101/11011/10001",X:"10001/10001/01010/00100/01010/10001/10001",Y:"10001/10001/01010/00100/00100/00100/00100",Z:"11111/00001/00010/00100/01000/10000/11111",
  0:"01110/10001/10011/10101/11001/10001/01110",1:"00100/01100/00100/00100/00100/00100/01110",2:"01110/10001/00001/00010/00100/01000/11111",3:"11110/00001/00001/01110/00001/00001/11110",4:"00010/00110/01010/10010/11111/00010/00010",5:"11111/10000/10000/11110/00001/00001/11110",6:"01110/10000/10000/11110/10001/10001/01110",7:"11111/00001/00010/00100/01000/01000/01000",8:"01110/10001/10001/01110/10001/10001/01110",9:"01110/10001/10001/01111/00001/00001/01110",
  " ":"00000/00000/00000/00000/00000/00000/00000","-":"00000/00000/00000/11111/00000/00000/00000",".":"00000/00000/00000/00000/00000/00110/00110",":":"00000/00110/00110/00000/00110/00110/00000","!":"00100/00100/00100/00100/00100/00000/00100","?":"01110/10001/00001/00010/00100/00000/00100","/":"00001/00010/00100/01000/10000/00000/00000","_":"00000/00000/00000/00000/00000/00000/11111"
};
function pixelText(text,x,y,color,size=12,align="left"){const value=String(text).toUpperCase();if(paintContext===ctx&&sceneWrap?.clientWidth<650&&value.length>4)return;const unit=size>=10?2:1;const advance=6*unit;const width=Math.max(0,value.length*advance-unit);let start=x;if(align==="center")start-=width/2;else if(align==="right")start-=width;const top=y-Math.floor(7*unit/2);for(let index=0;index<value.length;index++){const rows=(PIXEL_FONT[value[index]]||PIXEL_FONT["?"]).split("/");for(let row=0;row<7;row++)for(let col=0;col<5;col++)if(rows[row][col]==="1")rect(color,start+index*advance+col*unit,top+row*unit,unit,unit)}}
function compactPixelLabel(value,max=8){const clean=String(value||"?").trim();return clean.length<=max?clean:`${clean.slice(0,Math.max(1,max-1))}.`}
function pixelPlate(textValue,x,y,color,max=9){const value=compactPixelLabel(textValue,max).toUpperCase();const width=Math.max(5,value.length*6-1);rect("rgba(3,4,9,.88)",x-width/2-3,y-6,width+6,11);pixelText(value,x,y+1,"#030409",8,"center");pixelText(value,x,y,color,8,"center")}
/*ROOMS-8BIT*//* ---- room art primitives (ported verbatim from the approved rooms lab; m: 0=Blue Bomber, 1=Dark Sector, 2=Neon Nights) ---- */
function roomDither(c,x,y,w,h,step=4){ctx.fillStyle=c;for(let j=y;j<y+h;j+=step)for(let i=x+((j/step)%2?step/2:0);i<x+w;i+=step)ctx.fillRect(Math.round(i),Math.round(j),Math.max(1,step/2-1),Math.max(1,step/2-1))}
function roomGlow(c,x,y,w,h,a=.18){ctx.save();ctx.globalAlpha=a;ctx.fillStyle=c;ctx.fillRect(x,y,w,h);ctx.globalAlpha=a*.5;ctx.fillRect(x-3,y-3,w+6,h+6);ctx.restore()}
function roomPlate(p,text,cx,cy,color,size=8){const w=Math.max(5,text.length*6-1);rect(p.ink,cx-w/2-4,cy-size/2-4,w+8,size+8);rect(tone(p.grid,.28),cx-w/2-4,cy+size/2+2,w+8,2);pixelText(text,cx,cy,color,size,"center")}
function roomEnv(p,m,carpet){
  if(m===0){
    rect(p.sky,0,0,960,96);rect(p.sky2,0,96,960,54);
    rect(p.wall,0,150,960,220);rect(tone(p.wall,.28),0,150,960,6);rect(tone(p.wall,-.32),0,344,960,26);rect(p.bronze,0,340,960,6);
    if(carpet){rect(tone(p.violet,-.62),0,370,960,170);roomDither(tone(p.violet,-.45),0,370,960,170,8);
      for(let i=0;i<130;i++){const h=hash32("carpet"+i);const x=h%950,y=376+(h>>6)%158;
        const c=[p.pink,p.cyan,p.gold,p.mint][h%4];
        if(h%4===0){rect(c,x,y,7,3);rect(c,x+2,y-3,3,3)}else if(h%4===1){rect(c,x,y,4,4);rect(c,x+5,y+2,3,3)}else if(h%4===2){poly(c,[[x,y],[x+6,y+2],[x+2,y+6]])}else{rect(c,x,y,2,8);rect(c,x-3,y+3,8,2)}}}
    else{rect(p.floor,0,370,960,170);for(let x=0;x<960;x+=48)rect(p.grid,x,370,1,170);for(let y=370;y<540;y+=34)rect(p.grid,0,y,960,1)}
  }else if(m===1){
    rect(tone(p.sky,-.3),0,0,960,150);roomDither(p.sky,0,0,960,150,6);
    rect(tone(p.wall,-.35),0,150,960,220);roomDither(tone(p.wall,-.1),0,150,960,220,7);rect(tone(p.wall,-.32),0,344,960,26);
    if(carpet){rect(tone(p.violet,-.75),0,370,960,170);roomDither(tone(p.violet,-.62),0,370,960,170,6);
      for(let i=0;i<40;i++){const h=hash32("carpet"+i);const x=h%950,y=376+(h>>6)%158;rect(tone([p.pink,p.cyan,p.gold][h%3],-.25),x,y,5,3)}}
    else{rect(tone(p.floor,-.3),0,370,960,170);roomDither(p.grid,0,370,960,170,9)}
    rect(tone(p.steel,-.32),0,368,960,4);
  }else{
    rect(tone(p.sky,-.3),0,0,960,150);rect(tone(p.sky2,-.35),0,150,960,220);roomDither(tone(p.sky2,-.15),0,150,960,220,10);
    rect(tone(p.floor,-.25),0,370,960,170);
    rect(p.violet,0,366,960,3);roomGlow(p.violet,0,352,960,16,.10);
    if(carpet)for(let i=0;i<46;i++){const h=hash32("carpet"+i);const x=h%950,y=376+(h>>6)%158;const c=[p.pink,p.cyan,p.violet][h%3];ctx.save();ctx.globalAlpha=.5;rect(c,x,y,5,2);ctx.restore()}
    else{ctx.save();ctx.globalAlpha=.35;for(let x=0;x<960;x+=48)rect(p.grid,x,370,1,170);for(let y=370;y<540;y+=34)rect(p.grid,0,y,960,1);ctx.restore()}
  }
}
function roomCeilingLights(p,m){
  for(const x of [120,360,600,840]){
    rect(p.ink,x-1,0,4,20);
    rect(p.ink,x-13,20,30,14);rect(m===1?tone(p.steel,-.32):p.gold,x-11,22,26,10);rect(tone(p.gold,-.3),x-11,30,26,4);
    if(m===0){rect(tone(p.gold,.35),x-11,22,26,3);roomGlow(p.gold,x-30,34,64,110,.05)}
    if(m===2){rect(p.cyan,x-11,24,26,6);roomGlow(p.cyan,x-34,34,72,150,.08)}
  }
}
function roomWallDress(p,m,theme){
  const y=162,w=92,h=78;
  const arts=theme==="space"?[["ORBIT",p.cyan],["NOVA",p.pink],["COMET",p.gold],["VOID",p.violet]]
    :theme==="agora"?[["WISDOM",p.gold],["LOGIC",p.cyan],["ETHICS",p.violet],["AESTHETIC",p.mint]]
    :[["SFII",p.cyan],["MKII",p.pink],["TMNT",p.mint],["X-MEN",p.gold]];
  for(let i=0;i<4;i++){const x=292+i*98;const [title,c]=arts[i];
    if(m===2)roomGlow(c,x,y,w,h,.10);
    rect(p.ink,x-2,y-2,w+4,h+4);
    rect(theme==="agora"?tone(p.bronze,-.15):tone(p.sky2,m===1?-.2:.1),x,y,w,h);
    rect(c,x,y,w,14);pixelText(title,x+w/2,y+9,p.ink,8,"center");
    const hh=hash32(title);
    if(theme==="space"){
      if(i%2){rect(p.ink,x+30,y+28,32,24);rect(c,x+32,y+30,28,20);rect(tone(c,-.3),x+32,y+42,28,8);ctx.strokeStyle=c;ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(x+46,y+42,26,7,-.4,0,Math.PI*2);ctx.stroke()}
      else{for(let s=0;s<7;s++)rect(s?p.paper:c,x+12+(hh>>s)%66,y+22+(hh>>(s+3))%44,s?2:4,s?2:4)}
    }else if(theme==="agora"){
      poly(c,[[x+26,y+56],[x+46,y+26],[x+66,y+56]]);rect(p.ink,x+42,y+30,8,22);rect(c,x+40,y+28,12,6);
      rect(p.paper,x+22,y+58,48,4);
    }else{
      rect(p.ink,x+10,y+22,72,46);rect(tone(c,-.35),x+12,y+24,68,42);
      poly(c,[[x+16,y+64],[x+34,26+y],[x+46,y+44],[x+60,y+26+((hh%3)*4)],[x+74,y+64]]);
      rect(p.paper,x+30+(hh%20),y+34,6,6);
    }
    if(m===1)roomDither(p.ink,x,y,w,h,6);
  }
  if(m===0){rect(tone(p.wall,-.32),0,252,960,3);for(let x=20;x<960;x+=60)rect(tone(p.wall,.28),x,254,3,3)}
  if(m===1){for(const py of [200,268]){rect(tone(p.steel,-.5),0,py,960,5);for(let x=16;x<960;x+=44)rect(tone(p.steel,-.32),x,py+1,3,3)}}
  if(m===2){rect(p.pink,0,206,960,2);roomGlow(p.pink,0,196,960,14,.12);rect(p.cyan,0,288,960,2);roomGlow(p.cyan,0,280,960,12,.10)}
}
function roomCloudSign(p,cx,cy,m,text="DREAM MACHINE"){
  const w=text.length*12+44;
  const C=m===1?tone(p.paper,-.45):p.paper;
  const shade=m===1?tone(p.violet,-.3):tone(p.violet,.1);
  if(m===2){roomGlow(p.pink,cx-w/2-8,cy-34,w+16,64,.20);roomGlow(p.cyan,cx-w/2-8,cy-34,w+16,64,.10)}
  const puffs=[[-w/2+8,-6,34,26],[-w/2+30,-18,42,32],[-14,-26,52,36],[w/2-62,-16,44,30],[w/2-36,-6,36,24]];
  for(const [dx,dy,pw,ph] of puffs)rect(p.ink,cx+dx-2,cy+dy-2,pw+4,ph+4);
  for(const [dx,dy,pw,ph] of puffs)rect(C,cx+dx,cy+dy,pw,ph);
  rect(p.ink,cx-w/2+4,cy+14,w-8,8);rect(C,cx-w/2+6,cy+12,w-12,8);
  rect(shade,cx-w/2+6,cy+16,w-12,4);
  rect(tone(C,.12),cx-w/2+12,cy-14,w/2-10,5);
  if(m!==1)for(const [sx,sy] of [[-w/2+16,2],[w/2-22,-8],[8,-20]])rect(p.paper,cx+sx,cy+sy,4,4);
  pixelText(text,cx,cy+3,p.ink,12,"center");
  pixelText(text,cx,cy+2,m===2?p.pink:p.violet,12,"center");
}
function roomCabinet(p,x,y,body,art,m){
  const bD=tone(body,-.35),bL=tone(body,.25);
  rect(p.ink,x-2,y-2,80,120);rect(body,x,y,76,116);rect(bL,x,y,76,8);rect(bD,x+62,y+8,14,108);
  rect(p.ink,x+4,y+4,68,18);rect(p.paper,x+6,y+6,64,14);pixelText(art,x+38,y+13,p.ink,8,"center");
  rect(p.ink,x+8,y+26,60,44);rect(p.sky,x+10,y+28,56,40);
  const h=hash32(art);
  rect([p.cyan,p.pink,p.gold,p.mint][h%4],x+14+(h%30),y+34+(h>>4)%22,10,8);
  rect([p.gold,p.cyan][h%2],x+30+(h>>2)%22,y+44+(h>>6)%14,6,6);
  if(m===1)roomDither(p.ink,x+10,y+28,56,40,5);
  if(m===2){roomGlow(p.cyan,x+8,y+26,60,44,.12);rect(p.cyan,x+6,y+6,64,2)}
  rect(p.ink,x+8,y+74,60,16);rect(bD,x+10,y+76,56,12);
  rect(p.pink,x+18,y+79,5,5);rect(p.cyan,x+30,y+79,5,5);rect(p.gold,x+42,y+79,5,5);
  rect(p.ink,x+52,y+75,4,9);rect(p.rust,x+51,y+73,6,5);
  rect(p.ink,x+10,y+96,20,10);rect(tone(p.steel,.28),x+12,y+98,16,6);rect(p.ink,x+16,y+100,8,2);
  if(m===0)rect(bL,x+2,y+2,2,112);else if(m===1)roomDither(bD,x,y,76,116,6);
}
function roomPinball(p,x,y,body,name,m){
  const bD=tone(body,-.35),bL=tone(body,.25);
  rect(p.ink,x-2,y-2,54,118);
  rect(p.ink,x+2,y,46,34);rect(body,x+4,y+2,42,30);rect(bL,x+4,y+2,42,4);
  const h=hash32(name);rect([p.pink,p.violet,p.cyan][h%3],x+8,y+6,34,14);rect(p.paper,x+8,y+6,34,3);
  poly(p.gold,[[x+14,y+24],[x+20,y+14],[x+26,y+24]]);poly(p.cyan,[[x+26,y+24],[x+32,y+14],[x+38,y+24]]);
  rect(p.ink,x,y+34,50,78);rect(body,x+2,y+36,46,74);rect(bL,x+2,y+36,46,5);rect(bD,x+38,y+36,10,74);
  rect(p.ink,x+6,y+44,38,30);rect(tone(p.sky,.15),x+8,y+46,34,26);
  poly(p.paper,[[x+12,y+70],[x+22,y+58],[x+24,y+62],[x+14,y+72]]);rect(p.pink,x+26,y+52,5,5);rect(p.gold,x+16,y+50,4,4);
  rect(p.ink,x+8,y+80,34,10);rect(p.paper,x+10,y+82,30,6);pixelText(String(1000+h%9000),x+25,y+86,p.pink,8,"center");
  rect(bD,x+4,y+96,42,6);
  if(m===1)roomDither(bD,x+2,y+36,46,74,5);
  if(m===2)roomGlow([p.pink,p.violet,p.cyan][h%3],x+4,y+2,42,30,.16);
}
function roomTokenMachine(p,x,y,m){
  rect(p.ink,x-2,y-2,84,146);rect(p.gold,x,y,80,142);rect(tone(p.gold,.28),x,y,80,10);rect(tone(p.gold,-.4),x+62,y+10,18,132);
  rect(p.ink,x+8,y+12,64,26);rect(p.paper,x+10,y+14,60,22);pixelText("TOKENS",x+40,y+25,p.pink,8,"center");
  rect(p.ink,x+8,y+44,64,44);rect(p.sky2,x+10,y+46,60,40);
  for(let i=0;i<4;i++)for(let j=0;j<3;j++){rect(tone(p.gold,.28),x+14+i*14,y+50+j*12,10,8);rect(p.bronze,x+14+i*14,y+50+j*12,10,2)}
  rect(p.ink,x+24,y+96,32,14);rect(tone(p.steel,.28),x+26,y+98,28,10);rect(p.ink,x+34,y+101,12,4);
  rect(p.ink,x+14,y+118,52,16);rect(tone(p.gold,-.55),x+16,y+120,48,12);rect(tone(p.gold,.28),x+26,y+122,28,4);
  if(m===1)roomDither(tone(p.gold,-.4),x,y,80,142,6);
  if(m===2)roomGlow(p.gold,x+8,y+12,64,26,.2);
}
function roomPrizeCounter(p,x,y,w,m){
  rect(p.ink,x-2,y-2,w+4,84);
  rect(p.violet,x,y,w,80);rect(tone(p.violet,.2),x,y,w,8);rect(tone(p.violet,-.4),x,y+66,w,14);
  for(const sy of [14,38]){
    rect(p.ink,x+6,y+sy,w-12,20);rect(p.wall,x+8,y+sy+2,w-16,16);
    for(let i=0;i<Math.floor((w-20)/22);i++){const h=hash32("prize"+sy+i);const px=x+12+i*22;
      if(h%3===0){rect(p.pink,px,y+sy+5,12,10);rect(tone(p.pink,.28),px+2,y+sy+3,8,4)}
      else if(h%3===1){rect(p.cyan,px,y+sy+4,8,12);rect(p.paper,px+2,y+sy+6,4,4)}
      else{rect(p.gold,px,y+sy+7,14,8);rect(p.ink,px+2,y+sy+9,3,3)}}
  }
  rect(p.ink,x+6,y+60,w-12,6);rect(p.paper,x+8,y+61,w-16,4);
  if(m===1)roomDither(tone(p.violet,-.4),x,y,w,80,6);
  if(m===2){roomGlow(p.pink,x+6,y+14,w-12,20,.12);roomGlow(p.cyan,x+6,y+38,w-12,20,.12)}
}
function roomVending(p,x,y,body,label,m){
  rect(p.ink,x-2,y-2,64,104);rect(body,x,y,60,100);rect(tone(body,.25),x,y,60,8);rect(tone(body,-.4),x+46,y+8,14,92);
  rect(p.ink,x+6,y+10,36,58);rect(p.sky2,x+8,y+12,32,54);
  for(let j=0;j<3;j++)for(let i=0;i<2;i++){const h=hash32(label+i+j*2);rect([p.rust,p.gold,p.mint,p.pink][h%4],x+11+i*15,y+16+j*17,10,12);rect(p.paper,x+11+i*15,y+16+j*17,10,2)}
  rect(p.ink,x+46,y+16,10,26);rect(p.paper,x+48,y+18,6,4);rect(p.paper,x+48,y+26,6,4);
  rect(p.ink,x+8,y+74,48,18);rect(tone(body,-.5),x+10,y+76,44,14);
  pixelText(label,x+30,y+97,p.paper,8,"center");
  if(m===1)roomDither(tone(body,-.4),x,y,60,100,6);
  if(m===2)roomGlow(p.mint,x+6,y+10,36,58,.14);
}
function roomExitDoor(p,x,y,w,label,glowc,m){
  rect(p.ink,x-2,y-2,w+4,84);rect(p.steel,x,y,w,80);rect(tone(p.steel,.28),x,y,w,8);rect(tone(p.steel,-.4),x,y+70,w,10);
  rect(p.ink,x+w/2-22,y+10,44,40);rect(p.sky,x+w/2-20,y+12,40,36);
  for(let i=0;i<3;i++)rect([p.cyan,p.pink,p.gold][i],x+w/2-14+i*10,y+20+(i%2)*10,6,6);
  rect(p.ink,x+8,y+56,w-16,12);pixelText(label,x+w/2,y+64,glowc,8,"center");
  if(m===2)roomGlow(glowc,x+w/2-22,y+10,44,40,.2);
  if(m===1)roomDither(tone(p.steel,-.35),x,y,w,80,7);
}
function roomCouch(p,x,y,w,body,m){
  rect(p.ink,x-2,y+6,w+4,34);rect(body,x,y+8,w,30);rect(tone(body,.25),x,y+8,w,8);
  rect(body,x-6,y,14,40);rect(body,x+w-8,y,14,40);rect(tone(body,-.35),x-6,y+30,14,10);rect(tone(body,-.35),x+w-8,y+30,14,10);
  rect(tone(body,-.2),x+4,y+16,w/2-6,16);rect(tone(body,-.2),x+w/2+2,y+16,w/2-6,16);
  if(m===1)roomDither(tone(body,-.35),x,y+8,w,30,5);
}
function roomQueueRope(p,x,y,m){
  const c=m===2?p.gold:p.bronze;
  for(const px of [x,x+40,x+80]){rect(p.ink,px-1,y,10,4);rect(p.ink,px+2,y-22,4,24);rect(c,px+3,y-21,2,22);rect(p.ink,px+1,y-26,6,6);rect(c,px+2,y-25,4,4)}
  poly(c,[[x+5,y-18],[x+42,y-10],[x+42,y-6],[x+5,y-14]]);poly(c,[[x+45,y-10],[x+82,y-18],[x+82,y-14],[x+45,y-6]]);
}
function roomBunting(p,seed,m){
  for(let x=10;x<950;x+=54){const h=hash32(seed+x);const c=[p.pink,p.cyan,p.gold,p.violet][h%4];
    rect(p.ink,x,150,54,2);
    poly(p.ink,[[x+8,150],[x+30,150],[x+19,178]]);poly(c,[[x+10,151],[x+28,151],[x+19,174]]);
    if(m===2&&h%2)roomGlow(c,x+10,151,18,22,.12)}
}
function roomScoreWall(p,x,y,w,h,m,title){
  rect(p.ink,x-2,y-2,w+4,h+4);rect(m===1?tone(p.wall,-.2):p.wall,x,y,w,h);rect(tone(p.wall,.28),x,y,w,6);
  for(let i=0;i<5;i++){const sy=y+14+i*24;
    rect(p.ink,x+10,sy,w-20,16);rect(p.sky2,x+12,sy+2,w-24,12);
    pixelText(`${i+1}. ${["AAA","DMX","SOL","KIM","YOU"][i]}`,x+18,sy+11,[p.gold,p.silver,p.bronze,p.cyan,p.pink][i],8);
    pixelText(String(99990-i*13700),x+w-18,sy+11,p.paper,8,"right")}
  roomPlate(p,title,x+w/2,y+h+14,p.paper);
  if(m===2)roomGlow(p.violet,x,y,w,h,.12);
  if(m===1)roomDither(p.ink,x,y,w,h,7);
}
function roomTicketEater(p,x,y,m){
  rect(p.ink,x-2,y-2,110,150);rect(p.violet,x,y,106,146);rect(tone(p.violet,.22),x,y,106,10);rect(tone(p.violet,-.4),x+86,y+10,20,136);
  rect(p.ink,x+10,y+12,86,24);rect(p.paper,x+12,y+14,82,20);pixelText("TICKET",x+53,y+23,p.violet,8,"center");pixelText("EATER",x+53,y+32,p.pink,8,"center");
  rect(p.ink,x+20,y+48,66,22);rect(p.ink,x+20,y+48,66,6);
  for(let i=0;i<6;i++)poly(p.paper,[[x+24+i*10,y+54],[x+28+i*10,y+54],[x+26+i*10,y+62]]);
  rect(p.pink,x+24,y+64,58,4);
  rect(p.paper,x+42,y+74,22,40);for(let i=0;i<4;i++)rect(p.pink,x+42,y+80+i*9,22,2);
  rect(p.ink,x+16,y+122,74,16);rect(tone(p.violet,-.5),x+18,y+124,70,12);
  if(m===1)roomDither(tone(p.violet,-.4),x,y,106,146,6);
  if(m===2)roomGlow(p.pink,x+20,y+48,66,22,.2);
}
function roomPizzaCounter(p,x,y,m){
  rect(p.ink,x-2,y+18,206,58);rect(p.bronze,x,y+20,202,54);rect(tone(p.bronze,.28),x,y+20,202,8);rect(tone(p.bronze,-.4),x,y+62,202,12);
  rect(p.ink,x+6,y+26,60,30);rect(p.rust,x+8,y+28,56,26);
  poly(p.gold,[[x+14,y+52],[x+30,y+34],[x+50,y+52]]);rect(p.rust,x+22,y+42,4,4);rect(p.rust,x+34,y+46,4,4);
  poly(p.paper,[[x+86,y+34],[x+108,y+34],[x+97,y+20]]);poly(p.gold,[[x+88,y+34],[x+106,y+34],[x+97,y+24]]);rect(p.rust,x+93,y+29,3,3);rect(p.rust,x+100,y+31,3,3);
  for(let i=0;i<3;i++){rect(p.paper,x+124+i*22,y+30,14,16);rect(p.pink,x+124+i*22,y+30,14,4);rect(p.paper,x+127+i*22,y+18,2,12)}
  roomPlate(p,"PIZZA COUNTER",x+101,y+92,p.paper);
  if(m===1)roomDither(tone(p.bronze,-.4),x,y+20,202,54,6);
  if(m===2)roomGlow(p.rust,x+8,y+28,56,26,.25);
}
function roomPartyTable(p,x,y,m){
  rect(p.ink,x-42,y+8,88,10);rect(p.bronze,x-40,y+6,84,8);
  poly(p.ink,[[x-46,y+6],[x+50,y+6],[x+38,y-14],[x-34,y-14]]);
  poly(p.paper,[[x-43,y+4],[x+47,y+4],[x+37,y-11],[x-33,y-11]]);
  rect(p.pink,x-30,y-10,12,6);rect(p.cyan,x-6,y-10,12,6);rect(p.gold,x+18,y-10,12,6);
  for(const [bx,c] of [[-24,p.pink],[10,p.cyan],[34,p.gold]]){
    rect(p.ink,x+bx,y-34,1,22);
    rect(p.ink,x+bx-5,y-48,12,14);rect(c,x+bx-4,y-47,10,12);rect(tone(c,.3),x+bx-4,y-47,10,3)}
  if(m===2)roomGlow(p.pink,x-24,y-48,60,30,.10);
}
function roomBallPit(p,x,y,m){
  rect(p.ink,x-2,y-2,194,64);rect(p.sky2,x,y,190,60);rect(tone(p.wall,-.32),x,y+48,190,12);
  for(let i=0;i<34;i++){const h=hash32("ball"+i);const bx=x+8+h%176,by=y+8+(h>>5)%40;
    rect(p.ink,bx-1,by-1,10,10);rect([p.pink,p.cyan,p.gold,p.mint,p.violet][h%5],bx,by,8,8);rect(tone([p.pink,p.cyan,p.gold,p.mint,p.violet][h%5],.3),bx,by,8,2)}
  roomPlate(p,"BALL PIT",x+95,y+76,p.paper);
  if(m===1)roomDither(p.ink,x,y,190,60,6);
}
/* ---- the five rooms (Mark's picks: main=C, pinball=A, party=C, observatory=A, agora=C) ---- */
function drawForgeFloor(){const p=COLORWAYS[state.colorway];
  roomEnv(p,2,true);roomWallDress(p,2,"dm");roomCeilingLights(p,2);roomCloudSign(p,480,58,2);
  roomPrizeCounter(p,60,178,210,2);roomPlate(p,"PRIZE WALL",165,282,p.paper);
  for(const [i,x] of [295,400,505,610].entries())roomCabinet(p,x,250,[p.cyan,p.pink,p.violet,p.gold][i],["SFII","MKII","TMNT","X-MEN"][i],2);
  roomPlate(p,"CABINET ROW",505,388,p.cyan,10);
  roomTokenMachine(p,770,262,2);roomPlate(p,"TOKEN MACHINE",810,424,p.gold);
  roomExitDoor(p,712,150,186,"PRIZE PICKUP",p.mint,2);
  roomCouch(p,84,428,150,p.violet,2);roomPlate(p,"LOUNGE",159,478,p.paper);
  roomQueueRope(p,636,458,2);roomPlate(p,"TOKEN LINE",678,478,p.gold);
  drawAmbient(p)}
function drawNullArcade(){const p=COLORWAYS[state.colorway];
  roomEnv(p,0,true);roomWallDress(p,0,"dm");roomBunting(p,"dm2",0);roomCloudSign(p,480,56,0);
  roomScoreWall(p,52,172,210,136,0,"HIGH SCORES");
  for(const [i,x] of [290,392,494,596].entries())roomPinball(p,x,248,[p.pink,p.cyan,p.gold,p.violet][i],["KISS","DUNE","GORGAR","EBD"][i],0);
  roomPlate(p,"PINBALL ROW",498,386,p.cyan,10);
  roomTicketEater(p,762,272,0);roomPlate(p,"FEED ME",817,440,p.pink);
  roomExitDoor(p,712,146,186,"EXIT?",p.pink,0);
  roomVending(p,76,414,p.rust,"SODA",0);roomVending(p,160,414,p.steel,"SNAX",0);
  roomQueueRope(p,632,462,0);roomPlate(p,"QUEUE",678,482,p.gold);
  drawAmbient(p)}
function drawDmParty(){const p=COLORWAYS[state.colorway];
  roomEnv(p,2,true);roomWallDress(p,2,"dm");roomBunting(p,"dm3",2);roomCloudSign(p,480,56,2);
  roomPizzaCounter(p,58,196,2);
  roomPartyTable(p,360,338,2);roomPartyTable(p,505,330,2);roomPartyTable(p,620,352,2);
  roomPlate(p,"PARTY TABLES",490,398,p.cyan,10);
  roomTicketEater(p,766,268,2);roomPlate(p,"TICKET EATER 5000",818,436,p.pink,8);
  roomPrizeCounter(p,706,148,196,2);roomPlate(p,"PRIZE SHELF",804,248,p.paper);
  roomBallPit(p,70,414,2);
  roomQueueRope(p,632,462,2);roomPlate(p,"QUEUE",678,482,p.gold);
  drawAmbient(p)}
function drawObservatory(){const p=COLORWAYS[state.colorway];
  roomEnv(p,0,false);roomWallDress(p,0,"space");
  for(const s of [[45,48],[98,83],[177,37],[274,96],[450,42],[528,71],[680,31],[912,80],[330,66],[760,52]]){
    rect(p.paper,s[0],s[1],3,3);rect(p.violet,s[0]+7,s[1]-3,2,2)}
  rect(p.ink,36,166,244,152);rect(p.sky,40,170,236,144);rect(tone(p.steel,.28),40,170,236,4);
  for(let r=52;r>6;r-=12){ctx.strokeStyle=r%24?p.violet:p.cyan;ctx.lineWidth=2;ctx.beginPath();ctx.arc(158,242,r,0,Math.PI*2);ctx.stroke()}
  rect(p.paper,155,192,4,100);rect(p.paper,108,240,100,4);
  for(let i=0;i<9;i++){const h=hash32("star"+i);rect(h%2?p.paper:p.cyan,60+h%190,182+(h>>4)%110,2,2)}
  rect(p.gold,196,210,6,6);rect(p.pink,120,262,5,5);
  roomPlate(p,"STAR MAP",158,330,p.paper);
  for(const x of [298,408,518,628]){
    rect(p.ink,x-2,296,88,74);rect(p.steel,x,298,84,70);rect(tone(p.steel,.28),x,298,84,8);rect(tone(p.steel,-.4),x+70,298,14,70);
    rect(p.ink,x+8,308,68,12);rect(p.cyan,x+10,310,64,8);
    rect(p.ink,x+12,326,60,30);rect(p.sky2,x+14,328,56,26);
    for(let b=0;b<4;b++)rect([p.mint,p.gold][b%2],x+18+b*13,334+(b%2)*8,8,6);
    poly(p.ink,[[x+38,298],[x+46,272],[x+54,298]]);poly(p.violet,[[x+41,298],[x+46,280],[x+51,298]])}
  roomPlate(p,"ANTENNA BANK",505,388,p.cyan,10);
  rect(p.ink,751,278,158,152);rect(p.sky2,755,282,150,144);
  rect(p.ink,812,292,34,120);rect(p.pink,815,295,28,114);rect(tone(p.pink,.3),815,295,28,10);
  rect(p.ink,808,282,42,14);rect(p.gold,811,285,36,8);
  roomGlow(p.pink,815,295,28,114,.14);
  for(let i=0;i<3;i++){ctx.strokeStyle=p.pink;ctx.globalAlpha=.5-i*.15;ctx.lineWidth=2;ctx.beginPath();ctx.arc(829,290,18+i*10,-.4,Math.PI+.4);ctx.stroke();ctx.globalAlpha=1}
  roomPlate(p,"ANOMALY",831,442,p.paper);
  rect(p.ink,698,148,208,92);rect(p.steel,702,152,200,84);rect(tone(p.steel,.28),702,152,200,6);
  for(let i=0;i<5;i++){const bh=14+i*9;rect(p.ink,716+i*34,206-bh,22,bh+6);rect(p.mint,718+i*34,208-bh,18,bh);rect(tone(p.mint,.3),718+i*34,208-bh,18,3)}
  roomPlate(p,"UPLINK",802,138,p.mint,10);
  roomCouch(p,74,428,180,tone(p.violet,-.25),0);roomDither(p.ink,74,436,180,30,5);
  roomPlate(p,"DARK MATTER SOFA",164,478,p.paper,8);
  roomQueueRope(p,636,462,0);roomPlate(p,"QUEUE",678,482,p.gold);
  drawAmbient(p)}
function drawAgoraArchive(){const p=COLORWAYS[state.colorway];
  roomEnv(p,2,false);roomWallDress(p,2,"agora");
  for(const x of [50,270,690,910]){
    rect(p.ink,x-4,164,28,186);rect(p.paper,x,168,20,176);rect(tone(p.paper,-.18),x+14,168,6,176);
    rect(p.ink,x-10,158,40,12);rect(p.bronze,x-8,160,36,10);rect(tone(p.bronze,.28),x-8,160,36,3);
    rect(p.ink,x-7,344,34,12);rect(p.bronze,x-5,346,30,8)}
  rect(p.ink,78,178,180,144);rect(p.bronze,82,182,172,136);rect(tone(p.bronze,.28),82,182,172,6);
  for(let s=0;s<4;s++){const sy=194+s*30;
    rect(p.ink,90,sy,156,22);rect(tone(p.bronze,-.3),92,sy+2,152,18);
    for(let i=0;i<5;i++){const sx=96+i*30;
      rect(p.ink,sx,sy+4,24,14);rect(p.paper,sx+1,sy+5,22,12);rect(tone(p.paper,-.18),sx+1,sy+13,22,4);
      rect([p.gold,p.violet,p.cyan][(s+i)%3],sx+9,sy+5,4,12)}}
  roomPlate(p,"SCROLL STACKS",168,334,p.paper);
  roomGlow(p.gold,82,182,172,136,.10);
  poly(p.ink,[[278,318],[656,318],[622,372],[312,372]]);
  poly(p.bronze,[[286,322],[648,322],[618,366],[316,366]]);poly(tone(p.bronze,.28),[[286,322],[648,322],[640,334],[294,334]]);
  for(const x of [330,425,520,605]){rect(p.ink,x,330,48,26);rect(p.paper,x+2,332,44,22);rect(tone(p.paper,-.18),x+2,348,44,6);rect(p.violet,x+10,338,28,3);rect(p.ink,x+10,344,20,2)}
  for(const x of [360,505]){rect(p.ink,x-1,296,10,26);rect(p.gold,x,298,8,22);rect(tone(p.gold,.3),x,298,8,5)}
  roomPlate(p,"DEBATE TABLE",468,386,p.gold,10);
  rect(p.ink,758,282,146,148);rect(p.sky2,762,286,138,140);
  rect(p.ink,800,312,60,100);rect(p.bronze,804,316,52,92);rect(tone(p.bronze,.28),804,316,52,8);rect(tone(p.bronze,-.4),804,388,52,20);
  rect(p.ink,796,300,68,16);rect(p.gold,800,304,60,8);
  rect(p.paper,812,330,36,22);rect(p.ink,816,336,28,3);rect(p.ink,816,342,20,2);
  roomPlate(p,"OBJECTION!",831,300,p.pink,10);
  roomGlow(p.pink,762,286,138,140,.12);
  rect(p.ink,698,146,206,96);rect(p.ink,702,150,198,88);
  for(let i=0;i<4;i++){const ax=712+i*46;
    rect(p.ink,ax,158,38,70);rect(p.wall,ax+2,160,34,66);
    for(let b=0;b<4;b++)rect([p.cyan,p.mint,p.gold,p.violet][(i+b)%4],ax+6,166+b*15,26,10);
    roomGlow([p.cyan,p.mint,p.gold,p.violet][i%4],ax+2,160,34,66,.18)}
  roomPlate(p,"GLOWING ARCHIVE",800,140,p.mint,10);
  rect(p.ink,73,409,196,76);rect(p.ink,77,413,188,68);
  rect(tone(p.sky,-.2),81,417,180,60);roomDither(tone(p.sky,.25),81,417,180,60,7);
  for(const x of [110,160,210]){rect(p.steel,x,436,22,14);rect(tone(p.steel,.28),x,436,22,4)}
  roomPlate(p,"PHILOSOPHER PIT",171,497,p.paper,8);
  roomQueueRope(p,630,462,2);roomPlate(p,"QUEUE",678,482,p.gold);
  drawAmbient(p)}
function drawAmbient(p){const t=state.quiet?0:performance.now()/1000;const bob=Math.round(Math.sin(t*2)*2);rect(p.mint,38,402+bob,20,14);rect(p.ink,42,406+bob,4,4);rect(p.ink,52,406+bob,4,4);rect(p.mint,33,410+bob,8,4);rect(p.mint,58,410+bob,8,4);rect(p.gold,903,331,11,22);rect(p.pink,906,326+bob,5,7);if(!state.quiet){const u=(t*24)%1050-50;poly(p.paper,[[u,108],[u+12,101],[u+24,108],[u+12,111]])}}
function draw(canvasCtx, roomKey, colorway, quiet){
  ctx = canvasCtx; paintContext = canvasCtx;
  state.colorway = colorway || "voidArcade"; state.quiet = !!quiet;
  ROOM_DEFS[roomKey].draw();
}
return { defs: ROOM_DEFS, order: ROOM_ORDER, stations: STATION_NAMES, draw, world: { width: 960, height: 540 }, pixelText: function(c, text, x, y, color, size, align){ ctx = c; paintContext = c; pixelText(text, x, y, color, size, align); } };
})();
