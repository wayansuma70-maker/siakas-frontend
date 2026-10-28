# SIAKAS — Sistem Aplikasi Anti Korupsi
SMP Negeri 3 Kediri, Tabanan, Bali. Frontend statis (HTML/CSS/JS murni) untuk GitHub Pages.
Backend: Google Apps Script sebagai REST API (berkas terpisah, tidak ada di repositori ini).

## Pengaturan satu-satunya
Edit `js/config.js` dan isi `GAS_URL` dengan URL Web App Apps Script (berakhiran `/exec`).
URL ini bukan rahasia. Keamanan dijaga oleh token sesi dan pengecekan peran di server.

## Struktur
```
index.html
css/style.css
templat/*.xlsx (templat impor Excel)
js/config.js  js/api.js  js/ui.js  js/pages1.js  js/pages2.js  js/kumbang.js  js/app.js
```
Panduan lengkap: lihat PANDUAN-INSTALASI.md (dikirim terpisah).
