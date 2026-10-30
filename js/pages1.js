// js/pages1.js — Overview · Presensi · Kas Kelas · Form Transaksi · Lost & Found
const Pages = {};
const ROLE_LABEL = { admin: 'ADMIN SISTEM', pimpinan: 'KEPALA SEKOLAH', wali: 'WALI KELAS', pengurus: 'PENGURUS KELAS', siswa: 'SISWA' };
const TOPO = [['login', 'W-01 Login'], ['overview', 'W-02 Overview'], ['presensi', 'W-03 Presensi'], ['kas', 'W-04 Kas Kelas'], ['kas/baru', 'W-05 Tambah Transaksi'], ['barang', 'W-06 Lost & Found'], ['integritas', 'W-09 Integrity Reports']];
const topo = aktif => `<div class="topo noprint"><div class="tl">[SIAKAS system pipeline navigation topology]</div><div class="st">${TOPO.map((t, i) => (i ? '<i>→</i>' : '') + `<a data-go="${t[0]}" class="${t[0] === aktif ? 'on' : ''}">[${esc(t[1])}${t[0] === aktif ? ' (ACTIVE)' : ''}]</a>`).join('')}</div></div>`;
const ph = (wf, judul, sub, aksi = '') => `<div class="wf"><span class="tag">WF-ID: ${esc(wf)}</span><span class="tag l">${esc((S.cfg.NAMA_SEKOLAH || 'SMP Negeri 3 Kediri').toUpperCase())} · TABANAN</span></div><div class="ph"><div><h1>${esc(judul)}</h1><p>${esc(sub)}</p></div><div class="row noprint">${aksi}</div></div>`;
const kelasSel = (id, v) => S.kelas.length > 1 ? `<select class="sel" id="${id}" aria-label="Pilih kelas">${S.kelas.map(k => `<option ${k === v ? 'selected' : ''}>${esc(k)}</option>`).join('')}</select>` : `<span class="pill">KELAS: <b>${esc(v || '-')}</b></span>`;
const tanpaKelas = () => `<div class="card">${kosong('users', S.me.role === 'admin' ? 'Belum ada kelas. Tambahkan siswa dan wali kelas di menu Users terlebih dahulu.' : 'Akun Anda belum terhubung ke kelas mana pun. Hubungi admin sekolah.')}</div>`;
const stat = (lbl, v, sub, ikon, ft) => `<div class="card k kpi"><div class="row sb2" style="align-items:flex-start"><span class="lbl">${lbl}</span><span class="ib">${ic(ikon, 16)}</span></div><div class="v">${v}</div>${sub ? `<div class="sm sub">${sub}</div>` : ''}<div class="ft">${ft || ''}</div></div>`;
const vivo = n => n === S.nav;
/** Dialog hapus seragam: ringkasan data, peringatan, alasan wajib. o: { judul, ringkas(HTML), catatan?, aksi(alasan)→respons, selesai() } */
function modalHapus(o) {
  return modal({ title: o.judul, body: `<div class="chk" style="cursor:default;border-color:var(--red);background:#fff">${ic('alert', 16)}<span class="sm"><b>Anda akan menghapus:</b><br>${o.ringkas}<br><span class="sub">${o.catatan || 'Data tidak akan dipakai lagi dalam daftar dan perhitungan. Siapa, kapan, dan alasannya tercatat di Log Audit.'}</span></span></div><div class="mt">${fld('Alasan penghapusan (wajib)', '<textarea class="in" name="alasan" maxlength="200" placeholder="Contoh: salah input nominal / nama salah ketik"></textarea>')}</div>`,
    actions: [{ label: 'Batal' }, { label: ic('x', 12) + ' Hapus', cls: 'danger', fn: async m => { const a = val(m.el, 'alasan').trim(); if (a.length < 5) { toast('Alasan minimal 5 karakter.', 'err'); return false; } const r = await o.aksi(a); toast((r && r.message) || 'Data dihapus.'); if (o.selesai) o.selesai(); } }] });
}

// ============================================================ OVERVIEW
Pages.overview = async v => {
  const n = S.nav;
  v.innerHTML = ph('W-02', 'Performance Overview', 'Integritas sistem dan aktivitas kelas — ringkasan satu layar.', `<button class="btn o" id="seg">${ic('clock')} Segarkan</button><button class="btn" onclick="window.print()">${ic('print')} Cetak</button>`) + `<div id="ov">${muat()}</div>` + topo('overview');
  $('#seg', v).onclick = e => aman(e.currentTarget, async () => { const d = await Api.d('dash.summary', {}); $('#ov', v).innerHTML = ovHtml(d); toast('Data dimuat ulang.'); });
  try { await Api.swr('dash_' + S.me.email, 'dash.summary', {}, d => { if (vivo(n)) $('#ov', v).innerHTML = ovHtml(d); }); }
  catch (e) { if (vivo(n)) $('#ov', v).innerHTML = `<div class="card">${kosong('alert', e.message)}</div>`; }
};
function ovHtml(d) {
  const k = d.kpi, ok = k.hadirPct != null && k.hadirPct >= k.target;
  const kpi = `<div class="grid g4">
    ${stat('TOTAL CLASS CASH', `<small>Rp</small> ${Math.round(k.kasTotal).toLocaleString('id-ID')}`, '', 'bank', `<span>Masuk bln ini ${rp(k.masukBln)}</span><span>Keluar ${rp(k.keluarBln)}</span>`)}
    ${stat('ATTENDANCE RATE', pct(k.hadirPct), '28 hari terakhir', 'usercheck', `<span>Target: ${k.target}%</span>${k.hadirPct == null ? bd('NO DATA', 'm') : ok ? bd('VERIFIED') : bd('BELOW TARGET', 'r')}`)}
    ${stat('INTEGRITY REPORTS', String(k.laporanTerbuka).padStart(2, '0') + ' <small>Open</small>', '', 'flag', `<span>${k.laporanProses} sedang diproses</span>${k.laporanTerbuka ? bd('FLAGGED', 'r') : bd('CLEAR', 'm')}`)}
    ${stat('LOST & FOUND INVENTORY', String(k.barang).padStart(2, '0') + ' <small>Items</small>', '', 'box', `<span>Retention alert &gt;14d</span>${bd(k.barangLama + ' ITEMS', k.barangLama ? 'r' : 'm')}`)}
  </div>`;
  const tren = `<div class="grid g64 mt"><div class="card"><div class="ch"><h3><span class="lbl">[CHART-SCHEMATIC: 01]</span> Attendance Trend (weekly)</h3><span class="lbl">--- min target ${k.target}%</span></div><div class="cb chart">${grafikGaris(d.mingg, k.target)}</div><div class="cf">EVALUATION METRIC: kehadiran = (Hadir + Terlambat) / total tercatat.</div></div>
    <div class="card"><div class="ch"><h3><span class="lbl">[CHART-SCHEMATIC: 02]</span> Status Distribution</h3><span class="tag l">N=${d.dist.total}</span></div><div class="cb chart">${grafikDonat(d.dist)}</div><div class="cf">${d.dist.Alpa ? 'Alpa terdeteksi: ' + d.dist.Alpa + ' catatan — tindak lanjuti via wali kelas.' : 'Tidak ada alpa pada 28 hari terakhir.'}</div></div></div>`;
  const aliran = d.flags.length ? d.flags.map(f => `<div class="it"><h4><span>${esc(f.judul)}</span>${bd(f.status, f.status === 'OPEN' ? 'r' : '')}</h4><p>${esc(f.uraian)}</p><div class="row sb2 xs mono sub"><span>By: ${esc(f.oleh)}</span><span>${wkt(f.waktu)}</span></div></div>`).join('') : kosong('shield', 'Tidak ada flag integritas yang aktif.');
  const bawah = `<div class="grid g64 mt"><div class="card"><div class="ch"><h3><span class="lbl">[CHART-SCHEMATIC: 03]</span> Cash In vs Cash Out per Tingkat</h3></div><div class="cb">${batangKas(d.tingkat)}</div><div class="cf">LEDGER: saldo = pemasukan − pengeluaran (entri pembalik ikut dihitung).</div></div>
    <div class="card stream"><div class="ch"><h3><span class="lbl">[STREAM-LOG: 09]</span> Integrity Flag Stream</h3>${bd('LIVE', 'k')}</div>${aliran}<div class="cf">[+ ARCHIVED REPORTS: ${d.arsipLap}]</div></div></div>`;
  const tb = d.tabel.length ? d.tabel.map(r => `<tr><td class="b mono">${esc(r.kelas)}</td><td>${esc(r.wali)}</td><td class="num">${r.siswa}</td><td class="num ${r.hadir != null && r.hadir < d.kpi.target ? 'red b' : ''}">${pct(r.hadir)}</td><td class="num">${rp(r.saldo)}</td><td>${bd(r.verif, r.menunggu ? '' : 'k')}</td><td><button class="btn o sm" data-kelas="${esc(r.kelas)}">DETAIL</button></td></tr>`).join('') : `<tr><td colspan="7">${kosong('users', 'Belum ada data kelas.')}</td></tr>`;
  setTimeout(() => $$('[data-kelas]').forEach(b => b.onclick = () => { S.kelasAktif = b.dataset.kelas; go('kas'); }), 0);
  return kpi + tren + bawah + `<div class="card mt"><div class="ch"><h3><span class="lbl">[DATA-GRID: ARCHITECTURAL MATRIX]</span> Class Ledger & Presensi Overview</h3></div><div class="tw"><table><thead><tr><th>Class</th><th>Homeroom Teacher</th><th class="num">Students</th><th class="num">Attendance %</th><th class="num">Cash Balance</th><th>Verification</th><th>Action</th></tr></thead><tbody>${tb}</tbody></table></div><div class="pg"><span>Showing ${d.tabel.length} active cohorts</span></div></div>`;
}

// ============================================================ PRESENSI
const STS = ['Hadir', 'Terlambat', 'Izin', 'Sakit', 'Alpa'], STS_LBL = { Hadir: 'HADIR', Terlambat: 'TL', Izin: 'IZIN', Sakit: 'SAKIT', Alpa: 'ALPA' };
Pages.presensi = async v => {
  if (S.me.role === 'siswa') return presensiSiswa(v);
  const n = S.nav, role = S.me.role, edit = role !== 'pimpinan';
  if (!S.kelasAktif) { v.innerHTML = ph('W-03', 'Attendance (Presensi)', 'Rekam kehadiran dan verifikasi wali kelas.') + tanpaKelas(); return; }
  const P = { kelas: S.kelasAktif, tgl: hariIni(), siswa: [], terv: false, ada: false, f: 'ALL', q: '' };
  v.innerHTML = ph('W-03', 'Attendance (Presensi)', 'Student & Staff Attendance Integrity Tracker — verifikasi wali kelas wajib untuk mengunci data.') +
    `<div class="card"><div class="cb"><div class="grid g4" style="gap:12px"><div class="fld"><label>Rombel / Kelas</label>${kelasSel('pk', P.kelas)}</div><div class="fld"><label>Tanggal sesi</label><input type="date" class="in" id="pt" value="${P.tgl}" max="${hariIni()}"></div><div class="fld"><label>Jam masuk / toleransi</label><div class="in mono" style="background:var(--s1)">${esc(S.cfg.JAM_MASUK)} · +${esc(S.cfg.TOLERANSI_MENIT)} menit</div></div><div class="fld"><label>Petugas pencatat</label><div class="in" style="background:var(--s2)" id="pcat">${esc(S.me.nama)} <span class="bd">[${ROLE_LABEL[role]}]</span></div></div></div></div></div>
    <div class="grid g4 mt" id="pstat"></div>
    <div class="card mt"><div class="cb row sb2"><div class="row"><div class="row" style="position:relative"><input class="in" id="pq" placeholder="Cari nama / NISN…" style="width:240px" aria-label="Cari siswa"></div><div class="chips" id="pchips"></div></div><div class="row"><span class="lbl">STATUS VERIFIKASI:</span><span id="pverif"></span>${edit ? `<button class="btn o sm" id="pall">${ic('usercheck', 14)} Tandai semua hadir</button>` : ''}</div></div></div>
    <div class="card mt"><div class="ch"><span class="lbl" id="ptitle">[TABLE: STUDENT ROSTER REGISTER]</span><span class="lbl mono" id="pcount"></span></div><div class="tw"><table><thead><tr><th>No</th><th>NISN</th><th>Nama siswa</th><th>Status kehadiran</th><th>Jam</th><th>Keterangan</th></tr></thead><tbody id="pbody"></tbody></table></div></div>
    <div class="rules mt"><div class="rh"><span>${ic('shield', 16)} Siakas Integrity Protocol · Zero Compromise Directive</span><span class="bd">[ENFORCED VIA AUDIT LOG]</span></div><div class="rb"><div class="rule"><h4>[Aturan I: larangan titip absen]</h4><p>Memanipulasi kehadiran atau memalsukan surat izin melanggar integritas sekolah dan tercatat permanen di Log Audit.</p></div><div class="rule"><h4>[Aturan II: validasi tingkat dua]</h4><p>Pengurus kelas hanya pencatat tahap pertama. Verifikasi final oleh wali kelas mengunci data.</p></div><div class="rule"><h4>[Aturan III: sanksi ketidakjujuran]</h4><p>Izin tanpa bukti sah dapat diubah menjadi Alpa oleh wali kelas. Perubahan setelah verifikasi wajib beralasan.</p></div></div></div>
    <div class="bar"><div class="row"><span class="bd k" id="pmode">[STATUS: DRAFT MODE]</span><span class="sm sub mono" id="pinfo"></span></div><div class="row">${edit ? `<button class="btn o" id="psave">${ic('download', 14)} Simpan draf</button>` : ''}${edit ? `<button class="btn danger" id="phapus">${ic('x', 14)} Hapus presensi</button>` : ''}<button class="btn o" onclick="window.print()">${ic('print', 14)} Cetak</button>${(role === 'wali' || role === 'admin') ? `<button class="btn" id="pver">${ic('lock', 14)} Verifikasi &amp; kunci presensi</button>` : ''}</div></div>` + topo('presensi');
  const draw = () => {
    const c = { Hadir: 0, Terlambat: 0, Izin: 0, Sakit: 0, Alpa: 0 }; P.siswa.forEach(s => c[s.status || 'Hadir']++);
    const tot = P.siswa.length || 1, pc = x => (x / tot * 100).toFixed(1).replace('.', ',') + '%';
    $('#pstat').innerHTML = stat('PRESENT (HADIR)', `${c.Hadir} <small>/ ${P.siswa.length} siswa</small>`, '', 'usercheck', `<span>${pc(c.Hadir)} ratio</span>${P.terv ? bd('VERIFIED') : ''}`) + stat('LATE (TERLAMBAT)', String(c.Terlambat).padStart(2, '0'), '', 'clock', `<span>${pc(c.Terlambat)} ratio</span>`) + stat('PERMIT / SICK (I/S)', String(c.Izin + c.Sakit).padStart(2, '0') + ` <small>(${c.Izin} izin, ${c.Sakit} sakit)</small>`, '', 'file', `<span>${pc(c.Izin + c.Sakit)} ratio</span>`) + stat('ABSENT (ALPA)', String(c.Alpa).padStart(2, '0'), '', 'alert', `<span>${pc(c.Alpa)} ratio</span>${c.Alpa ? bd('FLAGGED', 'r') : bd('INTEGRITY CLEAR')}`);
    $('#pchips').innerHTML = [['ALL', 'ALL: ' + P.siswa.length], ...STS.map(s => [s, STS_LBL[s] + ': ' + c[s]])].map(x => `<button class="chip ${P.f === x[0] ? 'on' : ''}" data-f="${x[0]}">[${x[1]}]</button>`).join('');
    $$('#pchips .chip').forEach(b => b.onclick = () => { P.f = b.dataset.f; draw(); });
    const q = P.q.toLowerCase(), list = P.siswa.filter(s => (P.f === 'ALL' || (s.status || 'Hadir') === P.f) && (!q || (s.nama + ' ' + s.nisn).toLowerCase().includes(q)));
    $('#pbody').innerHTML = list.length ? list.map((s, i) => `<tr><td class="mono sub">${String(P.siswa.indexOf(s) + 1).padStart(2, '0')}</td><td class="mono sub">${esc(s.nisn || '-')}</td><td class="b">${esc(s.nama)}</td><td><div class="seg" role="group" aria-label="Status ${esc(s.nama)}">${STS.map(x => `<button class="${(s.status || 'Hadir') === x ? 'on' : ''}" data-u="${s.userId}" data-s="${x}" ${!edit || (P.terv && role === 'pengurus') ? 'disabled' : ''}>${STS_LBL[x]}</button>`).join('')}</div></td><td class="mono sm">${esc(s.jam || '–')}</td><td><input class="in" style="min-height:30px;padding:3px 8px;min-width:150px" data-c="${s.userId}" value="${esc(s.catatan || '')}" maxlength="120" placeholder="opsional" ${!edit || (P.terv && role === 'pengurus') ? 'disabled' : ''} aria-label="Keterangan ${esc(s.nama)}"></td></tr>`).join('') : `<tr><td colspan="6">${kosong('users', P.siswa.length ? 'Tidak ada siswa yang cocok dengan filter.' : 'Belum ada siswa di kelas ini. Tambahkan di menu Users.')}</td></tr>`;
    $$('#pbody [data-s]').forEach(b => b.onclick = () => { const s = P.siswa.find(x => x.userId === b.dataset.u); s.status = b.dataset.s; if (s.status !== 'Hadir' && s.status !== 'Terlambat') s.jam = ''; P.dirty = true; draw(); });
    $$('#pbody [data-c]').forEach(i => i.oninput = () => { P.siswa.find(x => x.userId === i.dataset.c).catatan = i.value; P.dirty = true; });
    $('#pcount').textContent = `${list.length} / ${P.siswa.length} TAMPIL`;
    $('#ptitle').textContent = `[TABLE: STUDENT ROSTER REGISTER — KELAS ${P.kelas}]`;
    $('#pverif').innerHTML = P.terv ? bd('TERVERIFIKASI · ' + (P.vby || ''), 'k') : bd(P.ada ? 'DRAF — BELUM DIVALIDASI WALI KELAS' : 'BELUM DISIMPAN');
    $('#pmode').textContent = P.terv ? '[STATUS: LOCKED]' : '[STATUS: DRAFT MODE]'; $('#pmode').className = 'bd ' + (P.terv ? '' : 'k');
    $('#pinfo').textContent = P.ada ? `DICATAT: ${P.cby || '-'} · ${tgl(P.tgl)}` : 'Belum ada rekaman untuk tanggal ini — default semua HADIR.';
    const pv = $('#pver'); if (pv) pv.disabled = !P.ada || P.terv || P.dirty;
    const phd = $('#phapus'); if (phd) phd.disabled = !P.ada || (P.terv && role === 'pengurus');
  };
  const muatRoster = async () => {
    $('#pbody').innerHTML = `<tr><td colspan="6">${muat()}</td></tr>`;
    try {
      const d = await Api.d('presensi.roster', { kelas: P.kelas, tanggal: P.tgl }); if (!vivo(n)) return;
      Object.assign(P, { siswa: d.siswa, terv: d.terverifikasi, ada: d.adaData, vby: d.diverifikasiOleh, cby: d.dicatatOleh, dirty: false });
      draw();
    } catch (e) { toast(e.message, 'err'); }
  };
  $('#pk', v) && ($('#pk', v).onchange = e => { P.kelas = S.kelasAktif = e.target.value; muatRoster(); });
  $('#pt', v).onchange = e => { if (e.target.value) { P.tgl = e.target.value; muatRoster(); } };
  $('#pq', v).oninput = debounce(e => { P.q = e.target.value; draw(); }, 200);
  const pall = $('#pall', v); if (pall) pall.onclick = () => { P.siswa.forEach(s => { if (!(P.terv && role === 'pengurus')) s.status = 'Hadir'; }); P.dirty = true; draw(); };
  const simpan = async alasan => {
    const r = await Api.call('presensi.simpan', { kelas: P.kelas, tanggal: P.tgl, alasan, items: P.siswa.map(s => ({ userId: s.userId, status: s.status || 'Hadir', jam: s.jam || '', catatan: s.catatan || '' })) });
    toast(r.message); await muatRoster();
  };
  const ps = $('#psave', v); if (ps) ps.onclick = e => aman(e.currentTarget, async () => {
    if (!P.terv) return simpan('');
    modal({ title: 'Ubah presensi terverifikasi', body: fld('Alasan perubahan (wajib, tercatat di Log Audit)', '<textarea class="in" name="alasan" maxlength="120"></textarea>'), actions: [{ label: 'Batal' }, { label: 'Simpan perubahan', cls: 'p', fn: async m => { const a = val(m.el, 'alasan').trim(); if (a.length < 5) { toast('Alasan minimal 5 karakter.', 'err'); return false; } await simpan(a); } }] });
  });
  const pv = $('#pver', v); if (pv) pv.onclick = async e => {
    if (!await tanya(`Verifikasi dan kunci presensi kelas ${P.kelas} tanggal ${tgl(P.tgl)}? Pengurus kelas tidak dapat mengubahnya lagi.`, 'Verifikasi & kunci')) return;
    aman(e.currentTarget, async () => { const r = await Api.call('presensi.verifikasi', { kelas: P.kelas, tanggal: P.tgl }); toast(r.message); await muatRoster(); });
  };
  const phd = $('#phapus', v); if (phd) phd.onclick = () => modalHapus({ judul: 'Hapus presensi', ringkas: `Presensi kelas <b>${esc(P.kelas)}</b> tanggal <b>${tgl(P.tgl)}</b> (${P.siswa.length} siswa)${P.terv ? ' — <b>sudah diverifikasi</b>' : ''}`, catatan: 'Seluruh catatan presensi kelas ini pada tanggal tersebut dihapus dan tidak dihitung dalam rekap. Anda dapat menginput ulang setelahnya.', aksi: a => Api.call('presensi.hapus', { kelas: P.kelas, tanggal: P.tgl, alasan: a }), selesai: muatRoster });
  muatRoster();
};
async function presensiSiswa(v) {
  v.innerHTML = ph('W-03', 'Presensi Saya', 'Catat kehadiran Anda hari ini secara jujur. Wali kelas akan memverifikasinya.') + `<div class="card" style="max-width:560px"><div class="cb" id="ps">${muat()}</div></div>` + topo('presensi');
  const n = S.nav, tampil = async () => {
    const d = await Api.d('presensi.saya', {}); if (!vivo(n)) return;
    $('#ps', v).innerHTML = `<div class="lbl">KELAS ${esc(d.kelas || '-')} · ${tgl(d.tanggal)}</div><div class="kpi" style="min-height:0;padding:12px 0"><div class="v">${d.status ? esc(d.status).toUpperCase() : 'BELUM TERCATAT'}</div><div class="sm sub mono">${d.jam ? 'Pukul ' + esc(d.jam) + ' WITA · ' : ''}${d.terverifikasi ? 'Terverifikasi wali kelas' : d.status ? 'Menunggu verifikasi wali kelas' : ''}</div></div>${d.mandiri ? (d.status && d.status !== 'Alpa' ? '' : `<button class="btn" id="pm">${ic('usercheck', 14)} Catat kehadiran saya sekarang</button>`) : '<p class="sm sub">Presensi mandiri tidak diaktifkan sekolah. Kehadiran dicatat oleh pengurus kelas dan diverifikasi wali kelas.</p>'}`;
    const b = $('#pm', v); if (b) b.onclick = e => aman(e.currentTarget, async () => { const r = await Api.call('presensi.mandiri', {}); toast(r.message); tampil(); });
  };
  tampil().catch(e => toast(e.message, 'err'));
}

// ============================================================ KAS KELAS
const KAT_IN = ['Iuran Wajib', 'Sumbangan Sukarela', 'Lainnya'], KAT_OUT = ['ATK Kelas', 'Kebersihan 7K', 'Sosial & Duka', 'Akademik / P5', 'Kegiatan Kelas', 'Lainnya'];
Pages.kas = async v => {
  const n = S.nav, role = S.me.role, input = ['admin', 'wali', 'pengurus'].includes(role), staf = ['admin', 'wali'].includes(role);
  if (!S.kelasAktif) { v.innerHTML = ph('W-04', 'Class Cash Book (Kas Kelas)', 'Buku kas kelas yang terbuka dan dapat diaudit.') + tanpaKelas(); return; }
  const K = { kelas: S.kelasAktif, rows: [], f: 'ALL', q: '', hal: 1, per: 8 };
  v.innerHTML = ph('W-04', 'Class Cash Book (Kas Kelas)', 'Real-time fiscal integrity & double-key ledger — setiap rupiah tercatat, berbukti, dan terverifikasi.', `<button class="btn o" id="kexp">${ic('download')} Ekspor CSV</button>${input ? `<button class="btn" data-go="kas/baru">${ic('plus')} Catat transaksi</button>` : ''}`) + `<div id="kas">${muat()}</div>` + topo('kas');
  const muatKas = async () => {
    try { const d = await Api.d('kas.list', { kelas: K.kelas }); if (!vivo(n)) return; K.d = d; K.rows = d.rows; drawKas(); }
    catch (e) { if (vivo(n)) $('#kas', v).innerHTML = `<div class="card">${kosong('alert', e.message)}</div>`; }
  };
  const FIL = [['ALL', 'Semua'], ['IN', 'Pemasukan'], ['OUT', 'Pengeluaran'], ['FLAG', 'Perlu bukti'], ['OK', 'Terverifikasi']];
  const drawKas = () => {
    const d = K.d, q = K.q.toLowerCase();
    const cnt = { ALL: K.rows.length, IN: K.rows.filter(r => r.Jenis === 'IN').length, OUT: K.rows.filter(r => r.Jenis === 'OUT').length, FLAG: K.rows.filter(r => r.flag).length, OK: K.rows.filter(r => r.Status === 'Terverifikasi').length };
    let list = K.rows.filter(r => (K.f === 'ALL' || (K.f === 'IN' && r.Jenis === 'IN') || (K.f === 'OUT' && r.Jenis === 'OUT') || (K.f === 'FLAG' && r.flag) || (K.f === 'OK' && r.Status === 'Terverifikasi')) && (!q || (r.Keterangan + ' ' + r.KasID + ' ' + r.Kategori).toLowerCase().includes(q)));
    const hal = Math.min(K.hal, Math.max(1, Math.ceil(list.length / K.per))), tot = list.length; list = list.slice((hal - 1) * K.per, hal * K.per);
    const baris = list.map(r => {
      const mine = r.DicatatOleh === S.me.email, bukti = r.adaBukti ? `<button class="btn o sm" data-b="${r.KasID}">${ic('file', 12)} LIHAT</button>` : (r.flag ? (input ? `<button class="btn sm" data-up="${r.KasID}">${ic('upload', 12)} UNGGAH</button>` : '') + `<div class="bd r" style="margin-top:4px">[! BUKTI BELUM DIUNGGAH]</div>` : '<span class="mut">–</span>');
      const aks = [];
      if (staf && r.Status === 'Menunggu' && !mine) aks.push(`<button class="btn sm" data-v="${r.KasID}">VERIF</button>`);
      if (staf && (r.Status === 'Menunggu' || r.Status === 'Terverifikasi') && r.Kategori !== 'Koreksi') aks.push(`<button class="btn o sm" data-r="${r.KasID}">BALIK</button>`);
      const buka = r.Status === 'Menunggu' || r.Status === 'Ditolak';
      if (r.Status !== 'Dibalik' && r.Kategori !== 'Koreksi' && (role === 'admin' || (role === 'wali' && buka) || (role === 'pengurus' && mine && buka))) aks.push(`<button class="btn danger sm" data-del="${r.KasID}">HAPUS</button>`);
      return `<tr class="${r.flag ? 'flag' : ''}"><td class="mono sm b">${esc(r.KasID)}</td><td class="mono sm">${tgl(r.Tanggal)}</td><td style="min-width:220px">${esc(r.Keterangan)}${r.flag && r.sisaJam != null ? `<div class="red mono xs">[DEADLINE: ${r.sisaJam > 0 ? 'H-' + Math.ceil(r.sisaJam) + ' JAM' : 'LEWAT BATAS'}]</div>` : ''}${r.Catatan ? `<div class="mono xs sub">Catatan: ${esc(r.Catatan)}</div>` : ''}</td><td class="sm">${esc(r.Kategori)}</td><td class="c">${bd(r.Jenis, r.Jenis === 'IN' ? 'k' : '')}</td><td class="num b mono">${r.Jenis === 'IN' ? '+' : '−'} ${rp(r.Nominal).replace('Rp ', 'Rp ')}</td><td>${bukti}</td><td class="sm">${esc(r.pencatat)}<div class="mono xs sub">Verif: ${esc(r.pemverifikasi || '–')}</div></td><td>${sbd(r.Status)}</td><td><div class="row gap8">${aks.join('')}</div></td></tr>`;
    }).join('');
    $('#kas', v).innerHTML = `<div class="grid g4"><div class="card"><div class="cb"><div class="lbl">Audit entity / cohort</div><div class="b" style="font-size:22px;margin:6px 0">KELAS: ${esc(d.kelas)}</div><div class="sm sub">Wali: ${esc(d.wali || '-')}<br>Bendahara: ${esc(d.bendahara || '-')}</div></div><div class="cf">${kelasSel('kk', K.kelas)}</div></div>
      ${stat('SALDO KAS SAAT INI', rp(d.saldo), '', 'wallet', `<span>${d.saldo >= 0 ? bd('SAFE LIQUIDITY') : bd('NEGATIF', 'r')}</span>`)}
      ${stat('PEMASUKAN / PENGELUARAN (BLN INI)', `<small>+</small>${Math.round(d.masuk).toLocaleString('id-ID')}`, `Keluar bulan ini: ${rp(d.keluar)}`, 'bank', `<span>${d.tervalid} dari ${d.total} transaksi terverifikasi</span>`)}
      <div class="card k kpi" style="${d.flag ? 'background:var(--s1)' : ''}"><div class="row sb2" style="align-items:flex-start"><span class="lbl">INTEGRITY &amp; PROOF AUDIT</span>${bd(d.flag ? 'ACTION REQUIRED' : 'CLEAR', d.flag ? 'k' : 'm')}</div><div class="v">${String(d.flag).padStart(2, '0')} FLAGGED</div><div class="ft"><span>${d.flag} pengeluaran tanpa bukti (batas ${d.batasJam} jam)</span></div></div></div>
      <div class="card mt"><div class="cb row sb2"><div class="row"><input class="in" id="kq" value="${esc(K.q)}" placeholder="Cari no. bukti / keterangan…" style="width:260px" aria-label="Cari transaksi"><div class="chips">${FIL.map(f => `<button class="chip ${K.f === f[0] ? 'on' : ''}" data-f="${f[0]}">[${f[1]} (${cnt[f[0]]})]</button>`).join('')}</div></div>${bd('STATUS BUKU KAS: OPEN FOR AUDIT')}</div></div>
      <div class="card mt"><div class="ch"><span class="lbl">[TABLE: BUKU KAS ${esc(d.kelas)}]</span></div><div class="tw"><table><thead><tr><th>No / Ref</th><th>Tanggal</th><th>Uraian</th><th>Kategori</th><th class="c">Jenis</th><th class="num">Nominal</th><th>Bukti fisik</th><th>Pencatat</th><th>Status</th><th>Aksi</th></tr></thead><tbody>${baris || `<tr><td colspan="10">${kosong('wallet', 'Belum ada transaksi yang cocok.')}</td></tr>`}</tbody></table></div><div class="pg"><span>Showing ${tot ? (hal - 1) * K.per + 1 : 0}–${Math.min(hal * K.per, tot)} of ${tot}</span><span class="row gap8"><button class="btn o sm" data-p="${hal - 1}" ${hal <= 1 ? 'disabled' : ''}>&lt; PREV</button><b>${hal} / ${Math.max(1, Math.ceil(tot / K.per))}</b><button class="btn o sm" data-p="${hal + 1}" ${hal >= Math.ceil(tot / K.per) ? 'disabled' : ''}>NEXT &gt;</button></span></div></div>
      <div class="rules mt"><div class="rh"><span>${ic('shield', 16)} [!] Protokol transparansi kas kelas · Zero unproved expenditure</span><span class="bd">[SIAKAS INTEGRITY RULESET]</span></div><div class="rb"><div class="rule"><h4>[Aturan I: batas unggah bukti]</h4><p>Pengeluaran wajib berbukti nota maksimal ${d.batasJam} jam sejak uang keluar. Keterlambatan menandai flag integritas.</p></div><div class="rule"><h4>[Aturan II: larangan penggunaan pribadi]</h4><p>Kas dilarang dipinjamkan atau dipakai di luar kegiatan resmi kelas. Pelanggaran diproses oleh wali kelas dan kepala sekolah.</p></div><div class="rule"><h4>[Aturan III: otentikasi ganda]</h4><p>Catatan bendahara baru sah setelah diverifikasi wali kelas. Pencatat tidak dapat memverifikasi catatannya sendiri.</p></div></div></div>`;
    const kk = $('#kk', v); if (kk) kk.onchange = e => { K.kelas = S.kelasAktif = e.target.value; K.hal = 1; K.f = 'ALL'; muatKas(); };
    $('#kq', v).oninput = debounce(e => { K.q = e.target.value; K.hal = 1; drawKas(); const i = $('#kq', v); i.focus(); i.setSelectionRange(i.value.length, i.value.length); }, 300);
    $$('[data-f]', v).forEach(b => b.onclick = () => { K.f = b.dataset.f; K.hal = 1; drawKas(); });
    $$('[data-p]', v).forEach(b => b.onclick = () => { K.hal = Number(b.dataset.p); drawKas(); });
    $$('[data-b]', v).forEach(b => b.onclick = e => aman(e.currentTarget, async () => tampilBerkas(await Api.d('berkas.ambil', { jenis: 'kas', id: b.dataset.b }), 'Bukti ' + b.dataset.b)));
    $$('[data-up]', v).forEach(b => b.onclick = () => unggahSusulan(b.dataset.up, muatKas));
    $$('[data-v]', v).forEach(b => b.onclick = () => verifKas(b.dataset.v, K.rows.find(r => r.KasID === b.dataset.v), muatKas));
    $$('[data-r]', v).forEach(b => b.onclick = () => balikKas(b.dataset.r, muatKas));
    $$('[data-del]', v).forEach(b => b.onclick = () => { const r = K.rows.find(x => x.KasID === b.dataset.del); modalHapus({ judul: 'Hapus transaksi ' + r.KasID, ringkas: `${esc(r.Keterangan)}<br><b>${r.Jenis === 'IN' ? '+' : '−'} ${rp(r.Nominal)}</b> · ${tgl(r.Tanggal)} · ${esc(r.Status)}`, catatan: 'Transaksi tidak dihitung lagi dalam saldo dan tidak tampil di daftar. Bila transaksi sebenarnya benar tetapi perlu dikoreksi, gunakan BALIK (entri pembalik).', aksi: a => Api.call('kas.hapus', { id: r.KasID, alasan: a }), selesai: muatKas }); });
  };
  $('#kexp', v).onclick = () => { if (!K.rows.length) return toast('Belum ada data untuk diekspor.', 'err'); unduhCsv(`kas_${K.kelas}_${hariIni()}.csv`, ['No/Ref', 'Tanggal', 'Keterangan', 'Kategori', 'Jenis', 'Nominal', 'Bukti', 'Pencatat', 'Verifikator', 'Status'], K.rows.map(r => [r.KasID, r.Tanggal, r.Keterangan, r.Kategori, r.Jenis, r.Nominal, r.adaBukti ? 'ADA' : 'TIDAK', r.pencatat, r.pemverifikasi, r.Status])); };
  muatKas();
};
function unggahSusulan(id, selesai) {
  let b = null;
  const m = modal({ title: 'Unggah bukti ' + id, body: `<div class="drop"><div>${ic('upload', 24)}</div><div class="b mono sm">[KLIK ATAU TARIK BERKAS NOTA KE SINI]</div><div class="sm sub">JPG, PNG, atau PDF · maks. 5 MB</div><input type="file" accept="image/jpeg,image/png,application/pdf" class="hide"></div><div id="up-info" class="mono sm mt"></div>`, actions: [{ label: 'Batal' }, { label: 'Unggah bukti', cls: 'p', fn: async () => { if (!b) { toast('Pilih berkas terlebih dahulu.', 'err'); return false; } const r = await Api.call('kas.lampirkan', { id, bukti: b }); toast(r.message); selesai(); } }] });
  pasangDrop(m.el, async f => { try { b = await siapBerkas(f); $('#up-info', m.el).textContent = `${b.nama} · ${(b.data.length * .75 / 1024).toFixed(0)} KB siap diunggah`; } catch (e) { toast(e.message, 'err'); } });
}
function verifKas(id, r, selesai) {
  modal({ title: 'Verifikasi ' + id, body: `<p class="sm">${esc(r.Keterangan)}<br><b>${r.Jenis === 'IN' ? '+' : '−'} ${rp(r.Nominal)}</b> · dicatat ${esc(r.pencatat)}</p><div class="radio2"><label><input type="radio" name="kep" value="setuju" checked><span>SETUJU</span></label><label><input type="radio" name="kep" value="tolak"><span>TOLAK</span></label></div><div class="fld mt"><label>Catatan (wajib bila menolak)</label><textarea class="in" name="cat" maxlength="200"></textarea></div><p class="sm sub mono">Kunci ganda: Anda memverifikasi catatan orang lain. Keputusan tercatat di Log Audit.</p>`, actions: [{ label: 'Batal' }, { label: 'Simpan keputusan', cls: 'p', fn: async m => { const rr = await Api.call('kas.verifikasi', { id, keputusan: $('[name=kep]:checked', m.el).value, catatan: val(m.el, 'cat') }); toast(rr.message); selesai(); } }] });
}
function balikKas(id, selesai) {
  modal({ title: 'Entri pembalik ' + id, body: `<p class="sm">Transaksi tidak dihapus. Sistem membuat entri pembalik agar jejak tetap utuh.</p>${fld('Alasan koreksi (wajib)', '<textarea class="in" name="alasan" maxlength="200"></textarea>')}`, actions: [{ label: 'Batal' }, { label: 'Buat entri pembalik', cls: 'p', fn: async m => { const r = await Api.call('kas.balik', { id, alasan: val(m.el, 'alasan') }); toast(r.message); selesai(); } }] });
}

// ============================================================ FORM TRANSAKSI KAS (W-05)
Pages['kas/baru'] = async v => {
  const n = S.nav;
  if (!['admin', 'wali', 'pengurus'].includes(S.me.role)) { go('kas'); return; }
  if (!S.kelasAktif) { v.innerHTML = ph('W-05', 'Catat Transaksi Kas', '') + tanpaKelas(); return; }
  const F = { kelas: S.kelasAktif, jenis: 'OUT', bukti: null, saldo: 0 };
  v.innerHTML = `<div class="row mb"><button class="btn g sm" data-go="kas">← Kembali ke buku kas (W-04)</button></div>` + ph('W-05', 'Catat Transaksi Kas Kelas', 'Dual-key real-time ledger — transaksi baru sah setelah diverifikasi wali kelas.') +
    `<div class="grid g64" style="align-items:start"><div>
    <div class="card"><div class="ch"><h3><span class="tag">SEC 01</span> Klasifikasi &amp; metadata</h3></div><div class="cb">
      <div class="fld"><label>Kelas *</label>${S.kelas.length > 1 ? `<select class="in" id="fk">${opsi(S.kelas, F.kelas)}</select>` : `<div class="in" style="background:var(--s2)">${esc(F.kelas)}</div>`}</div>
      <div class="fld"><label>Tipe transaksi kas *</label><div class="radio2"><label><input type="radio" name="jenis" value="IN"><span>PEMASUKAN / DEBET (+)</span></label><label><input type="radio" name="jenis" value="OUT" checked><span>PENGELUARAN / KREDIT (−)</span></label></div></div>
      <div class="f2"><div class="fld"><label>Tanggal transaksi fisik *</label><input type="date" class="in" name="tanggal" value="${hariIni()}" max="${hariIni()}"></div><div class="fld"><label>Kategori *</label><select class="in" name="kategori"></select></div></div>
    </div></div>
    <div class="card mt"><div class="ch"><h3><span class="tag">SEC 02</span> Nominal &amp; rincian</h3></div><div class="cb">
      <div class="fld"><label>Jumlah nominal (Rupiah) *</label><input class="in" name="nominal" inputmode="numeric" placeholder="85000" style="font:700 24px var(--f);min-height:52px"><span class="h" id="terb"></span></div>
      <div class="fld"><label>Uraian transaksi / rincian *</label><textarea class="in" name="keterangan" maxlength="300" placeholder="Contoh: Pembelian tempat sampah dan pembersih lantai untuk lomba kebersihan 7K."></textarea><span class="h">Rincian harus jelas agar lolos audit. Min. 5 karakter.</span></div>
    </div></div>
    <div class="card mt"><div class="ch"><h3><span class="tag">SEC 03</span> Unggah bukti fisik / nota asli</h3><span class="bd k" id="wb">[WAJIB UNTUK PENGELUARAN]</span></div><div class="cb">
      <div class="drop"><div>${ic('upload', 28)}</div><div class="b mono sm mt">[DRAG &amp; DROP ATAU KLIK UNTUK UNGGAH NOTA / KWITANSI]</div><div class="sm sub">JPG, PNG, PDF · maks. 5 MB · foto dikompres otomatis. Pastikan stempel toko, tanggal, dan harga terbaca.</div><input type="file" class="hide" accept="image/jpeg,image/png,application/pdf"></div>
      <div id="bprev" class="mt"></div>
      <div class="chk" style="cursor:default;background:#fff;border-style:dashed">${ic('alert', 16)}<span class="sm">Pengeluaran tanpa bukti dalam ${esc(S.cfg.BATAS_BUKTI_JAM || 48)} jam otomatis ditandai <b>FLAGGED</b> dan diberitahukan ke wali kelas.</span></div>
    </div></div></div>
    <div><div class="card k"><div class="ch"><h3>Simulasi dampak saldo</h3><span class="lbl">[REAL-TIME]</span></div><div class="cb"><div class="row sb2"><span class="sub">Saldo kas saat ini</span><b class="mono" id="s0">…</b></div><div class="row sb2 mt"><span class="red mono sm" id="sl">Rencana (−)</span><b class="red mono" id="s1">Rp 0</b></div><hr style="border:0;border-top:1px solid var(--line2);margin:12px 0"><div class="row sb2"><span class="lbl">ESTIMASI SALDO AKHIR</span><b class="mono" style="font-size:18px" id="s2">…</b></div><div class="mt" id="s3"></div></div></div>
    <div class="card mt"><div class="ch"><h3>Alur verifikasi ganda</h3><span class="lbl">[CONSENSUS]</span></div><div class="cb sm"><div class="chk" style="cursor:default"><span><b>1. Input &amp; unggah bukti</b><br><span class="sub">${esc(S.me.nama)} (${ROLE_LABEL[S.me.role]})</span></span></div><div class="chk" style="cursor:default"><span><b>2. Verifikasi wali kelas</b><br><span class="sub">Orang berbeda dari pencatat</span></span></div><div class="chk" style="cursor:default"><span><b>3. Masuk buku kas resmi</b><br><span class="sub">Terlihat oleh kepala sekolah &amp; siswa</span></span></div></div></div>
    <div class="card mt"><div class="ch"><h3>Pakta integritas kas</h3><span class="lbl">[CHECKLIST]</span></div><div class="cb"><p class="sm sub" style="margin-top:0">Wajib dicentang sebelum mengirim:</p>
      <label class="chk"><input type="checkbox" class="pakta"><span>Pengeluaran telah disepakati melalui musyawarah siswa kelas.</span></label>
      <label class="chk"><input type="checkbox" class="pakta"><span>Nota asli mencantumkan rincian barang dan harga yang wajar (atau, untuk pemasukan, daftar iuran yang valid).</span></label>
      <label class="chk"><input type="checkbox" class="pakta"><span>Bukan untuk keperluan pribadi siswa atau pos non-kegiatan kelas.</span></label>
      <div class="mono sm" id="pk3">0/3 klausul terpenuhi</div></div></div></div></div>
    <div class="bar"><span class="sm mono sub">Draf tidak disimpan lokal. Data dikirim langsung ke wali kelas untuk verifikasi.</span><div class="row"><button class="btn o" data-go="kas">Batalkan</button><button class="btn" id="fsub" disabled>${ic('send', 14)} Ajukan ke wali kelas</button></div></div>` + topo('kas/baru');
  const kat = () => { $('[name=kategori]', v).innerHTML = opsi(F.jenis === 'IN' ? KAT_IN : KAT_OUT); $('#wb', v).textContent = F.jenis === 'OUT' ? '[WAJIB UNTUK PENGELUARAN]' : '[OPSIONAL UNTUK PEMASUKAN]'; };
  const sim = () => {
    const nom = Math.round(Number($('[name=nominal]', v).value.replace(/\D/g, '')) || 0), plus = F.jenis === 'IN', akhir = F.saldo + (plus ? nom : -nom);
    $('#s0', v).textContent = rp(F.saldo); $('#sl', v).textContent = plus ? 'Rencana pemasukan (+)' : 'Rencana pengeluaran (−)'; $('#sl', v).className = (plus ? '' : 'red ') + 'mono sm'; $('#s1', v).textContent = (plus ? '+ ' : '− ') + rp(nom); $('#s1', v).className = (plus ? '' : 'red ') + 'mono';
    $('#s2', v).textContent = rp(akhir); $('#s3', v).innerHTML = akhir < 0 ? bd('SALDO TIDAK CUKUP', 'r') : bd('SAFE BUFFER MAINTAINED');
    $('#terb', v).textContent = nom ? rp(nom) : ''; cekSiap();
  };
  const cekSiap = () => { const c = $$('.pakta', v).filter(x => x.checked).length; $('#pk3', v).textContent = c + '/3 klausul terpenuhi'; $('#fsub', v).disabled = c < 3; };
  const muatSaldo = async () => { try { const d = await Api.d('kas.list', { kelas: F.kelas }); if (vivo(n)) { F.saldo = d.saldo; sim(); } } catch (e) { toast(e.message, 'err'); } };
  $$('[name=jenis]', v).forEach(r => r.onchange = () => { F.jenis = r.value; kat(); sim(); });
  const fk = $('#fk', v); if (fk) fk.onchange = () => { F.kelas = S.kelasAktif = fk.value; muatSaldo(); };
  $('[name=nominal]', v).oninput = e => { const x = e.target.value.replace(/\D/g, ''); e.target.value = x ? Number(x).toLocaleString('id-ID') : ''; sim(); };
  $$('.pakta', v).forEach(c => c.onchange = cekSiap);
  pasangDrop(v, async f => { try { F.bukti = await siapBerkas(f); $('#bprev', v).innerHTML = F.bukti.mime === 'application/pdf' ? `<div class="chk" style="cursor:default">${ic('file')}<span class="mono sm">${esc(F.bukti.nama)} · PDF</span></div>` : `<div class="row" style="align-items:flex-start"><img alt="Pratinjau bukti" style="max-width:160px;border:1px solid var(--line2)" src="data:image/jpeg;base64,${F.bukti.data}"><div class="mono sm">${esc(F.bukti.nama)}<br>${(F.bukti.data.length * .75 / 1024).toFixed(0)} KB<br><button class="btn danger sm mt" id="bdel">HAPUS</button></div></div>`; const d = $('#bdel', v); if (d) d.onclick = () => { F.bukti = null; $('#bprev', v).innerHTML = ''; }; } catch (e) { toast(e.message, 'err'); } });
  $('#fsub', v).onclick = e => aman(e.currentTarget, async () => {
    const nom = Math.round(Number($('[name=nominal]', v).value.replace(/\D/g, '')) || 0);
    const r = await Api.call('kas.simpan', { kelas: F.kelas, jenis: F.jenis, tanggal: val(v, 'tanggal'), kategori: val(v, 'kategori'), nominal: nom, keterangan: val(v, 'keterangan'), bukti: F.bukti });
    toast(r.message + (r.data.flag ? ' Pengeluaran ini ditandai FLAGGED karena belum ada bukti.' : '')); go('kas');
  });
  kat(); sim(); muatSaldo();
};

// ============================================================ LOST & FOUND
const KAT_BRG = ['Alat tulis', 'Tas & dompet', 'Alat minum / makan', 'Pakaian', 'Elektronik', 'Buku', 'Lainnya'];
Pages.barang = async v => {
  const n = S.nav, staf = ['admin', 'wali'].includes(S.me.role), bisaLapor = S.me.role !== 'pimpinan';
  const B = { tab: 'Ditemukan', q: '', rows: [] };
  v.innerHTML = ph('W-06', 'Lost and Found', 'Pencatatan barang temuan dan hilang yang jujur dan terintegrasi — klaim wajib diverifikasi petugas.', bisaLapor ? `<button class="btn" id="blapor">${ic('plus')} Lapor barang</button>` : '') + `<div id="bw">${muat()}</div>` + topo('barang');
  const draw = () => {
    const cnt = s => B.rows.filter(r => r.Status === s).length, q = B.q.toLowerCase();
    const list = B.rows.filter(r => r.Status === B.tab && (!q || (r.Nama + ' ' + r.Lokasi + ' ' + r.Kategori).toLowerCase().includes(q)));
    $('#bw', v).innerHTML = `<div class="tabs">${['Ditemukan', 'Diklaim', 'Dikembalikan', 'Diarsipkan'].map(t => `<button class="tab ${B.tab === t ? 'on' : ''}" data-t="${t}">${t} (${cnt(t)})</button>`).join('')}</div><div class="row mb"><input class="in" id="bq" value="${esc(B.q)}" placeholder="Cari nama barang / lokasi…" style="max-width:320px" aria-label="Cari barang"></div>` +
      (list.length ? `<div class="grid g3">${list.map(r => `<div class="card"><div>${r.Thumb ? `<div class="ximg" style="aspect-ratio:4/3"><img alt="Foto ${esc(r.Nama)}" src="${esc(r.Thumb)}"></div>` : xbox(4, 3, '[IMG: tanpa foto]')}</div><div class="cb"><div class="row sb2" style="align-items:flex-start"><b>${esc(r.Nama)}</b>${sbd(r.Status)}</div><div class="sm sub mt" style="margin-top:6px">${bd(r.Jenis, r.Jenis === 'Hilang' ? 'r' : '')} ${esc(r.Kategori)}<br>${ic('flag', 12)} ${esc(r.Lokasi)} · ${tgl(r.Tanggal)}</div></div><div class="cf row sb2"><span>Oleh ${esc(r.pelapor)}</span><button class="btn o sm" data-d="${r.BarangID}">DETAIL</button></div></div>`).join('')}</div>` : `<div class="card">${kosong('box', 'Belum ada barang pada tab ini.')}</div>`);
    $$('[data-t]', v).forEach(b => b.onclick = () => { B.tab = b.dataset.t; draw(); });
    $('#bq', v).oninput = debounce(e => { B.q = e.target.value; draw(); const i = $('#bq', v); i.focus(); i.setSelectionRange(i.value.length, i.value.length); }, 250);
    $$('[data-d]', v).forEach(b => b.onclick = () => detail(B.rows.find(r => r.BarangID === b.dataset.d)));
  };
  const ulang = async () => { try { const d = await Api.d('barang.list', {}); if (!vivo(n)) return; B.rows = d.rows; draw(); } catch (e) { $('#bw', v).innerHTML = `<div class="card">${kosong('alert', e.message)}</div>`; } };
  const detail = r => {
    const act = [{ label: 'Tutup' }];
    if (r.Status === 'Ditemukan' && r.Jenis === 'Temuan' && bisaLapor) act.push({ label: 'Ini barang saya', cls: 'p', fn: () => { klaim(r); return true; } });
    if (staf && r.Status === 'Diklaim') { act.push({ label: 'Tolak klaim', cls: 'danger', fn: async () => { await Api.call('barang.proses', { id: r.BarangID, keputusan: 'tolak' }); toast('Klaim ditolak.'); ulang(); } }, { label: 'Serahkan barang', cls: 'p', fn: async () => { await Api.call('barang.proses', { id: r.BarangID, keputusan: 'serah' }); toast('Barang diserahkan.'); ulang(); } }); }
    if (staf && r.Status === 'Ditemukan') act.splice(1, 0, { label: 'Arsipkan', fn: async () => { await Api.call('barang.proses', { id: r.BarangID, keputusan: 'arsip' }); ulang(); } });
    if (staf || (r.milikPelapor && r.Status === 'Ditemukan')) act.splice(1, 0, { label: 'Hapus', cls: 'danger', fn: () => { modalHapus({ judul: 'Hapus laporan barang', ringkas: `<b>${esc(r.Nama)}</b> (${esc(r.Jenis)}) · ${esc(r.Lokasi)}`, aksi: a => Api.call('barang.hapus', { id: r.BarangID, alasan: a }), selesai: ulang }); } });
    const m = modal({ title: r.BarangID + ' · ' + r.Nama, wide: true, body: `<div class="grid g2"><div id="mf">${r.Thumb ? `<div class="ximg" style="aspect-ratio:4/3"><img alt="Foto" src="${esc(r.Thumb)}"></div>` : xbox(4, 3, '[IMG]')}${r.adaFoto ? '<button class="btn o sm mt" id="mfull">Lihat foto penuh</button>' : ''}</div><div class="sm"><div class="lbl">Status</div>${sbd(r.Status)}<div class="lbl mt">Jenis / kategori</div>${esc(r.Jenis)} · ${esc(r.Kategori)}<div class="lbl mt">Lokasi / tanggal</div>${esc(r.Lokasi)} · ${tgl(r.Tanggal)}<div class="lbl mt">Deskripsi</div>${esc(r.Deskripsi || '–')}<div class="lbl mt">Dilaporkan oleh</div>${esc(r.pelapor)}${r.pengklaim ? `<div class="lbl mt">Pengklaim</div>${esc(r.pengklaim)}${r.CiriKlaim ? `<div class="lbl mt">Ciri yang disebutkan pengklaim</div><div class="chk" style="cursor:default">${esc(r.CiriKlaim)}</div>` : ''}` : ''}<div class="timeline mt mono xs sub">Ditemukan → Diklaim → Dikembalikan · serah terima wajib diverifikasi petugas</div></div></div>`, actions: act });
    const f = $('#mfull', m.el); if (f) f.onclick = e => aman(e.currentTarget, async () => tampilBerkas(await Api.d('berkas.ambil', { jenis: 'barang', id: r.BarangID }), 'Foto ' + r.Nama));
  };
  const klaim = r => modal({ title: 'Klaim: ' + r.Nama, body: `<p class="sm">Sebutkan ciri khusus yang hanya pemilik ketahui (isi, stiker, goresan, nama tertulis). Petugas akan mencocokkannya sebelum barang diserahkan.</p>${fld('Ciri-ciri barang *', '<textarea class="in" name="ciri" maxlength="300"></textarea>', 'Minimal 15 karakter. Klaim palsu merupakan pelanggaran integritas.')}`, actions: [{ label: 'Batal' }, { label: 'Kirim klaim', cls: 'p', fn: async m => { const x = await Api.call('barang.klaim', { id: r.BarangID, ciri: val(m.el, 'ciri') }); toast(x.message); ulang(); } }] });
  const lapor = $('#blapor', v); if (lapor) lapor.onclick = () => {
    let foto = null;
    const m = modal({ title: 'Lapor barang', body: `<div class="radio2"><label><input type="radio" name="jenis" value="Temuan" checked><span>SAYA MENEMUKAN BARANG</span></label><label><input type="radio" name="jenis" value="Hilang"><span>BARANG SAYA HILANG</span></label></div><div class="mt">${fld('Nama barang *', '<input class="in" name="nama" maxlength="80">')}<div class="f2">${fld('Kategori', `<select class="in" name="kat">${opsi(KAT_BRG)}</select>`)}${fld('Tanggal', `<input type="date" class="in" name="tgl" value="${hariIni()}" max="${hariIni()}">`)}</div>${fld('Lokasi *', '<input class="in" name="lok" maxlength="100" placeholder="Contoh: Kantin, depan kelas VIII-A">')}${fld('Deskripsi', '<textarea class="in" name="desk" maxlength="300" placeholder="Warna, merek, kondisi (jangan tulis ciri rahasia yang dipakai untuk verifikasi pemilik)"></textarea>')}<div class="drop" style="padding:14px"><div class="mono sm">${ic('camera', 16)} [UNGGAH FOTO · OPSIONAL]</div><input type="file" class="hide" accept="image/jpeg,image/png"></div><div class="mono sm mt" id="finfo"></div></div>`, actions: [{ label: 'Batal' }, { label: 'Kirim laporan', cls: 'p', fn: async mm => { const r = await Api.call('barang.simpan', { jenis: $('[name=jenis]:checked', mm.el).value, nama: val(mm.el, 'nama'), kategori: val(mm.el, 'kat'), tanggal: val(mm.el, 'tgl'), lokasi: val(mm.el, 'lok'), deskripsi: val(mm.el, 'desk'), foto: foto && { nama: foto.nama, mime: foto.mime, data: foto.data }, thumb: foto && foto.thumb }); toast(r.message); ulang(); } }] });
    pasangDrop(m.el, async f => { try { foto = await siapBerkas(f, true); $('#finfo', m.el).textContent = foto.nama + ' siap diunggah'; } catch (e) { toast(e.message, 'err'); } });
  };
  ulang();
};
