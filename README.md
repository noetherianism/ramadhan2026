# Jadwal Buka Puasa Masjid Jogja
### Ramadan 1447 H / 2026 M

---

## 📁 Struktur File

```
jadwal-masjid/
├── index.html          ← Halaman utama
├── css/
│   └── style.css       ← Semua styling (variabel, layout, animasi)
├── js/
│   └── app.js          ← Logika aplikasi (fetch data, render, navigasi)
├── data/
│   └── jadwal.json     ← Database jadwal (edit di sini untuk update data)
└── README.md           ← Dokumentasi ini
```

---

## 🚀 Cara Menjalankan

File ini **tidak bisa dibuka langsung** sebagai file biasa (`file://`) karena menggunakan `fetch()` untuk membaca JSON.
Harus dijalankan lewat web server lokal.

### Opsi 1 — VS Code Live Server (paling mudah)
1. Install ekstensi **Live Server** di VS Code
2. Klik kanan `index.html` → **Open with Live Server**
3. Browser terbuka otomatis

### Opsi 2 — Python (sudah ada di sebagian besar PC)
```bash
# Masuk ke folder project
cd jadwal-masjid

# Python 3
python -m http.server 8080

# Python 2
python -m SimpleHTTPServer 8080
```
Lalu buka: `http://localhost:8080`

### Opsi 3 — Node.js
```bash
npx serve .
# atau
npx http-server -p 8080
```

---

## ✏️ Cara Update Data Jadwal

Edit file **`data/jadwal.json`**:

### Menambah/mengubah menu satu hari:
```json
{
  "tanggal": "2026-02-19",
  "ramadan_ke": 2,
  "menus": [
    "Opor ayam, tumis buncis tempe",   ← Masjid Pogung Dalangan (MPD)
    "Ikan Bakar Manokwari",             ← Masjid Nurul Ashri
    "Daging Giling",                    ← Masjid Jogokariyan
    ...                                 (12 masjid total, urut sesuai mosques[])
  ]
}
```

### Nilai yang bisa dipakai untuk menu:
- **String menu** → `"Opor Ayam, Tempe Goreng"`
- **`"-"`** → menu kosong/tidak ada
- **`null`** → belum diisi
- **`"(Belum ada jadwal)"`** → tampil sebagai placeholder

### Menambah masjid baru:
Di bagian `mosques[]`, tambahkan:
```json
{ "id": 12, "nama": "Masjid Baru", "singkatan": "MB" }
```
Kemudian tambahkan satu item lagi di setiap array `menus[]` di bagian `jadwal[]`.

---

## ⌨️ Fitur & Shortcut

| Aksi | Cara |
|------|------|
| Pindah hari | Klik pill tanggal di strip atas |
| Hari berikutnya | Tombol → atau tekan `→` di keyboard |
| Hari sebelumnya | Tombol ← atau tekan `←` di keyboard |
| Swipe ganti hari | Swipe kiri/kanan di layar HP |
| Cari menu/masjid | Ketik di search bar |
| Otomatis ke hari ini | Terjadi saat pertama membuka web |

---

## 🎨 Kustomisasi Warna

Edit variabel CSS di `css/style.css` bagian `:root`:
```css
:root {
  --gold:      #C9933A;   /* Warna emas utama */
  --teal:      #1A5C4E;   /* Warna hijau teal */
  --teal-dark: #0C3328;   /* Header & sticky nav */
  --cream:     #FEFAF2;   /* Background halaman */
}
```

---

## 📱 Kompatibilitas
- ✅ Chrome, Firefox, Edge, Safari (modern)
- ✅ Mobile-friendly (responsive)
- ✅ Keyboard accessible
- ✅ Touch swipe support
