document.addEventListener('DOMContentLoaded', function(){
try{
/* ---------------- WATCH SVG GENERATOR ---------------- */
function watchSVG(cfg){
  const {bezel='plain', bezelColor='#c9a24b', bezelColor2='#7a1f1f', dial='#06392c', dialText='#e4cd8f', caseColor='#c9a24b', tick='#e4cd8f', id=''} = cfg;
  let bezelRing = '';
  if(bezel==='plain'){
    bezelRing = `<circle cx="60" cy="60" r="52" fill="none" stroke="${bezelColor}" stroke-width="9"/>`;
  } else if(bezel==='fluted'){
    bezelRing = `<circle cx="60" cy="60" r="52" fill="none" stroke="${bezelColor}" stroke-width="9"/>`;
    for(let i=0;i<40;i++){
      const a = (i/40)*Math.PI*2;
      const x1 = 60+47.5*Math.cos(a), y1=60+47.5*Math.sin(a);
      const x2 = 60+56.5*Math.cos(a), y2=60+56.5*Math.sin(a);
      bezelRing += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#8a6a26" stroke-width="1"/>`;
    }
  } else if(bezel==='dive'){
    bezelRing = `<circle cx="60" cy="60" r="52" fill="none" stroke="${bezelColor}" stroke-width="9"/>`;
    for(let i=0;i<60;i++){
      const a = (i/60)*Math.PI*2;
      const len = i%5===0? 6:3;
      const x1 = 60+(48)*Math.cos(a), y1=60+(48)*Math.sin(a);
      const x2 = 60+(48-len)*Math.cos(a), y2=60+(48-len)*Math.sin(a);
      bezelRing += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#0a0a08" stroke-width="1.2" opacity=".5"/>`;
    }
  } else if(bezel==='gmt'){
    bezelRing = `<path d="M60 8 A52 52 0 0 1 112 60 L60 60 Z" fill="${bezelColor}"/><path d="M60 8 A52 52 0 0 0 8 60 L60 60 Z" fill="${bezelColor2}"/><circle cx="60" cy="60" r="43" fill="${dial}"/>`;
  }
  let ticks='';
  for(let i=0;i<12;i++){
    const a=(i/12)*Math.PI*2 - Math.PI/2;
    const x1=60+38*Math.cos(a), y1=60+38*Math.sin(a);
    const x2=60+33*Math.cos(a), y2=60+33*Math.sin(a);
    ticks+=`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${tick}" stroke-width="${i%3===0?2.6:1.4}"/>`;
  }
  return `
  <svg class="watch-svg" data-id="${id}" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
    <circle cx="60" cy="60" r="58" fill="#0c0d0a"/>
    ${bezelRing}
    ${bezel!=='gmt' ? `<circle cx="60" cy="60" r="43" fill="${dial}"/>` : ''}
    <circle cx="60" cy="60" r="43" fill="url(#sheen${id})" opacity=".35"/>
    ${ticks}
    <text x="60" y="47" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="6" fill="${dialText}" letter-spacing="1">ROLEX</text>
    <rect x="52" y="68" width="16" height="8" rx="1.5" fill="#0a0a08" opacity=".6"/>
    <text x="60" y="74" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="5" fill="${dialText}">25</text>
    <g class="hands">
      <line x1="60" y1="60" x2="60" y2="34" stroke="${dialText}" stroke-width="2.6" stroke-linecap="round"/>
      <line x1="60" y1="60" x2="78" y2="60" stroke="${dialText}" stroke-width="2.2" stroke-linecap="round"/>
      <line class="secHand-${id}" x1="60" y1="60" x2="60" y2="28" stroke="${bezelColor==='#c9a24b'?'#b5762c':bezelColor}" stroke-width="1" stroke-linecap="round" transform-origin="60 60"/>
    </g>
    <circle cx="60" cy="60" r="3" fill="${caseColor}"/>
    <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,.08)" stroke-width="1"/>
    <defs>
      <radialGradient id="sheen${id}" cx="35%" cy="25%" r="70%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity=".5"/>
        <stop offset="60%" stop-color="#ffffff" stop-opacity="0"/>
      </radialGradient>
    </defs>
  </svg>`;
}

function sideProfileSVG(color){
  return `<svg viewBox="0 0 160 100" xmlns="http://www.w3.org/2000/svg">
    <rect x="20" y="42" width="120" height="16" rx="4" fill="${color}"/>
    <rect x="10" y="46" width="14" height="8" rx="2" fill="#8a6a26"/>
    <rect x="136" y="46" width="14" height="8" rx="2" fill="#8a6a26"/>
    <ellipse cx="80" cy="50" rx="34" ry="20" fill="#0c0d0a"/>
    <ellipse cx="80" cy="50" rx="30" ry="16" fill="${color}" opacity=".8"/>
    <path d="M46 66 Q80 100 114 66" stroke="#1a1a17" stroke-width="10" fill="none" opacity=".7"/>
    <path d="M46 34 Q80 0 114 34" stroke="#1a1a17" stroke-width="10" fill="none" opacity=".7"/>
  </svg>`;
}

function wristSVG(color){
  return `<svg viewBox="0 0 160 120" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 90 Q80 130 150 88 L150 120 L10 120 Z" fill="#1c130c" opacity=".55"/>
    <rect x="55" y="40" width="50" height="76" rx="26" fill="#241a11" opacity=".85"/>
    <circle cx="80" cy="55" r="30" fill="#0c0d0a"/>
    <circle cx="80" cy="55" r="26" fill="${color}"/>
    <circle cx="80" cy="55" r="26" fill="none" stroke="rgba(255,255,255,.15)" stroke-width="1"/>
    <line x1="80" y1="55" x2="80" y2="38" stroke="#e4cd8f" stroke-width="2"/>
    <line x1="80" y1="55" x2="92" y2="55" stroke="#e4cd8f" stroke-width="1.8"/>
  </svg>`;
}

/* ---------------- MODELS DATA ---------------- */
const models = [
  { id:'sub', name:'Submariner', ref:'126610LN', bezel:'dive', bezelColor:'#c9a24b', dial:'#06392c', tick:'#e4cd8f', price:'89 500 сомонӣ',
    photo:'https://commons.wikimedia.org/wiki/Special:FilePath/Rolex-Submariner.jpg',
    desc:'Соати ботинии афсонавӣ барои ғаввосон, тобовар то 300 метр зери об, бо ринги давридиҳии яктарафа.',
    specs:{Тан:'Oystersteel 41мм', Механизм:'Худкор, Калибри 3235', Обногузарӣ:'300 м', Шиша:'Сапфир'} },
  { id:'day', name:'Daytona', ref:'126500LN', bezel:'fluted', bezelColor:'#c9a24b', dial:'#0d0d0c', tick:'#f2ecdd', price:'142 000 сомонӣ',
    photo:'https://commons.wikimedia.org/wiki/Special:FilePath/Rolex Daytona Cosmograph.jpg',
    desc:'Хронографи мусобиқавӣ, сохта барои дақиқии ниҳоӣ ва суръати баланд дар пист.',
    specs:{Тан:'Oystersteel 40мм', Механизм:'Худкори хроно 4131', Обногузарӣ:'100 м', Шиша:'Сапфир'} },
  { id:'date', name:'Datejust', ref:'126234', bezel:'fluted', bezelColor:'#c9a24b', dial:'#0e2e24', tick:'#f2ecdd', price:'76 300 сомонӣ',
    photo:'https://commons.wikimedia.org/wiki/Special:FilePath/Rolex Datejust 126234.jpg',
    desc:'Классики беохир бо равзанаи сана ва линзаи Cyclops, интихоби расмии тиҷорат.',
    specs:{Тан:'Oystersteel/Тилло 36мм', Механизм:'Худкор, Калибри 3235', Обногузарӣ:'100 м', Шиша:'Сапфир'} },
  { id:'gmt', name:'GMT-Master II', ref:'126710BLRO', bezel:'gmt', bezelColor:'#1c3f7a', bezelColor2:'#7a1f1f', dial:'#0c0d0a', tick:'#f2ecdd', price:'118 900 сомонӣ',
    photo:'https://commons.wikimedia.org/wiki/Special:FilePath/Rolex GMT Master II Pepsi.jpg',
    desc:'Соати мусофирони ҳавопаймо, нишон медиҳад ду минтақаи вақт якбора — рамзи "Pepsi".',
    specs:{Тан:'Oystersteel 40мм', Механизм:'Худкор, Калибри 3285', Обногузарӣ:'100 м', Шиша:'Сапфир'} },
  { id:'exp', name:'Explorer', ref:'224270', bezel:'plain', bezelColor:'#9a9a9a', dial:'#0c0d0a', tick:'#f2ecdd', price:'68 200 сомонӣ',
    photo:'https://commons.wikimedia.org/wiki/Special:FilePath/Rolex Oyster Perpetual Explorer Ref. 114270 Cal. 3130.png',
    desc:'Соддагии ҳадафнок барои кӯҳнавардон, тобовар дар ҳарорати -20°C то +40°C.',
    specs:{Тан:'Oystersteel 36мм', Механизм:'Худкор, Калибри 3230', Обногузарӣ:'100 м', Шиша:'Сапфир'} },
  { id:'sea', name:'Sea-Dweller', ref:'126600', bezel:'dive', bezelColor:'#0a0a08', dial:'#0c0d0a', tick:'#e4cd8f', price:'99 700 сомонӣ',
    photo:"https://commons.wikimedia.org/wiki/Special:FilePath/Rolex Deepsea Sea-Dweller 116660 Blue Dial 'James Cameron'.jpg",
    desc:'Барои ғаввосии амиқ то 1220 метр, дорои клапани гелий барои декомпрессия.',
    specs:{Тан:'Oystersteel 43мм', Механизм:'Худкор, Калибри 3235', Обногузарӣ:'1220 м', Шиша:'Сапфир'} },
  { id:'yacht', name:'Yacht-Master', ref:'226659', bezel:'plain', bezelColor:'#c9c9c9', dial:'#1c3f7a', tick:'#f2ecdd', price:'157 400 сомонӣ',
    photo:'https://commons.wikimedia.org/wiki/Special:FilePath/Rolex Yachtmaster II 116680.JPG',
    desc:'Рӯҳияи баҳрии амаливу боҳашамат, тан аз платина ва Oystersteel.',
    specs:{Тан:'Платина/Пӯлод 42мм', Механизм:'Худкор, Калибри 3235', Обногузарӣ:'100 м', Шиша:'Сапфир'} },
  { id:'sky', name:'Sky-Dweller', ref:'336934', bezel:'fluted', bezelColor:'#c9a24b', dial:'#3a2a12', tick:'#f2ecdd', price:'168 900 сомонӣ',
    photo:'https://commons.wikimedia.org/wiki/Special:FilePath/Rolex Sky-Dweller in oro bianco.jpg',
    desc:'Соли аннуалӣ ва GMT дар як механизм — барои мусофирони бетанаффус.',
    specs:{Тан:'Oystersteel/Тилло 42мм', Механизм:'Худкор, Калибри 9001', Обногузарӣ:'100 м', Шиша:'Сапфир'} },
];

/* ---------------- RENDER HERO WATCH ---------------- */
document.getElementById('heroWatch').innerHTML = watchSVG({id:'hero', bezel:'dive', bezelColor:'#c9a24b', dial:'#06392c', tick:'#e4cd8f'});

/* ---------------- RENDER GRID ---------------- */
const grid = document.getElementById('grid');
models.forEach((m,i)=>{
  const card = document.createElement('div');
  card.className='card';
  const svgId = 'card'+m.id;
  card.innerHTML = `
    <span class="idx">${String(i+1).padStart(2,'0')}</span>
    <div class="watchbox">
      <img src="${m.photo}" alt="Rolex ${m.name}" loading="lazy"
           onerror="this.replaceWith(document.getElementById('${svgId}-fallback').content.firstElementChild)">
      <template id="${svgId}-fallback">${watchSVG({...m, id:svgId})}</template>
    </div>
    <h3>${m.name}</h3>
    <div class="ref">РЕФ. ${m.ref}</div>
    <div class="price">${m.price}</div>
    <div class="viewline">Намоиши васеъ →</div>
  `;
  card.addEventListener('click', ()=>openModal(m));
  grid.appendChild(card);
});

/* ---------------- TICKING SECOND HANDS ---------------- */
function startTicking(){
  document.querySelectorAll('[class^="secHand-"], [class*=" secHand-"]').forEach(el=>{
    let deg = Math.random()*360;
    setInterval(()=>{
      deg += 6;
      el.setAttribute('transform', `rotate(${deg} 60 60)`);
    }, 1000);
  });
}
startTicking();

/* ---------------- MODAL / SLIDER ---------------- */
const backdrop = document.getElementById('modalBackdrop');
const slidesEl = document.getElementById('slides');
const dotsEl = document.getElementById('dots');
const infoEl = document.getElementById('modalInfo');
let currentSlide = 0;

function openModal(m){
  const svgId = 'modal'+m.id;
  slidesEl.innerHTML = `
    <div class="slide">
      <div class="modal-photo-frame">
        <img src="${m.photo}" alt="Rolex ${m.name}"
             onerror="this.replaceWith(document.getElementById('${svgId}-fallback').content.firstElementChild)">
        <template id="${svgId}-fallback">${watchSVG({...m, id:svgId})}</template>
      </div>
      <div class="caption">Намуди рӯи соат</div>
    </div>
    <div class="slide">${sideProfileSVG(m.bezelColor)}<div class="caption">Намуди паҳлу</div></div>
    <div class="slide">${wristSVG(m.dial)}<div class="caption">Дар маж</div></div>
  `;
  dotsEl.innerHTML = [0,1,2].map(i=>`<div class="dot ${i===0?'active':''}" data-i="${i}"></div>`).join('');
  currentSlide = 0;
  slidesEl.style.transform = 'translateX(0%)';

  infoEl.innerHTML = `
    <span class="eyebrow">Rolex Oyster Perpetual</span>
    <h3>${m.name}</h3>
    <div class="ref">РЕФ. ${m.ref}</div>
    <p class="desc">${m.desc}</p>
    <div class="specs">
      ${Object.entries(m.specs).map(([k,v])=>`<div><b>${k}</b><span>${v}</span></div>`).join('')}
    </div>
    <div class="modal-footer">
      <div class="modal-price">${m.price}</div>
      <button class="btn-primary" id="addCart">Илова ба сабад</button>
    </div>
  `;
  document.getElementById('addCart').addEventListener('click', showToast);
  document.querySelectorAll('.dot').forEach(d=>d.addEventListener('click', ()=>goToSlide(+d.dataset.i)));

  backdrop.classList.add('open');
  startTicking();
}

function goToSlide(i){
  currentSlide = (i+3)%3;
  slidesEl.style.transform = `translateX(-${currentSlide*33.333}%)`;
  document.querySelectorAll('.dot').forEach((d,idx)=> d.classList.toggle('active', idx===currentSlide));
}

document.getElementById('prevBtn').addEventListener('click', ()=>goToSlide(currentSlide-1));
document.getElementById('nextBtn').addEventListener('click', ()=>goToSlide(currentSlide+1));
document.getElementById('modalClose').addEventListener('click', closeModal);
backdrop.addEventListener('click', e=>{ if(e.target===backdrop) closeModal(); });
document.addEventListener('keydown', e=>{
  if(!backdrop.classList.contains('open')) return;
  if(e.key==='Escape') closeModal();
  if(e.key==='ArrowRight') goToSlide(currentSlide+1);
  if(e.key==='ArrowLeft') goToSlide(currentSlide-1);
});
function closeModal(){ backdrop.classList.remove('open'); }

/* ---------------- NAV SCROLL + REVEAL ---------------- */
const navEl = document.querySelector('nav');
window.addEventListener('scroll', ()=>{
  navEl.classList.toggle('scrolled', window.scrollY > 30);
}, { passive:true });

const revealObserver = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); revealObserver.unobserve(e.target); } });
}, { threshold:0.12 });
document.querySelectorAll('.reveal').forEach(el=>revealObserver.observe(el));

function showToast(){
  const t = document.getElementById('toast');
  t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'), 2200);
}

}catch(err){
  console.error('Хатогии сайт:', err);
}
});