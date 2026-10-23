
// Load the processing engine only after the user presses START PROCESSING.
// This keeps welcome, fireworks, lanterns, and upload UI alive if the engine fails to load.
(()=>{'use strict';
const $=id=>document.getElementById(id);let file=null,url=null,timer=null,progress=0,outputUrl=null,outputBlob=null,outputName=null,busy=false;const screens=['uploadScreen','processingScreen','completeScreen'];
// V3: Local unlimited processing; no remote quota, login, or payments.
function dailyDisplay(){ $('start').disabled=busy||!(file||window.neonSelectedFile); }

// Lightweight CSS sparkles surrounding the processing percentage ring.
const ringSparks=$('ringSparks');
for(let i=0;i<26;i++){
 const dot=document.createElement('i');
 dot.style.setProperty('--angle',(i*360/26)+'deg');
 dot.style.setProperty('--radius',(-89-(i%4)*5)+'px');
 dot.style.setProperty('--sz',(2+i%4)+'px');
 dot.style.setProperty('--spark',i%3===0?'#ffffff':i%3===1?'#ffcf87':'#ff526b');
 dot.style.setProperty('--twinkle',(0.55+(i%6)*0.18)+'s');
 dot.style.setProperty('--delay',(-i*.12)+'s');
 ringSparks.appendChild(dot);
}

function page(n){screens.forEach((id,i)=>$(id).classList.toggle('hidden',i!==n));document.querySelectorAll('.step').forEach((el,i)=>el.classList.toggle('active',i<=n));window.scrollTo({top:0,behavior:'smooth'});}
function setFile(f){if(!f)return;if(!/\.mp4$/i.test(f.name)){alert('Please choose an MP4 video.');return;}if(url)URL.revokeObjectURL(url);file=f;url=URL.createObjectURL(f);$('fileName').textContent=f.name;$('fileSize').textContent=(f.size/1048576).toFixed(1)+' MB';$('uploadPreview').src=url;$('fileBox').style.display='block';$('errorMessage').classList.add('hidden');dailyDisplay();}
function stop(){if(timer!==null){clearInterval(timer);timer=null;}}
function reset(){stop();if(outputUrl)URL.revokeObjectURL(outputUrl);outputUrl=null;outputBlob=null;outputName=null;$('uploadPreview').pause();$('completePreview').pause();$('uploadPreview').removeAttribute('src');$('completePreview').removeAttribute('src');$('uploadPreview').load();$('completePreview').load();if(url)URL.revokeObjectURL(url);url=null;file=null;window.neonSelectedFile=null;$('videoInput').value='';$('fileBox').style.display='none';$('start').disabled=true;progress=0;page(0);dailyDisplay();}
$('continue').addEventListener('click',()=>{$('welcome').classList.add('hidden');try{sessionStorage.setItem('neon-welcomed','1');}catch(_){}});try{if(sessionStorage.getItem('neon-welcomed')==='1')$('welcome').classList.add('hidden');}catch(_){}
$('videoInput').addEventListener('change',e=>{if(e.target.files[0])setFile(e.target.files[0]);});
const drop=$('drop');drop.addEventListener('dragover',e=>{e.preventDefault();drop.classList.add('drag');});drop.addEventListener('dragleave',()=>drop.classList.remove('drag'));drop.addEventListener('drop',e=>{e.preventDefault();drop.classList.remove('drag');setFile(e.dataTransfer.files[0]);});
$('start').addEventListener('click',async()=>{
 if(!file && window.neonSelectedFile) setFile(window.neonSelectedFile);
 if(!file||busy)return;
 if(!/\.mp4$/i.test(file.name)){const el=$('errorMessage');el.textContent='MAX QUALITY supports MP4 input only. Please select an MP4 video.';el.classList.remove('hidden');return;}
 busy=true;dailyDisplay();
 progress=0;$('processingName').textContent=file.name;$('percentage').textContent='0%';$('ring').style.setProperty('--progress','0%');page(1);
 $('cancel').disabled=true;
 try {
  const { optimizeVideo } = await import('./processing.js');
  const result=await optimizeVideo(file,(value)=>{progress=value;$('percentage').textContent=value+'%';$('ring').style.setProperty('--progress',value+'%');});
  if(outputUrl)URL.revokeObjectURL(outputUrl);
  outputBlob=result.blob;outputName=result.name;outputUrl=URL.createObjectURL(outputBlob);
  $('completePreview').src=outputUrl;page(2);
 } catch(err){const el=$('errorMessage');el.textContent='Video optimization failed: '+(err instanceof Error?err.message:String(err));el.classList.remove('hidden');page(0);}
 finally{busy=false;$('cancel').disabled=false;dailyDisplay();}
});
$('download').addEventListener('click',()=>{
 if(!outputBlob||!outputName)return;
 const link=document.createElement('a');link.href=outputUrl;link.download=outputName;document.body.appendChild(link);link.click();link.remove();
});
$('cancel').addEventListener('click',()=>{if(!busy)page(0);});$('again').addEventListener('click',reset);window.addEventListener('beforeunload',()=>{stop();if(url)URL.revokeObjectURL(url);if(outputUrl)URL.revokeObjectURL(outputUrl);});
// Decorative sky lanterns: animation only, no effect on video or controls.
const lanternSky=$('lanternSky');
for(let i=0;i<13;i++){
  const el=document.createElement('span');el.className='sky-lantern';
  el.style.setProperty('--x',(3+(i*37)%94)+'%');
  el.style.setProperty('--size',(15+(i*7)%17)+'px');
  el.style.setProperty('--duration',(14+(i*3)%13)+'s');
  el.style.setProperty('--delay',(-i*2.1)+'s');
  lanternSky.appendChild(el);
}
const canvas=$('sky'),ctx=canvas.getContext('2d');if(!ctx)return;let particles=[],rockets=[],w=0,h=0,last=0;const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function resize(){w=canvas.width=innerWidth*devicePixelRatio;h=canvas.height=innerHeight*devicePixelRatio;ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);w=innerWidth;h=innerHeight;}resize();addEventListener('resize',resize);
function burst(x,y,white=false){
  const amount=white?30:34;
  for(let i=0;i<amount;i++){
    const a=Math.random()*Math.PI*2,s=(white?1.2:1.6)+Math.random()*(white?3.5:2.9);
    particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:1,size:white?1.1+Math.random()*2.2:1+Math.random()*1.7,color:white?'255,255,255':Math.random()>.5?'255,64,89':'255,220,225'});
  }
  if(particles.length>360)particles.splice(0,particles.length-360);
}
function launchHeroFireworks(){
  const hero=document.querySelector('.hero');if(!hero)return;
  const r=hero.getBoundingClientRect();if(r.bottom<0||r.top>h)return;
  const x=r.left+r.width*([.08,.18,.32,.68,.82,.92][Math.floor(Math.random()*6)]);
  const targetY=Math.max(35,r.top+Math.random()*Math.min(110,r.height*.65));
  rockets.push({x,y:Math.min(h-10,r.bottom+65),targetY,speed:4.2+Math.random()*2,trail:[]});
}
function draw(t){
  ctx.clearRect(0,0,w,h);
  if(!reduced&&t-last>320){launchHeroFireworks();launchHeroFireworks();if(Math.random()>.45)launchHeroFireworks();last=t;}
  rockets=rockets.filter(r=>{
    r.trail.push({x:r.x,y:r.y});if(r.trail.length>12)r.trail.shift();
    r.y-=r.speed;
    r.trail.forEach((p,i)=>{ctx.beginPath();ctx.fillStyle=`rgba(255,${i%2?255:75},${i%2?255:100},${(i+1)/r.trail.length*.75})`;ctx.arc(p.x,p.y,1.5,0,Math.PI*2);ctx.fill();});
    if(r.y<=r.targetY){burst(r.x,r.y);return false;}return true;
  });
  particles=particles.filter(p=>p.life>0);
  for(const p of particles){p.x+=p.vx;p.y+=p.vy;p.vy+=.025;p.life-=.018;ctx.beginPath();ctx.fillStyle=`rgba(${p.color},${Math.max(0,p.life)})`;ctx.shadowBlur=12;ctx.shadowColor=`rgba(${p.color},.85)`;ctx.arc(p.x,p.y,Math.max(.2,p.size*p.life),0,Math.PI*2);ctx.fill();}
  ctx.shadowBlur=0;requestAnimationFrame(draw);
}
if(!reduced){
  requestAnimationFrame(draw);
  document.addEventListener('pointerdown',e=>{burst(e.clientX,e.clientY,true);burst(e.clientX,e.clientY,true);},{passive:true,capture:true});
}

})();
