/* ==================================================
   GLOBAL STATE
================================================== */
const pages = document.querySelectorAll('.page');
const navs = document.querySelectorAll('.nav');
const bottomNav = document.getElementById('bottomNav');
const bgAnimation = document.getElementById('bgAnimation');
const starsContainer = document.getElementById('stars');

let mode = 'free';
let isOwner = false;
let currentFile = null;
let currentRes = 720;
let currentFormat = 'jpg';
let currentFeature = null;
let pageHistory = ['home'];

const MAX_SIZE = 10 * 1024 * 1024;
const OWNER_CODE = 'GUSTAV2026';

/* ==================================================
   NAVIGASI
================================================== */
function goTo(name){
  // Simpan ke history (kecuali loading)
  if(name !== 'loading'){
    const current = pageHistory[pageHistory.length - 1];
    if(current !== name){
      pageHistory.push(name);
    }
  }

  // Sembunyikan semua halaman
  pages.forEach(p => p.classList.remove('active'));

  // Tampilkan target
  const target = document.getElementById('page-' + name);
  if(target){
    target.classList.add('active');
    window.scrollTo({top:0, behavior:'smooth'});
  }

  // Update bottom nav
  navs.forEach(n => n.classList.toggle('active', n.dataset.nav === name));

  // Sembunyikan bottom nav di halaman tertentu
  const hideNav = ['quality','options','loading','result'].includes(name);
  bottomNav.style.display = hideNav ? 'none' : 'grid';

  // Background bintang hanya di Home + Premium mode
  updateBg(name);
}

function goBack(){
  if(pageHistory.length > 1){
    pageHistory.pop();
    const prev = pageHistory[pageHistory.length - 1];

    // Pindah TANPA tambah ke history
    pages.forEach(p => p.classList.remove('active'));
    const t = document.getElementById('page-' + prev);
    if(t){
      t.classList.add('active');
      window.scrollTo({top:0, behavior:'smooth'});
    }
    navs.forEach(n => n.classList.toggle('active', n.dataset.nav === prev));
    const hideNav = ['quality','options','loading','result'].includes(prev);
    bottomNav.style.display = hideNav ? 'none' : 'grid';
    updateBg(prev);
  } else {
    goTo('home');
  }
}

function updateBg(pageName){
  if(pageName === 'home' && mode === 'premium'){
    bgAnimation.classList.add('show');
  } else {
    bgAnimation.classList.remove('show');
  }
}

/* ==================================================
   BACKGROUND STARS
================================================== */
const STAR_COUNT = 60;

function createStars(){
  if(!starsContainer) return;
  starsContainer.innerHTML = '';

  for(let i = 0; i < STAR_COUNT; i++){
    const s = document.createElement('div');
    s.className = 'star';
    s.style.left = (Math.random() * 100) + '%';
    s.style.top = (Math.random() * 100) + '%';
    const sz = 1 + Math.random() * 2;
    s.style.width = sz + 'px';
    s.style.height = sz + 'px';
    s.style.opacity = 0.3 + Math.random() * 0.7;
    const d = 15 + Math.random() * 15, dl = -Math.random() * 20;
    const td = 2 + Math.random() * 2, tdl = -Math.random() * 4;
    s.style.animationDuration = `${d}s, ${td}s`;
    s.style.animationDelay = `${dl}s, ${tdl}s`;
    starsContainer.appendChild(s);
  }
}

/* ==================================================
   TOAST
================================================== */
let toastTimer;
function toast(msg){
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 1800);
}

/* ==================================================
   HALAMAN 2: PENINGKAT KUALITAS
================================================== */
// Before/After slider
function updateSlider(v){
  const after = document.getElementById('baAfter');
  const line = document.getElementById('sliderLine');
  const handle = document.querySelector('.ba-slider .slider-handle');

  after.style.clipPath = `inset(0 ${100 - v}% 0 0)`;
  line.style.left = v + '%';
  handle.style.left = v + '%';
}

// Tab switch
function switchTab(tab, el){
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');

  const umum = document.getElementById('featureUmum');
  const skenario = document.getElementById('featureSkenario');

  if(tab === 'umum'){
    umum.style.display = 'grid';
    skenario.style.display = 'none';
  } else {
    umum.style.display = 'none';
    skenario.style.display = 'grid';
  }
}

// Pilih feature
function pickFeature(el, feature){
  document.querySelectorAll('.feature').forEach(f => f.classList.remove('selected'));
  el.classList.add('selected');
  currentFeature = feature;

  // Auto-set AI Upscale ke 4K
  if(feature === 'ai'){
    currentRes = 2160;
  }

  toast('Fitur: ' + feature.charAt(0).toUpperCase() + feature.slice(1));
}

// Buka galeri HP
function openGallery(){
  if(!currentFeature){
    toast('Pilih fitur dulu');
    return;
  }

  // Buat input file temporary
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*,video/*';
  input.onchange = (e) => {
    const f = e.target.files[0];
    if(!f) return;

    if(f.size > MAX_SIZE){
      toast('File maks 10MB');
      return;
    }

    currentFile = f;

    // Tentukan apakah foto atau video
    const isVideo = f.type.startsWith('video/');

    // Kalau pilih FPS tapi bukan video
    if(currentFeature === 'fps' && !isVideo){
      toast('FPS hanya untuk video');
      return;
    }

    // Siapkan halaman options
    setupOptions(f, isVideo);
    goTo('options');
  };
  input.click();
}

/* ==================================================
   HALAMAN 4: OPTIONS
================================================== */
function setupOptions(f, isVideo){
  // Set preview
  const img = document.getElementById('optionsPreviewImg');
  img.src = URL.createObjectURL(f);
  img.style.display = 'block';

  // Set file info
  document.getElementById('optionsFileName').textContent = f.name;
  document.getElementById('optionsFileSize').textContent = formatSize(f.size);

  // Set title berdasarkan feature
  const featureNames = {
    'resolusi': 'Pilih Resolusi',
    'fps': 'Pilih Frame Rate',
    'potret': 'Pilih Resolusi (Potret)',
    'ai': 'AI Upscale (Otomatis 4K)',
    'sosial': 'Sosial Media (1080p)',
    'cetak': 'Cetak Foto (4K)',
    'cinema': 'Cinema (4K 60fps)',
    'restorasi': 'Restorasi (4K + Potret)'
  };
  document.getElementById('optionsTitle').textContent = featureNames[currentFeature] || 'Pilih Opsi';

  // Reset pilihan
  document.querySelectorAll('#resGrid .res').forEach(r => r.classList.remove('selected'));
  document.querySelectorAll('#formatGrid .res').forEach(r => r.classList.remove('selected'));

  // Default format JPG
  document.querySelector('#formatGrid .res[data-f="jpg"]').classList.add('selected');

  // Setup resolusi grid
  const resGrid = document.getElementById('resGrid');
  const formatHead = document.getElementById('formatHead');
  const formatGrid = document.getElementById('formatGrid');

  if(currentFeature === 'fps'){
    // Tampilkan FPS, bukan resolusi
    document.getElementById('optionsSectionTitle').textContent = 'Frame Rate (FPS)';
    resGrid.innerHTML = `
      <button class="res" data-r="60" onclick="pickRes(this)"><h4>60</h4><p>Standard</p></button>
      <button class="res" data-r="120" onclick="pickRes(this)"><h4>120</h4><p>Smooth</p></button>
      <button class="res" data-r="140" onclick="pickRes(this)"><h4>140</h4><p>Gaming</p></button>
      <button class="res" data-r="180" onclick="pickRes(this)"><h4>180</h4><p>Ultra</p></button>
    `;
    currentRes = 60;
  } else {
    // Tampilkan resolusi
    document.getElementById('optionsSectionTitle').textContent = 'Output Resolution';
    resGrid.innerHTML = `
      <button class="res" data-r="720" onclick="pickRes(this)"><h4>720p</h4><p>HD Ready</p></button>
      <button class="res" data-r="1080" onclick="pickRes(this)"><h4>1080p</h4><p>Full HD</p></button>
      <button class="res locked" data-r="1440" onclick="tryLocked(this)">
        <div class="lock-badge"><svg class="ico" viewBox="0 0 24 24"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg></div>
        <h4>2K</h4><p>Ultra HD</p>
      </button>
      <button class="res locked" data-r="2160" onclick="tryLocked(this)">
        <div class="lock-badge"><svg class="ico" viewBox="0 0 24 24"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg></div>
        <h4>4K</h4><p>Ultra HD</p>
      </button>
    `;

    // Apply mode (lock/unlock)
    if(mode === 'premium'){
      document.querySelectorAll('#resGrid .res').forEach(r => r.classList.remove('locked'));
      document.querySelectorAll('#resGrid .lock-badge').forEach(b => b.style.display = 'none');
    }
  }

  // Tampilkan format grid
  formatHead.style.display = 'flex';
  formatGrid.style.display = 'grid';

  // Set selected pertama
  document.querySelector('#resGrid .res').classList.add('selected');
  currentRes = parseInt(document.querySelector('#resGrid .res').dataset.r);

  // Enable process button
  document.getElementById('optionsProcessBtn').disabled = false;

  // Update chip
  document.getElementById('optionsChip').textContent = mode === 'premium' ? 'PREMIUM' : 'FREE';
}

function pickRes(el){
  if(el.classList.contains('locked')){
    tryLocked(el);
    return;
  }
  // Hapus SEMUA selected (fix bug 2 ungu)
  document.querySelectorAll('.res').forEach(r => r.classList.remove('selected'));
  el.classList.add('selected');
  currentRes = parseInt(el.dataset.r);
}

function tryLocked(el){
  if(mode === 'premium') return;
  toast('Upgrade ke Premium untuk membuka');
}

function pickFormat(el){
  document.querySelectorAll('#formatGrid .res').forEach(r => r.classList.remove('selected'));
  el.classList.add('selected');
  currentFormat = el.dataset.f;
}

function resetOptions(){
  currentFile = null;
  goBack();
}

/* ==================================================
   HALAMAN 5: PROSES
================================================== */
function startProcess(){
  if(!currentFile){
    toast('Tidak ada file');
    return;
  }

  goTo('loading');

  const label = getLabel();
  document.getElementById('loadingChip').textContent = mode === 'premium' ? 'PREMIUM' : 'FREE';
  document.getElementById('loadingTitle').textContent = 'Enhancing...';

  let progress = 0;
  const duration = mode === 'premium' ? 2500 : 4500;
  const step = 50;
  const inc = 100 / (duration / step);

  const statuses = [
    {m:30, t:'Menyiapkan...'},
    {m:70, t:'Enhancing...'},
    {m:99, t:'Menyelesaikan...'},
    {m:100, t:'Selesai!'}
  ];

  const iv = setInterval(() => {
    progress += inc;
    if(progress > 100) progress = 100;

    document.getElementById('progressBar').style.width = progress + '%';
    document.getElementById('progressPercent').textContent = Math.floor(progress) + '%';

    for(const s of statuses){
      if(progress <= s.m){
        document.getElementById('loadingStatus').textContent = s.t;
        break;
      }
    }

    const rem = Math.ceil((100 - progress) / inc * step / 1000);
    document.getElementById('loadingSub').textContent = progress < 100
      ? `Estimasi: ${rem} detik`
      : `Memproses ${label}...`;

    if(progress >= 100){
      clearInterval(iv);
      setTimeout(() => showResult(label), 500);
    }
  }, step);
}

function cancelProcess(){
  if(confirm('Batal proses?')){
    // Hapus loading dari history
    if(pageHistory[pageHistory.length - 1] === 'loading'){
      pageHistory.pop();
    }
    goBack();
  }
}

function getLabel(){
  if(currentFeature === 'fps') return currentRes + ' fps';
  if(currentRes >= 2160) return '4K';
  if(currentRes >= 1440) return '2K';
  if(currentRes >= 1080) return '1080p';
  if(currentRes >= 720) return '720p';
  return currentRes + 'p';
}

/* ==================================================
   HALAMAN 6: HASIL
================================================== */
function showResult(label){
  // Set preview before/after
  const before = document.getElementById('resultBefore');
  const after = document.getElementById('resultAfter');

  if(currentFile){
    const url = URL.createObjectURL(currentFile);
    before.src = url;
    after.src = url;
  }

  // Set info
  const resText = currentFeature === 'fps'
    ? label
    : label + ' (' + getResolutionSize(currentRes) + ')';

  document.getElementById('resultRes').textContent = resText;
  document.getElementById('resultSize').textContent = currentFile
    ? formatSize(currentFile.size * 1.5)
    : '2.4 MB';
  document.getElementById('resultTime').textContent = (mode === 'premium' ? '1.6' : '3.2') + ' detik';
  document.getElementById('resultChip').textContent = mode === 'premium' ? 'PREMIUM' : 'FREE';

  goTo('result');
}

function getResolutionSize(r){
  const m = {720:'1280×720', 1080:'1920×1080', 1440:'2560×1440', 2160:'3840×2160'};
  return m[r] || r + 'p';
}

function updateResultSlider(v){
  const after = document.getElementById('resultAfter');
  const line = document.getElementById('resultLine');
  const handle = document.querySelector('#page-result .slider-handle');

  after.style.clipPath = `inset(0 ${100 - v}% 0 0)`;
  line.style.left = v + '%';
  handle.style.left = v + '%';
}

/* ==================================================
   SIMPAN & BAGIKAN
================================================== */
async function saveResult(){
  if(!currentFile){
    toast('Tidak ada file');
    return;
  }

  const originalName = currentFile.name.replace(/\.[^/.]+$/, '');
  const ext = currentFormat === 'png' ? 'png' : 'jpg';
  const label = getLabel().replace(/\s/g, '');
  const newName = `${originalName}_GUSTAV-${label}.${ext}`;

  // Coba Web Share API dulu
  if(navigator.canShare && navigator.share){
    try{
      const file = new File([currentFile], newName, { type: currentFile.type });
      if(navigator.canShare({ files: [file] })){
        await navigator.share({
          files: [file],
          title: 'GUSTAV HD',
          text: 'Hasil enhance dari GUSTAV HD'
        });
        toast('Berhasil disimpan');
        return;
      }
    }catch(err){
      // Lanjut ke download biasa
    }
  }

  // Fallback: download
  const url = URL.createObjectURL(currentFile);
  const a = document.createElement('a');
  a.href = url;
  a.download = newName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);

  toast('File disimpan ke Download');
}

function shareResult(){
  if(navigator.share){
    navigator.share({
      title: 'GUSTAV HD',
      text: 'Hasil enhance dari GUSTAV HD'
    }).catch(() => {});
  } else {
    toast('Share tidak didukung');
  }
}

/* ==================================================
   FORMAT SIZE
================================================== */
function formatSize(b){
  if(b < 1024) return b + ' B';
  if(b < 1048576) return (b / 1024).toFixed(1) + ' KB';
  return (b / 1048576).toFixed(2) + ' MB';
}

/* ==================================================
   MODE FREE ↔ PREMIUM
================================================== */
function applyMode(){
  document.body.dataset.mode = mode;

  const banner = document.getElementById('premiumBanner');
  const icon = document.getElementById('bannerIcon');
  const title = document.getElementById('bannerTitle');
  const desc = document.getElementById('bannerDesc');
  const sub = document.getElementById('subStatus');
  const badge = document.getElementById('modeBadgeText');
  const chips = ['optionsChip','loadingChip','resultChip'];

  if(mode === 'premium'){
    banner.classList.remove('free');
    banner.classList.add('premium');
    icon.innerHTML = '<svg class="ico" viewBox="0 0 24 24"><path d="M3 17l4-8 4 5 3-5 7 8"/><path d="M3 17h18"/><path d="M3 17v2h18v-2"/></svg>';
    title.textContent = 'PREMIUM ACTIVATED';
    desc.textContent = 'selamat menikmati!';
    sub.textContent = 'Premium Active - Tahunan';
    badge.textContent = 'PREMIUM';
    chips.forEach(id => {
      const el = document.getElementById(id);
      if(el) el.textContent = 'PREMIUM';
    });
    document.querySelectorAll('.res').forEach(r => r.classList.remove('locked'));
    document.querySelectorAll('.lock-badge').forEach(b => b.style.display = 'none');
  } else {
    banner.classList.remove('premium');
    banner.classList.add('free');
    icon.innerHTML = '<svg class="ico" viewBox="0 0 24 24"><path d="M12 2l1.5 5L19 8.5 13.5 10 12 15l-1.5-5L5 8.5 10.5 7 12 2z"/></svg>';
    title.textContent = 'GUSTAV HD PREMIUM';
    desc.textContent = 'Unlock unlimited AI magic. Pro models, 4K exports & priority queue.';
    sub.textContent = 'Free Plan';
    badge.textContent = 'FREE';
    chips.forEach(id => {
      const el = document.getElementById(id);
      if(el) el.textContent = 'FREE';
    });
    document.querySelectorAll('.res').forEach(r => {
      const rv = parseInt(r.dataset.r);
      if(rv >= 1440) r.classList.add('locked');
    });
    document.querySelectorAll('.lock-badge').forEach(b => b.style.display = 'flex');
  }

  // Update background
  const currentPage = document.querySelector('.page.active')?.id.replace('page-','');
  updateBg(currentPage);
}

/* ==================================================
   OWNER SYSTEM
================================================== */
let secretTapCount = 0;
let secretTapTimer;

function handleSecretTap(){
  secretTapCount++;
  clearTimeout(secretTapTimer);
  secretTapTimer = setTimeout(() => { secretTapCount = 0; }, 1500);

  if(secretTapCount >= 5){
    secretTapCount = 0;
    askOwnerCode();
  }
}

function askOwnerCode(){
  const input = prompt('Masukkan kode owner:');
  if(input === null) return;
  if(input.trim() === OWNER_CODE){
    activateOwner();
  } else {
    toast('Kode salah');
  }
}

function activateOwner(silent){
  isOwner = true;
  document.getElementById('ownerIndicator').classList.add('show');
  if(!silent) toast('Owner mode aktif');
}

function logoutOwner(){
  isOwner = false;
  document.getElementById('ownerIndicator').classList.remove('show');
  closeOwnerPanel();
  toast('Keluar owner mode');
}

function openOwnerPanel(){
  if(!isOwner){ toast('Akses ditolak'); return; }
  document.getElementById('ownerPanel').classList.add('show');
  syncOwnerUI();
}

function closeOwnerPanel(){
  document.getElementById('ownerPanel').classList.remove('show');
}

function setMode(m){
  if(!isOwner){ toast('Hanya owner'); return; }
  if(mode === m) return;
  mode = m;
  applyMode();
  toast(m === 'premium' ? 'Premium mode aktif' : 'Free mode aktif');
}

function syncOwnerUI(){
  document.getElementById('btnFree').classList.toggle('selected', mode === 'free');
  document.getElementById('btnPremium').classList.toggle('selected', mode === 'premium');
}

function resetLimit(){
  toast('Daily limit direset');
}

function clearCache(){
  if(confirm('Hapus semua data?')){
    localStorage.clear();
    toast('Cache dibersihkan');
  }
}

/* ==================================================
   LOGOUT
================================================== */
function logout(){
  toast('Berhasil keluar');
}

/* ==================================================
   EVENT LISTENERS
================================================== */
// Owner panel close on backdrop click
document.getElementById('ownerPanel').addEventListener('click', e => {
  if(e.target.id === 'ownerPanel') closeOwnerPanel();
});

// Keyboard shortcut Ctrl+Shift+O
document.addEventListener('keydown', e => {
  if(e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'o'){
    e.preventDefault();
    if(isOwner) openOwnerPanel();
    else askOwnerCode();
  }
});

/* ==================================================
   INIT
================================================== */
applyMode();
createStars();
updateBg('home');

// URL param untuk owner mode
const params = new URLSearchParams(window.location.search);
if(params.get('owner') === '1') activateOwner(true);

console.log('%c GUSTAV HD ', 'background:#54258f;color:#fff;padding:4px 8px;border-radius:4px;font-weight:bold');
console.log('3 file berhasil diload ✅');
