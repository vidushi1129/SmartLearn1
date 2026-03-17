// ═══════════════════════════════════════════════════════════
// PathForge – Frontend (connects to Python smart backend)
// Backend must be running on http://localhost:3001
// ═══════════════════════════════════════════════════════════

const API = 'http://localhost:3001/api';

var APP = {
  token: localStorage.getItem('pf_token') || null,
  user: null,
  careers: [],
  roadmap: [],
  courses: [],
  market: null,
  skillGaps: { have:[], need:[], learning:[] },
  compareList: [],
  skillStates: {},
  charts: {},
  topCareerId: 1
};

// ─────────────────────────────────────────
// API HELPER
// ─────────────────────────────────────────
async function api(path, opts) {
  opts = opts || {};
  const headers = { 'Content-Type': 'application/json' };
  if (APP.token) headers['Authorization'] = 'Bearer ' + APP.token;
  const res = await fetch(API + path, { ...opts, headers: { ...headers, ...(opts.headers||{}) } });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

// ─────────────────────────────────────────
// CURSOR
// ─────────────────────────────────────────
var cur  = document.getElementById('cursor');
var ring = document.getElementById('cursor-ring');
var cx = innerWidth/2, cy = innerHeight/2, rx = cx, ry = cy;

document.addEventListener('mousemove', function(e){ cx=e.clientX; cy=e.clientY; cur.style.left=cx+'px'; cur.style.top=cy+'px'; });
(function animRing(){ rx+=(cx-rx)*0.12; ry+=(cy-ry)*0.12; ring.style.left=rx+'px'; ring.style.top=ry+'px'; requestAnimationFrame(animRing); })();
document.addEventListener('mousedown', function(){ cur.style.width='8px'; cur.style.height='8px'; ring.style.width='48px'; ring.style.height='48px'; });
document.addEventListener('mouseup',   function(){ cur.style.width='12px'; cur.style.height='12px'; ring.style.width='36px'; ring.style.height='36px'; });

// ─────────────────────────────────────────
// PARTICLES
// ─────────────────────────────────────────
(function(){
  var canvas=document.getElementById('particle-canvas');
  var ctx=canvas.getContext('2d');
  var W=canvas.width=innerWidth, H=canvas.height=innerHeight;
  window.addEventListener('resize',function(){ W=canvas.width=innerWidth; H=canvas.height=innerHeight; });
  var mouse={x:W/2,y:H/2,px:W/2,py:H/2};
  var lastSpawn=0, sparkAccum=0, glowA=0, frame=0;
  var BC=[[244,185,66],[124,111,255],[92,225,200],[77,216,154],[255,140,100],[255,200,80]];
  var SC=[[255,230,120],[200,180,255],[160,255,220],[255,255,255]];
  var ambient=[], trail=[], sparks=[];
  function rnd(a,b){return a+Math.random()*(b-a);}
  function rc(arr){return arr[Math.floor(Math.random()*arr.length)];}
  function mkA(){return{x:rnd(0,W),y:rnd(0,H),r:rnd(4,20),vx:rnd(-0.3,0.3),vy:-rnd(0.12,0.55),alpha:rnd(0.06,0.22),col:rc(BC),phase:rnd(0,Math.PI*2),wob:rnd(0.005,0.03),hollow:Math.random()<0.4};}
  for(var i=0;i<30;i++) ambient.push(mkA());
  window.addEventListener('mousemove',function(e){
    mouse.px=mouse.x; mouse.py=mouse.y; mouse.x=e.clientX; mouse.y=e.clientY;
    var dx=mouse.x-mouse.px,dy=mouse.y-mouse.py,spd=Math.sqrt(dx*dx+dy*dy),now=performance.now();
    if(spd>2&&now-lastSpawn>28){var n=Math.min(4,Math.floor(spd/7)+1);for(var k=0;k<n;k++){var col=rc(BC),ang=rnd(0,Math.PI*2),sp=Math.min(spd*0.35,3.2);trail.push({x:mouse.x,y:mouse.y,vx:Math.cos(ang)*sp*0.5+rnd(-1,1),vy:Math.sin(ang)*sp*0.5-rnd(0.4,2),r:rnd(3,12),alpha:rnd(0.3,0.7),life:1,decay:rnd(0.01,0.022),col:col,phase:rnd(0,Math.PI*2),wob:rnd(0.02,0.07),hollow:Math.random()<0.4});}lastSpawn=now;}
    sparkAccum+=spd;
    if(sparkAccum>70){var sn=Math.min(6,Math.floor(sparkAccum/45));for(var sk=0;sk<sn;sk++){var sang=rnd(0,Math.PI*2);sparks.push({x:mouse.x+rnd(-20,20),y:mouse.y+rnd(-20,20),vx:Math.cos(sang)*rnd(0.5,2.2),vy:Math.sin(sang)*rnd(0.5,2.2)-rnd(0.2,1),size:rnd(2,6),alpha:1,life:1,decay:rnd(0.018,0.03),rot:rnd(0,Math.PI),rotspd:rnd(-0.12,0.12),col:rc(SC),star:Math.random()<0.55});}sparkAccum=0;}
    glowA=Math.min(1,glowA+spd*0.035);
  });
  function drawB(b,t){if(b.alpha<=0||b.r<=0)return;var wx=b.x+Math.sin(t*b.wob+b.phase)*b.r*0.55,cr=b.col[0],cg=b.col[1],cb=b.col[2],al=(b.life===undefined?1:b.life)*b.alpha;if(al<=0)return;ctx.save();ctx.globalAlpha=al;if(b.hollow){ctx.beginPath();ctx.arc(wx,b.y,b.r,0,Math.PI*2);ctx.strokeStyle='rgb('+cr+','+cg+','+cb+')';ctx.lineWidth=1.2;ctx.stroke();ctx.beginPath();ctx.arc(wx-b.r*.28,b.y-b.r*.28,b.r*.18,0,Math.PI*2);ctx.fillStyle='rgba(255,255,255,0.45)';ctx.fill();}else{ctx.beginPath();ctx.arc(wx,b.y,b.r,0,Math.PI*2);ctx.fillStyle='rgba('+cr+','+cg+','+cb+',0.22)';ctx.fill();ctx.beginPath();ctx.arc(wx,b.y,b.r*.6,0,Math.PI*2);ctx.fillStyle='rgba('+cr+','+cg+','+cb+',0.14)';ctx.fill();ctx.beginPath();ctx.arc(wx-b.r*.3,b.y-b.r*.3,b.r*.24,0,Math.PI*2);ctx.fillStyle='rgba(255,255,255,0.38)';ctx.fill();ctx.beginPath();ctx.arc(wx,b.y,b.r,0,Math.PI*2);ctx.strokeStyle='rgba('+cr+','+cg+','+cb+',0.55)';ctx.lineWidth=0.8;ctx.stroke();}ctx.restore();}
  function drawS(sp){ctx.save();ctx.translate(sp.x,sp.y);ctx.rotate(sp.rot);ctx.globalAlpha=sp.alpha;ctx.strokeStyle='rgb('+sp.col[0]+','+sp.col[1]+','+sp.col[2]+')';ctx.lineWidth=1.6;ctx.lineCap='round';var s=sp.size;if(sp.star){for(var i=0;i<4;i++){ctx.save();ctx.rotate(i*Math.PI/2);ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,-s);ctx.stroke();ctx.restore();}for(var i=0;i<4;i++){ctx.save();ctx.rotate(i*Math.PI/2+Math.PI/4);ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,-s*.5);ctx.stroke();ctx.restore();}}else{ctx.beginPath();ctx.moveTo(-s,0);ctx.lineTo(s,0);ctx.stroke();ctx.beginPath();ctx.moveTo(0,-s);ctx.lineTo(0,s);ctx.stroke();}ctx.restore();}
  function tick(){ctx.clearRect(0,0,W,H);frame++;var t=frame*.5;if(glowA>0.005){var grd=ctx.createRadialGradient(mouse.x,mouse.y,0,mouse.x,mouse.y,90);grd.addColorStop(0,'rgba(244,185,66,'+(0.13*glowA)+')');grd.addColorStop(0.45,'rgba(124,111,255,'+(0.055*glowA)+')');grd.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=grd;ctx.beginPath();ctx.arc(mouse.x,mouse.y,90,0,Math.PI*2);ctx.fill();ctx.save();ctx.globalAlpha=0.28*glowA;ctx.strokeStyle='rgba(244,185,66,0.7)';ctx.lineWidth=1;ctx.beginPath();ctx.arc(mouse.x,mouse.y,20,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=0.14*glowA;ctx.beginPath();ctx.arc(mouse.x,mouse.y,36,0,Math.PI*2);ctx.stroke();ctx.restore();glowA*=0.93;}
    for(var i=0;i<ambient.length;i++){var b=ambient[i];b.x+=b.vx+Math.sin(t*b.wob+b.phase)*.3;b.y+=b.vy;if(b.y+b.r<0||b.x<-b.r*2||b.x>W+b.r*2){ambient[i]=mkA();ambient[i].y=H+ambient[i].r;}drawB(b,t);}
    for(var i=trail.length-1;i>=0;i--){var b=trail[i];b.x+=b.vx+Math.sin(t*b.wob+b.phase)*.4;b.y+=b.vy;b.vy+=0.035;b.vx*=0.978;b.life-=b.decay;b.r+=0.07;if(b.life<=0){trail.splice(i,1);continue;}drawB(b,t);}
    for(var i=sparks.length-1;i>=0;i--){var sp=sparks[i];sp.x+=sp.vx;sp.y+=sp.vy;sp.vy+=0.05;sp.rot+=sp.rotspd;sp.life-=sp.decay;sp.alpha=sp.life*sp.life;sp.size*=0.984;if(sp.life<=0){sparks.splice(i,1);continue;}drawS(sp);}
    for(var i=0;i<ambient.length;i++){for(var j=i+1;j<ambient.length;j++){var dx=ambient[i].x-ambient[j].x,dy=ambient[i].y-ambient[j].y,d=Math.sqrt(dx*dx+dy*dy);if(d<100){ctx.beginPath();ctx.moveTo(ambient[i].x,ambient[i].y);ctx.lineTo(ambient[j].x,ambient[j].y);ctx.strokeStyle='rgba(244,185,66,'+(0.045*(1-d/100))+')';ctx.lineWidth=0.4;ctx.stroke();}}}
    requestAnimationFrame(tick);}
  tick();
})();

// ─────────────────────────────────────────
// TYPEWRITER
// ─────────────────────────────────────────
(function(){
  var el=document.getElementById('hero-title'); if(!el) return;
  var text='Your Future Career\nStarts Here', i=0;
  function type(){ if(i<=text.length){el.innerHTML=text.slice(0,i).replace('\n','<br>')+'<span style="display:inline-block;width:3px;height:.85em;background:var(--gold);margin-left:3px;vertical-align:middle;animation:blink 1s step-end infinite;"></span>';i++;setTimeout(type,i<20?80:45);}else{el.innerHTML=text.replace('\n','<br>');}}
  setTimeout(type,500);
})();

// ─────────────────────────────────────────
// STAT COUNTERS
// ─────────────────────────────────────────
function animateCounters(){
  [{el:'stat1',target:2.4,suffix:'M+',dec:true},{el:'stat2',target:850,suffix:'+',dec:false},{el:'stat3',target:98,suffix:'%',dec:false}].forEach(function(item){
    var el=document.getElementById(item.el); if(!el) return;
    var s=0;var timer=setInterval(function(){s+=item.target/(1400/16);if(s>=item.target){s=item.target;clearInterval(timer);}el.textContent=(item.dec?s.toFixed(1):Math.floor(s))+item.suffix;},16);
  });
}
setTimeout(animateCounters,600);

// ─────────────────────────────────────────
// TILT
// ─────────────────────────────────────────
document.addEventListener('mousemove',function(e){document.querySelectorAll('.tilt-card').forEach(function(c){var r=c.getBoundingClientRect(),dx=(e.clientX-r.left-r.width/2)/r.width*16,dy=(e.clientY-r.top-r.height/2)/r.height*16;c.style.transform='perspective(600px) rotateY('+dx+'deg) rotateX('+(-dy)+'deg) translateZ(6px)';});});
document.addEventListener('mouseleave',function(){document.querySelectorAll('.tilt-card').forEach(function(c){c.style.transform='';});});

// ─────────────────────────────────────────
// CONFETTI
// ─────────────────────────────────────────
function launchConfetti(){
  var colors=['#F4B942','#7C6FFF','#5CE1C8','#4DD89A','#FF5757','#FFD700','#FF69B4'];
  for(var i=0;i<80;i++){var el=document.createElement('div');el.className='confetti-piece';var size=Math.random()*8+4;el.style.cssText='left:'+Math.random()*100+'vw;top:-10px;background:'+colors[Math.floor(Math.random()*colors.length)]+';width:'+size+'px;height:'+size+'px;border-radius:'+(Math.random()<.5?'50%':'2px')+';animation-duration:'+(Math.random()*2+1.5)+'s;animation-delay:'+(Math.random()*.8)+'s;';document.body.appendChild(el);setTimeout(function(e){e.remove();},3500,el);}
}

// ─────────────────────────────────────────
// THEME
// ─────────────────────────────────────────
function toggleTheme(){var isLight=document.documentElement.getAttribute('data-theme')==='light';if(isLight)document.documentElement.removeAttribute('data-theme');else document.documentElement.setAttribute('data-theme','light');toast('🎨',isLight?'Dark mode on':'Light mode on');}

// ─────────────────────────────────────────
// SCREENS & PAGES
// ─────────────────────────────────────────
function showScreen(id){document.querySelectorAll('.screen').forEach(function(s){s.classList.remove('active');});document.getElementById('screen-'+id).classList.add('active');window.scrollTo(0,0);}

function switchPage(id,el){
  document.querySelectorAll('.page').forEach(function(p){p.classList.remove('active');});
  document.getElementById('page-'+id).classList.add('active');
  if(el){document.querySelectorAll('.nav-item').forEach(function(n){n.classList.remove('active');});el.classList.add('active');}
  if(id==='market')  setTimeout(buildMarketCharts,100);
  if(id==='skills')  setTimeout(buildSkillsChart,100);
  if(id==='overview')setTimeout(buildRadarChart,100);
  if(id==='salary')  setTimeout(function(){loadSalaryData();buildGrowthChart();},100);
  if(id==='careers') setTimeout(function(){document.querySelectorAll('.match-bar').forEach(function(b){b.style.width=b.getAttribute('data-w')+'%';});},100);
}
function updateMobNav(idx){document.querySelectorAll('.mob-nav-btn').forEach(function(b,i){b.classList.toggle('active',i===idx);});}

// ─────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────
function switchTab(tab){
  document.getElementById('tab-login').classList.toggle('active',tab==='login');
  document.getElementById('tab-register').classList.toggle('active',tab==='register');
  document.getElementById('login-form').style.display=tab==='login'?'block':'none';
  document.getElementById('register-form').style.display=tab==='register'?'block':'none';
}

async function handleLogin(){
  var email=document.getElementById('login-email').value.trim();
  var password=document.getElementById('login-pwd').value;
  if(!email||!password){toast('⚠️','Please enter email and password.');return;}
  try{
    var data=await api('/auth/login',{method:'POST',body:JSON.stringify({email,password})});
    APP.token=data.token; APP.user=data.user; APP.skillStates=data.user.skillStates||{};
    localStorage.setItem('pf_token',data.token);
    if(data.user.hasProfile){await loadAllData();launchDashboard();}
    else{showScreen('onboarding');initSteps();}
  }catch(e){toast('⚠️',e.message);}
}

async function handleRegister(){
  var name=document.getElementById('reg-name').value.trim();
  var email=document.getElementById('reg-email').value.trim();
  var password=document.getElementById('reg-pwd').value;
  if(!name||!email||!password){toast('⚠️','Please fill all fields.');return;}
  try{
    var data=await api('/auth/register',{method:'POST',body:JSON.stringify({name,email,password})});
    APP.token=data.token; APP.user=data.user; APP.skillStates={};
    localStorage.setItem('pf_token',data.token);
    showScreen('onboarding');initSteps();toast('🎉','Account created! Let\'s build your profile.');
  }catch(e){toast('⚠️',e.message);}
}

function demoLogin(){
  document.getElementById('login-email').value='priya@example.com';
  document.getElementById('login-pwd').value='password';
  handleLogin();
}

function handleLogout(){
  APP.token=null;APP.user=null;APP.charts={};APP.compareList=[];APP.skillStates={};
  localStorage.removeItem('pf_token');
  showScreen('landing');toast('👋','Signed out. See you soon!');
}

// ─────────────────────────────────────────
// ONBOARDING
// ─────────────────────────────────────────
var currentStep=1;
document.querySelectorAll('.chip').forEach(function(c){c.addEventListener('click',function(){c.classList.toggle('selected');});});

function initSteps(){currentStep=1;updateProgress();for(var i=1;i<=5;i++)document.getElementById('step-'+i).style.display=i===1?'block':'none';}
function updateProgress(){var bar=document.getElementById('step-progress');bar.innerHTML='';for(var i=1;i<=5;i++){var d=document.createElement('div');d.className='step-dot'+(i<currentStep?' done':i===currentStep?' active':'');bar.appendChild(d);}var lbl=document.createElement('div');lbl.className='step-label';lbl.textContent=currentStep+'/5';bar.appendChild(lbl);}
function nextStep(n){document.getElementById('step-'+currentStep).style.display='none';currentStep=n;document.getElementById('step-'+n).style.display='block';updateProgress();window.scrollTo(0,0);}
function getChips(id){return Array.from(document.querySelectorAll('#'+id+' .chip.selected')).map(function(c){return c.getAttribute('data-val');});}

// ─────────────────────────────────────────
// DYNAMIC SKILLS BASED ON FIELD
// ─────────────────────────────────────────
var FIELD_CONFIG = {
  cs: {
    sub: 'Rate your proficiency in Computer Science & IT skills',
    labels: { prog:'Programming', data:'Data Analysis', comm:'Communication', prob:'Problem Solving', tech:'Technical Skills' },
    defaults: { prog:60, data:40, comm:60, prob:70, tech:50 },
    toolsLabel: 'Tools & Technologies you know',
    tools: [
      {val:'Python',sel:false},{val:'SQL',sel:false},{val:'Java',sel:false},
      {val:'React',sel:false},{val:'Excel',sel:true},{val:'Statistics',sel:true},
      {val:'Power BI',sel:false},{val:'Cloud',sel:false},{val:'ML',sel:false},{val:'Git',sel:false}
    ]
  },
  engg: {
    sub: 'Rate your proficiency in Engineering skills',
    labels: { prog:'Programming / Coding', data:'Data & Analysis', comm:'Communication', prob:'Problem Solving', tech:'Technical / Domain Skills' },
    defaults: { prog:50, data:40, comm:60, prob:70, tech:60 },
    toolsLabel: 'Engineering Tools you know',
    tools: [
      {val:'AutoCAD',sel:false},{val:'MATLAB',sel:false},{val:'Python',sel:false},
      {val:'Excel',sel:true},{val:'Statistics',sel:true},{val:'CAD Software',sel:false},
      {val:'Circuit Design',sel:false},{val:'Project Management',sel:false},{val:'SQL',sel:false},{val:'Cloud',sel:false}
    ]
  },
  commerce: {
    sub: 'Rate your proficiency in Commerce & Business skills',
    labels: { prog:'Digital / Tech Skills', data:'Data & Financial Analysis', comm:'Communication & Presentation', prob:'Problem Solving', tech:'Business & Domain Knowledge' },
    defaults: { prog:30, data:50, comm:70, prob:60, tech:65 },
    toolsLabel: 'Business Tools you know',
    tools: [
      {val:'Excel',sel:true},{val:'Tally',sel:false},{val:'Statistics',sel:true},
      {val:'Power BI',sel:false},{val:'Google Analytics',sel:false},{val:'SQL',sel:false},
      {val:'Accounting Software',sel:false},{val:'MS Office',sel:true},{val:'CRM Tools',sel:false},{val:'Tableau',sel:false}
    ]
  },
  science: {
    sub: 'Rate your proficiency in Science & Research skills',
    labels: { prog:'Programming / Coding', data:'Data Analysis & Statistics', comm:'Communication & Writing', prob:'Problem Solving & Research', tech:'Lab & Technical Skills' },
    defaults: { prog:40, data:60, comm:60, prob:65, tech:55 },
    toolsLabel: 'Science & Research Tools you know',
    tools: [
      {val:'Python',sel:false},{val:'R Programming',sel:false},{val:'SPSS',sel:false},
      {val:'Excel',sel:true},{val:'Statistics',sel:true},{val:'MATLAB',sel:false},
      {val:'Lab Equipment',sel:false},{val:'LaTeX',sel:false},{val:'SQL',sel:false},{val:'Tableau',sel:false}
    ]
  },
  arts: {
    sub: 'Rate your proficiency in Arts & Humanities skills',
    labels: { prog:'Digital & Tech Skills', data:'Research & Analysis', comm:'Communication & Writing', prob:'Critical Thinking', tech:'Creative & Domain Skills' },
    defaults: { prog:25, data:40, comm:75, prob:60, tech:65 },
    toolsLabel: 'Tools & Platforms you know',
    tools: [
      {val:'MS Office',sel:true},{val:'Google Workspace',sel:true},{val:'Social Media',sel:false},
      {val:'Content Writing',sel:false},{val:'Canva',sel:false},{val:'WordPress',sel:false},
      {val:'Excel',sel:false},{val:'Photography',sel:false},{val:'Video Editing',sel:false},{val:'SEO',sel:false}
    ]
  },
  medical: {
    sub: 'Rate your proficiency in Healthcare & Medical skills',
    labels: { prog:'Digital / Tech Skills', data:'Data & Clinical Analysis', comm:'Patient Communication', prob:'Clinical Problem Solving', tech:'Medical & Domain Knowledge' },
    defaults: { prog:25, data:45, comm:70, prob:65, tech:70 },
    toolsLabel: 'Medical & Healthcare Tools you know',
    tools: [
      {val:'MS Office',sel:true},{val:'Excel',sel:true},{val:'HMIS Systems',sel:false},
      {val:'Medical Coding',sel:false},{val:'Statistics',sel:false},{val:'EHR Software',sel:false},
      {val:'Lab Equipment',sel:false},{val:'SQL',sel:false},{val:'Power BI',sel:false},{val:'Python',sel:false}
    ]
  },
  law: {
    sub: 'Rate your proficiency in Legal & Professional skills',
    labels: { prog:'Digital & Tech Skills', data:'Research & Analysis', comm:'Communication & Advocacy', prob:'Legal Problem Solving', tech:'Legal Domain Knowledge' },
    defaults: { prog:25, data:50, comm:75, prob:65, tech:70 },
    toolsLabel: 'Legal & Professional Tools you know',
    tools: [
      {val:'MS Office',sel:true},{val:'Legal Research Tools',sel:false},{val:'Excel',sel:true},
      {val:'Case Management Software',sel:false},{val:'Documentation',sel:false},{val:'Google Workspace',sel:true},
      {val:'Statistics',sel:false},{val:'Presentation Tools',sel:false},{val:'Database Research',sel:false},{val:'Contract Drafting',sel:false}
    ]
  },
  other: {
    sub: 'Rate your proficiency in key skill areas',
    labels: { prog:'Digital & Tech Skills', data:'Data & Analysis', comm:'Communication', prob:'Problem Solving', tech:'Domain / Specialist Skills' },
    defaults: { prog:35, data:35, comm:65, prob:60, tech:55 },
    toolsLabel: 'Tools & Skills you know',
    tools: [
      {val:'MS Office',sel:true},{val:'Excel',sel:true},{val:'Google Workspace',sel:true},
      {val:'Communication',sel:false},{val:'Social Media',sel:false},{val:'Statistics',sel:false},
      {val:'Python',sel:false},{val:'SQL',sel:false},{val:'Canva',sel:false},{val:'Project Management',sel:false}
    ]
  }
};

function goToSkills() {
  var field = document.getElementById('field').value || 'cs';
  var config = FIELD_CONFIG[field] || FIELD_CONFIG['other'];

  // Update subtitle
  var subEl = document.getElementById('step2-sub');
  if (subEl) subEl.textContent = config.sub;

  // Update slider labels
  document.getElementById('lbl-prog').innerHTML = config.labels.prog + ' <span id="s-prog-val">' + config.defaults.prog + '</span>%';
  document.getElementById('lbl-data').innerHTML = config.labels.data + ' <span id="s-data-val">' + config.defaults.data + '</span>%';
  document.getElementById('lbl-comm').innerHTML = config.labels.comm + ' <span id="s-comm-val">' + config.defaults.comm + '</span>%';
  document.getElementById('lbl-prob').innerHTML = config.labels.prob + ' <span id="s-prob-val">' + config.defaults.prob + '</span>%';
  document.getElementById('lbl-tech').innerHTML = config.labels.tech + ' <span id="s-tech-val">' + config.defaults.tech + '</span>%';

  // Update slider default values
  document.getElementById('s-prog').value = config.defaults.prog;
  document.getElementById('s-data').value = config.defaults.data;
  document.getElementById('s-comm').value = config.defaults.comm;
  document.getElementById('s-prob').value = config.defaults.prob;
  document.getElementById('s-tech').value = config.defaults.tech;

  // Re-attach oninput handlers since innerHTML replaced the spans
  document.getElementById('s-prog').oninput = function(){ document.getElementById('s-prog-val').textContent = this.value; };
  document.getElementById('s-data').oninput = function(){ document.getElementById('s-data-val').textContent = this.value; };
  document.getElementById('s-comm').oninput = function(){ document.getElementById('s-comm-val').textContent = this.value; };
  document.getElementById('s-prob').oninput = function(){ document.getElementById('s-prob-val').textContent = this.value; };
  document.getElementById('s-tech').oninput = function(){ document.getElementById('s-tech-val').textContent = this.value; };

  // Update tools label
  var toolsLabel = document.getElementById('tools-label');
  if (toolsLabel) toolsLabel.textContent = config.toolsLabel;

  // Render tool chips dynamically
  var chipsContainer = document.getElementById('tools-chips');
  chipsContainer.innerHTML = config.tools.map(function(t) {
    return '<div class="chip' + (t.sel ? ' selected' : '') + '" data-val="' + t.val + '">' + t.val + '</div>';
  }).join('');

  // Re-attach chip click handlers
  chipsContainer.querySelectorAll('.chip').forEach(function(c) {
    c.addEventListener('click', function() { c.classList.toggle('selected'); });
  });

  nextStep(2);
}

async function submitProfile(){
  var profile={
    qualification:document.getElementById('qualification').value,
    field:document.getElementById('field').value,
    year:document.getElementById('grad-year').value,
    skills:{prog:+document.getElementById('s-prog').value,data:+document.getElementById('s-data').value,comm:+document.getElementById('s-comm').value,prob:+document.getElementById('s-prob').value,tech:+document.getElementById('s-tech').value},
    tools:getChips('tools-chips'),interests:getChips('interest-chips'),goals:getChips('goal-chips'),
    timeline:document.getElementById('timeline').value,learning:getChips('learn-chips'),hours:document.getElementById('hours').value
  };

  document.getElementById('loading').style.display='flex';
  [100,700,1400,2100,2700].forEach(function(t,i){setTimeout(function(){var el=document.getElementById('ls'+(i+1));if(el)el.classList.add('show');},t);});

  try{
    await api('/user/profile',{method:'POST',body:JSON.stringify(profile)});
    APP.user.profile=profile; APP.user.hasProfile=true;
    await loadAllData();
  }catch(e){
    APP.user.profile=profile;APP.user.hasProfile=true;
    await loadAllData();
  }

  setTimeout(function(){
    document.getElementById('loading').style.display='none';
    launchDashboard();launchConfetti();toast('✨','Your personalised career path is ready!');
  },3400);
}

// ─────────────────────────────────────────
// LOAD ALL DATA FROM BACKEND
// ─────────────────────────────────────────
async function loadAllData(){
  try{
    var [careersData, skillsData, roadmapData, coursesData, marketData, tipData] = await Promise.all([
      api('/careers/match'),
      api('/skills/analysis'),
      api('/roadmap'),
      api('/courses'),
      api('/market'),
      api('/tips')
    ]);
    APP.careers   = careersData.careers;
    APP.skillGaps = { have: skillsData.have||[], need: skillsData.need||[], learning: skillsData.learning||[] };
    APP.matchScore= skillsData.match_score || 85;
    APP.topCareerName = skillsData.career ? skillsData.career.name : 'Data Analyst';
    APP.topCareerId   = skillsData.career ? skillsData.career.id  : 1;
    APP.roadmap   = roadmapData.roadmap;
    APP.courses   = coursesData.courses;
    APP.market    = marketData;
    APP.dailyTip  = tipData.tip;
  }catch(e){
    console.warn('Backend unreachable, using fallback:', e.message);
    useFallbackData();
  }
}

// ─────────────────────────────────────────
// LAUNCH DASHBOARD
// ─────────────────────────────────────────
function launchDashboard(){
  var u=APP.user, name=u?u.name:'Learner', first=name.split(' ')[0];
  var returning=!!(u&&u.hasProfile);

  document.getElementById('welcome-title').textContent=(returning?'Welcome back, ':'Welcome, ')+first+' 👋';
  document.getElementById('sidebar-name').textContent=name;
  document.getElementById('sidebar-avatar').textContent=first[0];
  document.getElementById('profile-avatar').textContent=first[0];
  document.getElementById('profile-name').textContent=name;
  document.getElementById('profile-email').textContent=u?u.email:'';

  var QM={ug:"Bachelor's Degree",pg:"Master's Degree",diploma:"Diploma/ITI",'10th':'Class 10','12th':'Class 12',phd:'PhD'};
  var FM={cs:'Computer Science / IT',engg:'Engineering',commerce:'Commerce',science:'Sciences',arts:'Arts',medical:'Medical',law:'Law',other:'Other'};
  var p=u&&u.profile;
  if(p){
    document.getElementById('p-qual').textContent=QM[p.qualification]||p.qualification||'—';
    document.getElementById('p-field').textContent=FM[p.field]||p.field||'—';
    document.getElementById('p-year').textContent=p.year||'—';
    document.getElementById('p-goal').textContent=(p.goals||[]).join(', ')||'—';
    document.getElementById('p-timeline').textContent=p.timeline==='6m'?'6 months':p.timeline||'—';
    document.getElementById('p-learn').textContent=(p.learning||[]).join(', ')||'—';
    document.getElementById('p-hours').textContent=p.hours==='10'?'5–10 hrs':(p.hours?p.hours+' hrs':'—');
  }

  // Update top match metric
  var topCareer=APP.careers[0];
  if(topCareer){
    var topMatchEl=document.getElementById('top-match-val');
    if(topMatchEl) topMatchEl.textContent=topCareer.score+'%';
    // Update subtext
    var topEl=topMatchEl&&topMatchEl.nextElementSibling;
    if(topEl) topEl.textContent=topCareer.name;
  }

  // Update skill match score display
  var msEl=document.getElementById('match-score-live');
  if(msEl) msEl.textContent='Match: '+APP.matchScore+'%';
  var targetEl=document.querySelector('.skills-target');
  if(targetEl) targetEl.textContent='Target: '+APP.topCareerName;

  renderStreak(u?(u.streak||1):1);
  renderDailyTip();
  renderWhatsNew();
  renderTopCareers();
  renderAllCareers();
  renderMiniRoadmap();
  renderFullRoadmap();
  renderSkillsBoxes();
  renderCourses();
  renderMarketInsights();
  renderHeatmap();
  renderCompletionRing(p?82:30);

  showScreen('dashboard');
  setTimeout(function(){buildRadarChart();},300);
  setTimeout(function(){document.querySelectorAll('.match-bar').forEach(function(b){b.style.width=b.getAttribute('data-w')+'%';});},600);
  if(returning) toast('👋','Welcome back! Career matches updated from your profile.');
}

// ─────────────────────────────────────────
// RENDER HELPERS
// ─────────────────────────────────────────
function renderStreak(n){
  var c=document.getElementById('streak-count'),d=document.getElementById('streak-dots');
  if(c) c.textContent=n+' Day Streak!';
  if(d){d.innerHTML='';for(var i=0;i<7;i++){var dot=document.createElement('div');dot.className='streak-day'+(i<n?' active':'');d.appendChild(dot);}}
}
function renderDailyTip(){var el=document.getElementById('daily-tip');if(el)el.textContent=APP.dailyTip||'Keep learning every day!';}
function renderWhatsNew(){
  var el=document.getElementById('whats-new-list');
  var items=(APP.market&&APP.market.whatsNew)||FALLBACK_WHATS_NEW;
  if(el) el.innerHTML=items.map(function(w){return'<div class="new-item"><div class="new-dot"></div><span>'+w+'</span></div>';}).join('');
}
function renderCompletionRing(pct){
  setTimeout(function(){
    var ring=document.getElementById('comp-ring'),pctEl=document.getElementById('comp-pct'),lbl=document.getElementById('comp-label');
    if(ring) ring.style.strokeDashoffset=213.6-(213.6*pct/100);
    if(pctEl) pctEl.textContent=pct+'%';
    if(lbl)  lbl.textContent=pct>=80?'Looking great! 🌟':pct>=50?'Coming along nicely':'Getting started';
  },600);
}

function careerCard(c){
  var inCmp=APP.compareList.indexOf(c.id)>=0;
  return '<div class="career-card tilt-card">'
    +'<div class="career-rank">Match #'+(c.rank||c.id)+' · '+c.nsqf+' · '+c.openings+' openings</div>'
    +'<div class="career-name">'+c.name+'</div>'
    +'<div class="match-bar-track"><div class="match-bar" data-w="'+c.score+'" style="width:0%"></div></div>'
    +'<div class="match-score"><span class="lbl">Match Score</span><span class="val">'+c.score+'%</span></div>'
    +'<div class="career-tags">'+c.tags.map(function(t){return'<span class="career-tag">'+t+'</span>';}).join('')
    +'<span class="career-tag" style="color:var(--green)">'+c.salary+'</span>'
    +'<span class="career-tag" style="color:var(--accent2)">'+c.growth+'</span></div>'
    +'<button class="compare-btn'+(inCmp?' selected':'')+'" onclick="toggleCompare('+c.id+')">'+(inCmp?'✓ In Compare':'+ Compare')+'</button>'
    +'</div>';
}
function renderTopCareers(){var el=document.getElementById('top-careers');if(el&&APP.careers.length)el.innerHTML=APP.careers.slice(0,3).map(careerCard).join('');}
function renderAllCareers(){var el=document.getElementById('all-careers');if(el&&APP.careers.length)el.innerHTML=APP.careers.map(careerCard).join('');}

function toggleCompare(id){
  var idx=APP.compareList.indexOf(id);
  if(idx>=0)APP.compareList.splice(idx,1);
  else if(APP.compareList.length<2)APP.compareList.push(id);
  else{toast('ℹ️','Select up to 2 careers to compare.');return;}
  renderAllCareers();
  setTimeout(function(){document.querySelectorAll('.match-bar').forEach(function(b){b.style.width=b.getAttribute('data-w')+'%';});},100);
  if(APP.compareList.length===2)buildCompare();
  else document.getElementById('compare-panel').classList.remove('active');
}
function clearCompare(){APP.compareList=[];renderAllCareers();document.getElementById('compare-panel').classList.remove('active');setTimeout(function(){document.querySelectorAll('.match-bar').forEach(function(b){b.style.width=b.getAttribute('data-w')+'%';});},100);}
function buildCompare(){
  var a=APP.careers.find(function(c){return c.id===APP.compareList[0];}),b=APP.careers.find(function(c){return c.id===APP.compareList[1];});
  if(!a||!b)return;
  var panel=document.getElementById('compare-panel'),grid=document.getElementById('compare-grid');
  panel.classList.add('active');
  function col(c){return'<div class="compare-col"><div class="compare-col-title">'+c.name+'</div>'
    +'<div class="compare-row"><span class="compare-lbl">Match Score</span><span>'+c.score+'%</span></div>'
    +'<div class="compare-row"><span class="compare-lbl">NSQF Level</span><span>'+c.nsqf+'</span></div>'
    +'<div class="compare-row"><span class="compare-lbl">Salary Range</span><span>'+c.salary+'</span></div>'
    +'<div class="compare-row"><span class="compare-lbl">Demand Growth</span><span style="color:var(--green)">'+c.growth+'</span></div>'
    +'<div class="compare-row"><span class="compare-lbl">Open Roles</span><span>'+c.openings+'</span></div>'
    +'<div class="compare-row"><span class="compare-lbl">Key Skills</span><span>'+c.tags.join(', ')+'</span></div>'
    +'</div>';}
  grid.innerHTML=col(a)+col(b);
}

function renderMiniRoadmap(){
  var el=document.getElementById('mini-roadmap');if(!el)return;
  el.innerHTML=(APP.roadmap||[]).slice(0,3).map(function(s){return'<div class="roadmap-step"><div class="step-circle '+s.state+'">'+(s.state==='done'?'✓':s.step)+'</div><div class="step-body"><div class="step-nsqf">'+s.nsqf+'</div><div class="step-title">'+s.title+'</div></div></div>';}).join('');
}
function renderFullRoadmap(){
  var el=document.getElementById('full-roadmap');if(!el)return;
  el.innerHTML=(APP.roadmap||[]).map(function(s){return'<div class="roadmap-step"><div class="step-circle '+s.state+'">'+(s.state==='done'?'✓':s.step)+'</div><div class="step-body"><div class="step-nsqf">'+s.nsqf+'</div><div class="step-title">'+s.title+'</div><div class="step-desc">'+s.desc+'</div></div></div>';}).join('');
}

// ─── SKILLS - driven by backend gap analysis ───
function renderSkillsBoxes(){
  var haveEl=document.getElementById('skills-have'),needEl=document.getElementById('skills-need');
  if(haveEl) haveEl.innerHTML=APP.skillGaps.have.map(function(s){
    return'<div class="skill-pill"><span class="skill-check has">✓</span>'+(s.name||s)+'</div>';
  }).join('');
  var allNeed=[...APP.skillGaps.need,...APP.skillGaps.learning];
  if(needEl) needEl.innerHTML=allNeed.map(function(s){
    var sname=s.name||s, state=APP.skillStates[sname]||s.state||'needs';
    var icon=state==='completed'?'✓':state==='learning'?'~':'✗';
    var cls=state==='completed'?'has':state==='learning'?'learning-icon':'needs';
    return'<div class="skill-pill '+state+'"><span class="skill-check '+cls+'">'+icon+'</span>'+sname
      +'<button class="skill-action" onclick="cycleSkill(\''+sname+'\')">'+
      (state==='needs'?'Start Learning':state==='learning'?'Mark Done':'Reset')+'</button></div>';
  }).join('');
  updateMatchScore();
}

async function cycleSkill(sname){
  var cur=APP.skillStates[sname]||'needs';
  APP.skillStates[sname]=cur==='needs'?'learning':cur==='learning'?'completed':'needs';
  renderSkillsBoxes();
  if(APP.charts.skillsBar){APP.charts.skillsBar.destroy();delete APP.charts.skillsBar;buildSkillsChart();}
  toast(APP.skillStates[sname]==='learning'?'📖':'✅',sname+' marked as '+APP.skillStates[sname]+'!');
  try{
    await api('/user/skills',{method:'PATCH',body:JSON.stringify({[sname]:APP.skillStates[sname]})});
    // Reload skill analysis to get updated score from backend
    var updated=await api('/skills/analysis');
    APP.matchScore=updated.match_score||APP.matchScore;
    var msEl=document.getElementById('match-score-live');
    if(msEl) msEl.textContent='Match: '+APP.matchScore+'%';
  }catch(e){}
}

function updateMatchScore(){
  var msEl=document.getElementById('match-score-live');
  if(msEl) msEl.textContent='Match: '+APP.matchScore+'%';
}

function renderCourses(){
  var el=document.getElementById('courses-grid');if(!el)return;
  el.innerHTML=(APP.courses||[]).map(function(c){return'<div class="course-card"><div class="course-provider">'+c.provider+'</div><div class="course-name">'+c.name+'</div><div class="course-meta"><span class="cbadge nsqf">'+c.nsqf+'</span><span class="cbadge dur">⏱ '+c.dur+'</span>'+(c.free?'<span class="cbadge free">Free</span>':'')+'</div></div>';}).join('');
}
function renderMarketInsights(){
  var el=document.getElementById('market-insights');if(!el||!APP.market)return;
  el.innerHTML=APP.market.insights.map(function(i){return'<div class="insight-card"><div class="insight-label">'+i.label+'</div><div class="insight-val">'+i.val+'</div><div class="insight-sub">'+i.sub+'</div></div>';}).join('');
}
function renderHeatmap(){
  var el=document.getElementById('heatmap-grid');if(!el||!APP.market)return;
  el.innerHTML=APP.market.heatmap.map(function(c){var r=Math.floor(30+(244-30)*c.heat),g=Math.floor(30+(185-30)*c.heat*.5),b=Math.floor(50+(66-50)*c.heat*.3);return'<div class="heatmap-city" style="background:rgba('+r+','+g+','+b+',0.25);border:1px solid rgba(244,185,66,'+(c.heat*0.4)+')">'+'<div class="city-name">'+c.city+'</div><div class="city-jobs">'+c.jobs+' jobs</div></div>';}).join('');
}

// ─────────────────────────────────────────
// SALARY CALCULATOR  - calls backend
// ─────────────────────────────────────────
var salaryData = null;

async function loadSalaryData(){
  var role=document.getElementById('calc-role')?.value||'da';
  var city=document.getElementById('calc-city')?.value||'bangalore';
  // Map role dropdown value to career id
  var roleMap={da:1,bi:2,ds:3,ml:3,de:4,ca:10};
  var careerId=roleMap[role]||1;
  try{
    var data=await api('/salary?career_id='+careerId+'&city='+city);
    salaryData=data;
    renderSalaryResult(data);
    renderSalaryBreakdown(data);
    if(APP.charts.growth){APP.charts.growth.destroy();delete APP.charts.growth;}
    buildGrowthChart(data.growth_projection);
    // Populate all roles comparison
    if(data.all_roles && APP.charts.salaryChart){
      APP.charts.salaryChart.destroy(); delete APP.charts.salaryChart;
    }
  }catch(e){calcSalaryFallback();}
}

function renderSalaryResult(data){
  var resEl=document.getElementById('salary-result'),noteEl=document.getElementById('salary-note');
  if(resEl) resEl.textContent='₹'+data.salary_range.lo+' – '+data.salary_range.hi+' LPA';
  if(noteEl) noteEl.textContent='Based on '+data.experience_years+' yrs experience in '+data.city.charAt(0).toUpperCase()+data.city.slice(1)+'. NSQF-aligned package.';
}
function renderSalaryBreakdown(data){
  var bd=document.getElementById('salary-breakdown');
  if(!bd)return;
  bd.innerHTML=[{label:'Monthly (Avg)',val:'₹'+data.monthly_avg.toLocaleString('en-IN')},{label:'In-hand (~70%)',val:'₹'+data.monthly_inhand.toLocaleString('en-IN')},{label:'With Bonus',val:'₹'+data.with_bonus+' LPA'}]
    .map(function(x){return'<div class="breakdown-card"><div class="breakdown-label">'+x.label+'</div><div class="breakdown-val">'+x.val+'</div></div>';}).join('');
}

function calcSalary(){loadSalaryData();}

// Fallback if backend is down
var SALARY_BASE_FB={da:{0:[5.5,8],2:[8,12],4:[12,18],7:[18,28]},bi:{0:[6,9],2:[9,14],4:[14,22],7:[22,35]},ds:{0:[8,12],2:[12,20],4:[20,30],7:[30,45]},ml:{0:[8,13],2:[13,22],4:[22,35],7:[35,55]},de:{0:[7,11],2:[11,18],4:[18,28],7:[28,42]},ca:{0:[10,16],2:[16,26],4:[26,40],7:[40,60]}};
var CITY_MULT_FB={bangalore:1.15,hyderabad:1.05,mumbai:1.1,delhi:1.08,pune:1.0,chennai:0.95,tier2:0.75};
function calcSalaryFallback(){
  var role=document.getElementById('calc-role')?.value||'da';
  var city=document.getElementById('calc-city')?.value||'bangalore';
  var exp=document.getElementById('calc-exp')?.value||'0';
  var cityEl=document.getElementById('calc-city');
  var cityName=cityEl?cityEl.options[cityEl.selectedIndex].text:'Bengaluru';
  var base=SALARY_BASE_FB[role][exp],mult=CITY_MULT_FB[city];
  var lo=(base[0]*mult).toFixed(1),hi=(base[1]*mult).toFixed(1);
  var avg=(+lo+(+hi))/2;
  var resEl=document.getElementById('salary-result'),noteEl=document.getElementById('salary-note');
  if(resEl) resEl.textContent='₹'+lo+' – '+hi+' LPA';
  if(noteEl) noteEl.textContent='Estimated for '+cityName+'.';
  var bd=document.getElementById('salary-breakdown');
  if(bd) bd.innerHTML=[{label:'Monthly (Avg)',val:'₹'+Math.round(avg*100000/12).toLocaleString('en-IN')},{label:'In-hand (~70%)',val:'₹'+Math.round(avg*0.7*100000/12).toLocaleString('en-IN')},{label:'With Bonus',val:'₹'+(+hi*1.15).toFixed(1)+' LPA'}].map(function(x){return'<div class="breakdown-card"><div class="breakdown-label">'+x.label+'</div><div class="breakdown-val">'+x.val+'</div></div>';}).join('');
}

// ─────────────────────────────────────────
// CHARTS
// ─────────────────────────────────────────
var CD={grid:'rgba(255,255,255,0.06)',tick:'rgba(255,255,255,0.4)',font:{family:'DM Sans,sans-serif',size:12}};

function buildRadarChart(){
  if(APP.charts.radar)return;
  var el=document.getElementById('radar-chart');if(!el)return;
  var p=APP.user&&APP.user.profile&&APP.user.profile.skills||{prog:60,data:40,comm:75,prob:70,tech:45};
  APP.charts.radar=new Chart(el,{type:'radar',data:{labels:['Programming','Data Analysis','Communication','Problem Solving','Tech Writing'],datasets:[{label:'Your Level',data:[p.prog,p.data,p.comm,p.prob,p.tech],fill:true,backgroundColor:'rgba(124,111,255,0.2)',borderColor:'rgba(124,111,255,0.8)',pointBackgroundColor:'#7C6FFF',pointRadius:4},{label:'Required',data:[80,85,70,80,60],fill:true,backgroundColor:'rgba(244,185,66,0.1)',borderColor:'rgba(244,185,66,0.6)',borderDash:[5,4],pointBackgroundColor:'#F4B942',pointRadius:4}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{labels:{color:'rgba(255,255,255,0.6)',font:CD.font,boxWidth:10}}},scales:{r:{grid:{color:CD.grid},ticks:{display:false},pointLabels:{color:CD.tick,font:CD.font},suggestedMin:0,suggestedMax:100}}}});
}

function buildSkillsChart(){
  if(APP.charts.skillsBar)return;
  var el=document.getElementById('skills-bar-chart');if(!el)return;
  var allNeed=[...APP.skillGaps.need,...APP.skillGaps.learning];
  var labels=allNeed.map(function(s){return s.name||s;}).slice(0,8);
  var yourVals=labels.map(function(n){var st=APP.skillStates[n]||'needs';return st==='completed'?95:st==='learning'?50:15;});
  var reqVals=labels.map(function(){return 80;});
  APP.charts.skillsBar=new Chart(el,{type:'bar',data:{labels:labels,datasets:[{label:'Your Level',data:yourVals,backgroundColor:'rgba(124,111,255,0.7)',borderRadius:6,borderSkipped:false},{label:'Required',data:reqVals,backgroundColor:'rgba(244,185,66,0.3)',borderRadius:6,borderSkipped:false}]},options:{responsive:true,maintainAspectRatio:false,indexAxis:'y',plugins:{legend:{labels:{color:'rgba(255,255,255,0.6)',font:CD.font,boxWidth:10}}},scales:{x:{grid:{color:CD.grid},ticks:{color:CD.tick,font:CD.font},suggestedMax:100},y:{grid:{display:false},ticks:{color:CD.tick,font:CD.font}}}}});
}

function buildMarketCharts(){
  if(!APP.market)return;
  var t=APP.market.trends;
  if(!APP.charts.demand){var el=document.getElementById('demand-chart');if(el)APP.charts.demand=new Chart(el,{type:'bar',data:{labels:t.demandLabels,datasets:[{label:'Job Postings (thousands)',data:t.demandValues,backgroundColor:['rgba(244,185,66,.85)','rgba(124,111,255,.85)','rgba(92,225,200,.85)','rgba(255,87,87,.7)','rgba(244,185,66,.6)','rgba(124,111,255,.6)','rgba(92,225,200,.6)','rgba(77,216,154,.6)'],borderRadius:8,borderSkipped:false}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{grid:{display:false},ticks:{color:CD.tick,font:CD.font}},y:{grid:{color:CD.grid},ticks:{color:CD.tick,font:CD.font}}}}});}
  if(!APP.charts.salaryChart){var el2=document.getElementById('salary-chart');if(el2)APP.charts.salaryChart=new Chart(el2,{type:'bar',data:{labels:t.salaryRoles,datasets:[{label:'Min LPA',data:t.salaryMin,backgroundColor:'rgba(124,111,255,0.5)',borderRadius:4},{label:'Max LPA',data:t.salaryMax,backgroundColor:'rgba(244,185,66,0.75)',borderRadius:4}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{labels:{color:'rgba(255,255,255,0.6)',font:CD.font,boxWidth:10}}},scales:{x:{grid:{display:false},ticks:{color:CD.tick,font:CD.font}},y:{grid:{color:CD.grid},ticks:{color:CD.tick,font:CD.font}}}}});}
}

function buildGrowthChart(proj){
  if(APP.charts.growth)return;
  var el=document.getElementById('growth-chart');if(!el)return;
  var labels=proj?proj.map(function(p){return p.label;}):['Now','Year 1','Year 2','Year 3','Year 4','Year 5'];
  var vals=proj?proj.map(function(p){return p.avg;}):[6.5,8,10.5,14,18,24];
  APP.charts.growth=new Chart(el,{type:'line',data:{labels:labels,datasets:[{label:'Projected Salary (₹ LPA)',data:vals,fill:true,backgroundColor:'rgba(244,185,66,0.12)',borderColor:'rgba(244,185,66,0.9)',pointBackgroundColor:'#F4B942',pointRadius:5,tension:0.4}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{labels:{color:'rgba(255,255,255,0.6)',font:CD.font}}},scales:{x:{grid:{color:CD.grid},ticks:{color:CD.tick}},y:{grid:{color:CD.grid},ticks:{color:CD.tick,callback:function(v){return'₹'+v+' L';}}}}}});
}

// ─────────────────────────────────────────
// TOAST
// ─────────────────────────────────────────
var toastTimer;
function toast(icon,msg){clearTimeout(toastTimer);document.getElementById('toast-icon').textContent=icon;document.getElementById('toast-msg').textContent=msg;var el=document.getElementById('toast');el.classList.add('show');toastTimer=setTimeout(function(){el.classList.remove('show');},3500);}

// ─────────────────────────────────────────
// FALLBACK DATA (if backend is offline)
// ─────────────────────────────────────────
var FALLBACK_WHATS_NEW=['Data Analyst demand ↑ 22% in last 30 days','New NSQF Level 5 cert launched by NASSCOM','Bengaluru surpassed Hyderabad as top hiring city','ML fresher salaries crossed ₹8 LPA'];

function useFallbackData(){
  APP.careers=[{id:1,rank:1,name:'Data Analyst',score:85,nsqf:'Level 5',tags:['SQL','Excel','Analytics'],salary:'₹5–12 LPA',growth:'+22%',openings:'48,000'},{id:2,rank:2,name:'BI Analyst',score:78,nsqf:'Level 5',tags:['Power BI','SQL'],salary:'₹7–15 LPA',growth:'+18%',openings:'22,000'},{id:3,rank:3,name:'AI/ML Technician',score:72,nsqf:'Level 6',tags:['Python','ML'],salary:'₹8–20 LPA',growth:'+42%',openings:'38,000'}];
  APP.skillGaps={have:['Excel','Statistics','Communication'],need:[{name:'Python',weight:'high'},{name:'SQL',weight:'high'},{name:'Data Visualization',weight:'high'}],learning:[]};
  APP.roadmap=[{step:1,nsqf:'NSQF Level 3',title:'Foundation Training',desc:'Python basics, statistics, data handling. Duration: 4–6 weeks.',state:'done'},{step:2,nsqf:'NSQF Level 4',title:'Core Data Skills',desc:'SQL, Excel advanced, data cleaning. Duration: 6–8 weeks.',state:'active'},{step:3,nsqf:'NSQF Level 5',title:'Advanced Certification',desc:'Power BI, Tableau, advanced Python. Duration: 8 weeks.',state:'pending'},{step:4,nsqf:'NSQF Level 5',title:'Apprenticeship',desc:'Real-world project under NCVET. Duration: 3 months.',state:'pending'},{step:5,nsqf:'NSQF Level 5–6',title:'Entry-Level Job Ready',desc:'Portfolio review and interview prep.',state:'pending'}];
  APP.courses=[{provider:'NIELIT / NSDC',name:'Data Analytics Fundamentals',nsqf:'NSQF Level 4',dur:'8 weeks',free:true},{provider:'NPTEL (IIT)',name:'Python for Data Science',nsqf:'NSQF Level 5',dur:'12 weeks',free:true},{provider:'Skill India Portal',name:'SQL & Database Basics',nsqf:'NSQF Level 4',dur:'4 weeks',free:true},{provider:'Microsoft x NSDC',name:'Power BI Visualisation',nsqf:'NSQF Level 5',dur:'6 weeks',free:false}];
  APP.market={insights:[{label:'Avg. Salary',val:'₹7.5 LPA',sub:'↑ 18% YoY'},{label:'Job Postings',val:'48,000+',sub:'This month'},{label:'Top City',val:'Bengaluru',sub:'↑ Fastest growth'}],heatmap:[{city:'Bengaluru',jobs:'48,200',heat:1.0},{city:'Hyderabad',jobs:'32,500',heat:0.85},{city:'Mumbai',jobs:'28,100',heat:0.75}],trends:{demandLabels:['Data Analyst','ML Engineer','BI Analyst','DevOps'],demandValues:[48,38,22,35],salaryRoles:['Data Analyst','BI Analyst','ML Engineer'],salaryMin:[5,7,12],salaryMax:[12,15,28]},whatsNew:FALLBACK_WHATS_NEW};
  APP.dailyTip='Python is the #1 skill for Data Analyst roles in India in 2025.';
  APP.matchScore=85;APP.topCareerName='Data Analyst';APP.topCareerId=1;
}

// ─────────────────────────────────────────
// AUTO LOGIN ON PAGE LOAD
// ─────────────────────────────────────────
(async function init(){
  if(APP.token){
    try{
      var data=await api('/user/me');
      APP.user=data; APP.skillStates=data.skillStates||{};
      if(data.hasProfile){await loadAllData();launchDashboard();return;}
    }catch(e){localStorage.removeItem('pf_token');APP.token=null;}
  }
  useFallbackData();
  animateCounters();
})();