// js/api.js — klien REST ke Google Apps Script (fetch + text/plain agar tanpa preflight CORS)
(function () {
  const READ = /(\.(list|summary|roster|config|stats|detail|queue|status|saya|data|audience|get)|^auth\.me)$/;
  const Api = {
    token: localStorage.getItem('siakas_token') || '',
    inflight: {}, epoch: 0, perf: [],
    siap() { const u = (window.APP_CONFIG || {}).GAS_URL || ''; return /^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec$/.test(u) && !/GANTI|XXXX/.test(u); },
    setToken(t) { this.token = t || ''; t ? localStorage.setItem('siakas_token', t) : localStorage.removeItem('siakas_token'); },
    async raw(action, data) {
      const t0 = performance.now();
      const kirim = async () => {
        const ctl = new AbortController(), to = setTimeout(() => ctl.abort(), 70000);
        try {
          const res = await fetch(window.APP_CONFIG.GAS_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ action, token: this.token, data: data || {} }), signal: ctl.signal });
          return await res.json();
        } finally { clearTimeout(to); }
      };
      let j;
      try { j = await kirim(); }
      catch (e) { try { j = await kirim(); } catch (e2) { throw new Error('Tidak dapat terhubung ke server. Periksa koneksi internet lalu coba lagi.'); } }
      const total = Math.round(performance.now() - t0);
      this.perf.push({ aksi: action, total, server: j.ms, cache: !!j.cached }); if (this.perf.length > 80) this.perf.shift();
      if (!j.success) {
        const e = new Error(j.message || 'Terjadi kesalahan.'); e.code = j.code;
        if (j.code === 'AUTH') { this.setToken(''); window.dispatchEvent(new Event('siakas:auth')); }
        throw e;
      }
      return j;
    },
    // pembacaan identik yang sedang berjalan digabung; epoch tulis mencegah data basi
    call(action, data) {
      if (!READ.test(action)) { this.epoch++; return this.raw(action, data); }
      const k = this.epoch + '|' + action + '|' + JSON.stringify(data || {});
      if (this.inflight[k]) return this.inflight[k];
      const p = this.raw(action, data); this.inflight[k] = p;
      const bersih = () => { delete this.inflight[k]; }; p.then(bersih, bersih);
      return p;
    },
    async d(action, data) { return (await this.call(action, data)).data; },
    // beberapa aksi baca dalam satu eksekusi server
    async many(calls) {
      const j = await this.raw('batch', { calls: calls.map(c => ({ action: c[0], data: c[1] || {} })) });
      return j.data.map(x => { if (!x.success) { const e = new Error(x.message); e.code = x.code; throw e; } return x.data; });
    },
    // stale-while-revalidate: tampilkan cache lokal dulu, lalu segarkan
    async swr(key, action, data, render) {
      const k = 'siakas_c_' + key; let hit = null;
      try { hit = JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { hit = null; }
      if (hit) render(hit.v, true);
      const fresh = await this.d(action, data);
      try { localStorage.setItem(k, JSON.stringify({ v: fresh, t: Date.now() })); } catch (e) { /* kuota penuh: abaikan */ }
      render(fresh, false); return fresh;
    },
    warm() { try { fetch(window.APP_CONFIG.GAS_URL + '?w=pub', { mode: 'no-cors' }); } catch (e) { /* abaikan */ } },
    tabel() { console.table(this.perf); }
  };
  window.Api = Api; window.Perf = { table: () => Api.tabel() };
})();
