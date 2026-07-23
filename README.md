# Menara — Panel Bot Telegram

Dashboard untuk memasang dan menjalankan banyak bot Telegram sekaligus.
Tinggal tempel token dari @BotFather di web, bot langsung aktif dan membalas pesan.

## Cara kerja (penting dibaca)

Vercel itu **serverless** — tidak ada proses yang "menyala terus" seperti VPS.
Karena itu bot di sini **tidak** memakai long-polling, tapi **webhook**:

1. Kamu tempel token bot di dashboard.
2. Sistem otomatis daftar webhook ke Telegram, mengarah ke
   `https://domain-kamu.vercel.app/api/webhook/[botId]`.
3. Setiap ada pesan masuk ke bot, Telegram langsung memanggil endpoint itu,
   dan bot membalas dalam hitungan milidetik. Tidak perlu server yang "nyala".

Jadi walau terlihat seperti "jalan terus", sebenarnya bot ini bereaksi setiap
ada pesan masuk — bukan idle nunggu di background. Efeknya sama persis dari
sisi pengguna Telegram: bot selalu responsif 24/7.

## Fitur bawaan

- Tempel token → otomatis divalidasi ke Telegram, webhook langsung dipasang.
- Atur pesan `/start`, balasan default, dan kata kunci → balasan otomatis,
  semua dari web tanpa perlu coding.
- Jeda/aktifkan bot kapan saja tanpa menghapus token.
- Log 50 pesan terakhir per bot (siapa chat, apa yang diketik, apa balasannya).
- Hapus bot → webhook otomatis dicabut dari Telegram.

## Deploy ke Vercel

### 1. Push ke GitHub

```bash
git init
git add .
git commit -m "Menara - panel bot telegram"
git branch -M main
git remote add origin <url-repo-kamu>
git push -u origin main
```

### 2. Import project di Vercel

- Buka https://vercel.com/new, pilih repo ini.
- Framework preset otomatis terdeteksi sebagai Next.js. Klik **Deploy**.

### 3. Pasang database (WAJIB — untuk simpan token & rules)

Vercel KV sudah tidak tersedia untuk project baru, sekarang penggantinya
adalah integrasi Redis dari Upstash lewat Vercel Marketplace:

1. Di dashboard project kamu di Vercel → tab **Storage**.
2. **Create Database** → pilih **Upstash** → **Redis**.
3. Ikuti wizard-nya, lalu **Connect** ke project ini.
4. Vercel otomatis mengisi env var `UPSTASH_REDIS_REST_URL` dan
   `UPSTASH_REDIS_REST_TOKEN` ke project — tidak perlu diisi manual.
5. **Redeploy** project (tab Deployments → titik tiga → Redeploy) supaya
   env var baru terbaca.

### 4. Selesai — buka domain Vercel kamu

Begitu domain aktif (misalnya `menara-kamu.vercel.app`), buka di browser,
tempel token bot dari @BotFather, dan bot langsung aktif.

## Menjalankan lokal (opsional, untuk development)

```bash
npm install
cp .env.example .env.local
# isi UPSTASH_REDIS_REST_URL dan UPSTASH_REDIS_REST_TOKEN di .env.local
npm run dev
```

Catatan: Telegram tidak bisa mengirim webhook ke `localhost`. Untuk test
lokal, pakai tunnel seperti `ngrok http 3000` lalu register webhook manual
ke URL ngrok tersebut — atau langsung test di environment yang sudah deploy.

## Struktur project

```
app/
  page.js                     → halaman dashboard
  api/bots/route.js           → tambah bot baru (paste token di sini)
  api/bots/[id]/route.js      → edit rules / hapus bot
  api/webhook/[botId]/route.js→ endpoint yang dipanggil Telegram saat ada pesan
  api/health/route.js         → dipakai cron untuk cek status
lib/
  db.js                       → penyimpanan data bot (Upstash Redis)
  botEngine.js                → logika balasan otomatis & panggilan API Telegram
components/
  Dashboard.jsx, BotCard.jsx, AddBotPanel.jsx, EmptyState.jsx
```

## Mengembangkan lebih lanjut

Balasan bot saat ini berbasis kata kunci (rule-based) — cukup untuk FAQ bot,
customer service sederhana, atau bot notifikasi. Kalau nanti butuh bot yang
lebih pintar (nyambung ke AI, database eksternal, atau integrasi pihak
ketiga), tinggal edit `findReply()` di `lib/botEngine.js`.
