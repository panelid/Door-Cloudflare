# Claw Chat UI

Website chat interface untuk OpenClaw AI, di-deploy di Vercel.

## 🚀 Deploy ke Vercel

### 1. Install Vercel CLI (kalau belum)
```bash
npm i -g vercel
```

### 2. Login ke Vercel
```bash
vercel login
```

### 3. Setup Environment Variables
Copy file `.env.example` jadi `.env.local`:
```bash
cp .env.example .env.local
```

Edit `.env.local` sesuaikan token kalau perlu.

### 4. Deploy
```bash
vercel --prod
```

Atau push ke GitHub dan connect ke Vercel dashboard.

### 5. Setup Domain
Di Vercel dashboard:
- Pilih project
- Tab "Domains"
- Tambah domain: `claw.door.id`
- Ikuti instruksi DNS

## 🛠️ Development

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Open http://localhost:3000
```

## 📁 Struktur Folder

```
app/
├── api/chat/route.ts    # API endpoint ke OpenClaw
├── page.tsx             # Halaman chat utama
├── layout.tsx           # Layout aplikasi
└── globals.css          # Style global
```

## 🔐 Keamanan

- Token disimpan di Environment Variables (tidak kelihatan di kode)
- API route di server-side (token tidak expose ke browser)
- CORS sudah diatur di nginx OpenClaw
