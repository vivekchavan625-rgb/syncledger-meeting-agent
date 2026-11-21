const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const day=n=>new Date(Date.now()+n*864e5).toISOString().slice(0,10);
const STAGES=['Idle','Capture','Extract','Memory check','Conflict guard','Human gate','Execution','Complete'];
const PRE={
sprint:['Sprint Planning Sync',()=>`Alice: Decision: Sprint demo moves to Thursday review\nBob: Action: Prepare demo environment | owner:bob | deadline:${day(2)}\nCarol: Action: Write release notes | owner:carol | deadline:${day(4)}\nAlice: Action: Fix timeout bug | owner:alice | deadline:${day(3)}`],
conflict:['Launch and Auth Review',()=>`Bob: Decision: Move the launch to Monday to finish testing\nCarol: Decision: Switch authentication to email and password login instead of SSO\nAlice: Action: Update the launch plan for Monday | owner:alice | deadline:${day(1)}\nBob: Action: Replace SSO with password login | owner:bob | deadline:${day(3)}`],
messy:['Messy Standup',()=>`Alice: ok so umm quick thing\nBob: Decision: Freeze new features after Wednesday\nCarol: Action: Fix payment bug | owner:carol\nBob: Action: Check analytics numbers\nAlice: Action: Book the demo room | owner:alice | deadline:${day(5)}`]};
let S={meetings:[],tasks:[],reminders:[],weeklyDigests:{},stagedBatch:null},res={},sel=new Set(),spk=['Alice','Bob','Carol'],cur=0,stage=0,dig='',rec,listening=false,stream,actx;
const pill=(s,t,k='')=>{const e=$(s);e.className='pill '+k;e.innerHTML='<i></i>'+t};
const toast=(m,k='')=>{const d=document.createElement('div');d.className='toast '+k;d.textContent=m;$('#toasts').append(d);setTimeout(()=>d.remove(),3600)};
const setStage=n=>{stage=n;$$('.step').forEach((e,i)=>{e.classList.toggle('done',i+1<n);e.classList.toggle('act',i+1===n)});pill('#pStage','Stage: '+STAGES[n],n&&n<7?'live':n?'ok':'')};
async function api(p,o){const r=await fetch(p,o&&{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(o)});const t=await r.text();let j={};try{j=t?JSON.parse(t):{}}catch{}if(!r.ok)throw new Error(j.error||'HTTP '+r.status);return j}
const T=[['Launch date',/launch|release|go[- ]?live/i,/(?:mon|tues|wednes|thurs|fri|satur|sun)day|\d{4}-\d{2}-\d{2}/gi],['Authentication',/oauth|sso|auth|login|password|sign[- ]?in/i,/oauth|sso|google|password|magic link|otp|saml/gi]];
const keys=(t,r)=>[...new Set((t.match(r)||[]).map(x=>x.toLowerCase()))].sort().join();
function conflicts(){const b=S.stagedBatch;if(!b)return[];const past=S.meetings.flatMap(m=>m.decisions.map(d=>({...d,meeting:m.title,date:m.date}))),out=[];
for(const n of b.decisions)for(const[name,t,k]of T){if(!t.test(n.text))continue;const nk=keys(n.text,k);if(!nk)continue;const p=past.find(p=>t.test(p.text)&&keys(p.text,k)&&keys(p.text,k)!==nk);if(p){out.push({n,p,name});break}}return out}
const dd=d=>Math.round((new Date(d)-new Date(day(0)))/864e5);
const urg=d=>{const x=dd(d);return x<0?'r':x<=3?'a':'g'};
const when=d=>{const x=dd(d);return x<0?`Overdue by ${-x}d`:x===0?'Due today':`Due in ${x}d`};
const ini=n=>esc(String(n||'?').slice(0,2).toUpperCase());
const rems=()=>S.tasks.filter(t=>!t.completed&&dd(t.deadline)<=3).sort((a,b)=>a.deadline<b.deadline?-1:1);
const empty=t=>`<li class="empty">${t}</li>`;
const owners=()=>[...new Set([...Object.keys(S.weeklyDigests||{}),...S.tasks.map(t=>t.owner)].map(o=>String(o).toLowerCase()))];
const digText=o=>`Weekly digest - ${o}\n`+(S.tasks.filter(t=>String(t.owner).toLowerCase()===o).map(t=>`- ${t.title} (due ${t.deadline})`).join('\n')||'- No open tasks');
function render(){
const c=conflicts(),open=c.filter(x=>!res[x.n.id]).length,b=S.stagedBatch;
$('#kM').textContent=S.meetings.length;$('#kT').textContent=S.tasks.length;$('#kC').textContent=open;$('#kD').textContent=rems().length;
$('#bR').textContent=open;$('#bR').hidden=!open;$('#bT').textContent=S.tasks.length;$('#bT').hidden=!S.tasks.length;
$('#rev').hidden=!b;$('#revEmpty').hidden=!!b;
if(b){const cid=new Set(c.map(x=>x.n.id));
$('#cfs').innerHTML=c.map(x=>`<article class="cf"><h4>${esc(x.name)} conflict</h4><div class="vs"><div><small>Past Decision - ${esc(x.p.meeting)} (${esc(x.p.date)})</small><p>${esc(x.p.text)}</p></div><div><small>New Proposal</small><p>${esc(x.n.text)}</p></div></div><div class="acts"><button class="btn ${res[x.n.id]==='keep_past'?'on':'ghost'}" data-r="keep_past" data-id="${esc(x.n.id)}">Keep Past</button><button class="btn ${res[x.n.id]==='accept_new'?'on':'ghost'}" data-r="accept_new" data-id="${esc(x.n.id)}">Accept New</button></div></article>`).join('')||'<p class="empty">No conflicts with past decisions.</p>';
$('#decs').innerHTML=b.decisions.filter(d=>!cid.has(d.id)).map(d=>`<li class="row">${esc(d.text)}</li>`).join('')||empty('No other decisions found');
$('#acts').innerHTML=b.actions.map(a=>`<li><label class="row"><input type="checkbox" style="width:auto" data-t="${esc(a.id)}" ${sel.has(a.id)?'checked':''}><span class="av">${ini(a.owner)}</span><b>${esc(a.title)}</b><em>${esc(a.owner)}</em><span class="chip ${urg(a.deadline)}">${esc(a.deadline)}</span></label></li>`).join('')||empty('No action items found');
$('#confirm').disabled=open>0;$('#lock').textContent=open?`Resolve ${open} conflict${open>1?'s':''} to unlock Confirm & Post`:'Ready to post'}
$('#tl').innerHTML=S.tasks.map(t=>`<li class="row"><span class="av">${ini(t.owner)}</span><b>${esc(t.title)}</b><em>${esc(t.owner)}</em><span class="chip ${urg(t.deadline)}">${esc(t.deadline)}</span></li>`).join('')||empty('No tasks yet. Try a sample meeting.');
$('#rl').innerHTML=rems().map(t=>`<li class="row"><span class="av">${ini(t.owner)}</span><b>${esc(t.title)}</b><span class="chip ${urg(t.deadline)}">${when(t.deadline)}</span></li>`).join('')||empty('No deadlines in the next 3 days.');
const os=owners();if(!os.includes(dig))dig=os[0]||'';
$('#dt').innerHTML=os.map(o=>`<button class="btn ${o===dig?'on':'ghost'} sm" data-d="${esc(o)}">${esc(o)}</button>`).join('');
$('#dp').textContent=dig?digText(dig):'No digests yet. Confirm a meeting to create one.';
$('#ml').innerHTML=[...S.meetings].reverse().map(m=>`<li class="tl"><b>${esc(m.title)}</b><small>${esc(m.date)} - ${m.tasks.length} task${m.tasks.length===1?'':'s'}</small>${m.decisions.map(d=>`<p>${esc(d.text)}</p>`).join('')}</li>`).join('')||empty('No meetings yet.')}
async function load(){try{S=await api('/api/state');$('#banner').hidden=true;pill('#pBack','Backend: Online','ok')}catch(e){pill('#pBack','Backend: Offline','bad');$('#banner').hidden=false;$('#bmsg').textContent='Could not load /api/state: '+e.message}render()}
const norm=t=>t.split(/\r?\n/).map(l=>{l=l.trim();const m=l.match(/^([A-Za-z][\w .'-]{0,24}):\s*(.*)$/);if(!m)return l;let[,sp,x]=m;if(/^(decision|action)$/i.test(sp))return l;x=x.replace(/^(?:we )?(?:decided|decision)\b[:,\s-]*/i,'Decision: ').replace(/^action\b[:,\s-]*/i,'Action: ');return /^decision:/i.test(x)?x+' ('+sp+')':/^action:/i.test(x)?x:''}).filter(Boolean).join('\n');
const loadPre=k=>{$('#title').value=PRE[k][0];$('#tx').value=PRE[k][1]();setStage(1);toast('Sample loaded. Press Analyze Meeting.')};
function spkRender(){$('#spk').innerHTML=spk.map((s,i)=>`<button class="btn ${i===cur?'on':'ghost'}" data-sp="${i}">${i+1}. ${esc(s)}</button>`).join('')+'<button class="btn ghost" data-sp="add" aria-label="Add speaker">+</button>'}
const add=l=>{const t=$('#tx');t.value+=(t.value&&!t.value.endsWith('\n')?'\n':'')+l+'\n';if(stage<2)setStage(1)};
function stopMic(){listening=false;try{rec&&rec.stop()}catch{}stream&&stream.getTracks().forEach(t=>t.stop());actx&&actx.close().catch(()=>{});stream=actx=null;$('#orb').classList.remove('on');$('#orb').style.setProperty('--lvl',0);$('#interim').textContent='';pill('#pMic','Mic: Idle')}
async function level(){try{stream=await navigator.mediaDevices.getUserMedia({audio:true});actx=new AudioContext();const an=actx.createAnalyser();an.fftSize=256;actx.createMediaStreamSource(stream).connect(an);const d=new Uint8Array(an.frequencyBinCount);(function f(){if(!listening)return;an.getByteFrequencyData(d);$('#orb').style.setProperty('--lvl',Math.min(d.reduce((a,b)=>a+b,0)/d.length/100,1));requestAnimationFrame(f)})()}catch{}}
function initMic(){const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
if(!SR){pill('#pMic','Mic: Unsupported','bad');$('#micmsg').textContent='Voice capture needs Chrome or Edge. You can still type or use a sample meeting.';$('#orb').classList.add('off');return}
rec=new SR();rec.continuous=true;rec.interimResults=true;
rec.onresult=e=>{let i='';for(let k=e.resultIndex;k<e.results.length;k++){const r=e.results[k];if(r.isFinal){const t=r[0].transcript.trim();if(t)add(spk[cur]+': '+t)}else i+=r[0].transcript}$('#interim').textContent=i};
rec.onerror=e=>{if(e.error==='not-allowed'||e.error==='service-not-allowed'){stopMic();toast('Microphone permission was denied. Allow it in the address bar.','bad')}};
rec.onend=()=>{if(listening)try{rec.start()}catch{}};
$('#orb').onclick=()=>{if(listening)return stopMic();listening=true;rec.lang=$('#lang').value;try{rec.start()}catch{}$('#orb').classList.add('on');pill('#pMic','Mic: Listening','live');$('#micmsg').textContent='Listening as '+spk[cur]+'. Tap the orb to stop.';level()}}
const ow=$('#orbwrap');ow.onpointermove=e=>{const r=ow.getBoundingClientRect();ow.style.setProperty('--ry',((e.clientX-r.left)/r.width-.5)*26+'deg');ow.style.setProperty('--rx',(.5-(e.clientY-r.top)/r.height)*26+'deg')};
ow.onpointerleave=()=>{ow.style.setProperty('--rx','0deg');ow.style.setProperty('--ry','0deg')};
document.addEventListener('click',e=>{const t=e.target.closest('button,a');if(!t)return;
if(t.dataset.r){res[t.dataset.id]=t.dataset.r;render()}
else if(t.dataset.p){loadPre(t.dataset.p);document.getElementById('capture').scrollIntoView()}
else if(t.dataset.sp){if(t.dataset.sp==='add'){const n=(prompt('Speaker name')||'').trim();if(n&&spk.length<9){spk.push(n);cur=spk.length-1}}else cur=+t.dataset.sp;spkRender()}
else if(t.dataset.d){dig=t.dataset.d;render()}
else if(t.dataset.v){view(t.dataset.v)}
else if(t.id==='burger'){const o=$('#nav').classList.toggle('open');t.setAttribute('aria-expanded',o)}
else if(t.closest('#nav')){$('#nav').classList.remove('open');const h=t.hash.slice(1);if(VIEWS.includes(h))view(h)}});
document.addEventListener('change',e=>{if(e.target.dataset.t){e.target.checked?sel.add(e.target.dataset.t):sel.delete(e.target.dataset.t)}});
document.addEventListener('keydown',e=>{if(e.key==='Escape')$('#nav').classList.remove('open');if(/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)||e.ctrlKey||e.metaKey)return;const n=+e.key;if(n>=1&&n<=spk.length){cur=n-1;spkRender()}});
$('#tx').addEventListener('input',()=>{if(stage<2)setStage($('#tx').value?1:0)});
$('#retry').onclick=load;
$('#all').onclick=()=>{sel=new Set(S.stagedBatch.actions.map(a=>a.id));render()};
$('#none').onclick=()=>{sel.clear();render()};
$('#copy').onclick=()=>dig?navigator.clipboard.writeText(digText(dig)).then(()=>toast('Digest copied','ok'),()=>toast('Copy failed','bad')):toast('No digest to copy','bad');
$('#analyze').onclick=async()=>{const title=$('#title').value.trim(),tx=norm($('#tx').value);if(!title||!tx.trim())return toast('Add a meeting title and at least one Decision: or Action: line.','bad');
setStage(2);try{const r=await api('/api/analyze',{meetingTitle:title,transcript:tx});S.stagedBatch=r.stagedBatch;sel=new Set(S.stagedBatch.actions.map(a=>a.id));res={};for(const n of [2,3,4]){setStage(n);await new Promise(r=>setTimeout(r,450))}setStage(5);render();if(!S.stagedBatch.decisions.length&&!S.stagedBatch.actions.length)toast('Nothing was extracted from the transcript.','bad');document.getElementById('review').scrollIntoView()}catch(e){setStage(1);toast('Analyze failed: '+e.message,'bad')}};
$('#confirm').onclick=()=>{$('#dsum').textContent=`${sel.size} action item${sel.size===1?'':'s'} will be added to the tracker, and decisions saved to memory.`;$('#dlg').showModal()};
$('#dno').onclick=()=>$('#dlg').close();
$('#dyes').onclick=async()=>{$('#dlg').close();setStage(6);try{await api('/api/confirm',{approvedTaskIds:[...sel],conflictResolutions:res});res={};sel.clear();setStage(7);await load();toast('Posted to tracker','ok');view('tasks');document.getElementById('tasks').scrollIntoView()}catch(e){setStage(5);toast('Confirm failed: '+e.message,'bad')}};
$('#reset').onclick=async()=>{if(!confirm('Reset demo data to the seeded state?'))return;try{await api('/api/reset-demo',{});res={};sel.clear();$('#tx').value='';$('#title').value='';setStage(0);await load();toast('Demo reset','ok')}catch(e){toast('Reset failed: '+e.message,'bad')}};
const io=new IntersectionObserver(es=>es.forEach(x=>{if(x.isIntersecting)$$('#nav a').forEach(a=>a.classList.toggle('on',a.hash==='#'+x.target.id))}),{rootMargin:'-45% 0px -50% 0px'});
['overview','capture','pipeline','review','tasks','reminders','digests','memory'].forEach(id=>io.observe(document.getElementById(id)));
const VIEWS=['tasks','reminders','digests','memory'],VN={tasks:'Tracker tasks',reminders:'Reminders',digests:'Weekly digest',memory:'Memory'};
function view(id){VIEWS.forEach(v=>document.getElementById(v).hidden=v!==id);$$('#wt button').forEach(b=>{const on=b.dataset.v===id;b.classList.toggle('on',on);b.classList.toggle('ghost',!on)})}
const wt=document.createElement('div');wt.id='wt';wt.className='tabs';wt.innerHTML=VIEWS.map(v=>`<button class="btn ghost" data-v="${v}">${VN[v]}</button>`).join('');
document.getElementById('tasks').before(wt);
view(VIEWS.includes(location.hash.slice(1))?location.hash.slice(1):'tasks');
spkRender();initMic();setStage(0);
load().then(()=>{if(S.stagedBatch){sel=new Set(S.stagedBatch.actions.map(a=>a.id));setStage(5);render()}});
