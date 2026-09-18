/* ============ PAGE NAVIGATION ============ */
const pages = document.querySelectorAll('.page');
const navs  = document.querySelectorAll('.nav');

function goTo(pageName){
  // Sembunyikan semua halaman
  pages.forEach(p => p.classList.remove('active'));

  // Tampilkan halaman target
  const target = document.getElementById('page-' + pageName);
  if(target){
    target.classList.add('active');
    window.scrollTo({top:0, behavior:'smooth'});
  }

  // Update state bottom nav
  navs.forEach(n => {
    n.classList.toggle('active', n.dataset.nav === pageName);
  });
}

// Tombol dengan data-nav
document.querySelectorAll('[data-nav]').forEach(el => {
  el.addEventListener('click', () => {
    const page = el.dataset.nav;
    if(page === 'enhance') toast('Enhance Photo');
    if(page === 'history') toast('History');
    if(page === 'profile') toast('Profile');
    goTo(page);
  });
});

/* ============ UPLOAD & PREVIEW ============ */
const fileInput   = document.getElementById('fileInput');
const preview     = document.getElementById('preview');
const previewImg  = document.getElementById('previewImg');
const fileNameEl  = document.getElementById('fileName');
const fileSizeEl  = document.getElementById('fileSize');
const removeBtn   = document.getElementById('removeBtn');
const processBtn  = document.getElementById('processBtn');

let currentFile = null;
let currentRes  = 2160;

const MAX_SIZE = 10 * 1024 * 1024; // 10MB

fileInput.addEventListener('change', e => {
  const f = e.target.files[0];
  if(!f) return;

  if(!f.type.startsWith('image/')){
    toast('File harus berupa gambar');
    return;
  }

  if(f.size > MAX_SIZE){
    toast('Ukuran file maks 10MB');
    return;
  }

  currentFile = f;
  previewImg.src = URL.createObjectURL(f);
  fileNameEl.textContent = f.name;
  fileSizeEl.textContent = formatSize(f.size);

  preview.classList.add('show');
  processBtn.disabled = false;

  toast('Foto berhasil diupload');
});

removeBtn.addEventListener('click', () => {
  currentFile = null;
  fileInput.value = '';
  previewImg.src = '';
  preview.classList.remove('show');
  processBtn.disabled = true;
  toast('Foto dihapus');
});

function formatSize(bytes){
  if(bytes < 1024) return bytes + ' B';
  if(bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1024 / 1024).toFixed(2) + ' MB';
}

/* ============ RESOLUTION PICKER ============ */
document.querySelectorAll('.res').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.res').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    currentRes = parseInt(btn.dataset.r);
  });
});

/* ============ PROCESS (PROTOTYPE) ============ */
processBtn.addEventListener('click', () => {
  if(!currentFile){
    toast('Upload foto dulu ya');
    return;
  }

  const label = currentRes >= 2160 ? '4K' : currentRes + 'p';
  processBtn.disabled = true;
  processBtn.textContent = `Memproses ${label}...`;
  toast(`Processing ${label} — prototype`);

  // Simulasi proses (belum ada AI asli)
  setTimeout(() => {
    processBtn.textContent = 'Selesai! (prototype)';
    toast('Tahap prototype — belum proses HD asli');

    setTimeout(() => {
      processBtn.textContent = 'Mulai Enhance';
      processBtn.disabled = false;
    }, 1800);
  }, 1600);
});

/* ============ TOAST ============ */
let toastTimer;
function toast(msg){
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 1800);
}

/* ============ GENERIC TOAST BUTTONS ============ */
document.querySelectorAll('[data-toast]').forEach(el => {
  el.addEventListener('click', () => toast(el.dataset.toast));
});
