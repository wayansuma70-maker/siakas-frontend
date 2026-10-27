// js/app.js — shell aplikasi, router hash, login, boot
const S = { me: null, cfg: {}, kelas: [], kelasAktif: '', badge: {}, nav: 0 };
const SEMUA_PERAN = ['admin', 'pimpinan', 'wali', 'pengurus', 'siswa'];
const NAV = [
  { sec: 'Core navigation' },
  { id: 'overview', label: 'Overview', ic: 'grid', roles: SEMUA_PERAN },
  { id: 'presensi', label: 'Presensi / Attend', ic: 'usercheck', roles: SEMUA_PERAN },
  { id: 'kas', label: 'Kas Kelas / Cash', ic: 'wallet', roles: SEMUA_PERAN, badge: 'kas' },
  { id: 'barang', label: 'Lost & Found', ic: 'box', roles: SEMUA_PERAN, badge: 'barang' },
  { id: 'kegiatan', label: 'Inventory & Act', ic: 'inv', roles: SEMUA_PERAN },
  { id: 'integritas', label: 'Integrity Reports', ic: 'alert', roles: SEMUA_PERAN, badge: 'laporan' },
  { id: 'laporan', label: 'Reports & Export', ic: 'file', roles: ['admin', 'pimpinan', 'wali'] },
  { sec: 'Governance', roles: ['admin', 'pimpinan'] },
  { id: 'pengguna', label: 'Users [Admin]', ic: 'users', roles: ['admin'] },
  { id: 'wa', label: 'WhatsApp & Notif', ic: 'send', roles: ['admin'] },
  { id: 'crm', label: 'CRM Kontak', ic: 'user', roles: ['admin'] },
  { id: 'pengaturan', label: 'Settings & Audit', ic: 'lock', roles: ['admin', 'pimpinan'] }
];
const RUTE_INDUK = { 'kas/baru': 'kas' };
const go = r => { const h = '#/' + r; if (location.hash === h) route(); else location.hash = h; };

document.addEventListener('click', e => { const a = e.target.closest('[data-go]'); if (a) { e.preventDefault(); document.body.classList.remove('nav'); go(a.dataset.go); } });
window.addEventListener('hashchange', () => { if (S.me) route(); else if (location.hash === '#/darurat') renderDarurat(); });
window.addEventListener('siakas:auth', () => { if (S.me) { S.me = null; toast('Sesi berakhir. Silakan masuk kembali.', 'err'); } renderLogin(); });
document.addEventListener('click', e => { if (!e.target.closest('.menu,[data-menu]')) $$('.menu').forEach(m => m.remove()); });

// ---------------------------------------------------------------- shell
function renderShell() {
  const app = $('#app');
  if (!$('#view')) app.innerHTML = '<div class="app"><aside class="sb" id="sb" aria-label="Navigasi utama"></aside><div class="main"><header class="top" id="top"></header><main class="view" id="view" tabindex="-1"></main></div></div><div class="scrim" id="scrim"></div>';
  const role = S.me.role, aktif = RUTE_INDUK[ruteSaatIni()] || ruteSaatIni().split('/')[0];
  let sb = `<div class="sb-brand"><div class="logo">[X]</div><div><b>SIAKAS</b><span class="mono xs sub">${esc((S.cfg.NAMA_SEKOLAH || 'SMPN 3 KEDIRI').replace('SMP Negeri', 'SMPN').toUpperCase())}</span></div></div><div class="ver">v1.0.0-AUDIT</div>`;
  NAV.forEach(i => {
    if (i.sec) { if (!i.roles || i.roles.includes(role)) sb += `<div class="sb-sec">${esc(i.sec)}</div>`; return; }
    if (!i.roles.includes(role)) return;
    const b = i.badge && S.badge[i.badge];
    sb += `<a class="sb-it ${aktif === i.id ? 'on' : ''}" data-go="${i.id}" href="#/${i.id}" ${aktif === i.id ? 'aria-current="page"' : ''}>${ic(i.ic)}<span>${esc(i.label)}</span>${b ? `<span class="n">${b > 99 ? '99+' : b}</span>` : ''}</a>`;
  });
  sb += `<div class="sb-fill"></div><div class="quote">[QUOTE // INTEGRITY]<br>“Kejujuran adalah pondasi kehormatan sekolah.”</div><button class="btn o sb-out" id="logout">${ic('out', 14)} Logout</button>`;
  $('#sb').innerHTML = sb;
  const notif = (S.badge.kas || 0) + (S.badge.laporan || 0) + (S.badge.barang || 0), input = ['admin', 'wali', 'pengurus'].includes(role);
  $('#top').innerHTML = `<button class="iconbtn burger" id="burger" aria-label="Buka menu">${ic('menu')}</button><div class="crumb">SIAKAS <span>/ PANEL /</span> <u>INDEX</u></div><div class="sp"></div>
    <span class="pill hd">TA: <b>${esc(S.cfg.TAHUN_AJARAN || '-')}</b></span><span class="pill hd">SEM: <b>${esc(S.cfg.SEMESTER || '-')}</b></span>
    <button class="btn sm" id="quick" data-menu>${ic('plus', 14)} Entri cepat</button>
    <button class="iconbtn" id="kbtn" aria-label="Kumbang pendamping" title="Kumbang pendamping: ${window.Kumbang && Kumbang.aktif ? 'ON' : 'OFF'}" style="${window.Kumbang && Kumbang.aktif ? 'background:var(--blk);color:#fff' : ''}">${ic('bug')}</button>
    <button class="iconbtn" id="bell" aria-label="Notifikasi" data-menu>${ic('bell')}${notif ? `<span class="dot">${notif > 99 ? '99+' : notif}</span>` : ''}</button>
    <button class="user" id="usr" data-menu style="background:#fff;cursor:pointer"><div class="t"><b>${esc(S.me.nama)}</b><span class="mono xs sub">${ROLE_LABEL[role]}${S.me.kelas.length ? ' ' + esc(S.me.kelas[0]) : ''}</span></div><div class="av">${ic('user', 16)}</div></button>`;
  $('#burger').onclick = () => document.body.classList.toggle('nav'); $('#scrim').onclick = () => document.body.classList.remove('nav');
  $('#logout').onclick = logout;
  $('#kbtn').onclick = () => { if (window.Kumbang) { Kumbang.toggle(); renderShell(); toast('Kumbang pendamping ' + (Kumbang.aktif ? 'aktif 🪲' : 'dimatikan')); } };
  const menu = (btn, html) => { $$('.menu').forEach(m => m.remove()); const m = document.createElement('div'); m.className = 'menu'; m.innerHTML = html; document.body.appendChild(m); const r = btn.getBoundingClientRect(); m.style.position = 'fixed'; m.style.top = r.bottom + 6 + 'px'; m.style.right = Math.max(8, innerWidth - r.right) + 'px'; $$('[data-go]', m).forEach(a => a.onclick = () => m.remove()); return m; };
  $('#quick').onclick = e => { e.stopPropagation(); menu(e.currentTarget, [input ? `<a data-go="kas/baru">${ic('wallet')} Catat transaksi kas</a>` : '', `<a data-go="presensi">${ic('usercheck')} Presensi</a>`, `<a data-go="barang">${ic('box')} Lapor barang</a>`, S.me.role !== 'pimpinan' ? `<a data-go="integritas">${ic('alert')} Laporan integritas</a>` : ''].join('')); };
  $('#bell').onclick = e => { e.stopPropagation(); const b = S.badge, it = []; if (b.kas) it.push(`<a data-go="kas">${ic('wallet')} ${b.kas} transaksi kas menunggu verifikasi</a>`); if (b.laporan) it.push(`<a data-go="integritas">${ic('alert')} ${b.laporan} laporan integritas belum selesai</a>`); if (b.barang) it.push(`<a data-go="barang">${ic('box')} ${b.barang} klaim barang menunggu</a>`); menu(e.currentTarget, it.join('') || `<a style="cursor:default">${ic('shield')} Tidak ada notifikasi baru</a>`); };
  $('#usr').onclick = e => { e.stopPropagation(); const m = menu(e.currentTarget, `<a style="cursor:default"><div><b>${esc(S.me.nama)}</b><div class="mono xs sub">${esc(S.me.email)}</div></div></a><a id="mk">${ic('out')} Keluar dari semua perangkat</a><a id="mo">${ic('out')} Keluar</a>`); $('#mo', m).onclick = logout; $('#mk', m).onclick = async () => { try { await Api.call('auth.keluarSemua', {}); } catch (x) { /* abaikan */ } logout(); }; };
}
const ruteSaatIni = () => (location.hash.replace(/^#\/?/, '') || 'overview').split('?')[0];

async function route() {
  if (!S.me) return;
  let r = ruteSaatIni(), induk = RUTE_INDUK[r] || r.split('/')[0];
  const nv = NAV.find(i => i.id === induk);
  if (!Pages[r] || !nv || !nv.roles.includes(S.me.role)) { if (r !== 'overview') toast('Halaman tidak tersedia untuk peran Anda.', 'err'); r = 'overview'; location.replace('#/overview'); }
  S.nav++; document.body.classList.remove('nav'); renderShell();
  const v = $('#view'); v.scrollTop = 0; window.scrollTo(0, 0); v.innerHTML = muat();
  document.title = (NAV.find(i => i.id === (RUTE_INDUK[r] || r.split('/')[0])) || { label: 'SIAKAS' }).label + ' · SIAKAS ' + (S.cfg.NAMA_SEKOLAH || '');
  try { await Pages[r](v); } catch (e) { v.innerHTML = `<div class="card">${kosong('alert', e.message || 'Terjadi kesalahan.')}</div>`; }
  v.focus({ preventScroll: true });
}

// ---------------------------------------------------------------- auth
async function muatSesi() {
  const d = await Api.d('auth.me', {});
  S.me = d.me; S.cfg = d.cfg || {}; S.kelas = d.kelas || []; S.badge = d.badge || {};
  if (!S.kelas.includes(S.kelasAktif)) S.kelasAktif = S.kelas[0] || '';
}
function logout() {
  Api.setToken(''); S.me = null; S.kelasAktif = '';
  try { Object.keys(localStorage).filter(k => k.startsWith('siakas_c_')).forEach(k => localStorage.removeItem(k)); } catch (e) { /* abaikan */ }
  $('#app').innerHTML = ''; location.hash = '#/'; renderLogin();
}
function layarSetup(judul, isi) {
  $('#app').innerHTML = `<div class="login"><div class="card"><div class="ch"><h3>${esc(judul)}</h3></div><div class="cb">${isi}</div></div></div>`;
}
async function renderLogin() {
  if (!Api.siap()) return layarSetup('Konfigurasi belum lengkap', '<p>Buka <code class="mono">js/config.js</code> lalu isi <b>GAS_URL</b> dengan URL Web App Apps Script (berakhiran <code class="mono">/exec</code>). Lihat PANDUAN-INSTALASI.md.</p>');
  $('#app').innerHTML = `<div class="login"><div class="card"><div class="cb" style="padding:24px"><div class="row" style="gap:12px;margin-bottom:6px"><div class="logo" style="width:46px;height:46px">[X]</div><div><div class="b" style="font:700 22px var(--f);letter-spacing:-.01em">SIAKAS</div><div class="mono xs sub">SISTEM APLIKASI ANTI KORUPSI</div></div></div><p class="sub" style="margin:14px 0" id="lsub">SMP Negeri 3 Kediri, Tabanan, Bali — transparansi, integritas, dan akuntabilitas.</p><div id="gbtn" style="min-height:44px;display:flex;justify-content:center">${muat('Menyiapkan login…')}</div><p class="mono xs sub c" style="margin-top:14px">Gunakan akun Google sekolah yang sudah didaftarkan admin.<br>Belum terdaftar? Hubungi admin sekolah.</p></div><div class="cf c">[SIAKAS v1.0.0-AUDIT]</div></div></div>`;
  Api.warm();
  try {
    const c = await Api.d('auth.config', {}); if (c.namaSekolah) $('#lsub').textContent = c.namaSekolah + ' — transparansi, integritas, dan akuntabilitas.';
    if (!c.googleClientId) { $('#gbtn').innerHTML = `<div class="chk" style="cursor:default">${ic('alert')}<span class="sm">Login Google belum disiapkan. Admin dapat masuk lewat akses darurat dan mengisi Client ID di Pengaturan.</span></div>`; return; }
    await muatGsi();
    google.accounts.id.initialize({ client_id: c.googleClientId, callback: async resp => { try { $('#gbtn').innerHTML = muat('Memverifikasi…'); const r = await Api.call('auth.google', { idToken: resp.credential }); Api.setToken(r.data.token); await masuk(); } catch (e) { toast(e.message, 'err'); renderLogin(); } }, auto_select: false, ux_mode: 'popup' });
    $('#gbtn').innerHTML = ''; google.accounts.id.renderButton($('#gbtn'), { theme: 'outline', size: 'large', text: 'signin_with', shape: 'rectangular', width: 320, locale: 'id' });
  } catch (e) { $('#gbtn').innerHTML = `<div class="chk" style="cursor:default">${ic('alert')}<span class="sm">${esc(e.message)}</span></div><button class="btn o mt" onclick="renderLogin()">Coba lagi</button>`; }
}
function muatGsi() {
  return new Promise((ok, no) => { if (window.google && google.accounts) return ok(); const s = document.createElement('script'); s.src = 'https://accounts.google.com/gsi/client'; s.async = true; s.onload = ok; s.onerror = () => no(new Error('Gagal memuat layanan Google. Periksa koneksi internet.')); document.head.appendChild(s); });
}
function renderDarurat() {
  if (!Api.siap()) return renderLogin();
  $('#app').innerHTML = `<div class="login"><div class="card"><div class="ch"><h3>${ic('lock', 16)} Akses darurat</h3><span class="bd r">[ADMIN]</span></div><div class="cb"><p class="sm sub" style="margin-top:0">Hanya untuk admin bila login Google tidak dapat dipakai. Setiap percobaan dicatat; 5 kali salah mengunci 15 menit.</p>${fld('Nama pengguna', '<input class="in" id="du" autocomplete="username">')}${fld('Kata sandi', '<input class="in" id="dp" type="password" autocomplete="current-password">')}<button class="btn" id="dgo" style="width:100%;justify-content:center">Masuk</button><p class="c mt"><a href="#/" class="sm">← Kembali ke login biasa</a></p></div></div></div>`;
  const kirim = e => aman($('#dgo'), async () => { const r = await Api.call('auth.darurat', { username: $('#du').value, password: $('#dp').value }); Api.setToken(r.data.token); await masuk(); });
  $('#dgo').onclick = kirim; $('#dp').onkeydown = e => { if (e.key === 'Enter') kirim(); };
}
async function masuk() {
  await muatSesi();
  if (location.hash === '#/darurat' || location.hash === '#/' || !location.hash) location.hash = '#/overview';
  route(); setInterval(async () => { try { const d = await Api.d('auth.me', {}); S.badge = d.badge || {}; renderShell(); } catch (e) { /* sesi dicek saat aksi berikutnya */ } }, 180000);
}

// ---------------------------------------------------------------- boot
(async function boot() {
  if (window.Kumbang) Kumbang.init();
  if (!Api.siap()) return renderLogin();
  if (location.hash === '#/darurat' && !Api.token) return renderDarurat();
  if (Api.token) { $('#app').innerHTML = `<div class="login">${muat('Memulihkan sesi…')}</div>`; try { await masuk(); return; } catch (e) { Api.setToken(''); } }
  renderLogin();
})();
