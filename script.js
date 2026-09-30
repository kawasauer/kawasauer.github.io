const $=i=>document.getElementById(i),cv=$('cv'),g=cv.getContext('2d'),C=19,R=11,T=56,STEP=115;cv.width=C*T;cv.height=R*T;
const D=[[1,0],[-1,0],[0,1],[0,-1]],DV={u:[0,-1],d:[0,1],l:[-1,0],r:[1,0]},KM={arrowup:'u',w:'u',arrowdown:'d',s:'d',arrowleft:'l',a:'l',arrowright:'r',d:'r'},K=(x,y)=>y*C+x,AS=()=>P.as||P.dif===0,cnt=(a,f)=>a.filter(o=>o[f]).length;
// [tema, título, matiz, chaves, símbolos, interruptores, armadilhas, abertura]
const LV=[['Parque da Amizade','Primeiro Passo',150,1,0,0,0,.8],['Cidade das Possibilidades','Rotas Diferentes',215,2,0,0,0,.7],['Centro da Comunicação','Na Ordem Certa',270,0,3,0,0,.65],['Parque da Cooperação','Pontos de Ação',42,0,0,3,0,.6],['Praça da Inclusão','Cada Um do Seu Jeito',320,2,3,3,0,.55],['Centro da Acessibilidade','Caminhos Acessíveis',185,3,0,3,2,.5],['Laboratório','Comunicação em Ação',205,3,4,0,2,.45],['Praça da União','Todos Juntos',130,4,3,4,3,.4],['Cidade dos Desafios','Escolhas e Soluções',25,4,4,4,4,.35],['Centro da Inclusão','A Grande Inclusão',250,5,5,5,5,.3],
['Biblioteca Sensorial','Ler com as Mãos',35,3,5,0,3,.3],['Estação Libras','Mãos que Falam',340,2,4,4,4,.3],['Jardim dos Sentidos','Sons e Cores',100,4,0,5,5,.28],['Escola para Todos','Sala de Aula Aberta',55,5,4,3,6,.25],['Teatro Acessível','Todos no Palco',350,3,6,4,6,.25],['Mercado Solidário','Trocas e Apoios',15,6,4,5,7,.22],['Metrô Inclusivo','Linha Sem Barreiras',195,5,5,5,8,.2],['Ginásio Adaptado','Jogo de Todos',85,6,6,4,8,.2],['Torre da Empatia','Ponte de Vozes',290,6,6,6,9,.15],['Praça do Futuro','Um Mundo Para Todos',265,7,7,6,10,.12]];
const TIP={0:'Use setas, WASD ou os botões da tela.',2:'Ative os símbolos em ordem: 1, 2, 3… Errar a ordem não tira vida.',3:'Novo: 🚧 portões só abrem quando todos os interruptores são acionados.',5:'Novo: ⚠️ armadilhas só machucam quando ficam altas e vermelhas. Espere o momento certo.'};
const OPTS=[['ts','🔎 Tamanho do texto',['Normal','Grande','Enorme'],'Aumenta textos e botões.'],['hc','⚫ Alto contraste',0,'Preto e branco com amarelo, bordas grossas.'],['sym','🔷 Formas e padrões',0,'Texturas e destaques além das cores.'],['rm','🌀 Reduzir movimento',0,'Sem brilhos pulsantes nem partículas.'],['dif','🎚️ Dificuldade',['Fácil','Médio','Difícil'],'Vale a partir da próxima fase ou ao reiniciar a fase.'],['as','💡 Assistência visual',0,'Mostra o caminho até o próximo objetivo.'],['voz','🎙️ Controle por sons',0,'Ande, pare e peça dica com sons gravados por você. Configure no botão abaixo.'],['tap','👆 Toque para andar',0,'Toque no mapa e o personagem vai sozinho.'],['snd','🔊 Sons',1,'Efeitos sonoros.'],['vol','📢 Volume dos efeitos',['Normal','Alto','Máximo'],'Deixa os sons mais fortes que a narração.'],['son','📡 Sonar sonoro',0,'Bipes mais rápidos e agudos perto do objetivo; o som vem do lado certo.'],['nar','🗣️ Narração',0,'Lê as mensagens em voz alta.'],['calm','🐢 Ritmo calmo',0,'Armadilhas bem mais lentas.'],['safe','🛟 Modo sem vidas',0,'Armadilhas desativadas, sem risco.'],['vib','📳 Vibração',1,'Vibra em acertos e erros (celular).']];
let P={ts:0,hc:+matchMedia('(prefers-contrast:more)').matches,sym:0,rm:+matchMedia('(prefers-reduced-motion:reduce)').matches,as:0,dif:1,voz:0,vol:1,tap:0,snd:1,son:0,nar:0,calm:0,safe:0,vib:1},best=0;
try{Object.assign(P,JSON.parse(localStorage.getItem('mi-p')||'{}'));best=+localStorage.getItem('mi-b')||0}catch(e){}
const save=(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}};
let L=0,G=[],keys=[],syms=[],sws=[],gate=null,spk=[],door={},st={},pl={x:1,y:1,fx:1,fy:0},mv=null,auto=[],dirs=[],lives=3,hints=0,hurts=0,run='menu',inv=0,gc=null,gcAt=0,gUntil=0,now=0,gt=0,last=0,snAt=0,cl=0,cd=0,resume=0,opener=null,AC=null,MS=null;
/* ÁUDIO */
function initAudio(){try{if(!AC){AC=new(window.AudioContext||window.webkitAudioContext)();MS=AC.createDynamicsCompressor();MS.connect(AC.destination)}AC.state==='suspended'&&AC.resume()}catch(e){}}
function tone(f,d=.08,ty='triangle',v=.16,pan=0,force){v*=[1,1.7,2.4][P.vol];if(!(P.snd||force)||!AC)return;try{const o=AC.createOscillator(),n=AC.createGain(),t=AC.currentTime;o.type=ty;o.frequency.value=f;n.gain.setValueAtTime(v,t);n.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(n);let out=n;if(AC.createStereoPanner){const p=AC.createStereoPanner();p.pan.value=pan;n.connect(p);out=p}out.connect(MS||AC.destination);o.start(t);o.stop(t+d)}catch(e){}}
const SF={start:[[500],[700]],key:[[700],[980]],ok:[[850]],bad:[[220,.15,'triangle']],lock:[[120,.14,'square']],unlock:[[500],[700],[950,.16]],door:[[360,.3]],sw:[[520,.1]],win:[[523],[659],[784],[1046,.3]],hurt:[[100,.28,'sawtooth']],bump:[[90,.06,'square',.08]]};
const sfx=n=>{initAudio();(SF[n]||[]).forEach((a,i)=>setTimeout(()=>tone(...a),i*85))},buzz=n=>{try{P.vib&&navigator.vibrate&&navigator.vibrate(n)}catch(e){}};
let sp=0;const stopSpeech=()=>{sp=0;try{window.speechSynthesis&&speechSynthesis.cancel()}catch(e){}};
function say(t){$('msg').textContent=t;if(!P.nar||!window.speechSynthesis)return;try{if(sp>4){speechSynthesis.cancel();sp=0}const u=new SpeechSynthesisUtterance(t.replace(/(\d+)\/(\d+)/g,'$1 de $2').replace(/[^\p{L}\p{N}\s.,!?:-]/gu,'').replace(/\s+/g,' ').trim());u.lang='pt-BR';u.volume=[.9,.75,.6][P.vol];u.onend=u.onerror=()=>{sp=Math.max(0,sp-1)};sp++;speechSynthesis.speak(u)}catch(e){}}
/* GERAÇÃO DAS FASES (mapa único garantido: labirinto + laços, tudo alcançável) */
function rng(s){return()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const open=(x,y,gb=1)=>x>=0&&y>=0&&x<C&&y<R&&!G[y][x]&&!(gb&&gate&&!gate.open&&gate.x===x&&gate.y===y);
function bfs(sx,sy,gb=1,db=1){const pr=new Map([[K(sx,sy),-1]]),q=[[sx,sy]];for(let h=0;h<q.length;h++){const[x,y]=q[h];if(db&&!door.open&&x===door.x&&y===door.y)continue;for(const[a,b]of D){const nx=x+a,ny=y+b;if(!open(nx,ny,gb)||pr.has(K(nx,ny)))continue;pr.set(K(nx,ny),K(x,y));q.push([nx,ny])}}return pr}
function route(tx,ty,sx=pl.x,sy=pl.y){const pr=bfs(sx,sy);if(!pr.has(K(tx,ty)))return null;const o=[];let k=K(tx,ty);while(k!==-1){o.push([k%C,k/C|0]);k=pr.get(k)}return o.reverse()}
function build(i){const[,,,k0,s0,w0,x0,b0]=LV[i],r=rng(i*7919+13),f=[.6,1,1.3][P.dif],sc=v=>v?Math.max(1,Math.round(v*f)):0,nk=sc(k0),ns=sc(s0),nw=sc(w0),nx=P.dif===0?0:Math.round(x0*[0,1,1.5][P.dif]),br=Math.max(.05,Math.min(.9,b0+[.25,0,-.08][P.dif]));gate=null;
G=[...Array(R)].map(()=>Array(C).fill(1));const sk=[[1,1]];G[1][1]=0;
while(sk.length){const[x,y]=sk[sk.length-1],n=D.map(([a,b])=>[a*2,b*2]).filter(([a,b])=>x+a>0&&x+a<C-1&&y+b>0&&y+b<R-1&&G[y+b][x+a]);if(!n.length){sk.pop();continue}const[a,b]=n[r()*n.length|0];G[y+b/2][x+a/2]=0;G[y+b][x+a]=0;sk.push([x+a,y+b])}
for(let y=1;y<R-1;y++)for(let x=1;x<C-1;x++)if(G[y][x]&&(!G[y][x-1]&&!G[y][x+1]||!G[y-1][x]&&!G[y+1][x])&&r()<br)G[y][x]=0;
if(i%2)G=G.map(w=>w.reverse());if(i%3===1)G.reverse();
const sx=i%2?17:1,sy=i%3===1?9:1,dx=18-sx,dy=10-sy;st={x:sx,y:sy};pl.x=sx;pl.y=sy;pl.fx=sx<9?1:-1;pl.fy=0;door={x:dx,y:dy,open:0};
const rt=route(dx,dy,sx,sy);
if(nw)for(let j=rt.length>>1;j<rt.length-1;j++){gate={x:rt[j][0],y:rt[j][1],open:0};if(!bfs(sx,sy).has(K(dx,dy)))break;gate=null}
const used=[[sx,sy],[dx,dy]];gate&&used.push([gate.x,gate.y]);
const pick=(pool,ds)=>{for(let t=0;t<300;t++){const k=pool[r()*pool.length|0],x=k%C,y=k/C|0,d=t<120?ds:t<240?2:1;if(used.every(([a,b])=>Math.abs(a-x)+Math.abs(b-y)>=d)){used.push([x,y]);return{x,y}}}return null};
const fr=[...bfs(sx,sy,0).keys()],pre=[...bfs(sx,sy).keys()],rp=rt.map(([x,y])=>K(x,y));
keys=[];syms=[];sws=[];spk=[];
for(let j=0;j<nk;j++){const o=pick(fr,3);o&&keys.push({...o,got:0})}
const fset=new Set(fr),rd=new Map(rp.map(k=>[k,0])),rq=rp.map(k=>[k%C,k/C|0]);
for(let h=0;h<rq.length;h++){const[x,y]=rq[h];for(const[a,b]of D){const nx=x+a,ny=y+b;if(!open(nx,ny,0)||rd.has(K(nx,ny)))continue;rd.set(K(nx,ny),rd.get(K(x,y))+1);rq.push([nx,ny])}}
const near=[...rd].filter(([k,d])=>d<=2&&fset.has(k)).map(([k])=>k);
for(let j=0;j<ns;j++){const o=pick(near.length>=ns*3?near:fr,3);o&&syms.push({...o,done:0})}
const p0=bfs(sx,sy,0),dist=o=>{let n=0,k=K(o.x,o.y);while(k!==-1){k=p0.get(k);n++}return n};
syms.sort((a,b)=>dist(a)-dist(b)).forEach((o,j)=>o.n=j+1);
for(let j=0;j<nw;j++){const o=pick(pre,3);o&&sws.push({...o,on:0})}
for(let j=0;j<nx;j++){const o=pick(j%2?fr:rp,2);o&&spk.push({...o,o:r()})}}
const goal=()=>{const k=keys.length,s=syms.length,w=sws.length;return'Objetivo: '+[k&&`pegar ${k} chave${k>1?'s':''}`,s&&`ativar ${s} símbolo${s>1?'s em ordem':''}`,w&&`acionar ${w} interruptor${w>1?'es':''}`].filter(Boolean).join(', ')+' e chegar à saída.'+(spk.length?' Cuidado com as armadilhas!':'')};
const missing=()=>[[keys,'got','chave(s)'],[syms,'done','símbolo(s)'],[sws,'on','interruptor(es)']].map(([a,f,n])=>a.length-cnt(a,f)?`${a.length-cnt(a,f)} ${n}`:'').filter(Boolean).join(', ')||'nada';
function load(i){stopSpeech();L=i;lives=3;build(i);mv=null;auto=[];dirs=[];gc=null;gcAt=0;gUntil=0;inv=0;run='play';hud();say(goal()+(TIP[i]&&(i!==5||spk.length)?' '+TIP[i]:''))}
function hud(){const l=LV[L];$('ph').textContent=`FASE ${L+1} / 20`;$('th').textContent=l[0];$('ti').textContent=l[1];
$('lv').textContent=P.safe?'🛟 Sem vidas':'❤️'.repeat(lives)+'🖤'.repeat(3-lives);$('lv').setAttribute('aria-label',P.safe?'Modo sem vidas':`Vidas: ${lives} de 3`);
[[keys,'got','🔑 Chaves'],[syms,'done','🔷 Símbolos'],[sws,'on','⚡ Interruptores']].forEach(([a,f,n],i)=>{const e=$('c'+(i+1));e.hidden=!a.length;e.textContent=`${n}: ${cnt(a,f)}/${a.length}`});
$('c4').textContent=door.open?'🟢 Saída liberada':'🔒 Saída bloqueada';
const tot=keys.length+syms.length+sws.length,dn=cnt(keys,'got')+cnt(syms,'done')+cnt(sws,'on'),pc=Math.round(dn/tot*100);$('pgi').style.width=pc+'%';$('pg').setAttribute('aria-valuenow',pc);
$('ob').textContent=AS()?(door.open?'Vá até a saída!':'Faltam: '+missing()):goal()}
/* MOVIMENTO E REGRAS */
function step(dx,dy){pl.fx=dx;pl.fy=dy;const nx=pl.x+dx,ny=pl.y+dy,ok=ms=>now>=cl&&(cl=now+ms,1);
if(gate&&!gate.open&&gate.x===nx&&gate.y===ny){if(ok(1200)){sfx('lock');say('🚧 O portão está fechado. Acione todos os interruptores.')}auto=[];return}
if(nx===door.x&&ny===door.y&&!door.open){if(ok(1200)){sfx('lock');say('🔒 A saída está bloqueada. Falta: '+missing()+'.')}auto=[];return}
if(!open(nx,ny)){auto=[];if(ok(250)){sfx('bump');buzz(15)}return}
mv={fx:pl.x,fy:pl.y,tx:nx,ty:ny,t:now}}
function arrive(){pl.x=mv.tx;pl.y=mv.ty;mv=null;const at=o=>o.x===pl.x&&o.y===pl.y;
const k=keys.find(o=>!o.got&&at(o));if(k){k.got=1;sfx('key');buzz(30);say(`🔑 Chave ${cnt(keys,'got')}/${keys.length}!`)}
const s=syms.find(o=>!o.done&&at(o));if(s){const n=cnt(syms,'done')+1;if(s.n===n){s.done=1;sfx('ok');buzz(30);say(n===syms.length?'🔷 Todos os símbolos ativados!':`✓ Símbolo ${n} ativado. Próximo: ${n+1}.`)}else{sfx('bad');buzz([40,40,40]);say(`↔ Esse é o símbolo ${s.n}. Procure o ${n} primeiro.`)}}
const w=sws.find(o=>!o.on&&at(o));if(w){w.on=1;sfx('sw');buzz(30);say(`⚡ Interruptor ${cnt(sws,'on')}/${sws.length}!`);if(gate&&sws.every(o=>o.on)){gate.open=1;sfx('unlock');say('🚧 Portão aberto! O caminho está livre.')}}
if(!door.open&&keys.every(o=>o.got)&&syms.every(o=>o.done)&&sws.every(o=>o.on)){door.open=1;sfx('unlock');say('🔓 Saída liberada! Vá até a porta.')}
hud();if(door.open&&at(door))finish()}
const ph=s=>((now/(P.calm?4600:[2600,2600,1900][P.dif]))+s.o)%1,danger=s=>!P.safe&&ph(s)>=.7,warn=s=>!P.safe&&ph(s)>=.5&&ph(s)<.7;
function hurt(){if(P.safe||now<inv)return;inv=now+1400;hurts++;lives--;sfx('hurt');buzz(200);
if(lives<=0){say('💥 Sem vidas. Recomeçando a fase…');run='busy';setTimeout(()=>load(L),1500);return}
say('⚠️ Armadilha! Você voltou ao início da fase.');mv=null;auto=[];pl.x=st.x;pl.y=st.y;hud()}
function finish(){run='busy';sfx('door');say(`🎉 Fase ${L+1} concluída!`);best=Math.max(best,Math.min(19,L+1));save('mi-b',best);setTimeout(()=>L<19?load(L+1):endGame(),1100)}
function endGame(){stopSpeech();run='end';sfx('win');$('fh').textContent=hints;$('fu').textContent=hurts;show('end');$('again').focus()}
function nextObj(){const c=[];keys.filter(k=>!k.got).forEach(k=>c.push([k,'uma chave']));const s=syms.find(s=>!s.done&&s.n===cnt(syms,'done')+1);s&&c.push([s,`o símbolo ${s.n}`]);sws.filter(w=>!w.on).forEach(w=>c.push([w,'um interruptor']));
let b=null;for(const[o,n]of c){const rt=route(o.x,o.y);if(rt&&(!b||rt.length<b.rt.length))b={o,n,rt}}
if(!b&&door.open){const rt=route(door.x,door.y);if(rt)b={o:door,n:'a saída',rt}}return b}
function hint(){if(run!=='play'||now<cd)return;cd=now+1200;hints++;const b=nextObj();if(!b)return say('💡 Explore o mapa: os objetivos estão espalhados pelos corredores.');
gc=b;gcAt=now+180;gUntil=now+6000;const t=b.rt[b.rt.length-1],dx=t[0]-pl.x,dy=t[1]-pl.y,p=[dx&&`${Math.abs(dx)} à ${dx>0?'direita':'esquerda'}`,dy&&`${Math.abs(dy)} ${dy>0?'abaixo':'acima'}`].filter(Boolean).join(' e ');
say(`💡 Procure ${b.n}: ${p}. Caminho de ${b.rt.length-1} passos (destacado no mapa).`)}
const status=()=>run==='play'&&say(`Você está na coluna ${pl.x+1}, linha ${pl.y+1}. Falta: ${missing()}. A saída está ${door.open?'liberada':'bloqueada'}.${P.safe?'':` Vidas: ${lives}.`}`);
function upd(){if(run!=='play')return;if(mv&&now-mv.t>=STEP)arrive();if(run!=='play')return;
if(!mv){const d=dirs[dirs.length-1];if(d){auto=[];step(...DV[d])}else if(auto.length){const c=auto.shift();step(c[0]-pl.x,c[1]-pl.y)}}
const c=mv&&now-mv.t>=STEP/2?[mv.tx,mv.ty]:[pl.x,pl.y];if(spk.some(s=>s.x===c[0]&&s.y===c[1]&&danger(s)))hurt();
if((AS()||P.son||now<gUntil)&&now>gcAt){gc=nextObj();gcAt=now+180}
if(P.son&&gc&&now>snAt){const n=gc.rt.length-1,nx=gc.rt[1];snAt=now+140+n*40;tone(320+Math.max(0,1-n/25)*800,.08,'triangle',.2,nx?Math.sign(nx[0]-pl.x)*.8:0,1)}}
/* DESENHO */
const ctr=o=>[o.x*T+T/2,o.y*T+T/2],COL=['#6dd8ff','#ffbd63','#cf8dff','#7dffb0','#ff8fa3'];
const pal=()=>{const h=LV[L][2];return P.hc?{f:'#000',f2:'#0a0a0a',w:'#fff',wt:'#fff',a:'#ffe600'}:{f:`hsl(${h} 30% 15%)`,f2:`hsl(${h} 30% 18%)`,w:`hsl(${h} 28% 32%)`,wt:`hsl(${h} 35% 46%)`,a:`hsl(${h} 90% 72%)`}};
function shp(sh,r){g.beginPath();if(sh===0)g.arc(0,0,r,0,7);else if(sh===1){g.moveTo(0,-r);g.lineTo(r,r*.85);g.lineTo(-r,r*.85);g.closePath()}else if(sh===2)g.rect(-r*.9,-r*.9,r*1.8,r*1.8);else if(sh===3){g.moveTo(0,-r*1.15);g.lineTo(r*1.05,0);g.lineTo(0,r*1.15);g.lineTo(-r*1.05,0);g.closePath()}else{for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,q=i%2?r*.5:r*1.1;g[i?'lineTo':'moveTo'](Math.cos(a)*q,Math.sin(a)*q)}g.closePath()}}
function draw(){const p=pal(),W=cv.width,H=cv.height,pr=mv?Math.min(1,(now-mv.t)/STEP):0,px=((mv?mv.fx+(mv.tx-mv.fx)*pr:pl.x)+.5)*T,py=((mv?mv.fy+(mv.ty-mv.fy)*pr:pl.y)+.5)*T;
g.clearRect(0,0,W,H);g.textAlign='center';g.textBaseline='middle';g.setLineDash([]);
for(let y=0;y<R;y++)for(let x=0;x<C;x++){if(G[y][x]){g.fillStyle=p.w;g.fillRect(x*T,y*T,T,T);if(y&&!G[y-1][x]){g.fillStyle=p.wt;g.fillRect(x*T,y*T,T,5)}g.strokeStyle='rgba(0,0,0,.25)';g.lineWidth=1;g.strokeRect(x*T+.5,y*T+.5,T-1,T-1)}else{g.fillStyle=(x+y)%2?p.f2:p.f;g.fillRect(x*T,y*T,T,T);if(y&&G[y-1][x]){g.fillStyle='rgba(0,0,0,.28)';g.fillRect(x*T,y*T,T,9)}}}
if(!P.rm){g.globalAlpha=.15;g.fillStyle=p.a;for(let i=0;i<26;i++)g.fillRect((i*173+now*.03)%W,(i*97+Math.sin(now/900+i)*20+H)%H,3,3);g.globalAlpha=1}
if((AS()||now<gUntil)&&gc){g.save();g.strokeStyle='#fff';g.globalAlpha=.7;g.lineWidth=4;g.setLineDash([12,10]);g.lineDashOffset=P.rm?0:-now/40;g.beginPath();g.moveTo(px,py);gc.rt.slice(1).forEach(([x,y])=>g.lineTo(x*T+T/2,y*T+T/2));g.stroke();g.restore();
const[bx,by]=ctr(gc.rt[gc.rt.length-1]);g.strokeStyle='#fff';g.lineWidth=3;g.beginPath();g.arc(bx,by,28+(P.rm?0:Math.sin(now/200)*4),0,7);g.stroke()}
if(gate){const[x,y]=ctr(gate);if(gate.open){g.fillStyle='rgba(255,255,255,.35)';g.fillRect(x-24,y-24,6,48);g.fillRect(x+18,y-24,6,48)}else{g.fillStyle='#c9d2ff';g.strokeStyle='#0b1020';g.lineWidth=2;for(let i=0;i<4;i++){g.fillRect(x-22+i*14,y-26,8,52);g.strokeRect(x-22+i*14,y-26,8,52)}g.font='20px serif';g.fillText('🚧',x,y)}}
{const[x,y]=ctr(door);g.save();g.shadowColor=door.open?'#43d9a0':'#5aa5ff';g.shadowBlur=P.rm?0:18;g.fillStyle=door.open?'#1f9a6a':'#2c5490';g.fillRect(x-22,y-25,44,50);g.restore();g.strokeStyle='#fff';g.lineWidth=3;g.strokeRect(x-22,y-25,44,50);g.font='22px serif';g.fillStyle='#fff';g.fillText(door.open?'🚪':'🔒',x,y-6);g.font='bold 11px system-ui';g.fillText('SAÍDA',x,y+17);
if(AS()||P.sym){g.setLineDash([6,5]);g.lineWidth=2;g.strokeRect(x-28,y-31,56,62);g.setLineDash([])}}
for(const s of spk){const[x,y]=ctr(s),d=danger(s),w=warn(s),h=d?22:w?(Math.floor(now/90)%2?11:5):0;g.globalAlpha=P.safe?.4:1;g.fillStyle='rgba(0,0,0,.4)';g.fillRect(x-24,y-24,48,48);g.strokeStyle='#ffd166';g.lineWidth=2;g.setLineDash([6,4]);g.strokeRect(x-24,y-24,48,48);g.setLineDash([]);
for(let i=0;i<3;i++){const sx=x-16+i*16;if(h){g.fillStyle=d?'#ff4d6d':'#ffd166';g.strokeStyle='#fff';g.beginPath();g.moveTo(sx-7,y+14);g.lineTo(sx,y+8-h);g.lineTo(sx+7,y+14);g.closePath();g.fill();g.stroke()}else{g.fillStyle='#000';g.beginPath();g.arc(sx,y+10,3.5,0,7);g.fill()}}g.globalAlpha=1}
for(const k of keys)if(!k.got){const[x,y]=ctr(k);g.save();g.globalAlpha=.25+(P.rm?0:Math.sin(now/300)*.1);g.fillStyle=p.a;g.beginPath();g.arc(x,y,24,0,7);g.fill();g.restore();g.font='30px serif';g.fillText('🔑',x,y+(P.rm?0:Math.sin(now/300+k.x)*3));if(P.sym||P.hc){g.strokeStyle='#fff';g.lineWidth=2;g.setLineDash([4,4]);g.beginPath();g.arc(x,y,25,0,7);g.stroke();g.setLineDash([])}}
const nxs=cnt(syms,'done')+1;
for(const s of syms)if(!s.done){const[x,y]=ctr(s),sh=(s.n-1)%5;g.save();g.translate(x,y);g.shadowColor='#fff';g.shadowBlur=P.rm?0:10;g.fillStyle=COL[sh];shp(sh,15);g.fill();g.shadowBlur=0;g.strokeStyle='#fff';g.lineWidth=P.hc||P.sym?4:3;g.stroke();
if(P.sym||P.hc){g.save();shp(sh,15);g.clip();g.strokeStyle='rgba(0,0,0,.5)';g.lineWidth=2;const t=sh%3;for(let i=-20;i<=20;i+=7){g.beginPath();if(t===0){g.moveTo(i-20,-20);g.lineTo(i+20,20)}else if(t===1){g.moveTo(-20,i);g.lineTo(20,i)}else{g.moveTo(i,-20);g.lineTo(i,20)}g.stroke()}g.restore()}
g.fillStyle='#0b1020';g.strokeStyle='#fff';g.lineWidth=3;g.font='bold 17px system-ui';g.strokeText(s.n,0,1);g.fillText(s.n,0,1);
if((AS()||P.sym)&&s.n===nxs){g.setLineDash([6,5]);g.lineWidth=2;g.beginPath();g.arc(0,0,26,0,7);g.stroke()}g.restore()}
for(const w of sws){const[x,y]=ctr(w);g.fillStyle=w.on?'#39d98a':'#e28a3b';g.strokeStyle='#fff';g.lineWidth=3;g.fillRect(x-18,y-14,36,28);g.strokeRect(x-18,y-14,36,28);g.fillStyle='#fff';g.beginPath();g.arc(x,y,6+(w.on||P.rm?0:Math.sin(now/200)*1.5),0,7);g.fill();g.fillStyle='#10192b';g.font='bold 12px system-ui';g.fillText(w.on?'✓':'!',x,y+1)}
if(now<inv&&Math.floor(now/110)%2)g.globalAlpha=.35;
g.fillStyle='rgba(0,0,0,.3)';g.beginPath();g.ellipse(px,py+16,15,6,0,0,7);g.fill();
g.save();g.shadowColor='#64b5ff';g.shadowBlur=P.rm?0:16;g.fillStyle='#64b5ff';g.beginPath();g.arc(px,py,19,0,7);g.fill();g.restore();g.strokeStyle='#fff';g.lineWidth=P.hc?4:3;g.stroke();
g.fillStyle='#07101c';[-6,6].forEach(o=>{g.beginPath();g.arc(px+o+pl.fx*2.5,py-3+pl.fy*2.5,3,0,7);g.fill()});
if(AS()){g.lineWidth=2;g.beginPath();g.arc(px,py,26,0,7);g.stroke()}g.globalAlpha=1}
function loop(t){const dt=Math.min(50,t-last);last=t;if(run==='play')gt+=dt;now=gt;try{upd();if(G.length&&run!=='menu'&&run!=='end')draw()}catch(e){console.error(e)}requestAnimationFrame(loop)}
/* INTERFACE */
function show(id){['menu','game','end'].forEach(s=>$(s).classList.toggle('on',s===id));const h=$(id).querySelector('h1,h2');h.tabIndex=-1;h.focus({preventScroll:true})}
function modal(id,on){const m=$(id),sp=id==='acc'||id==='snd';if(sp&&on&&run==='play'){run='pause';resume=1}m.classList.toggle('on',!!on);if(sp&&!on&&resume&&!document.querySelector('#acc.on,#snd.on')){run='play';resume=0}if(on){opener=document.activeElement;m.querySelector('button').focus()}else if(opener&&opener.isConnected)opener.focus()}
function pause(on){if(on&&run!=='play'||!on&&run!=='pause')return;run=on?'pause':'play';auto=[];dirs=[];modal('pause',on)}
const fs=()=>{try{document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen()}catch(e){}};
function buildOpts(){OPTS.forEach(([k,t,v,d])=>{const b=document.createElement('button');b.className='opt';b.setAttribute('role','switch');b.dataset.k=k;b.innerHTML=`<span><b>${t}</b><small>${d}</small></span><em></em>`;
b.onclick=()=>{P[k]=Array.isArray(v)?(P[k]+1)%v.length:+!P[k];apply();save('mi-p',JSON.stringify(P));if((k==='snd'||k==='vol')&&P.snd)sfx('key');if(k==='dif')say('🎚️ Dificuldade: '+v[P[k]]+'. Vale a partir da próxima fase ou ao reiniciar.');if(k==='nar'&&P.nar)say('Narração ativada.');if(k==='voz'&&P.voz&&(!AN||SS.some(a=>a.length<3)))modal('snd',1);if(k==='son'&&P.son){initAudio();tone(700,.1,'triangle',.2,0,1)}};$('opts').append(b)})}
function apply(){document.documentElement.style.fontSize=[100,125,150][P.ts]+'%';document.body.classList.toggle('hc',!!P.hc);document.body.classList.toggle('rm',!!P.rm);
OPTS.forEach(([k,,v])=>{const b=document.querySelector(`.opt[data-k=${k}]`),on=Array.isArray(v)?P[k]>0:!!P[k];b.setAttribute('aria-checked',on);b.classList.toggle('on',on);b.classList.toggle('on',k==='dif'||on);b.lastChild.textContent=Array.isArray(v)?v[P[k]]:on?'Ativado':'Desativado'});$('dif').value=P.dif;if(G.length&&door.open!==undefined)hud()}
/* CONTROLE POR SONS: aprende os sons do próprio jogador (sem internet) */
const SA=['🚶 Andar até o objetivo','✋ Parar','💡 Dica'],NB=24;let SS=[[],[],[]],AN,td,fd,ed=[],thr=.03,rec=null,recT=0,sg=null,qt=0,cal=null,rig=.88;
try{SS=JSON.parse(localStorage.getItem('mi-snd'))||SS;rig=+localStorage.getItem('mi-rig')||rig}catch(e){}
const sm=t=>$('mst').textContent=t,ssave=()=>save('mi-snd',JSON.stringify(SS)),norm=v=>{const mu=v.reduce((a,b)=>a+b)/v.length,c=v.map(x=>x-mu),n=Math.hypot(...c)||1;return c.map(x=>x/n)},sim=(a,b)=>a.reduce((t,x,i)=>t+x*b[i],0);
function mrender(){$('mcards').innerHTML=SA.map((n,i)=>`<div class="sc"><b>${n}</b><span class="dots" aria-label="${SS[i].length} exemplos">${'●'.repeat(SS[i].length)||'—'}</span><span class="row"><button class="b" data-r="${i}" ${AN?'':'disabled'}>⏺ Gravar</button><button class="b" data-c="${i}" aria-label="Apagar sons de ${n}">🗑</button></span></div>`).join('')}
$('mcards').onclick=e=>{const r=e.target.closest('[data-r]'),c=e.target.closest('[data-c]');if(r){rec=+r.dataset.r;recT=Date.now();sm('🔴 Gravando "'+SA[rec]+'": faça o som agora, uma vez.')}if(c){SS[+c.dataset.c]=[];ssave();mrender()}};
async function startMic(){if(AN)return;try{const st=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:false}}),ac=new AudioContext(),src=ac.createMediaStreamSource(st);
AN=ac.createAnalyser();AN.fftSize=1024;AN.smoothingTimeConstant=0;src.connect(AN);td=new Float32Array(1024);fd=new Uint8Array(512);const bw=ac.sampleRate/1024;
for(let i=0;i<=NB;i++)ed[i]=Math.max((ed[i-1]??0)+1,Math.round(120*Math.pow(50,i/NB)/bw));
$('mic').textContent='🎤 Microfone ativo';$('mcal').disabled=false;mrender();vcal();setInterval(vtick,40)}
catch(e){AN=null;sm('⚠️ Não consegui usar o microfone ('+(e.name||'erro')+'). Abra o jogo direto no navegador (arquivo baixado) e permita o microfone.')}}
function vcal(){cal={n:0,m:0};sm('🔇 Calibrando… fique em silêncio por 1 segundo.')}
function vtick(){AN.getFloatTimeDomainData(td);let t=0;for(const v of td)t+=v*v;const r=Math.sqrt(t/td.length);$('mlv').style.width=Math.min(100,r*400)+'%';
if(rec!==null&&Date.now()-recT>8000){rec=null;sm('Tempo esgotado. Toque em Gravar para tentar de novo.')}
if(cal){cal.m=Math.max(cal.m,r);if(++cal.n>=25){thr=Math.max(.02,cal.m*2.2);cal=null;sm('✅ Pronto. Grave os exemplos de cada som.')}return}
AN.getByteFrequencyData(fd);const b=[];for(let i=0;i<NB;i++){let a=0,c=0;for(let j=ed[i];j<ed[i+1];j++){a+=fd[j];c++}b.push(a/Math.max(1,c))}
if(r>thr){qt=0;(sg=sg||{f:[]}).f.push(b);if(sg.f.length>=30)vend()}else if(sg&&++qt>=4)vend()}
function vend(){const q=sg;sg=null;qt=0;if(q.f.length<2)return;const m=Array(NB).fill(0);q.f.forEach(f=>f.forEach((v,i)=>m[i]+=v/q.f.length));const v=norm(m);
if(rec!==null){SS[rec].push(v);ssave();rec=null;mrender();sm('✅ Exemplo gravado! Grave de 3 a 5 de cada som.');return}
const inM=$('snd').classList.contains('on');if(!inM&&!(P.voz&&run==='play'))return;
const sc=SS.map(a=>{if(a.length<2)return -1;const z=a.map(x=>sim(x,v)).sort((x,y)=>y-x);return(z[0]+z[1])/2}),o=sc.map((x,i)=>[x,i]).sort((a,b)=>b[0]-a[0]),ok=o[0][0]>=rig&&o[0][0]-o[1][0]>=.03;
if(inM)sm(ok?'👂 Reconheci: '+SA[o[0][1]]:'🤔 Não reconheci ('+Math.round(Math.max(0,o[0][0])*100)+'%). Tente de novo ou baixe o rigor.');else if(ok)vact(o[0][1])}
function vact(i){if(i===0){const b=nextObj();if(b&&b.rt.length>1){dirs=[];auto=b.rt.slice(1);say('🚶 Indo até '+b.n+'.')}else say('Nada para buscar agora.')}else if(i===1){auto=[];say('✋ Parou.')}else hint()}
$('sb').onclick=()=>modal('snd',1);$('sx').onclick=()=>modal('snd',0);$('mic').onclick=startMic;$('mcal').onclick=vcal;
$('mrig').value=rig*100;$('mrv').textContent=Math.round(rig*100);$('mrig').oninput=()=>{rig=$('mrig').value/100;$('mrv').textContent=$('mrig').value;save('mi-rig',rig)};mrender();
/* ENTRADAS */
addEventListener('keydown',e=>{const k=e.key.toLowerCase(),d=KM[k];
if(k==='tab'){const ms=document.querySelectorAll('.modal.on'),m=ms[ms.length-1];if(m){const f=[...m.querySelectorAll('button')],a=document.activeElement;if(e.shiftKey&&a===f[0]){e.preventDefault();f[f.length-1].focus()}else if(!e.shiftKey&&a===f[f.length-1]){e.preventDefault();f[0].focus()}}return}
if(k==='escape'){if($('snd').classList.contains('on'))modal('snd',0);else if($('acc').classList.contains('on'))modal('acc',0);else if(run==='play')pause(1);else if(run==='pause')pause(0);return}
if(run!=='play')return;
if(d){e.preventDefault();if(!dirs.includes(d))dirs.push(d);initAudio()}else if(k==='h')hint();else if(k==='e')status();else if(k==='p')pause(1)});
addEventListener('keyup',e=>{const d=KM[e.key.toLowerCase()];if(d)dirs=dirs.filter(x=>x!==d)});
addEventListener('blur',()=>dirs=[]);
document.querySelectorAll('[data-d]').forEach(b=>{const d=b.dataset.d,off=()=>{dirs=dirs.filter(x=>x!==d)};b.style.touchAction='none';
b.addEventListener('pointerdown',e=>{e.preventDefault();initAudio();if(!dirs.includes(d))dirs.push(d)});['pointerup','pointercancel','pointerleave'].forEach(t=>b.addEventListener(t,off));
b.addEventListener('click',e=>{if(e.detail===0){dirs.push(d);setTimeout(off,60)}})});
cv.addEventListener('pointerdown',e=>{initAudio();if(!P.tap||run!=='play')return;const b=cv.getBoundingClientRect(),x=Math.floor((e.clientX-b.left)/b.width*C),y=Math.floor((e.clientY-b.top)/b.height*R),rt=open(x,y)?route(x,y):null;
if(x===door.x&&y===door.y&&!door.open){sfx('lock');return say('🔒 A saída está bloqueada. Falta: '+missing()+'.')}
if(rt&&rt.length>1){dirs=[];auto=rt.slice(1)}else say(rt?'Você já está aqui.':'🚫 Não há caminho até esse ponto.')});
document.querySelectorAll('[data-o]').forEach(b=>b.onclick=()=>modal('acc',1));document.querySelectorAll('[data-fs]').forEach(b=>b.onclick=fs);
$('play').onclick=()=>{hints=0;hurts=0;initAudio();P.voz&&!AN&&startMic();sfx('start');show('game');load(+$('sel').value)};
$('again').onclick=()=>{hints=0;hurts=0;show('game');load(0)};
$('hb').onclick=hint;$('pb').onclick=()=>pause(1);$('rb').onclick=()=>run==='play'&&load(L);
$('px').onclick=$('pc').onclick=()=>pause(0);$('ax').onclick=()=>modal('acc',0);$('pr').onclick=()=>{pause(0);load(L)};
$('pm').onclick=()=>{stopSpeech();run='menu';modal('pause',0);$('sel').value=best;show('menu')};
$('sel').innerHTML=LV.map((l,i)=>`<option value="${i}">${i+1}. ${l[1]}</option>`).join('');$('sel').value=best;
$('dif').onchange=()=>{P.dif=+$('dif').value;save('mi-p',JSON.stringify(P));apply()};
buildOpts();apply();requestAnimationFrame(loop);
