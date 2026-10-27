// js/kumbang.js — kumbang hidup yang selalu mengikuti kursor / jari.
// Gerak: berjalan dengan pola tripod (3 kaki bergantian), kaki 2-ruas (IK), belok bertahap seperti hewan sungguhan,
// sungut dan rahang bergerak, lari kencang + sayap bergetar bila kursor jauh. Hormati prefers-reduced-motion.
(function () {
  const KEY = 'siakas_kumbang', UKURAN = 76;
  const NS = 'http://www.w3.org/2000/svg';
  const tubuh = `
  <svg viewBox="-52 -52 104 104" width="${UKURAN}" height="${UKURAN}" xmlns="${NS}" focusable="false" aria-hidden="true">
    <defs>
      <radialGradient id="kbE" cx="32%" cy="22%" r="95%"><stop offset="0" stop-color="#8be3b9"/><stop offset=".18" stop-color="#2f9772"/><stop offset=".5" stop-color="#0f4636"/><stop offset=".85" stop-color="#05170f"/><stop offset="1" stop-color="#020805"/></radialGradient>
      <radialGradient id="kbP" cx="38%" cy="28%" r="85%"><stop offset="0" stop-color="#6cc3a2"/><stop offset=".45" stop-color="#17503f"/><stop offset="1" stop-color="#04120d"/></radialGradient>
      <radialGradient id="kbH" cx="40%" cy="30%" r="80%"><stop offset="0" stop-color="#2b4a3e"/><stop offset="1" stop-color="#030a07"/></radialGradient>
      <linearGradient id="kbG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
      <filter id="kbB" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.4"/></filter>
    </defs>
    <g id="kb-sh"><ellipse cx="0" cy="2" rx="17" ry="35" fill="#000" opacity=".26" filter="url(#kbB)"/></g>
    <g id="kb-body">
      <g id="kb-legs" stroke="#0e0a06" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.3">
        <path/><path/><path/><path/><path/><path/>
      </g>
      <g id="kb-wings" opacity="0">
        <ellipse id="kb-wL" cx="-13" cy="14" rx="6" ry="25" transform="rotate(14 -13 14)" fill="#c9b385" fill-opacity=".38" stroke="#5a4526" stroke-opacity=".5" stroke-width=".6"/>
        <ellipse id="kb-wR" cx="13" cy="14" rx="6" ry="25" transform="rotate(-14 13 14)" fill="#c9b385" fill-opacity=".38" stroke="#5a4526" stroke-opacity=".5" stroke-width=".6"/>
      </g>
      <g id="kb-ant" stroke="#0e0a06" stroke-width="1.35" stroke-linecap="round" fill="none"><path/><path/></g>
      <g fill="#0e0a06"><ellipse id="kb-cL" rx="2.2" ry="3.2"/><ellipse id="kb-cR" rx="2.2" ry="3.2"/></g>
      <path id="kb-mL" d="M-3 -34 Q-7 -38.5 -3.2 -42" stroke="#0e0a06" stroke-width="1.8" stroke-linecap="round" fill="none"/>
      <path id="kb-mR" d="M3 -34 Q7 -38.5 3.2 -42" stroke="#0e0a06" stroke-width="1.8" stroke-linecap="round" fill="none"/>
      <path d="M-8 -26 Q-8.5 -35.5 0 -35.5 Q8.5 -35.5 8 -26 Q8 -21.5 0 -21 Q-8 -21.5 -8 -26Z" fill="url(#kbH)" stroke="#020705" stroke-width=".7"/>
      <circle cx="-6.3" cy="-28.4" r="2.2" fill="#050505"/><circle cx="6.3" cy="-28.4" r="2.2" fill="#050505"/>
      <circle cx="-6.9" cy="-29.1" r=".7" fill="#fff" opacity=".85"/><circle cx="5.7" cy="-29.1" r=".7" fill="#fff" opacity=".85"/>
      <path d="M-14.5 -20.5 Q-16.5 -13 -15.5 -6 L15.5 -6 Q16.5 -13 14.5 -20.5 Q0 -25.5 -14.5 -20.5Z" fill="url(#kbP)" stroke="#020705" stroke-width=".7"/>
      <path d="M-9 -18.5 Q0 -21.5 9 -18.5" stroke="#9fe8c8" stroke-opacity=".35" stroke-width="1.2" fill="none" stroke-linecap="round"/>
      <g id="kb-eL"><path d="M-.6 -7 L-15.5 -7 Q-19.5 8 -14.5 24 Q-8.5 36 -.6 38.5 Z" fill="url(#kbE)" stroke="#020705" stroke-width=".7"/>
        <g stroke="#000" stroke-opacity=".38" stroke-width=".7" fill="none"><path d="M-4.2 -6 Q-5.4 18 -2.4 36"/><path d="M-8.2 -6 Q-10.4 17 -6.6 33"/><path d="M-12 -6 Q-15 14 -10.4 28"/></g>
        <ellipse cx="-8" cy="9" rx="2.6" ry="13" fill="url(#kbG)" opacity=".5" transform="rotate(-6 -8 9)"/></g>
      <g id="kb-eR"><path d="M.6 -7 L15.5 -7 Q19.5 8 14.5 24 Q8.5 36 .6 38.5 Z" fill="url(#kbE)" stroke="#020705" stroke-width=".7"/>
        <g stroke="#000" stroke-opacity=".38" stroke-width=".7" fill="none"><path d="M4.2 -6 Q5.4 18 2.4 36"/><path d="M8.2 -6 Q10.4 17 6.6 33"/><path d="M12 -6 Q15 14 10.4 28"/></g>
        <ellipse cx="8" cy="9" rx="2.6" ry="13" fill="url(#kbG)" opacity=".5" transform="rotate(6 8 9)"/></g>
      <path d="M-2.4 -7.5 L2.4 -7.5 L0 -3Z" fill="#071a13" stroke="#020705" stroke-width=".4"/>
    </g>
  </svg>`;
  // [sisi, ax, ay (pangkal kaki), dx, dy (posisi istirahat telapak), femur, tibia, grup tripod]
  const KAKI = [[-1, -9, -17, -17, -13, 13, 16, 0], [1, 9, -17, 17, -13, 13, 16, 1], [-1, -13, -4, -23, -1, 15, 18, 1], [1, 13, -4, 23, -1, 15, 18, 0], [-1, -12, 9, -17, 15, 16, 19, 0], [1, 12, 9, 17, 15, 16, 19, 1]];
  const reduksi = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const K = { aktif: false, el: null, x: 0, y: 0, tx: 0, ty: 0, ang: 0, v: 0, fase: 0, t: 0, last: 0, raf: 0, gerak: 0, kepak: 0 };
  const sudut = a => { while (a > Math.PI) a -= 2 * Math.PI; while (a < -Math.PI) a += 2 * Math.PI; return a; };
  const $k = s => K.el.querySelector(s);

  function pasang() {
    if (K.el) return;
    K.el = document.createElement('div'); K.el.id = 'kumbang'; K.el.setAttribute('aria-hidden', 'true');
    K.el.style.cssText = `position:fixed;left:0;top:0;width:${UKURAN}px;height:${UKURAN}px;pointer-events:none;z-index:9998;will-change:transform;contain:layout paint style`;
    K.el.innerHTML = tubuh; document.body.appendChild(K.el);
    K.legs = [...K.el.querySelectorAll('#kb-legs path')]; K.ants = [...K.el.querySelectorAll('#kb-ant path')];
    K.x = innerWidth - 90; K.y = innerHeight - 90; K.tx = innerWidth * .62; K.ty = innerHeight * .62; K.ang = -Math.PI / 4;
  }
  function ik(h, f, l1, l2) {
    let dx = f[0] - h[0], dy = f[1] - h[1], d = Math.hypot(dx, dy) || .01;
    d = Math.min(l1 + l2 - .6, Math.max(Math.abs(l1 - l2) + .6, d));
    const ux = dx / Math.hypot(dx, dy), uy = dy / Math.hypot(dx, dy), a = (d * d + l1 * l1 - l2 * l2) / (2 * d), hh = Math.sqrt(Math.max(0, l1 * l1 - a * a));
    const k1 = [h[0] + ux * a - uy * hh, h[1] + uy * a + ux * hh], k2 = [h[0] + ux * a + uy * hh, h[1] + uy * a - ux * hh];
    return Math.abs(k1[0]) > Math.abs(k2[0]) ? k1 : k2;
  }
  function gambar(dt) {
    const gerak = Math.min(1, K.v / 55), sprint = K.kepak;
    const stride = (5.5 + Math.min(5, K.v / 90)) * gerak, t = K.t;
    KAKI.forEach((c, i) => {
      const ph = K.fase + c[7] * Math.PI, fo = stride * Math.sin(ph), angkat = Math.max(0, Math.cos(ph)) * 3.2 * gerak;
      const h = [c[1], c[2]], f = [c[1] + c[3] - c[0] * angkat, c[2] + c[4] - fo], k = ik(h, f, c[5], c[6]);
      const tx = f[0] - k[0], ty = f[1] - k[1], tl = Math.hypot(tx, ty) || 1;
      K.legs[i].setAttribute('d', `M${h[0].toFixed(1)} ${h[1].toFixed(1)}L${k[0].toFixed(1)} ${k[1].toFixed(1)}L${f[0].toFixed(1)} ${f[1].toFixed(1)}l${(tx / tl * 4.2).toFixed(1)} ${(ty / tl * 4.2).toFixed(1)}`);
    });
    // sungut: menyapu ke depan saat berjalan, berkedut saat diam
    [-1, 1].forEach((s, i) => {
      const dasar = s * (.62 + .12 * Math.sin(t * (K.v > 20 ? 11 : 3.1) + i * 1.9)) + (Math.sin(t * 1.3 + i * 4) > .94 ? s * .5 : 0);
      const b = [s * 4, -33], m = [b[0] + Math.sin(dasar) * 11, b[1] - Math.cos(dasar) * 11], a2 = dasar + s * (.25 + .18 * Math.sin(t * 8 + i)), e = [m[0] + Math.sin(a2) * 11, m[1] - Math.cos(a2) * 11];
      K.ants[i].setAttribute('d', `M${b[0]} ${b[1]}L${m[0].toFixed(1)} ${m[1].toFixed(1)}L${e[0].toFixed(1)} ${e[1].toFixed(1)}`);
      const c = $k(i ? '#kb-cR' : '#kb-cL'); c.setAttribute('transform', `translate(${e[0].toFixed(1)} ${e[1].toFixed(1)}) rotate(${(a2 * 180 / Math.PI).toFixed(0)})`);
    });
    const buka = K.v > 20 ? 0 : 9 * Math.max(0, Math.sin(t * 2.4));
    $k('#kb-mL').setAttribute('transform', `rotate(${-buka} -3 -34)`); $k('#kb-mR').setAttribute('transform', `rotate(${buka} 3 -34)`);
    const goyang = Math.sin(K.fase * 1 + 0) * 1.6 * gerak, nafas = 1 + .008 * Math.sin(t * 2.2);
    $k('#kb-body').setAttribute('transform', `rotate(${(K.ang * 180 / Math.PI + goyang).toFixed(1)}) scale(${nafas.toFixed(3)})`);
    // bayangan tetap jatuh ke kanan-bawah layar walau badan berputar
    const ox = 4, oy = 6, ca = Math.cos(K.ang), sa = Math.sin(K.ang);
    $k('#kb-sh').setAttribute('transform', `translate(${(ox * ca + oy * sa).toFixed(1)} ${(-ox * sa + oy * ca).toFixed(1)}) rotate(${(K.ang * 180 / Math.PI).toFixed(1)})`);
    // lari kencang: elitra terangkat, sayap bergetar
    const w = $k('#kb-wings'), lift = sprint * 16;
    w.setAttribute('opacity', (sprint * .95).toFixed(2));
    $k('#kb-eL').setAttribute('transform', `rotate(${-lift} -1 -7)`); $k('#kb-eR').setAttribute('transform', `rotate(${lift} 1 -7)`);
    const fl = Math.sin(t * 70) * 9 * sprint; $k('#kb-wL').setAttribute('transform', `rotate(${14 + fl} -13 -4)`); $k('#kb-wR').setAttribute('transform', `rotate(${-14 - fl} 13 -4)`);
    K.el.style.transform = `translate3d(${(K.x - UKURAN / 2).toFixed(1)}px,${(K.y - UKURAN / 2).toFixed(1)}px,0)`;
  }
  function langkah(now) {
    K.raf = requestAnimationFrame(langkah);
    const dt = Math.min(.05, (now - (K.last || now)) / 1000 || .016); K.last = now; K.t += dt;
    const dx = K.tx - K.x, dy = K.ty - K.y, dist = Math.hypot(dx, dy), jarakHenti = 48;
    const mau = Math.atan2(dx, -dy), da = sudut(mau - K.ang);
    const laju = 5.5 + Math.min(5, dist / 120);
    K.ang += Math.max(-laju * dt, Math.min(laju * dt, da));
    let sp = dist > jarakHenti ? Math.min(dist > 420 ? 640 : 360, (dist - jarakHenti) * 3.4 + 38) : 0;
    if (Math.abs(da) > 1.1) sp *= .35;
    K.v += (sp - K.v) * Math.min(1, dt * 7);
    if (K.v < 3) K.v = 0;
    K.x += Math.sin(K.ang) * K.v * dt; K.y -= Math.cos(K.ang) * K.v * dt;
    K.x = Math.max(24, Math.min(innerWidth - 24, K.x)); K.y = Math.max(24, Math.min(innerHeight - 24, K.y));
    K.fase += Math.min(K.v * .12, 26) * dt;
    K.kepak += ((K.v > 460 ? 1 : 0) - K.kepak) * Math.min(1, dt * 9);
    gambar(dt);
  }
  function arah(x, y) { K.tx = x; K.ty = y; if (reduksi && K.aktif) { clearTimeout(K.rt); K.rt = setTimeout(() => { K.x = Math.min(innerWidth - 30, x + 40); K.y = Math.min(innerHeight - 30, y + 40); gambar(0); }, 250); } }
  const onMove = e => arah(e.clientX, e.clientY), onTouch = e => { const t = e.touches[0]; if (t) arah(t.clientX, t.clientY); };
  function nyala() {
    pasang(); K.aktif = true; K.el.style.display = '';
    addEventListener('pointermove', onMove, { passive: true }); addEventListener('touchstart', onTouch, { passive: true }); addEventListener('touchmove', onTouch, { passive: true });
    cancelAnimationFrame(K.raf); K.last = 0; if (reduksi) gambar(0); else K.raf = requestAnimationFrame(langkah);
  }
  function mati() {
    K.aktif = false; cancelAnimationFrame(K.raf); if (K.el) K.el.style.display = 'none';
    removeEventListener('pointermove', onMove); removeEventListener('touchstart', onTouch); removeEventListener('touchmove', onTouch);
  }
  window.Kumbang = {
    get aktif() { return K.aktif; },
    init() { let pref = '1'; try { pref = localStorage.getItem(KEY) || '1'; } catch (e) { /* abaikan */ } if (pref === '1') nyala(); },
    toggle() { K.aktif ? mati() : nyala(); try { localStorage.setItem(KEY, K.aktif ? '1' : '0'); } catch (e) { /* abaikan */ } return K.aktif; }
  };
})();
