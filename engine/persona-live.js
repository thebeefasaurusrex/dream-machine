// Dream Machine live character renderer: extracted verbatim from teamloop-live.html
// (lines 1155-1723) by extract-persona-live.mjs. Do not edit by hand.
// Needs persona-engine.js loaded first (rect, poly, tone, finePal, legacyLayer, PART_RES, paintContext).
"use strict";
const DM_LIVE = (function(){
function drawSovereignHead(fp){
  poly(fp.ink,[[-15,-39],[-31,-48],[-20,-28]]);poly(fp.primary,[[-17,-39],[-27,-45],[-20,-31]]);poly(fp.pd,[[-19,-38],[-24,-42],[-20,-33]]);
  poly(fp.ink,[[15,-39],[31,-48],[20,-28]]);poly(fp.primary,[[17,-39],[27,-45],[20,-31]]);poly(fp.pd,[[19,-38],[24,-42],[20,-33]]);
  poly(fp.ink,[[-10,-53],[10,-53],[14,-51],[16,-49],[18,-47],[18,-25],[16,-23],[14,-21],[10,-19],[-10,-19],[-14,-21],[-16,-23],[-18,-25],[-18,-47],[-16,-49],[-14,-51]]);
  poly(fp.primary,[[-9,-51],[9,-51],[12,-49],[15,-47],[16,-45],[16,-27],[15,-25],[12,-23],[9,-21],[-9,-21],[-12,-23],[-15,-25],[-16,-27],[-16,-45],[-15,-47],[-12,-49]]);
  poly(fp.pl,[[-9,-51],[-4,-51],[-10,-24],[-13,-23],[-15,-25],[-16,-27],[-16,-45],[-15,-47],[-12,-49]]);
  poly(fp.pd,[[7,-51],[9,-51],[12,-49],[15,-47],[16,-45],[16,-27],[15,-25],[12,-23],[9,-21],[5,-22]]);
  rect(fp.al,-7,-50,5,1);rect(fp.al,-10,-48,3,1);
}
function drawOrbitToken(cx,cy,fp,behind){const face=behind?fp.ad:fp.accent;const light=behind?fp.accent:fp.al;const dark=behind?fp.ad:fp.pd;rect(fp.ink,cx-2,cy-4,5,1);rect(fp.ink,cx-4,cy-3,9,2);rect(fp.ink,cx-5,cy-1,11,4);rect(fp.ink,cx-4,cy+3,9,2);rect(fp.ink,cx-2,cy+5,5,1);rect(face,cx-2,cy-3,5,1);rect(face,cx-3,cy-2,7,2);rect(face,cx-4,cy,9,3);rect(face,cx-3,cy+3,7,1);rect(face,cx-2,cy+4,5,1);rect(light,cx-2,cy-3,3,1);rect(light,cx-3,cy-2,2,2);rect(dark,cx+2,cy+1,2,3);rect(dark,cx,cy+3,3,1);rect(light,cx-1,cy-1,1,3);rect(light,cx,cy,3,1)}
function drawTokenOrbit(fp,time,behind){for(let i=0;i<3;i++){const a=time/450+i*2.094;const s=Math.sin(a);if((s<0)!==behind)continue;const cx=Math.round(Math.cos(a)*38);const cy=-40+Math.round(s*18);drawOrbitToken(cx,cy,fp,behind)}}
function drawSpeedLines(fp,time){const s=Math.floor(time/120)%3;for(let i=0;i<4;i++){const y=-31+i*7;rect(fp.al,-37-s*2+i*2,y,12-i*2,1);rect(fp.accent,-27-s*2+i*2,y+2,6,1)}}
function drawTokenRailgun(fp,time){rect(fp.ink,8,-24,15,15);rect(fp.secondary,9,-23,13,13);rect(fp.sl,9,-23,13,3);rect(fp.sd,19,-23,3,13);rect(fp.ink,20,-21,14,11);rect(fp.primary,21,-20,12,9);rect(fp.pl,21,-20,12,2);rect(fp.pd,30,-20,3,9);rect(fp.ink,31,-23,7,15);rect(fp.accent,32,-22,5,13);rect(fp.ad,36,-22,1,13);rect(fp.ink,23,-27,8,4);rect(fp.accent,24,-26,6,2);rect(fp.ink,24,-10,6,5);rect(fp.secondary,25,-9,4,3);const shot=Math.floor((time/90)%13);rect(fp.al,21+shot,-17,2,2);rect(fp.paper,33,-19,2,2);rect(fp.al,34,-18,1,1);const phase=Math.floor(time/65)%18;if(phase<9){const sx=38+phase;rect(fp.ink,sx,-18,5,1);rect(fp.ink,sx-1,-17,7,3);rect(fp.ink,sx,-14,5,1);rect(fp.accent,sx,-17,5,3);rect(fp.al,sx+1,-17,2,1);rect(fp.ad,sx-4,-16,2,1);rect(fp.ad,sx-7,-16,1,1)}else if(phase<12){poly(fp.al,[[38,-21],[40,-17],[45,-16],[40,-15],[38,-11],[39,-16]])}}
function drawSonnetQuill(fp,time){const y=-34+Math.round(Math.sin(time/360)*2);poly(fp.ink,[[14,y+10],[18,y-4],[25,y-10],[22,y+2],[17,y+12]]);poly(fp.paper,[[16,y+9],[19,y-2],[23,y-7],[21,y+1],[17,y+10]]);rect(fp.accent,18,y,1,9);rect(fp.al,20,y-4,1,3);rect(fp.ink,13,y+12,4,2)}
function drawTerraSprout(fp,time){const sway=Math.round(Math.sin(time/360));rect(fp.ink,-1,-55,3,9);rect(fp.secondary,0,-54,1,8);poly(fp.ink,[[0,-53],[-8,-58],[-4,-49]]);poly(fp.primary,[[0,-52],[-6,-56],[-3,-50]]);poly(fp.ink,[[1,-53],[9,-58+sway],[5,-49]]);poly(fp.primary,[[1,-52],[7,-56+sway],[4,-50]])}
function drawLunaCrescent(fp,time){const y=-52+Math.round(Math.sin(time/420));poly(fp.ink,[[14,y+2],[19,y],[24,y+3],[21,y+8],[16,y+9],[19,y+5]]);poly(fp.accent,[[15,y+3],[19,y+2],[22,y+4],[20,y+7],[17,y+7],[19,y+5]]);rect(fp.al,20,y+3,1,1)}
function drawDeepSeekSonar(fp,time){const r=Math.floor(time/220)%3;rect(fp.accent,-2,-50,5,2);rect(fp.al,-1,-50,3,1);for(let i=0;i<3;i++){const x=-20-i*4-r;const y=-40+i*7;rect(i%2?fp.paper:fp.al,x,y,2,2)}rect(fp.accent,10,-16,6,1);rect(fp.accent,11,-14,4,1)}
function drawFineWrench(fp,time){const bob=Math.round(Math.sin(time/330));paintContext.save();paintContext.translate(0,bob);rect(fp.ink,11,-16,4,13);rect(fp.secondary,12,-15,2,11);rect(fp.ink,9,-20,8,5);rect(fp.secondary,10,-19,6,3);rect(fp.ink,10,-21,2,2);rect(fp.ink,15,-21,2,2);rect(fp.al,12,-19,2,1);paintContext.restore()}
function drawSignalShards(fp,time){const s=Math.floor(time/180)%4;const pts=[[-29,-43],[-25,-25],[27,-45],[30,-28]];for(let i=0;i<pts.length;i++){const p=pts[i];const c=i===s?fp.paper:(i%2?fp.accent:fp.primary);rect(c,p[0],p[1],i===s?3:2,1);rect(c,p[0]+1,p[1]-1,1,3)}rect(fp.accent,-2,-51,4,1);rect(fp.accent,0,-53,1,5)}
function drawPersonaFineBack(dna,fp,time){if(dna.aura==="speedLines")drawSpeedLines(fp,time)}
function drawPersonaFineFront(dna,fp,time){if(dna.prop==="tokenRailgun")drawTokenRailgun(fp,time);if(dna.prop==="quill")drawSonnetQuill(fp,time);if(dna.hat==="sprout")drawTerraSprout(fp,time);if(dna.aura==="moonCrescent")drawLunaCrescent(fp,time);if(dna.prop==="sonarLamp")drawDeepSeekSonar(fp,time);if(dna.prop==="fineWrench")drawFineWrench(fp,time);if(dna.motif==="signalShards")drawSignalShards(fp,time)}
function drawPersonaAura(d,fp,t){/*BATCH3-AURA*/const a=d.aura;
  if(a==="none"||a==="tokenOrbit"||a==="speedLines"||a==="moonCrescent")return;
  if(a==="static"){
    const anchors=[[-31,-42],[27,-31],[-25,-12],[23,-55],[-33,-26],[29,-48],[-19,-52],[19,-18]];
    for(let i=0;i<3;i++){
      const step=Math.floor((t+i*173)/(210+i*67));
      const s=anchors[(step*3+i*5)%anchors.length];const x=s[0],y=s[1];
      rect(fp.ad,x-1,y-1,6,6);rect(fp.accent,x,y,4,4);rect(fp.al,x+1,y,2,2);
      rect(fp.paper,x+1,y-3,2,2);rect(fp.accent,x+5,y+2,2,1);rect(fp.accent,x-3,y+1,2,1);
    }
  }else if(a==="stars"){
    const star=function(x,y,big){
      rect(fp.accent,x,y-2,2,6);rect(fp.accent,x-2,y,6,2);rect(fp.paper,x,y,2,2);
      if(big){rect(fp.al,x-2,y-2,2,2);rect(fp.al,x+2,y-2,2,2);rect(fp.al,x-2,y+2,2,2);rect(fp.al,x+2,y+2,2,2)}
    };
    const lanes=[[-28,0],[24,1300],[-20,2700],[29,3900]];
    for(const L of lanes){
      const fall=((t+L[1])/30)%62;const y=-58+Math.floor(fall);
      const x=L[0]+Math.round(Math.sin(t/540+L[1])*3);
      star(x,y,(Math.sin(t/300+L[1])+1)/2>0.5);
    }
  }else if(a==="questions"){
    const mark=function(x,y,lean){
      const R=[[1,0,3],[0,1,1],[4,1,1],[4,2,1],[3,3,2],[2,5,1],[2,7,1]];
      for(const r of R)rect(fp.accent,x+r[0]+(r[1]<3?lean:0),y+r[1],r[2],1);
      rect(fp.al,x+1+lean,y,2,1);rect(fp.paper,x+2,y+7,1,1);
      rect(fp.ad,x+4,y+3,1,2);
    };
    const arc=[[-34,-45,0],[-13,-57,1.4],[9,-60,2.6],[28,-48,3.9]];
    for(const m of arc)mark(m[0],m[1]+Math.round(Math.sin(t/450+m[2])*2),Math.round(Math.sin(t/700+m[2])));
  }else if(a==="probability"){
    const die=function(x,y,face,body,light){
      rect(fp.ink,x-1,y-1,13,13);rect(body,x,y,11,11);rect(light,x,y,11,2);rect(fp.paperD,x+8,y+2,3,9);
      const P={1:[[5,5]],2:[[2,2],[8,8]],3:[[2,2],[5,5],[8,8]],4:[[2,2],[8,2],[2,8],[8,8]],5:[[2,2],[8,2],[5,5],[2,8],[8,8]],6:[[2,2],[8,2],[2,5],[8,5],[2,8],[8,8]]};
      for(const pip of P[face])rect(fp.ink,x+pip[0],y+pip[1],2,2);
    };
    const f1=1+(Math.floor(t/900)%6),f2=6-(Math.floor(t/900)%6);
    const bob=Math.round(Math.sin(t/600));
    die(-31,-54+bob,f1,fp.accent,fp.al);die(19,-40-bob,f2,fp.paper,fp.paperL);
  }else if(a==="bubbles"){
    const lanes=[[-28,0],[24,900],[-21,1800],[29,2600]];
    for(const L of lanes){
      const rise=((t+L[1])/26)%58;const y=-4-Math.floor(rise);const x=L[0]+Math.round(Math.sin(t/420+L[1])*2);
      if(rise>54){
        rect(fp.paper,x,y,2,1);rect(fp.paper,x+4,y+2,2,1);rect(fp.paper,x-2,y+3,2,1);rect(fp.paper,x+2,y+5,2,1);
      }else{
        rect(fp.ink,x-1,y-1,8,8);rect(fp.paper,x,y,6,6);rect(fp.ink,x+1,y+1,4,4);rect(fp.paper,x+2,y+2,2,2);rect(fp.al,x+1,y+1,1,1);
      }
    }
  }else if(a==="chemistry"){
    const cx=-25,cy=-32;
    const ang=t/900;
    const s1=[cx+Math.round(Math.cos(ang)*10),cy+Math.round(Math.sin(ang)*7)];
    const s2=[cx+Math.round(Math.cos(ang+2.5)*13),cy+Math.round(Math.sin(ang+2.5)*9)];
    const bond=function(tx,ty){
      const steps=4;
      for(let i=1;i<steps;i++){const bx=cx+Math.round((tx-cx)*i/steps),by=cy+Math.round((ty-cy)*i/steps);rect(fp.secondary,bx-1,by-1,3,3);rect(fp.sl,bx,by,1,1)}
    };
    bond(s1[0]+2,s1[1]+2);bond(s2[0]+1,s2[1]+1);
    rect(fp.ink,s1[0]-1,s1[1]-1,7,7);rect(fp.primary,s1[0],s1[1],5,5);rect(fp.pl,s1[0]+1,s1[1]+1,2,2);
    rect(fp.ink,s2[0]-1,s2[1]-1,5,5);rect(fp.paper,s2[0],s2[1],3,3);
    rect(fp.ink,cx-4,cy-4,9,9);rect(fp.accent,cx-3,cy-3,7,7);rect(fp.al,cx-2,cy-2,3,3);rect(fp.paper,cx-1,cy-2,1,1);
    const fizz=Math.floor(t/200)%4;rect(fp.al,cx+8,-44-fizz*3,1,1);rect(fp.paper,cx+11,-42-fizz*2,1,1);
  }else if(a==="psychic"){
    for(let r=0;r<3;r++){
      const ph=((t/16)+r*40)%120;
      const rad=9+Math.floor(ph/4);
      const col=r===0?fp.al:(ph>100?fp.ad:fp.accent);
      for(let s=0;s<20;s++){
        const ang=s*Math.PI/10;
        const wave=Math.round(Math.sin(t/400+s*1.3+r*2.1)*1.5);
        const x=Math.round(Math.cos(ang)*(rad+wave));
        const y=-36+Math.round(Math.sin(ang)*(rad+wave)*0.75);
        rect(col,x-1,y-1,2,2);
      }
    }
    const eyeBob=Math.round(Math.sin(t/600)*2);
    const ey=-68+eyeBob;
    const W=[7,11,13,11,7];
    for(let r=0;r<5;r++){rect(fp.ink,-Math.floor(W[r]/2)-1,ey+r,W[r]+2,1);rect(fp.paper,-Math.floor(W[r]/2),ey+r,W[r],1)}
    rect(fp.accent,-2,ey+1,4,3);rect(fp.ad,1,ey+1,1,3);rect(fp.ink,-1,ey+1,2,3);rect(fp.paper,0,ey+2,1,1);rect(fp.al,-4,ey+1,2,1);
  }else if(a==="spirit"){
    const wisp=function(x,y,flip,blink){
      rect(fp.ink,x-1,y-1,9,11);
      rect(fp.accent,x,y,7,9);rect(fp.al,x+1,y+1,3,3);
      poly(fp.accent,[[x,y+9],[x+3,y+13],[x+5,y+9]]);
      poly(fp.ad,[[x+4,y+9],[x+6,y+12],[x+7,y+9]]);
      if(!blink){rect(fp.ink,x+2,y+3,1,2);rect(fp.ink,x+5,y+3,1,2)}
      else{rect(fp.ink,x+2,y+4,1,1);rect(fp.ink,x+5,y+4,1,1)}
    };
    const b1=Math.round(Math.sin(t/520)*3),b2=Math.round(Math.sin(t/520+2.8)*3),b3=Math.round(Math.sin(t/520+4.6)*2);
    const blink=Math.floor(t/2600)%6===0;
    wisp(-33,-30+b1,false,blink);wisp(26,-24+b2,true,blink);wisp(-4,-72+b3,false,blink);
  }else if(a==="forest"){
    const leaf=function(x,y,rot){
      if(rot){poly(fp.secondary,[[x,y],[x+5,y+2],[x+3,y+6],[x-1,y+4]]);rect(fp.sd,x+2,y+2,1,3);rect(fp.sl,x+1,y+1,1,1)}
      else{poly(fp.secondary,[[x+2,y],[x+5,y+4],[x+2,y+7],[x-1,y+4]]);rect(fp.sd,x+2,y+2,1,4);rect(fp.sl,x+1,y+2,1,1)}
    };
    const tracks=[[-27,0,1],[25,1400,0],[-20,2900,1]];
    for(const tr of tracks){
      const fall=((t+tr[1])/34)%62;const y=-58+Math.floor(fall);
      const x=tr[0]+Math.round(Math.sin(t/460+tr[1])*4);
      leaf(x,y,(Math.floor(t/300)+tr[2])%2===0);
    }
  }else if(a==="flame"){
    const flame=function(x,h){
      poly(fp.ad,[[x-6,0],[x-9,-h+8],[x-4,-h],[x,-h+4],[x+3,-h-3],[x+8,-h+7],[x+6,0]]);
      poly(fp.accent,[[x-4,0],[x-6,-h+10],[x-2,-h+3],[x+1,-h-1],[x+5,-h+9],[x+4,0]]);
      poly(fp.al,[[x-2,0],[x-3,-h+13],[x,-h+7],[x+3,-h+12],[x+2,0]]);
      rect(fp.paper,x,-6,2,4);
    };
    const f1=22+((Math.floor(t/130))%3)*5,f2=22+((Math.floor(t/130)+1)%3)*5;
    flame(-23,f1);flame(23,f2);
  }else if(a==="shadow"){
    const sway=Math.round(Math.sin(t/800)*3);const lean=Math.round(Math.sin(t/1300)*2);
    poly(fp.ink,[[sway-19,2],[sway-20,-24],[sway-15+lean,-42],[sway-9+lean,-52],[sway+9+lean,-52],[sway+15+lean,-42],[sway+20,-24],[sway+19,2]]);
    rect(fp.sd,sway-20,-24,2,26);rect(fp.sd,sway-15+lean,-42,2,18);
    const glint=(Math.sin(t/950)+1)/2;
    if(glint>0.55){rect(fp.ad,sway-5+lean,-44,3,1);rect(fp.ad,sway+2+lean,-44,3,1)}
    if(glint>0.8){rect(fp.accent,sway-4+lean,-44,1,1);rect(fp.accent,sway+3+lean,-44,1,1)}
    const w1=10+Math.round(Math.sin(t/700)*4),w2=8+Math.round(Math.sin(t/700+2)*3);
    rect(fp.ink,-32,-4,w1,5);rect(fp.sd,-30,-6,w1-3,2);
    rect(fp.ink,20,-3,w2,4);rect(fp.sd,22,-5,w2-2,2);
    rect(fp.ink,-12,-3,9,3);
    const rise=Math.floor(t/110)%26;const hy=-8-rise;
    if(rise<20){rect(fp.sd,-27,hy,3,8);rect(fp.ink,-26,hy-2,1,2)}
    else{rect(fp.sd,-28,hy,2,2);rect(fp.sd,-24,hy+2,2,2)}
  }else if(a==="embers"){
    const tracks=[[-27,0],[25,700],[-21,1500],[29,2200],[-31,2900]];
    for(const tr of tracks){
      const rise=((t+tr[1])/18)%54;const y=-2-Math.floor(rise);const x=tr[0]+Math.round(Math.sin(t/380+tr[1])*3);
      rect(fp.ad,x,y+3,2,2);rect(fp.accent,x,y,2,2);
      if(Math.floor(t/120+tr[1])%2)rect(fp.al,x,y,1,1);
    }
  }else if(a==="rain"){
    const RC=["#9AE3FF","#5DB8F0","#2F7CC0"];
    const lanes=[[-33,0],[-26,300],[-19,700],[-12,1100],[-5,1500],[10,1900],[17,2300],[25,2700],[32,3100]];
    for(const L of lanes){
      const fall=((t+L[1])/8)%62;const y=-58+Math.floor(fall);const x=L[0]+Math.floor(fall/22);
      rect(RC[1],x,y,1,5);rect(RC[0],x,y,1,2);
      if(fall>58)rect(RC[2],x,y+5,1,1);
    }
  }else if(a==="snow"){
    const flakes=[[-27,0,1],[24,1100,0],[-20,2300,1],[29,3200,0],[-31,4100,0]];
    for(const f of flakes){
      const fall=((t+f[1])/26)%62;const y=-58+Math.floor(fall);const x=f[0]+Math.round(Math.sin(t/520+f[1])*4);
      if(f[2]){rect(fp.paper,x,y-1,2,6);rect(fp.paper,x-2,y+1,6,2);rect(fp.al,x,y+1,2,2)}
      else rect(fp.paper,x,y,2,2);
    }
  }
}
function drawPersonaBack(d,p){/*BATCH2-FINE*/const fp=p;const s=d.shell;
if(s==="cage"){
    rect(fp.ink,-22,-38,44,4);rect(fp.primary,-21,-37,42,2);rect(fp.pl,-21,-37,42,1);
    rect(fp.ink,-22,6,44,4);rect(fp.primary,-21,7,42,2);rect(fp.pd,-21,9,42,1);
    rect(fp.ink,-23,-34,4,40);rect(fp.primary,-22,-33,2,38);rect(fp.ink,19,-34,4,40);rect(fp.primary,20,-33,2,38);
    rect(fp.accent,-24,-40,3,3);rect(fp.accent,21,-40,3,3);rect(fp.al,-24,-40,3,1);rect(fp.al,21,-40,3,1);
  }else if(s==="resistor"){
    rect(fp.ink,-33,-17,7,3);rect(fp.ink,26,-17,7,3);
    poly(fp.ink,[[-27,-22],[27,-22],[29,-8],[-29,-8]]);
    rect(fp.secondary,-26,-20,52,10);rect(fp.sl,-26,-20,52,2);rect(fp.sd,20,-20,6,10);
    rect(fp.accent,-19,-20,4,10);rect(fp.paper,-10,-20,4,10);rect(fp.primary,-1,-20,4,10);rect(fp.accent,8,-20,4,10);
    rect(fp.al,-19,-20,4,1);
  }else if(s==="battery"){
    rect(fp.ink,-24,-38,48,42);rect(fp.secondary,-22,-36,44,38);rect(fp.sl,-22,-36,44,3);rect(fp.sd,16,-36,6,38);
    rect(fp.ink,-24,-44,10,6);rect(fp.accent,-23,-43,8,4);rect(fp.al,-23,-43,8,1);
    poly(fp.accent,[[-20,-28],[-23,-19],[-21,-19],[-23,-11],[-18,-20],[-20,-20]]);
    rect(fp.ink,18,-26,5,16);rect(fp.paper,19,-25,3,14);rect(fp.accent,19,-17,3,7);
  }else if(s==="mecha-wings"){
    rect(fp.ink,-13,-29,6,11);rect(fp.primary,-12,-28,4,9);rect(fp.ink,7,-29,6,11);rect(fp.primary,8,-28,4,9);
    poly(fp.ink,[[-11,-26],[-31,-49],[-26,-28],[-12,-19]]);poly(fp.secondary,[[-12,-25],[-28,-45],[-24,-28],[-12,-20]]);
    poly(fp.sd,[[-16,-28],[-22,-36],[-20,-27],[-15,-22]]);
    poly(fp.ink,[[-10,-17],[-25,-25],[-21,-9],[-8,-7]]);poly(fp.primary,[[-11,-16],[-23,-23],[-20,-10],[-9,-8]]);
    poly(fp.ink,[[11,-26],[31,-49],[26,-28],[12,-19]]);poly(fp.secondary,[[12,-25],[28,-45],[24,-28],[12,-20]]);
    poly(fp.sd,[[16,-28],[22,-36],[20,-27],[15,-22]]);
    poly(fp.ink,[[10,-17],[25,-25],[21,-9],[8,-7]]);poly(fp.primary,[[11,-16],[23,-23],[20,-10],[9,-8]]);
    rect(fp.accent,-29,-48,3,3);rect(fp.al,-29,-48,3,1);rect(fp.accent,26,-48,3,3);rect(fp.al,26,-48,3,1);
  }else if(s==="wolf-cloak"){
    poly(fp.ink,[[-18,-28],[-22,-37],[-14,-41],[0,-36],[14,-41],[22,-37],[18,-28],[20,-12],[14,-6],[7,-11],[0,-5],[-7,-11],[-14,-6],[-20,-12]]);
    poly(fp.secondary,[[-16,-28],[-20,-35],[-13,-38],[0,-33],[13,-38],[20,-35],[16,-28],[18,-12],[13,-7],[7,-12],[0,-6],[-7,-12],[-13,-7],[-18,-12]]);
    rect(fp.sl,-19,-32,2,6);rect(fp.sd,16,-32,2,8);rect(fp.sd,-4,-9,1,2);rect(fp.sd,3,-9,1,2);
    rect(fp.ink,11,-45,12,9);rect(fp.secondary,12,-44,10,7);rect(fp.sl,12,-44,10,1);
    poly(fp.ink,[[13,-45],[15,-52],[18,-45]]);poly(fp.secondary,[[14,-45],[15,-50],[17,-45]]);
    poly(fp.ink,[[22,-41],[29,-38],[22,-35]]);rect(fp.ink,28,-39,2,2);
    rect(fp.paper,15,-42,3,2);rect(fp.ink,16,-41,1,1);
  }else if(s==="carapace"){
    poly(fp.ink,[[-22,-4],[-24,-22],[0,-37],[24,-22],[22,-4]]);
    poly(fp.secondary,[[-20,-5],[-22,-22],[0,-34],[22,-22],[20,-5]]);
    rect(fp.ink,-22,-7,44,4);rect(fp.primary,-21,-6,42,2);
    poly(fp.primary,[[-6,-27],[0,-32],[6,-27],[6,-18],[0,-15],[-6,-18]]);
    poly(fp.primary,[[-17,-21],[-8,-26],[-8,-16],[-16,-12]]);poly(fp.primary,[[17,-21],[8,-26],[8,-16],[16,-12]]);
    rect(fp.sl,-19,-22,3,6);
  }else if(s==="rocket-pack"){
    rect(fp.ink,-21,-34,9,24);rect(fp.secondary,-20,-33,7,22);rect(fp.sl,-20,-33,7,3);rect(fp.sd,-15,-33,2,22);
    rect(fp.ink,12,-34,9,24);rect(fp.secondary,13,-33,7,22);rect(fp.sl,13,-33,7,3);rect(fp.sd,18,-33,2,22);
    poly(fp.ink,[[-21,-10],[-12,-10],[-14,-5],[-19,-5]]);poly(fp.accent,[[-19,-5],[-14,-5],[-16,0]]);
    poly(fp.ink,[[12,-10],[21,-10],[19,-5],[14,-5]]);poly(fp.accent,[[14,-5],[19,-5],[17,0]]);
    rect(fp.paper,-19,-36,5,2);rect(fp.paper,14,-36,5,2);
    rect(fp.ink,-2,-30,4,14);rect(fp.accent,-1,-29,2,12);
  }}
function drawPersonaBody(d,p,s){const s2=s*PART_RES;
if(d.body==="round"){rect(p.ink,-11,-2,9,12+s2);rect(p.primary,-10,-1,7,10+s2);rect(p.ink,2,-2,9,12+s2);rect(p.primary,3,-1,7,10+s2);rect(p.ink,-12,8+s2,11,4);rect(p.pd,-11,9+s2,9,2);rect(p.ink,1,8+s2,11,4);rect(p.pd,2,9+s2,9,2);rect(p.ink,-18,-26,36,28);rect(p.primary,-16,-24,32,24);rect(p.pl,-16,-24,6,24);rect(p.pd,10,-24,6,24);rect(p.ink,-22,-20,6,16);rect(p.secondary,-20,-19,3,13);rect(p.ink,16,-20,6,16);rect(p.secondary,17,-19,3,13)}
else if(d.body==="robe"){rect(p.ink,-8,0,6,10+s2);rect(p.primary,-7,0,4,9+s2);rect(p.ink,2,0,6,10+s2);rect(p.primary,3,0,4,9+s2);poly(p.ink,[[-13,-26],[13,-26],[17,7],[-17,7]]);poly(p.primary,[[-11,-24],[11,-24],[15,5],[-15,5]]);poly(p.pl,[[-11,-24],[-6,-24],[-9,5],[-15,5]]);poly(p.pd,[[6,-24],[11,-24],[15,5],[9,5]]);poly(p.secondary,[[-3,-24],[0,-19],[3,-24]]);rect(p.sd,-1,-16,2,18);rect(p.secondary,-14,2,28,3);rect(p.sd,-14,4,28,1)}
else if(d.body==="fighter"){rect(p.ink,-13,-2,10,13+s2);rect(p.primary,-12,-1,8,11+s2);rect(p.ink,3,-2,10,13+s2);rect(p.primary,4,-1,8,11+s2);rect(p.ink,-14,9+s2,12,4);rect(p.pd,-13,10+s2,10,2);rect(p.ink,2,9+s2,12,4);rect(p.pd,3,10+s2,10,2);poly(p.ink,[[-15,-28],[15,-28],[12,2],[-12,2]]);poly(p.primary,[[-13,-26],[13,-26],[11,0],[-11,0]]);poly(p.pl,[[-13,-26],[-8,-26],[-7,0],[-11,0]]);poly(p.pd,[[8,-26],[13,-26],[11,0],[7,0]]);rect(p.pd,-1,-24,2,6);rect(p.pd,-6,-14,12,1);rect(p.pd,-5,-10,10,1);rect(p.ink,-20,-24,6,18);rect(p.secondary,-19,-23,4,14);rect(p.pd,-19,-10,4,4);rect(p.ink,14,-24,6,18);rect(p.secondary,15,-23,4,14);rect(p.pd,15,-10,4,4)}
else if(d.body==="armor"){rect(p.ink,-12,-2,10,13+s2);rect(p.secondary,-11,-1,8,11+s2);rect(p.pl,-11,-1,2,11+s2);rect(p.ink,2,-2,10,13+s2);rect(p.secondary,3,-1,8,11+s2);rect(p.pl,3,-1,2,11+s2);rect(p.ink,-13,9+s2,12,4);rect(p.pd,-12,10+s2,10,2);rect(p.ink,1,9+s2,12,4);rect(p.pd,2,10+s2,10,2);rect(p.ink,-18,-30,36,32);rect(p.secondary,-16,-28,32,28);rect(p.primary,-12,-24,24,18);rect(p.pl,-16,-28,5,28);rect(p.pd,11,-28,5,28);rect(p.pd,-12,-16,24,1);rect(p.al,-10,-22,2,2);rect(p.al,8,-22,2,2);rect(p.ink,-16,-8,32,3);rect(p.accent,-2,-8,4,3);rect(p.al,-2,-8,4,1);rect(p.accent,-3,-20,6,4);rect(p.al,-3,-20,6,1);rect(p.accent,-21,-28,7,15);rect(p.al,-21,-28,7,3);rect(p.accent,14,-28,7,15);rect(p.al,14,-28,7,3);rect(p.ink,-21,-16,7,2);rect(p.ink,14,-16,7,2)}
else if(d.body==="spirit"){poly(p.ink,[[-16,-26],[16,-26],[12,-4],[0,10],[-12,-4]]);poly(p.primary,[[-14,-24],[14,-24],[10,-5],[0,7],[-10,-5]]);poly(p.pl,[[-14,-24],[-8,-24],[-6,-5],[-10,-5]]);poly(p.pd,[[8,-24],[14,-24],[10,-5],[6,-5]]);rect(p.pl,-4,2+s2,3,4);rect(p.pd,2,4-s2,3,3);rect(p.ink,-20,-20,7,16);rect(p.secondary,-18,-19,4,13);rect(p.ink,13,-20,7,16);rect(p.secondary,14,-19,4,13)}
else if(d.body==="skeleton"){rect(p.ink,-10,-2,7,12+s2);rect(p.paper,-9,-1,5,10+s2);rect(p.ink,3,-2,7,12+s2);rect(p.paper,4,-1,5,10+s2);rect(p.ink,-14,-26,28,8);rect(p.paper,-12,-25,24,6);rect(p.paperD,-12,-20,24,1);rect(p.ink,-6,-18,12,20);rect(p.paper,-4,-17,8,18);for(const x of[-12,-5,2,9])rect(p.paper,x,-16,5,4);rect(p.paper,-9,-6,18,4);rect(p.paperD,-9,-3,18,1)}
else if(d.body==="cyborg"){/*WIND-UP*/rect(p.ink,-11,-2,9,13+s2);rect(p.primary,-10,-1,7,11+s2);rect(p.ink,2,-2,9,13+s2);rect(p.primary,3,-1,7,11+s2);rect(p.ink,-12,9+s2,11,4);rect(p.pd,-11,10+s2,9,2);rect(p.ink,1,9+s2,11,4);rect(p.pd,2,10+s2,9,2);rect(p.ink,-16,-28,32,30);rect(p.primary,-14,-26,28,26);rect(p.pl,-14,-26,4,26);rect(p.pd,9,-26,5,26);rect(p.ink,-9,-23,18,13);rect(p.paper,-8,-22,16,11);rect(p.accent,-6,-20,3,3);rect(p.al,-6,-20,3,1);rect(p.secondary,-1,-20,3,3);rect(p.accent,4,-20,3,3);rect(p.al,4,-20,3,1);for(const x of[-6,-2,2,6])rect(p.ink,x,-15,2,2);for(const x of[-6,-2,2,6])rect(p.sd,x,-9,2,4);rect(p.ink,-22,-24,7,18);rect(p.secondary,-20,-23,4,14);rect(p.ink,15,-24,7,18);rect(p.secondary,16,-23,4,14);rect(p.sd,-20,-23,4,2);rect(p.ink,-19,-20,4,2);rect(p.ink,-25,-27,7,10);rect(p.secondary,-24,-26,5,8);rect(p.ink,-22,-24,2,4)}
else if(d.body==="slime"){poly(p.ink,[[-18,2],[-19,-12],[-13,-26],[-6,-32],[6,-32],[13,-26],[19,-12],[18,2],[12,2],[10,6],[6,2],[2,2],[0,7],[-3,2],[-8,2],[-10,5],[-13,2]]);poly(p.primary,[[-16,1],[-17,-11],[-12,-24],[-5,-30],[5,-30],[12,-24],[17,-11],[16,1],[11,1],[9,5],[6,1],[2,1],[0,6],[-3,1],[-8,1],[-10,4],[-12,1]]);poly(p.pl,[[-16,1],[-17,-11],[-12,-24],[-8,-27],[-10,-12],[-9,0],[-12,1]]);poly(p.pd,[[16,1],[17,-11],[12,-24],[8,-27],[10,-12],[9,0],[11,1]]);rect(p.paper,-10,-24,5,3);rect(p.secondary,-3,-15,9,9);rect(p.sl,-2,-14,3,3);rect(p.ink,14,-6,3,5);rect(p.primary,14,-5,2,3)}
else if(d.body==="bird"){rect(p.accent,-8,1+s2,6,3);rect(p.accent,2,1-s2,6,3);poly(p.ink,[[-16,-4],[-17,-22],[-9,-32],[9,-32],[17,-22],[16,-4],[0,4]]);poly(p.primary,[[-14,-5],[-15,-21],[-8,-30],[8,-30],[15,-21],[14,-5],[0,2]]);poly(p.pl,[[-14,-5],[-15,-21],[-8,-30],[-3,-30],[-10,-20],[-9,-5]]);poly(p.pd,[[14,-5],[15,-21],[8,-30],[3,-30],[10,-20],[9,-5]]);rect(p.ink,-21,-20,7,14);rect(p.secondary,-19,-19,4,11)}
else if(d.body==="blob"){poly(p.ink,[[-18,2],[-21,-6],[-16,-16],[-18,-22],[-10,-26],[-6,-32],[2,-30],[8,-33],[14,-27],[20,-22],[16,-14],[20,-8],[18,2]]);poly(p.primary,[[-16,1],[-19,-6],[-14,-15],[-16,-21],[-9,-24],[-5,-30],[2,-28],[8,-31],[13,-26],[18,-21],[14,-13],[18,-8],[16,1]]);poly(p.pl,[[-16,1],[-19,-6],[-14,-15],[-16,-21],[-11,-23],[-13,-10],[-11,0]]);poly(p.pd,[[16,1],[18,-8],[14,-13],[18,-21],[13,-26],[10,-24],[13,-10],[11,0]]);rect(p.secondary,-11,-6,8,7);rect(p.sl,-10,-6,3,3);rect(p.secondary,4,-12,9,8);rect(p.sl,5,-11,3,3);rect(p.secondary,-2,-21,6,6);rect(p.sl,-1,-21,2,2)}
else if(d.body==="longlegs"){rect(p.ink,-9,-12,7,24+s2);rect(p.primary,-8,-11,5,22+s2);rect(p.ink,2,-12,7,24+s2);rect(p.primary,3,-11,5,22+s2);rect(p.ink,-10,10+s2,9,4);rect(p.pd,-9,11+s2,7,2);rect(p.ink,1,10+s2,9,4);rect(p.pd,2,11+s2,7,2);rect(p.ink,-10,-36,20,26);rect(p.primary,-8,-34,16,22);rect(p.pl,-8,-34,4,22);rect(p.pd,4,-34,4,22);rect(p.ink,-14,-32,5,16);rect(p.secondary,-12,-31,2,13);rect(p.ink,9,-32,5,16);rect(p.secondary,10,-31,2,13)}
else{rect(p.ink,-11,-2,9,12+s2);rect(p.primary,-10,-1,7,10+s2);rect(p.ink,2,-2,9,12+s2);rect(p.primary,3,-1,7,10+s2);rect(p.ink,-12,8+s2,11,4);rect(p.pd,-11,9+s2,9,2);rect(p.ink,1,8+s2,11,4);rect(p.pd,2,9+s2,9,2);rect(p.ink,-14,-26,28,28);rect(p.primary,-12,-24,24,24);rect(p.pl,-12,-24,5,24);rect(p.pd,7,-24,5,24);rect(p.ink,-18,-22,6,14);rect(p.primary,-16,-21,3,11);rect(p.ink,12,-22,6,14);rect(p.primary,13,-21,3,11);rect(p.pd,-15,-11,3,3);rect(p.pd,12,-11,3,3)}}
function drawPersonaOutfit(d,p){const fp=p;const o=d.outfit;
  if(o==="coat"){
    rect(fp.ink,-15,-25,30,26);rect(fp.secondary,-14,-24,28,24);rect(fp.sl,-14,-24,28,2);rect(fp.sd,8,-24,6,24);
    poly(fp.primary,[[-4,-24],[4,-24],[2,-8],[-2,-8]]);
    poly(fp.paper,[[-9,-24],[-3,-24],[-5,-13],[-9,-17]]);poly(fp.paper,[[9,-24],[3,-24],[5,-13],[9,-17]]);
    poly(fp.paperD,[[6,-24],[9,-24],[9,-17],[7,-15]]);
    rect(fp.ink,-12,-12,5,5);rect(fp.secondary,-11,-11,3,3);
    rect(fp.ink,-1,-6,2,2);rect(fp.ink,-1,-1,2,2);
  }else if(o==="toga"){
    rect(fp.paper,-14,-24,28,24);rect(fp.paperL,-14,-24,28,2);rect(fp.paperD,7,-24,7,24);
    poly(fp.paperD,[[-14,-24],[-8,-24],[12,-2],[6,-2]]);
    poly(fp.secondary,[[-14,-24],[-11,-24],[13,-2],[10,-2]]);
    rect(fp.paperD,-5,-18,1,10);rect(fp.paperD,2,-20,1,12);
    rect(fp.accent,-12,-26,4,4);rect(fp.al,-11,-25,2,2);
  }else if(o==="suit"){
    rect(fp.ink,-15,-25,30,26);rect(fp.primary,-14,-24,28,24);rect(fp.pl,-14,-24,4,24);rect(fp.pd,8,-24,6,24);
    poly(fp.paper,[[-5,-24],[5,-24],[2,-10],[-2,-10]]);
    poly(fp.ink,[[-10,-24],[-5,-24],[-2,-12],[-7,-16]]);poly(fp.ink,[[10,-24],[5,-24],[2,-12],[7,-16]]);
    poly(fp.accent,[[-2,-24],[2,-24],[1,-19],[-1,-19]]);poly(fp.accent,[[-1,-19],[1,-19],[2,-8],[0,-6],[-2,-8]]);
    rect(fp.ad,0,-23,1,2);rect(fp.paper,6,-16,3,2);
  }else if(o==="gi"){
    rect(fp.paper,-14,-24,28,16);rect(fp.paperL,-14,-24,28,2);rect(fp.paperD,7,-24,7,16);
    poly(fp.paperD,[[-5,-24],[0,-24],[-13,-8],[-14,-11]]);poly(fp.paperD,[[5,-24],[0,-24],[13,-8],[14,-11]]);
    poly(fp.paper,[[-14,-24],[-11,-24],[-14,-14]]);poly(fp.paper,[[14,-24],[11,-24],[14,-14]]);
    rect(fp.ink,-15,-9,30,5);rect(fp.ink,-4,-9,8,8);
    rect(fp.ink,-3,-1,3,7);rect(fp.ink,1,-1,3,6);
  }else if(o==="cape"){
    poly(fp.ink,[[-15,-25],[-22,-8],[-19,3],[-9,-3],[-12,-22]]);poly(fp.secondary,[[-14,-24],[-20,-8],[-18,1],[-11,-3],[-13,-21]]);
    poly(fp.ink,[[15,-25],[22,-8],[19,3],[9,-3],[12,-22]]);poly(fp.secondary,[[14,-24],[20,-8],[18,1],[11,-3],[13,-21]]);
    rect(fp.sd,-19,-8,2,8);rect(fp.sd,17,-8,2,8);
    rect(fp.ink,-12,-27,24,5);rect(fp.accent,-11,-26,22,3);rect(fp.al,-11,-26,22,1);
    rect(fp.ink,-3,-27,6,5);rect(fp.accent,-2,-26,4,3);rect(fp.al,-1,-25,2,1);
  }else if(o==="armor"){
    rect(fp.ink,-13,-24,26,20);rect(fp.paper,-12,-23,24,18);rect(fp.paperL,-12,-23,24,3);rect(fp.paperD,6,-23,6,18);
    rect(fp.paperD,-1,-22,2,14);rect(fp.paperD,-10,-15,8,1);rect(fp.paperD,2,-15,8,1);
    rect(fp.paperD,-10,-20,2,2);rect(fp.paperD,8,-20,2,2);
    rect(fp.ink,-12,-9,24,3);rect(fp.secondary,-11,-8,22,1);
    rect(fp.accent,-2,-19,4,4);rect(fp.al,-1,-18,2,2);
  }else if(o==="jacket"){
    rect(fp.ink,-15,-25,30,26);rect(fp.secondary,-14,-24,28,24);rect(fp.sl,-14,-24,28,2);rect(fp.sd,8,-24,6,24);
    rect(fp.ink,-14,-27,28,4);rect(fp.primary,-13,-26,26,2);
    rect(fp.ink,-1,-23,2,19);rect(fp.al,-1,-22,1,17);rect(fp.accent,-1,-5,2,3);
    rect(fp.ink,-12,-8,6,2);rect(fp.ink,6,-8,6,2);
    rect(fp.sd,-14,-2,28,2);
  }else if(o==="sports"){
    rect(fp.paper,-14,-24,28,24);rect(fp.paperD,7,-21,7,21);
    rect(fp.primary,-14,-24,28,3);rect(fp.primary,-14,-21,4,19);rect(fp.primary,10,-21,4,19);
    poly(fp.primary,[[-5,-24],[5,-24],[0,-17]]);poly(fp.paper,[[-3,-24],[3,-24],[0,-19]]);
    rect(fp.accent,-4,-14,3,9);rect(fp.accent,1,-14,3,9);rect(fp.al,-4,-14,3,1);rect(fp.al,1,-14,3,1);
    rect(fp.primary,-14,-2,28,2);
  }else if(o==="forest"){
    rect(fp.secondary,-14,-24,28,14);rect(fp.sl,-14,-24,28,2);rect(fp.sd,7,-24,7,14);
    poly(fp.secondary,[[-14,-12],[14,-12],[12,-3],[8,-8],[4,-1],[0,-8],[-4,-1],[-8,-8],[-12,-3]]);
    poly(fp.sd,[[7,-12],[14,-12],[12,-3],[8,-8],[5,-3]]);
    rect(fp.sd,-8,-20,1,8);rect(fp.sd,0,-21,1,9);rect(fp.sd,6,-20,1,7);
    rect(fp.primary,-14,-12,28,2);poly(fp.accent,[[-2,-12],[2,-12],[0,-8]]);
  }else if(o==="robe"){
    poly(fp.secondary,[[-14,-24],[-3,-24],[-5,2],[-14,2]]);poly(fp.secondary,[[14,-24],[3,-24],[5,2],[14,2]]);
    poly(fp.sd,[[8,-24],[14,-24],[14,2],[9,2]]);poly(fp.sl,[[-14,-24],[-10,-24],[-11,2],[-14,2]]);
    rect(fp.primary,-5,-24,2,26);rect(fp.primary,3,-24,2,26);
    rect(fp.primary,-14,0,28,2);rect(fp.sd,-4,-18,1,14);rect(fp.sd,5,-16,1,12);
    rect(fp.accent,-2,-23,4,3);rect(fp.al,-1,-22,2,1);
  }else if(o==="apron"){
    rect(fp.paper,-10,-24,3,7);rect(fp.paper,7,-24,3,7);
    rect(fp.ink,-9,-19,18,6);rect(fp.paper,-8,-18,16,4);
    rect(fp.ink,-11,-13,22,15);rect(fp.paper,-10,-12,20,13);rect(fp.paperD,5,-12,5,13);
    rect(fp.ink,-6,-8,12,7);rect(fp.paperD,-5,-7,10,5);rect(fp.ink,-1,-8,1,7);
    rect(fp.ink,-15,-12,4,1);rect(fp.ink,11,-12,4,1);
  }else if(o==="poncho"){
    poly(fp.ink,[[-10,-25],[10,-25],[18,-3],[-18,-3]]);
    poly(fp.secondary,[[-8,-24],[8,-24],[16,-4],[-16,-4]]);
    poly(fp.sd,[[4,-24],[8,-24],[16,-4],[11,-4]]);poly(fp.sl,[[-8,-24],[-5,-24],[-12,-4],[-16,-4]]);
    poly(fp.ink,[[-3,-25],[3,-25],[0,-20]]);
    rect(fp.primary,-13,-14,26,2);rect(fp.primary,-15,-9,30,2);
    rect(fp.accent,-8,-14,2,2);rect(fp.accent,0,-14,2,2);rect(fp.accent,8,-14,2,2);
    rect(fp.accent,-11,-9,2,2);rect(fp.accent,-2,-9,2,2);rect(fp.accent,6,-9,2,2);rect(fp.accent,12,-9,2,2);
    for(const x of [-14,-8,-2,4,10])poly(fp.secondary,[[x,-3],[x+3,-3],[x+1,1]]);
  }}
function drawPersonaHead(d,p){if(d.head==="square"){rect(p.ink,-13,-44,26,20);rect(p.primary,-11,-42,22,16);rect(p.pl,-11,-42,4,16);rect(p.pd,7,-42,4,16);rect(p.ink,-11,-26,22,2)}else if(d.head==="helmet"){rect(p.ink,-9,-48,18,2);rect(p.ink,-13,-46,26,19);rect(p.ink,-11,-27,22,2);rect(p.secondary,-8,-47,16,1);rect(p.secondary,-11,-46,22,17);rect(p.secondary,-10,-29,20,2);rect(p.sl,-11,-46,22,3);rect(p.sd,6,-46,5,17);rect(p.accent,-2,-49,4,3);rect(p.al,-1,-49,2,1);rect(p.ink,-17,-38,5,9);rect(p.secondary,-16,-37,3,7);rect(p.sd,-14,-37,1,7);rect(p.ink,12,-38,5,9);rect(p.secondary,13,-37,3,7);rect(p.sd,15,-37,1,7)}else if(d.head==="elf"){rect(p.ink,-12,-44,24,20);rect(p.paper,-10,-42,20,16);rect(p.paperL,-10,-42,20,3);rect(p.paperD,5,-42,5,16);poly(p.ink,[[-12,-38],[-22,-44],[-12,-32]]);poly(p.paper,[[-12,-37],[-19,-42],[-12,-33]]);poly(p.paperD,[[-12,-36],[-16,-40],[-12,-34]]);poly(p.ink,[[12,-38],[22,-44],[12,-32]]);poly(p.paper,[[12,-37],[19,-42],[12,-33]]);poly(p.paperD,[[12,-36],[16,-40],[12,-34]])}else if(d.head==="skull"){rect(p.ink,-13,-47,26,19);rect(p.paper,-11,-45,22,15);rect(p.paperL,-11,-45,22,3);rect(p.paperD,6,-45,5,15);rect(p.paperD,-11,-32,4,5);rect(p.paperD,7,-32,4,5);rect(p.ink,-8,-40,7,8);rect(p.ink,1,-40,7,8);rect(p.paperD,-7,-32,5,2);rect(p.paperD,2,-32,5,2);poly(p.ink,[[-1,-31],[1,-31],[0,-28]]);rect(p.ink,-7,-27,14,7);rect(p.paper,-6,-26,12,5);for(const x of[-5,-1,3])rect(p.ink,x,-26,1,5)}else if(d.head==="feline"){rect(p.ink,-13,-42,26,18);rect(p.primary,-11,-40,22,14);rect(p.pl,-11,-40,22,3);rect(p.pd,6,-40,5,14);poly(p.ink,[[-11,-40],[-7,-52],[-2,-40]]);poly(p.primary,[[-10,-40],[-7,-49],[-3,-40]]);poly(p.pd,[[-8,-40],[-7,-46],[-5,-40]]);poly(p.ink,[[11,-40],[7,-52],[2,-40]]);poly(p.primary,[[10,-40],[7,-49],[3,-40]]);poly(p.pd,[[8,-40],[7,-46],[5,-40]])}else if(d.head==="canine"){rect(p.ink,-13,-42,26,18);rect(p.primary,-11,-40,22,14);rect(p.pl,-11,-40,22,3);rect(p.pd,6,-40,5,14);rect(p.ink,-14,-47,8,3);rect(p.ink,-16,-44,9,9);rect(p.primary,-13,-46,6,2);rect(p.primary,-15,-43,7,6);rect(p.pd,-15,-38,7,3);rect(p.ink,6,-47,8,3);rect(p.ink,7,-44,9,9);rect(p.primary,7,-46,6,2);rect(p.primary,8,-43,7,6);rect(p.pd,8,-38,7,3)}else if(d.head==="orb"){/*ORB-FLOAT*/rect(p.ink,-6,-51,12,2);rect(p.ink,-9,-49,18,14);rect(p.ink,-6,-35,12,2);rect(p.primary,-5,-50,10,1);rect(p.primary,-7,-49,14,12);rect(p.primary,-5,-37,10,2);rect(p.pl,-7,-49,4,11);rect(p.pd,3,-49,4,12);rect(p.accent,-2,-45,4,4);rect(p.al,-1,-45,2,1);rect(p.accent,-1,-33,2,2);rect(p.al,2,-31,1,1);rect(p.al,-3,-30,1,1)}else if(d.head==="beak"){rect(p.ink,-12,-44,24,20);rect(p.primary,-10,-42,20,16);rect(p.pl,-10,-42,20,3);rect(p.pd,5,-42,5,16);poly(p.ink,[[6,-33],[20,-28],[6,-24]]);poly(p.accent,[[7,-32],[17,-28],[7,-25]]);poly(p.ad,[[7,-27],[12,-28],[7,-25]]);rect(p.al,8,-31,6,1)}else if(d.head==="long"){rect(p.ink,-10,-52,20,28);rect(p.primary,-8,-50,16,24);rect(p.pl,-8,-50,4,24);rect(p.pd,4,-50,4,24);rect(p.ink,-10,-56,20,6);rect(p.secondary,-8,-55,16,4);rect(p.sl,-8,-55,16,1)}else if(d.head==="round"){rect(p.ink,-9,-46,18,2);rect(p.ink,-12,-44,24,18);rect(p.ink,-9,-26,18,2);rect(p.primary,-8,-45,16,1);rect(p.primary,-11,-44,22,16);rect(p.primary,-10,-28,20,2);rect(p.pl,-11,-43,4,13);rect(p.pd,6,-43,5,13)}else{rect(p.ink,-13,-44,26,20);rect(p.paper,-11,-42,22,16);rect(p.paperL,-11,-42,22,4);rect(p.paperD,6,-42,5,16)}}
function drawPersonaFace(d,p){/*SKULL-LOCKED*/if(d.head==="skull")return;if(d.face==="visor"){rect(p.ink,-11,-37,22,5);rect(p.accent,-10,-36,20,3);rect(p.al,-10,-36,20,1)}else if(d.face==="glasses"){rect(p.ink,-11,-38,9,9);rect(p.ink,2,-38,9,9);rect(p.ink,-2,-36,4,2);rect(p.paper,-9,-36,5,5);rect(p.paper,4,-36,5,5);rect(p.ink,-7,-34,2,2);rect(p.ink,6,-34,2,2)}else if(d.face==="mask"){rect(p.ink,-11,-40,22,15);rect(p.paper,-10,-39,20,13);rect(p.ink,-8,-37,8,10);rect(p.primary,0,-37,8,10);rect(p.accent,-6,-34,4,4);rect(p.paper,4,-34,3,3);rect(p.ink,-13,-34,2,2);rect(p.ink,11,-34,2,2)}else if(d.face==="grin"){rect(p.ink,-8,-37,4,5);rect(p.ink,4,-37,4,5);rect(p.paper,-7,-37,1,2);rect(p.paper,5,-37,1,2);rect(p.ink,-8,-32,2,2);rect(p.ink,6,-32,2,2);rect(p.ink,-6,-30,12,3);rect(p.ink,-4,-27,8,1);rect(p.paper,-5,-30,10,1)}else if(d.face==="deadpan"){rect(p.ink,-8,-36,5,2);rect(p.ink,3,-36,5,2);rect(p.ink,-7,-28,14,2)}else if(d.face==="cyclops"){rect(p.ink,-9,-38,18,10);rect(p.paper,-7,-36,14,6);rect(p.accent,-2,-35,5,4);rect(p.ink,0,-35,2,3);rect(p.paper,-5,-36,3,2)}else if(d.face==="wink"){rect(p.ink,-8,-37,4,6);rect(p.paper,-7,-37,1,2);rect(p.ink,2,-35,8,2);rect(p.ink,-3,-28,8,2)}else if(d.face==="snout"){rect(p.ink,-8,-37,4,5);rect(p.ink,4,-37,4,5);rect(p.paper,-7,-37,1,2);rect(p.paper,5,-37,1,2);rect(p.ink,-5,-30,10,7);rect(p.secondary,-4,-29,8,5);rect(p.ink,-2,-27,2,2);rect(p.ink,2,-27,2,2)}else if(d.face==="sleepy"){rect(p.ink,-8,-35,5,2);rect(p.ink,-9,-34,1,2);rect(p.ink,3,-35,5,2);rect(p.ink,8,-34,1,2);rect(p.ink,-2,-28,4,3)}else{rect(p.ink,-8,-37,4,6);rect(p.ink,4,-37,4,6);rect(p.paper,-7,-37,1,2);rect(p.paper,5,-37,1,2)}}
function drawPersonaHat(d,p,time=0){const fp=p;const t=time;const hat=d.hat;
  if(hat==="coil"){
    rect(fp.ink,-8,-48,16,4);rect(fp.secondary,-7,-47,14,2);rect(fp.sl,-7,-47,14,1);
    const gap=3+Math.round(Math.sin(t/240)+1);
    for(let i=0;i<4;i++){const w=12-i*2;const y=-51-i*gap;
      rect(fp.ink,-w/2,y,w,2);rect(fp.accent,-w/2+1,y,w-2,1);
      if(i<3)rect(fp.accent,i%2? -w/2:w/2-1,y-gap+2,1,gap-2)}
    const ty=-51-3*gap;rect(fp.ink,-2,ty-4,5,4);rect(fp.paper,-1,ty-3,3,2);rect(fp.al,-1,ty-3,1,1);
  }else if(hat==="crown"){
    poly(fp.ink,[[-9,-47],[-8,-56],[-4,-50],[0,-58],[4,-50],[8,-56],[9,-47]]);
    poly(fp.accent,[[-7,-47],[-7,-53],[-4,-48],[0,-55],[4,-48],[7,-53],[7,-47]]);
    rect(fp.ink,-9,-48,18,4);rect(fp.accent,-8,-47,16,2);rect(fp.al,-8,-47,16,1);
    rect(fp.paper,-1,-58,2,2);rect(fp.paper,-8,-57,1,1);rect(fp.paper,7,-57,1,1);
    rect(fp.ad,-5,-47,2,2);rect(fp.ad,3,-47,2,2);
  }else if(hat==="curls"){
    const curl=function(x,y,s){rect(fp.ink,x-1,y-1,s+2,s+2);rect(fp.secondary,x,y,s,s);rect(fp.sl,x,y,2,2);rect(fp.sd,x+s-2,y+s-2,2,2);rect(fp.sd,x+Math.floor(s/2),y+Math.floor(s/2),1,1)};
    curl(-11,-53,6);curl(-3,-55,7);curl(4,-53,6);
    curl(-14,-46,5);curl(9,-46,5);curl(-14,-40,5);curl(9,-40,5);
  }else if(hat==="porkpie"){
    rect(fp.ink,-9,-57,18,8);rect(fp.secondary,-8,-56,16,6);rect(fp.sl,-8,-56,16,1);rect(fp.sd,4,-56,4,6);
    rect(fp.ink,-3,-57,6,1);rect(fp.ink,-9,-51,18,3);rect(fp.primary,-8,-50,16,1);
    rect(fp.ink,-15,-49,30,3);rect(fp.secondary,-14,-48,28,1);rect(fp.sd,8,-48,6,1);
  }else if(hat==="star-diadem"){
    rect(fp.ink,-11,-48,22,4);rect(fp.accent,-10,-47,20,2);rect(fp.al,-10,-47,20,1);
    for(const x of [-7,0,7]){rect(fp.ink,x-1,-55,3,8);rect(fp.ink,x-3,-53,7,3);rect(fp.paper,x,-54,1,6);rect(fp.paper,x-2,-52,5,1);rect(fp.al,x,-51,1,1)}
  }else if(hat==="beard"){
    rect(fp.ink,-5,-31,10,2);rect(fp.secondary,-4,-30,8,1);
    poly(fp.ink,[[-9,-29],[9,-29],[6,-15],[0,-11],[-6,-15]]);
    poly(fp.secondary,[[-7,-28],[7,-28],[5,-17],[0,-13],[-5,-17]]);
    poly(fp.sd,[[3,-28],[7,-28],[5,-17],[2,-16]]);
    rect(fp.sd,-4,-25,1,6);rect(fp.sd,0,-23,1,7);rect(fp.sd,4,-25,1,4);
  }else if(hat==="jester"){
    rect(fp.ink,-8,-51,16,6);rect(fp.secondary,-7,-50,14,4);rect(fp.sl,-7,-50,14,1);
    poly(fp.ink,[[-7,-51],[-14,-59],[-11,-60],[-4,-52]]);poly(fp.secondary,[[-7,-51],[-12,-58],[-10,-58],[-5,-52]]);
    poly(fp.ink,[[7,-51],[14,-59],[11,-60],[4,-52]]);poly(fp.secondary,[[7,-51],[12,-58],[10,-58],[5,-52]]);
    poly(fp.ink,[[-2,-51],[0,-58],[2,-51]]);poly(fp.primary,[[-1,-51],[0,-56],[1,-51]]);
    rect(fp.accent,-15,-63,4,4);rect(fp.al,-14,-62,1,1);rect(fp.accent,11,-63,4,4);rect(fp.al,12,-62,1,1);
    rect(fp.accent,-2,-61,4,4);rect(fp.al,-1,-60,1,1);
  }else if(hat==="rider"){
    rect(fp.ink,-12,-52,24,6);rect(fp.accent,-11,-51,22,4);rect(fp.al,-11,-51,22,1);
    rect(fp.ink,11,-51,5,5);rect(fp.accent,12,-50,3,3);
    const w1=Math.round(Math.sin(t/300)*2),w2=Math.round(Math.sin(t/300+1.3)*2);
    poly(fp.ink,[[13,-47],[19+w1,-38],[16+w1,-36],[11,-45]]);poly(fp.ad,[[13,-46],[17+w1,-39],[15+w1,-38],[12,-45]]);
    poly(fp.ink,[[12,-46],[15+w2,-34],[12+w2,-32],[10,-44]]);
  }else if(hat==="spikes"){
    const spikes=[[-10,7,5],[-5,11,6],[0,9,5],[4,13,6],[9,8,5]];
    for(const sp of spikes){const cx=sp[0],h=sp[1],w=sp[2];
      poly(fp.ink,[[cx-w,-46],[cx+1,-46-h],[cx+w,-46]]);
      poly(fp.primary,[[cx-w+2,-46],[cx+1,-44-h],[cx+w-2,-46]]);
      poly(fp.pd,[[cx+1,-44-h],[cx+w-2,-46],[cx+1,-46]]);}
    rect(fp.ink,-11,-48,22,4);rect(fp.primary,-10,-47,20,2);rect(fp.pl,-10,-47,4,2);
  }else if(hat==="halo"){
    const oy=Math.round(Math.sin(t/600));
    rect(fp.ink,-10,-60+oy,20,3);rect(fp.ink,-10,-52+oy,20,3);rect(fp.ink,-12,-57+oy,3,5);rect(fp.ink,9,-57+oy,3,5);
    rect(fp.accent,-8,-58+oy,16,2);rect(fp.accent,-8,-53+oy,16,2);rect(fp.accent,-10,-56+oy,2,4);rect(fp.accent,8,-56+oy,2,4);
    rect(fp.paper,-4,-59+oy,4,1);
  }else if(hat==="pilot"){
    rect(fp.ink,-11,-57,22,9);rect(fp.secondary,-10,-56,20,7);rect(fp.sl,-10,-56,20,2);rect(fp.sd,4,-56,6,7);
    rect(fp.ink,-12,-48,4,7);rect(fp.secondary,-11,-47,2,5);rect(fp.ink,8,-48,4,7);rect(fp.secondary,9,-47,2,5);
    rect(fp.ink,-9,-52,8,5);rect(fp.ink,1,-52,8,5);rect(fp.paper,-8,-51,6,3);rect(fp.paper,2,-51,6,3);
    rect(fp.al,-7,-51,2,1);rect(fp.al,3,-51,2,1);rect(fp.ink,-1,-51,2,1);
  }else if(hat==="ears"){
    poly(fp.ink,[[-11,-45],[-8,-57],[-2,-45]]);poly(fp.primary,[[-9,-46],[-8,-54],[-4,-46]]);
    poly(fp.paperD,[[-8,-47],[-8,-52],[-6,-47]]);
    poly(fp.ink,[[11,-45],[8,-57],[2,-45]]);poly(fp.primary,[[9,-46],[8,-54],[4,-46]]);
    poly(fp.paperD,[[8,-47],[8,-52],[6,-47]]);
  }else if(hat==="antenna"){
    rect(fp.ink,3,-57,3,11);rect(fp.secondary,4,-56,1,9);
    rect(fp.ink,1,-54,7,2);rect(fp.ink,1,-50,7,2);
    rect(fp.ink,2,-63,6,6);rect(fp.accent,3,-62,4,4);rect(fp.al,3,-62,2,2);rect(fp.paper,4,-61,1,1);
  }else if(hat==="hood"){
    poly(fp.ink,[[-14,-40],[-12,-52],[0,-58],[12,-52],[14,-40],[8,-44],[0,-50],[-8,-44]]);
    poly(fp.secondary,[[-12,-41],[-10,-51],[0,-56],[10,-51],[12,-41],[7,-44],[0,-49],[-7,-44]]);
    poly(fp.sd,[[6,-52],[10,-51],[12,-41],[8,-43]]);rect(fp.sl,-11,-48,2,4);
  }else if(hat==="cap"){
    rect(fp.ink,-10,-55,20,9);rect(fp.secondary,-9,-54,18,7);rect(fp.sl,-9,-54,18,2);rect(fp.sd,4,-54,5,7);
    rect(fp.sd,-1,-54,1,6);rect(fp.ink,-1,-57,3,2);rect(fp.accent,0,-56,1,1);
    rect(fp.ink,6,-48,13,3);rect(fp.secondary,7,-47,11,1);rect(fp.sd,14,-47,4,1);
  }else if(hat==="crystal"){
    poly(fp.ink,[[-4,-46],[-2,-58],[0,-61],[2,-58],[4,-46]]);
    poly(fp.accent,[[-3,-46],[-1,-57],[0,-59],[1,-57],[3,-46]]);
    rect(fp.al,-2,-56,1,9);rect(fp.paper,-2,-57,1,2);
    poly(fp.ink,[[-11,-46],[-8,-54],[-4,-46]]);poly(fp.primary,[[-10,-46],[-8,-52],[-5,-46]]);rect(fp.pl,-9,-51,1,3);
    poly(fp.ink,[[4,-46],[8,-55],[11,-46]]);poly(fp.primary,[[5,-46],[8,-53],[10,-46]]);rect(fp.pd,8,-51,1,4);
  }}
const PERSONA_LETTER_MAP={D:["##.","#.#","#.#","#.#","##."],M:["#...#","##.##","#.#.#","#...#","#...#"]};
function drawPersonaProp(d,p,time=0){const fp=p;const t=time;const pr=d.prop;
  if(pr==="coil"){
    rect(fp.ink,19,-12,4,8);rect(fp.secondary,20,-11,2,6);
    for(let i=0;i<4;i++){const w=10-i*2;const y=-16-i*4;const x=21-w/2;
      rect(fp.ink,x-1,y,w+2,2);rect(fp.accent,x,y,w,1);
      if(i<3)rect(fp.accent,i%2? x+w-1:x,y-3,1,3)}
    rect(fp.ink,19,-35,6,3);rect(fp.paper,20,-34,4,1);
  }else if(pr==="scroll"){
    rect(fp.ink,18,-30,10,20);rect(fp.accent,19,-29,8,18);rect(fp.al,19,-29,8,2);rect(fp.ad,25,-29,3,18);
    rect(fp.ink,17,-32,12,4);rect(fp.paper,18,-31,10,2);rect(fp.ink,17,-12,12,4);rect(fp.paper,18,-11,10,2);
    rect(fp.secondary,19,-19,8,2);
    for(const y of [-26,-23,-16])rect(fp.ad,20,y,6,1);
  }else if(pr==="question"){
    rect(fp.ink,17,-36,10,3);rect(fp.ink,15,-34,3,3);rect(fp.ink,25,-33,4,4);rect(fp.ink,23,-30,4,2);rect(fp.ink,20,-28,4,3);rect(fp.ink,20,-25,3,3);rect(fp.ink,20,-19,3,3);
    rect(fp.accent,18,-35,8,1);rect(fp.accent,16,-33,1,1);rect(fp.accent,26,-32,2,2);rect(fp.accent,23,-29,2,1);rect(fp.accent,21,-27,2,1);rect(fp.accent,21,-24,1,2);rect(fp.accent,21,-19,1,2);
  }else if(pr==="dice"){
    poly(fp.ink,[[17,-28],[21,-32],[34,-32],[30,-28]]);poly(fp.paperL,[[18,-28],[21,-31],[33,-31],[30,-28]]);
    poly(fp.ink,[[30,-28],[34,-32],[34,-19],[30,-15]]);poly(fp.paperD,[[31,-27],[33,-31],[33,-20],[31,-16]]);
    rect(fp.ink,17,-28,13,13);rect(fp.paper,18,-27,11,11);
    rect(fp.ink,20,-25,2,2);rect(fp.ink,23,-22,2,2);rect(fp.ink,26,-19,2,2);rect(fp.ink,25,-30,2,1);
  }else if(pr==="resistor"){
    rect(fp.ink,16,-14,4,2);rect(fp.ink,30,-14,4,2);
    rect(fp.ink,20,-17,10,8);rect(fp.accent,21,-16,8,6);rect(fp.al,21,-16,8,1);
    rect(fp.paper,23,-16,2,6);rect(fp.secondary,26,-16,2,6);
  }else if(pr==="meter"){
    rect(fp.ink,17,-30,14,18);rect(fp.secondary,18,-29,12,16);rect(fp.sl,18,-29,12,2);rect(fp.sd,26,-29,4,16);
    rect(fp.ink,19,-28,10,9);rect(fp.paper,20,-27,8,7);
    rect(fp.ink,21,-26,1,2);rect(fp.ink,27,-26,1,2);poly(fp.accent,[[23,-21],[25,-21],[26,-26]]);
    rect(fp.ink,20,-12,3,2);rect(fp.ink,26,-12,3,2);
  }else if(pr==="microphone"){
    rect(fp.ink,19,-32,9,9);rect(fp.secondary,20,-31,7,7);
    rect(fp.ink,21,-31,1,7);rect(fp.ink,24,-31,1,7);rect(fp.ink,20,-29,7,1);rect(fp.ink,20,-26,7,1);
    rect(fp.al,21,-30,2,2);
    rect(fp.ink,21,-23,5,12);rect(fp.primary,22,-22,3,10);rect(fp.accent,21,-20,5,2);
  }else if(pr==="flask"){
    poly(fp.ink,[[15,-12],[19,-26],[19,-34],[27,-34],[27,-26],[31,-12]]);
    poly(fp.paper,[[17,-13],[20,-25],[20,-32],[26,-32],[26,-25],[29,-13]]);
    poly(fp.accent,[[19,-20],[27,-20],[28,-14],[18,-14]]);
    rect(fp.al,19,-20,8,1);rect(fp.paperD,26,-24,2,8);
    const bub=Math.floor(t/240)%3;rect(fp.al,21,-14-bub*2,1,1);rect(fp.al,25,-15-bub*2,1,1);
    rect(fp.ink,18,-36,10,2);
  }else if(pr==="psychic"){
    rect(fp.ad,17,-33,16,1);rect(fp.ad,19,-35,12,1);
    rect(fp.ink,22,-31,8,2);rect(fp.ink,20,-29,12,10);rect(fp.ink,22,-19,8,2);
    rect(fp.accent,21,-28,10,8);rect(fp.accent,22,-29,8,1);rect(fp.accent,22,-20,8,1);
    rect(fp.paper,22,-27,2,2);rect(fp.al,26,-23,2,2);
    rect(fp.ad,17,-16,16,1);rect(fp.ad,19,-14,12,1);
  }else if(pr==="sword"){
    poly(fp.ink,[[22,-40],[24,-44],[26,-40]]);poly(fp.paper,[[23,-40],[24,-42],[25,-40]]);
    rect(fp.ink,22,-40,4,24);rect(fp.paper,23,-39,2,23);rect(fp.paperD,24,-39,1,23);
    rect(fp.ink,18,-16,12,3);rect(fp.accent,19,-15,10,1);
    rect(fp.ink,22,-13,4,8);rect(fp.secondary,23,-12,2,6);
    rect(fp.ink,22,-5,4,3);rect(fp.accent,23,-4,2,1);
  }else if(pr==="basketball"){
    rect(fp.ink,22,-29,8,2);rect(fp.ink,20,-27,12,2);rect(fp.ink,19,-25,14,6);rect(fp.ink,20,-19,12,2);rect(fp.ink,22,-17,8,2);
    rect(fp.accent,21,-27,10,2);rect(fp.accent,20,-25,12,6);rect(fp.accent,21,-19,10,2);
    rect(fp.al,21,-26,3,2);
    rect(fp.ad,25,-26,1,10);rect(fp.ad,20,-22,12,1);
  }else if(pr==="staff"){
    rect(fp.ink,22,-38,5,40);rect(fp.secondary,23,-37,3,38);rect(fp.sd,25,-37,1,38);
    rect(fp.primary,22,-30,5,2);rect(fp.primary,22,-20,5,2);rect(fp.primary,22,-10,5,2);
    poly(fp.ink,[[24,-49],[33,-42],[24,-35],[15,-42]]);poly(fp.accent,[[24,-47],[31,-42],[24,-37],[17,-42]]);
    rect(fp.al,21,-44,2,2);rect(fp.paper,22,-44,1,1);
  }else if(pr==="rose"){
    const stem=fp.mint||fp.secondary;
    rect(fp.ink,24,-20,2,16);rect(stem,25,-19,1,14);
    poly(fp.ink,[[24,-14],[18,-11],[24,-8]]);poly(stem,[[24,-13],[20,-11],[24,-9]]);
    rect(fp.ink,26,-17,1,1);
    rect(fp.ink,21,-32,9,2);rect(fp.ink,19,-30,13,9);rect(fp.ink,21,-21,9,2);
    rect(fp.accent,22,-31,7,2);rect(fp.accent,20,-29,11,7);rect(fp.accent,22,-22,7,2);
    rect(fp.ad,26,-29,5,7);rect(fp.ad,23,-27,3,3);rect(fp.al,21,-29,2,2);
  }else if(pr==="lantern"){
    rect(fp.ink,22,-21,6,1);rect(fp.ink,22,-20,1,3);rect(fp.ink,27,-20,1,3);
    rect(fp.ink,20,-17,10,3);rect(fp.secondary,21,-16,8,1);
    rect(fp.ink,20,-14,10,12);rect(fp.paper,21,-13,8,10);
    rect(fp.accent,22,-11,6,7);rect(fp.al,23,-10,4,5);rect(fp.paper,24,-9,2,2);
    rect(fp.ink,20,-2,10,3);rect(fp.secondary,21,-1,8,1);
  }else if(pr==="wrench"){
    rect(fp.ink,19,-35,4,9);rect(fp.ink,27,-35,4,9);rect(fp.ink,19,-27,12,3);
    rect(fp.secondary,20,-34,2,7);rect(fp.secondary,28,-34,2,7);rect(fp.secondary,21,-26,9,1);
    rect(fp.ink,23,-24,4,18);rect(fp.secondary,24,-23,2,16);rect(fp.sd,25,-23,1,16);
    rect(fp.ink,24,-9,2,2);
  }else if(pr==="teapot"){
    rect(fp.ink,23,-28,4,3);rect(fp.al,24,-27,2,1);
    rect(fp.ink,19,-26,12,3);rect(fp.accent,20,-25,10,1);
    rect(fp.ink,17,-23,16,13);rect(fp.accent,18,-22,14,11);rect(fp.al,19,-21,3,3);rect(fp.ad,27,-22,5,11);
    poly(fp.ink,[[33,-21],[38,-25],[39,-23],[34,-16]]);poly(fp.accent,[[34,-20],[37,-24],[38,-23],[35,-17]]);
    rect(fp.ink,14,-21,3,2);rect(fp.ink,13,-21,2,8);rect(fp.ink,14,-14,3,2);
    const st=Math.floor(t/320)%3;rect(fp.paper,37,-27-st*2,1,1);rect(fp.paper,35,-26-st*2,1,1);
  }else if(pr==="kite"){
    poly(fp.ink,[[26,-56],[35,-47],[26,-38],[17,-47]]);
    poly(fp.accent,[[25,-54],[25,-40],[19,-47]]);poly(fp.primary,[[27,-54],[33,-47],[27,-40]]);
    rect(fp.al,24,-51,2,3);
    for(let i=0;i<6;i++)rect(fp.secondary,21+Math.round(i*0.9),-14-i*4,1,2);
    rect(fp.accent,24,-37,3,2);rect(fp.accent,27,-34,3,2);
  }else if(pr==="probFlask"){
    rect(fp.ink,19,-40,11,3);rect(fp.paper,20,-39,9,1);
    rect(fp.ink,20,-38,9,11);rect(fp.paper,21,-37,7,9);
    rect(fp.ink,16,-28,17,4);rect(fp.ink,14,-24,21,11);rect(fp.ink,16,-13,17,4);
    rect(fp.paper,17,-27,15,2);rect(fp.paper,15,-23,19,9);rect(fp.paper,17,-14,15,4);rect(fp.paperD,27,-23,4,9);
    rect(fp.paperD,17,-25,3,1);rect(fp.paperD,17,-22,3,1);
    const a=(Math.sin(t/760)+1)/2;
    paintContext.save();paintContext.globalAlpha=0.15+a*0.85;
    rect(fp.accent,16,-21,18,6);rect(fp.accent,17,-15,16,2);
    rect(fp.al,16,-21,18,1);rect(fp.al,20,-18,1,1);rect(fp.al,26,-17,1,1);
    paintContext.restore();
  }else if(pr==="chargePalm"){
    const bob=Math.round(Math.sin(t/130));const y=-23+bob;
    rect(fp.ink,9,-14,7,6);rect(fp.secondary,10,-13,5,4);rect(fp.sd,13,-13,2,4);
    rect(fp.ink,16,y-4,6,1);rect(fp.ink,14,y-3,10,2);rect(fp.ink,13,y-1,12,5);rect(fp.ink,14,y+4,10,2);rect(fp.ink,16,y+6,6,1);
    rect(fp.accent,16,y-3,6,1);rect(fp.accent,15,y-2,8,2);rect(fp.accent,14,y,10,3);rect(fp.accent,15,y+3,8,2);rect(fp.accent,16,y+4,6,1);
    rect(fp.al,16,y-2,3,1);rect(fp.paper,18,y,2,2);rect(fp.al,12,y-5,1,1);rect(fp.al,25,y+2,1,1);
  }else if(pr==="joystickScepter"){
    rect(fp.ink,13,-35,5,35);rect(fp.secondary,14,-34,3,33);rect(fp.sd,16,-34,1,33);
    rect(fp.ink,11,-13,9,5);rect(fp.accent,12,-12,7,3);
    rect(fp.ink,13,-44,5,1);rect(fp.ink,11,-43,9,2);rect(fp.ink,10,-41,11,4);rect(fp.ink,11,-37,9,2);rect(fp.ink,13,-35,5,1);
    rect(fp.accent,13,-43,5,1);rect(fp.accent,12,-42,7,2);rect(fp.accent,11,-40,9,3);rect(fp.accent,12,-38,7,2);rect(fp.accent,13,-37,5,1);
    rect(fp.al,13,-42,3,1);rect(fp.paper,14,-40,2,1);
  }else if(pr==="cartBlade"){
    rect(fp.ink,9,-13,10,6);rect(fp.secondary,10,-12,8,4);
    rect(fp.ink,8,-17,14,4);rect(fp.accent,9,-16,12,2);
    poly(fp.ink,[[14,-50],[19,-55],[24,-50],[24,-17],[14,-17]]);poly(fp.secondary,[[16,-49],[19,-52],[22,-49],[22,-18],[16,-18]]);
    rect(fp.sd,21,-48,1,30);rect(fp.paper,16,-41,6,10);rect(fp.primary,17,-40,4,4);
    rect(fp.accent,17,-35,4,1);rect(fp.accent,17,-33,3,1);
    rect(fp.accent,16,-28,6,7);rect(fp.ink,17,-27,4,1);rect(fp.ink,17,-25,4,1);rect(fp.ink,17,-23,4,1);
    const gy=-45+Math.floor((t/140)%24);rect(fp.al,16,gy,2,1);
  }else if(pr==="tokenAegis"){
    poly(fp.ink,[[17,-39],[22,-38],[26,-35],[30,-31],[31,-24],[30,-17],[26,-13],[22,-10],[17,-9],[12,-10],[8,-13],[4,-17],[3,-24],[4,-31],[8,-35],[12,-38]]);
    poly(fp.accent,[[17,-36],[21,-35],[25,-32],[28,-29],[29,-24],[28,-18],[25,-15],[21,-12],[17,-11],[13,-12],[9,-15],[6,-18],[5,-24],[6,-29],[9,-32],[13,-35]]);
    poly(fp.al,[[13,-35],[17,-36],[12,-13],[9,-15],[6,-18],[5,-24],[6,-29],[9,-32]]);
    poly(fp.ad,[[21,-35],[25,-32],[28,-29],[29,-24],[28,-18],[25,-15],[21,-12],[17,-11],[22,-32]]);
    const relief=function(ch,x,y){const rows=PERSONA_LETTER_MAP[ch];for(let r=0;r<rows.length;r++)for(let c=0;c<rows[r].length;c++)if(rows[r][c]==="#"){rect(fp.ad,x+c*2+1,y+r*2+1,2,2);rect(fp.al,x+c*2,y+r*2,2,2)}};
    relief("D",8,-29);relief("M",16,-29);
    const spots=[[17,-37],[27,-30],[29,-22],[25,-14],[17,-10],[9,-15],[5,-23],[8,-31]];
    const s=spots[Math.floor(t/150)%spots.length];rect(fp.al,s[0],s[1],2,2);
  }else if(pr==="starWand"){
    rect(fp.ink,9,-12,10,6);rect(fp.secondary,10,-11,8,4);
    rect(fp.ink,13,-38,6,28);rect(fp.primary,14,-37,4,26);
    rect(fp.accent,14,-34,4,2);rect(fp.accent,14,-29,4,2);rect(fp.accent,14,-24,4,2);rect(fp.accent,14,-19,4,2);
    poly(fp.ink,[[16,-55],[19,-47],[28,-47],[21,-41],[24,-32],[16,-36],[8,-32],[11,-41],[4,-47],[13,-47]]);
    poly(fp.accent,[[16,-52],[18,-46],[25,-46],[20,-41],[22,-34],[16,-38],[10,-34],[12,-41],[7,-46],[14,-46]]);
    poly(fp.al,[[16,-50],[17,-46],[22,-46],[18,-43],[16,-39],[14,-43],[10,-46],[15,-46]]);
    const s2=Math.floor(t/160)%4;const sparks=[[29,-49],[4,-42],[25,-31],[8,-52]];
    rect(fp.paper,sparks[s2][0],sparks[s2][1],1,1);rect(fp.al,sparks[(s2+2)%4][0],sparks[(s2+2)%4][1],1,1);
  }else if(pr==="prizeHammer"){
    const bob=Math.round(Math.sin(t/300));
    paintContext.save();paintContext.translate(0,bob-2);
    rect(fp.ink,14,-46,7,36);rect(fp.secondary,15,-45,5,34);rect(fp.sd,19,-45,1,34);
    rect(fp.ink,9,-64,18,3);rect(fp.ink,5,-61,26,16);rect(fp.ink,9,-45,18,3);
    rect(fp.accent,10,-63,16,1);rect(fp.accent,6,-60,24,13);rect(fp.accent,10,-46,16,2);
    rect(fp.secondary,6,-60,6,13);rect(fp.secondary,22,-60,6,13);rect(fp.sd,27,-60,1,13);
    rect(fp.al,8,-59,6,2);rect(fp.paper,10,-58,2,1);rect(fp.ad,20,-49,7,2);
    paintContext.restore();
    const s=Math.floor(t/180)%3;rect(fp.al,30+s,-55+s,1,1);
  }else if(pr==="prizeClaw"){
    const open=Math.round((Math.sin(t/260)+1)*2);
    rect(fp.ink,9,-13,10,6);rect(fp.secondary,10,-12,8,4);
    rect(fp.ink,14,-43,5,32);rect(fp.primary,15,-42,3,30);rect(fp.pd,17,-42,1,30);
    rect(fp.ink,13,-48,8,2);rect(fp.ink,11,-46,12,4);rect(fp.accent,12,-45,10,2);
    poly(fp.ink,[[14,-43],[8-open,-39],[7-open,-34],[10-open,-33],[13-open,-38],[16,-41]]);
    poly(fp.secondary,[[14,-42],[10-open,-39],[9-open,-35],[11-open,-35],[14-open,-38],[16,-41]]);
    poly(fp.ink,[[18,-43],[24+open,-39],[25+open,-34],[22+open,-33],[19+open,-38],[16,-41]]);
    poly(fp.secondary,[[18,-42],[22+open,-39],[23+open,-35],[21+open,-35],[18+open,-38],[16,-41]]);
    rect(fp.ink,15,-38,3,7);rect(fp.accent,16,-37,1,5);
    const bob=Math.round(Math.sin(t/320));drawOrbitToken(16,-32+bob,fp,false);
  }}
function drawPersonaMotif(d,p){if(d.motif==="helix"){rect(p.accent,-3,-11,2,9);rect(p.accent,1,-11,2,9);for(const y of [-10,-7,-4])rect(p.paper,-1,y,2,1)}else if(d.motif==="bands"){for(const x of [-4,0,4])rect(p.accent,x,-9,2,6)}else if(d.motif==="badge"){rect(p.accent,2,-9,3,3)}else if(d.motif==="scar"){rect(p.accent,-3,-19,1,6)}else if(d.motif==="alchemy"){rect(p.accent,-2,-8,5,1);rect(p.accent,0,-10,1,5)}else if(d.motif==="number"){rect(p.accent,-1,-9,3,6)}else if(d.motif==="leaf"){poly(p.accent,[[-3,-8],[2,-11],[3,-6],[0,-4]])}else if(d.motif==="tie"){poly(p.accent,[[-1,-9],[2,-9],[1,-3],[-1,-3]])}else if(d.motif==="stripe"){rect(p.accent,-6,-8,12,2)}else if(d.motif==="rune"){rect(p.accent,-3,-9,6,1);rect(p.accent,-1,-11,2,6)}else if(d.motif==="bolt"){poly(p.accent,[[1,-11],[-2,-6],[0,-6],[-1,-2],[2,-7],[0,-7]])}else if(d.motif==="spots"){for(const [x,y] of [[-4,-9],[2,-7],[-1,-4]])rect(p.accent,x,y,2,2)}else if(d.motif==="heart"){rect(p.accent,-2,-9,2,2);rect(p.accent,1,-9,2,2);rect(p.accent,-1,-7,3,2);rect(p.accent,0,-5,1,1)}}
function drawPersonaShellFront(d,p){if(d.shell==="cage"){for(const x of [-18,-9,0,9,18]){rect(p.secondary,x,-48,2,56);rect(p.sl,x,-48,1,56)}rect(p.paper,-26,-40,4,4);rect(p.accent,24,-18,4,4);rect(p.al,24,-18,4,1)}}
function drawPersona(p,s,seed,dna,time=0){const fp=finePal(p);/*TINY-SCALE*//*MODEL-CREW-K7*/const bs=dna.body==="tiny"?0.7:1;paintContext.save();paintContext.translate(0,12*(1-bs));paintContext.scale(bs,bs);drawPersonaAura(dna,fp,time);drawPersonaBack(dna,fp);if(dna.aura==="tokenOrbit")drawTokenOrbit(fp,time,true);drawPersonaFineBack(dna,fp,time);drawPersonaBody(dna,fp,s);drawPersonaOutfit(dna,fp);if(dna.head==="orb"){/*ORB-DRIFT*/const oy=-2+Math.round(Math.sin(time/520+(seed%7))*2);paintContext.save();paintContext.translate(0,oy-42);paintContext.scale(1.25,1.25);paintContext.translate(0,42);drawPersonaHead(dna,fp);paintContext.translate(0,-7);drawPersonaFace(dna,fp);paintContext.restore()}else if(dna.head==="elfSovereign"){drawSovereignHead(fp);drawPersonaFace(dna,fp)}else{drawPersonaHead(dna,fp);drawPersonaFace(dna,fp)}drawPersonaHat(dna,fp,time);drawPersonaProp(dna,fp,time);legacyLayer(()=>drawPersonaMotif(dna,p));drawPersonaShellFront(dna,fp);drawPersonaFineFront(dna,fp,time);if(dna.aura==="tokenOrbit")drawTokenOrbit(fp,time,false);paintContext.restore()}
function drawCharacterLive(ctx, x, y, scale, dna, pal, time, seed){
  paintContext = ctx; ctx.save(); ctx.translate(x, y); ctx.scale(scale / PART_RES, scale / PART_RES);
  rect("rgba(0,0,0,.38)", -16, 2, 32, 6);
  drawPersona(pal, 0, seed, dna, time);
  ctx.restore();
}
return { drawCharacter: drawCharacterLive };
})();

