// js/ui.js — helper tampilan (tanpa dependensi)
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const rp = n => 'Rp ' + Math.round(Number(n) || 0).toLocaleString('id-ID');
const tgl = s => { if (!s) return '-'; const [y, m, d] = String(s).slice(0, 10).split('-'); return d + '/' + m + '/' + y; };
const wkt = s => s ? tgl(s) + ' ' + String(s).slice(11, 16) : '-';
const hariIni = () => { const d = new Date(Date.now() + 8 * 3600e3); return d.toISOString().slice(0, 10); };
const debounce = (f, ms = 350) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => f(...a), ms); }; };
const pct = v => v == null ? '–' : String(v).replace('.', ',') + '%';

const IC = {
  grid: 'M3 3h7v7H3z M14 3h7v7h-7z M14 14h7v7h-7z M3 14h7v7H3z',
  usercheck: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M16 11l2 2 4-4',
  wallet: 'M3 7h18v13H3z M3 7l3-4h12l3 4 M16 13h2',
  box: 'M3 4h18v4H3z M5 8v12h14V8 M10 12h4',
  inv: 'M4 3h16v18H4z M8 7h2 M14 7h2 M8 11h2 M14 11h2 M9 21v-4h6v4',
  alert: 'M12 3l10 18H2z M12 10v5 M12 18v.5',
  file: 'M6 2h9l5 5v15H6z M14 2v6h6 M9 13h6 M9 17h6',
  users: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M22 21v-2a4 4 0 0 0-3-3.9 M16 3.1a4 4 0 0 1 0 7.8',
  lock: 'M5 11h14v10H5z M8 11V7a4 4 0 0 1 8 0v4',
  bell: 'M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9 M10 21h4',
  print: 'M6 9V2h12v7 M6 18H4v-8h16v8h-2 M6 14h12v8H6z',
  plus: 'M12 5v14 M5 12h14',
  download: 'M12 3v12 M7 10l5 5 5-5 M4 21h16',
  upload: 'M12 15V3 M7 8l5-5 5 5 M4 21h16',
  search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14z M21 21l-5-5',
  send: 'M22 2L11 13 M22 2l-7 20-4-9-9-4z',
  out: 'M9 21H4V3h5 M16 17l5-5-5-5 M21 12H9',
  shield: 'M12 2l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5z M9 12l2 2 4-4',
  flag: 'M5 21V4 M5 4h12l-2 4 2 4H5',
  menu: 'M3 6h18 M3 12h18 M3 18h18',
  x: 'M18 6L6 18 M6 6l12 12',
  camera: 'M3 8h4l2-3h6l2 3h4v12H3z M12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  bug: 'M12 8a3 3 0 0 0-3 3v5a3 3 0 0 0 6 0v-5a3 3 0 0 0-3-3z M12 8V5 M9 5l3 1 3-1 M9 12H5 M19 12h-4 M9 16l-4 2 M15 16l4 2',
  user: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  clock: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z M12 7v5l3 2',
  bank: 'M3 10l9-6 9 6 M5 10v9 M9 10v9 M15 10v9 M19 10v9 M3 21h18',
  list: 'M8 6h13 M8 12h13 M8 18h13 M3 6h.5 M3 12h.5 M3 18h.5'
};
const ic = (n, sz = 16) => `<svg class="ic" width="${sz}" height="${sz}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="square" stroke-linejoin="miter" aria-hidden="true"><path d="${IC[n] || ''}"/></svg>`;
const bd = (t, c) => `<span class="bd ${c || ''}">[${esc(t)}]</span>`;
const STATUS_BD = { Terverifikasi: 'k', Menunggu: 'g', Ditolak: 'r', Dibalik: 'm', Ditemukan: 'g', Diklaim: 'k', Dikembalikan: 'm', Diarsipkan: 'm', Terbuka: 'r', Diproses: 'g', Selesai: 'k', Antri: 'g', Terkirim: 'k', Gagal: 'r', Batal: 'm', Berjalan: 'g', Dihentikan: 'm' };
const sbd = s => bd(s, STATUS_BD[s] || 'm');

function toast(msg, tipe) {
  const el = document.createElement('div'); el.className = 'tst' + (tipe === 'err' ? ' err' : ''); el.setAttribute('role', tipe === 'err' ? 'alert' : 'status'); el.textContent = msg;
  $('#toast').appendChild(el); setTimeout(() => el.remove(), tipe === 'err' ? 7000 : 3800);
}
function modal({ title, body, actions = [], wide }) {
  const mask = document.createElement('div'); mask.className = 'mask';
  mask.innerHTML = `<div class="modal ${wide ? 'w' : ''}" role="dialog" aria-modal="true" aria-label="${esc(title)}"><div class="mh"><span>${esc(title)}</span><button class="iconbtn" data-x aria-label="Tutup" style="width:28px;height:28px">${ic('x', 14)}</button></div><div class="mb2">${body}</div>${actions.length ? '<div class="mf"></div>' : ''}</div>`;
  const kontrol = { el: mask, close() { mask.remove(); document.removeEventListener('keydown', esc2); }, $: s => $(s, mask) };
  const esc2 = e => { if (e.key === 'Escape') kontrol.close(); };
  document.addEventListener('keydown', esc2);
  mask.addEventListener('mousedown', e => { if (e.target === mask) kontrol.close(); });
  $('[data-x]', mask).onclick = kontrol.close;
  const mf = $('.mf', mask);
  actions.forEach(a => {
    const b = document.createElement('button'); b.className = 'btn ' + (a.cls || 'o'); b.innerHTML = a.label;
    b.onclick = async () => {
      if (!a.fn) return kontrol.close();
      const asli = b.innerHTML; b.disabled = true; b.innerHTML = '<span class="spin"></span>';
      try { const r = await a.fn(kontrol); if (r !== false) kontrol.close(); } catch (e) { toast(e.message, 'err'); }
      b.disabled = false; b.innerHTML = asli;
    };
    mf.appendChild(b);
  });
  $('#modal-root').appendChild(mask);
  const f = $('input:not([type=hidden]),select,textarea', mask); if (f) setTimeout(() => f.focus(), 30);
  return kontrol;
}
const tanya = (pesan, label = 'Ya, lanjutkan') => new Promise(res => {
  let selesai = false;
  const m = modal({ title: 'Konfirmasi', body: `<p style="margin:0">${esc(pesan)}</p>`, actions: [{ label: 'Batal', fn: () => { selesai = true; res(false); } }, { label, cls: 'p', fn: () => { selesai = true; res(true); } }] });
  m.el.addEventListener('remove', () => { if (!selesai) res(false); });
  const t = setInterval(() => { if (!document.body.contains(m.el)) { clearInterval(t); if (!selesai) res(false); } }, 300);
});
const val = (root, name) => { const e = $(`[name="${name}"]`, root); return e ? (e.type === 'checkbox' ? e.checked : e.value) : ''; };
const fld = (label, inner, hint) => `<div class="fld"><label>${esc(label)}</label>${inner}${hint ? `<span class="h">${esc(hint)}</span>` : ''}</div>`;
const opsi = (arr, sel) => arr.map(o => { const v = Array.isArray(o) ? o[0] : o, t = Array.isArray(o) ? o[1] : o; return `<option value="${esc(v)}" ${String(v) === String(sel) ? 'selected' : ''}>${esc(t)}</option>`; }).join('');
const kosong = (ikon, teks) => `<div class="empty">${ic(ikon, 28)}${esc(teks)}</div>`;
const muat = t => `<div class="skel"><span class="spin"></span>&nbsp; ${esc(t || 'Memuat data…')}</div>`;
async function aman(btn, fn) {
  const asli = btn ? btn.innerHTML : ''; if (btn) { btn.disabled = true; btn.innerHTML = '<span class="spin"></span>'; }
  try { return await fn(); } catch (e) { toast(e.message, 'err'); } finally { if (btn) { btn.disabled = false; btn.innerHTML = asli; } }
}

// ---------- berkas & gambar ----------
const bacaB64 = f => new Promise((ok, no) => { const r = new FileReader(); r.onload = () => ok(String(r.result).split(',')[1]); r.onerror = () => no(new Error('Gagal membaca berkas.')); r.readAsDataURL(f); });
async function gambarKe(file, maks, q) {
  const bmp = await createImageBitmap(file), k = Math.min(1, maks / Math.max(bmp.width, bmp.height));
  const c = document.createElement('canvas'); c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k);
  c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height); return c.toDataURL('image/jpeg', q);
}
/** Siapkan berkas unggahan: gambar dikompres (maks 1600px), PDF ≤ 5 MB. */
async function siapBerkas(file, denganThumb) {
  if (!file) return null;
  if (file.type === 'application/pdf') {
    if (file.size > 5 * 1048576) throw new Error('PDF maksimal 5 MB.');
    return { nama: file.name, mime: file.type, data: await bacaB64(file) };
  }
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) throw new Error('Gunakan berkas JPG, PNG, atau PDF.');
  const url = await gambarKe(file, 1600, .82), out = { nama: file.name.replace(/\.\w+$/, '') + '.jpg', mime: 'image/jpeg', data: url.split(',')[1] };
  if (out.data.length * .75 > 5 * 1048576) throw new Error('Gambar terlalu besar setelah dikompres (maks. 5 MB).');
  if (denganThumb) out.thumb = await gambarKe(file, 240, .6);
  return out;
}
function pasangDrop(root, onFile) {
  const dz = $('.drop', root), inp = $('input[type=file]', root);
  dz.onclick = () => inp.click();
  dz.ondragover = e => { e.preventDefault(); dz.classList.add('over'); }; dz.ondragleave = () => dz.classList.remove('over');
  dz.ondrop = e => { e.preventDefault(); dz.classList.remove('over'); if (e.dataTransfer.files[0]) onFile(e.dataTransfer.files[0]); };
  inp.onchange = () => { if (inp.files[0]) onFile(inp.files[0]); };
}
function tampilBerkas(b, judul) {
  const isi = b.mime === 'application/pdf' ? `<iframe title="PDF" src="data:application/pdf;base64,${b.data}" style="width:100%;height:60vh;border:1px solid var(--line2)"></iframe>` : `<img alt="${esc(judul)}" src="data:${b.mime};base64,${b.data}" style="max-width:100%;display:block;margin:auto;border:1px solid var(--line2)">`;
  modal({ title: judul, body: isi, wide: true, actions: [{ label: 'Tutup' }] });
}
function unduhCsv(nama, kolom, baris) {
  const q = v => { v = v == null ? '' : String(v); return /[",\n;]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; };
  const csv = '\ufeff' + [kolom, ...baris].map(r => r.map(q).join(',')).join('\r\n');
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' })); a.download = nama; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
}
function bacaCsv(teks) {
  const baris = []; let r = [], f = '', q = false; teks = teks.replace(/^\ufeff/, '');
  const sep = (teks.split('\n')[0].match(/;/g) || []).length > (teks.split('\n')[0].match(/,/g) || []).length ? ';' : ',';
  for (let i = 0; i < teks.length; i++) {
    const c = teks[i];
    if (q) { if (c === '"' && teks[i + 1] === '"') { f += '"'; i++; } else if (c === '"') q = false; else f += c; }
    else if (c === '"') q = true; else if (c === sep) { r.push(f); f = ''; }
    else if (c === '\n' || c === '\r') { if (c === '\r' && teks[i + 1] === '\n') i++; r.push(f); f = ''; if (r.some(x => x.trim())) baris.push(r); r = []; }
    else f += c;
  }
  r.push(f); if (r.some(x => x.trim())) baris.push(r);
  if (!baris.length) return [];
  const h = baris[0].map(x => x.trim().toLowerCase());
  return baris.slice(1).map(b => { const o = {}; h.forEach((k, i) => o[k] = (b[i] || '').trim()); return o; });
}

// ---------- grafik SVG ----------
function grafikGaris(pts, target) {
  const W = 640, H = 240, L = 46, R = 16, T = 22, B = 40, ada = pts.filter(p => p.pct != null);
  if (!ada.length) return kosong('list', 'Belum ada data presensi terverifikasi.');
  const lo = Math.max(0, Math.floor((Math.min(...ada.map(p => p.pct), target || 100) - 4) / 5) * 5), hi = 100;
  const x = i => L + (W - L - R) * (pts.length === 1 ? .5 : i / (pts.length - 1)), y = v => T + (H - T - B) * (1 - (v - lo) / (hi - lo));
  let g = '';
  for (let v = lo; v <= hi; v += 5) g += `<line x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}" stroke="#e0e0e0"/><text x="${L - 8}" y="${y(v) + 3}" text-anchor="end">${v}%</text>`;
  if (target) g += `<line x1="${L}" x2="${W - R}" y1="${y(target)}" y2="${y(target)}" stroke="#212121" stroke-dasharray="5 4"/>`;
  const jalur = pts.map((p, i) => p.pct == null ? null : [x(i), y(p.pct)]);
  const d = jalur.filter(Boolean).map((p, i) => (i ? 'L' : 'M') + p[0] + ' ' + p[1]).join(' ');
  const titik = pts.map((p, i) => p.pct == null ? '' : `<circle cx="${x(i)}" cy="${y(p.pct)}" r="${i === pts.length - 1 ? 5 : 4}" fill="${i === pts.length - 1 ? '#000' : '#fff'}" stroke="#000" stroke-width="2"/><text x="${x(i)}" y="${y(p.pct) - 10}" text-anchor="middle" style="fill:#212121;font-weight:700">${String(p.pct).replace('.', ',')}%</text>`).join('');
  const lab = pts.map((p, i) => `<text x="${x(i)}" y="${H - 20}" text-anchor="middle">${esc(p.label.split(' (')[0])}</text><text x="${x(i)}" y="${H - 8}" text-anchor="middle" style="fill:#9e9e9e">${esc((p.label.match(/\((.*)\)/) || [])[1] || '')}</text>`).join('');
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Grafik tren kehadiran mingguan">${g}<path d="${d}" fill="none" stroke="#000" stroke-width="2"/>${titik}${lab}</svg>`;
}
const WARNA_STATUS = { Hadir: '#0a0a0a', Terlambat: '#555555', Sakit: '#9e9e9e', Izin: '#d4d4d4', Alpa: '#ba1a1a' };
function grafikDonat(dist) {
  const tot = dist.total || 0, R = 62, C = 2 * Math.PI * R; let off = 0, seg = '';
  if (!tot) return kosong('list', 'Belum ada data.');
  ['Hadir', 'Terlambat', 'Sakit', 'Izin', 'Alpa'].forEach(k => { const f = dist[k] / tot; if (f > 0) { seg += `<circle r="${R}" cx="90" cy="90" fill="none" stroke="${WARNA_STATUS[k]}" stroke-width="26" stroke-dasharray="${f * C} ${C}" stroke-dashoffset="${-off * C}" transform="rotate(-90 90 90)"/>`; off += f; } });
  const h = Math.round((dist.Hadir + dist.Terlambat) / tot * 1000) / 10;
  const leg = ['Hadir', 'Terlambat', 'Sakit', 'Izin', 'Alpa'].map(k => `<div style="${k === 'Alpa' ? 'color:var(--red)' : ''}"><i style="background:${WARNA_STATUS[k]}"></i>${k.toUpperCase()} &nbsp; <b>${(dist[k] / tot * 100).toFixed(1).replace('.', ',')}%</b> (${dist[k]})</div>`).join('');
  return `<div class="row" style="justify-content:center;gap:28px;padding:10px 0"><svg viewBox="0 0 180 180" width="180" height="180" role="img" aria-label="Distribusi status kehadiran">${seg}<text x="90" y="88" text-anchor="middle" style="font:700 22px Inter,sans-serif;fill:#000">${String(h).replace('.', ',')}%</text><text x="90" y="106" text-anchor="middle" style="font:400 10px 'Space Mono',monospace;fill:#616161">HADIR</text></svg><div class="legend">${leg}</div></div>`;
}
function batangKas(rows) {
  if (!rows.length) return kosong('wallet', 'Belum ada transaksi kas.');
  const mx = Math.max(...rows.map(r => r.masuk), 1);
  return rows.map(r => `<div class="hb"><div class="hh"><b>${esc(r.label)}</b><span class="sub">In: ${rp(r.masuk)} | Out: ${rp(r.keluar)} | <b style="color:var(--ink)">Net: ${rp(r.net)}</b></span></div><div class="tr" style="position:relative"><div class="fi" style="width:${Math.round(r.masuk / mx * 100)}%"></div><div style="position:absolute;top:0;left:0;height:100%;width:${Math.round(r.keluar / mx * 100)}%;background:repeating-linear-gradient(45deg,#fff 0 3px,#9e9e9e 3px 4px);opacity:.85;mix-blend-mode:normal"></div></div></div>`).join('') + `<div class="row sm mono"><span><i style="display:inline-block;width:10px;height:10px;background:#000"></i> Cash In</span><span><i style="display:inline-block;width:10px;height:10px;border:1px solid #9e9e9e;background:repeating-linear-gradient(45deg,#fff 0 3px,#9e9e9e 3px 4px)"></i> Cash Out</span></div>`;
}
const xbox = (w, h, label) => `<div class="ximg" style="aspect-ratio:${w}/${h}"><svg class="x" preserveAspectRatio="none" viewBox="0 0 100 100"><path d="M0 0L100 100M100 0L0 100" stroke="#ccc" stroke-width="1" vector-effect="non-scaling-stroke" fill="none"/></svg><span class="t"><span style="background:var(--s1);padding:0 6px">${esc(label || '[IMG]')}</span></span></div>`;
