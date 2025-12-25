# 📄 Product Requirements Document (PRD)

**Product Name:** PixForge
**Tagline:** Gabungin dua foto jadi satu momen berdua dengan AI

## 1. Overview

**PixForge** adalah web application berbasis AI yang memungkinkan user mengunggah dua foto orang berbeda, lalu menggabungkannya menjadi satu foto realistis atau artistik (seolah berfoto bersama). Produk ini ditujukan untuk kebutuhan personal, sosial media, dan konten kreatif.

## 2. Problem Statement

Banyak orang ingin terlihat “foto bareng” dengan orang lain (teman, pasangan, idola), tapi:

- Tidak punya foto bersama.
- Terpisah jarak / beda waktu.
- **Tools AI yang ada saat ini:**
  - Terlalu teknis.
  - UI rumit.
  - Tidak fokus ke use-case “foto bareng”.

## 3. Goals & Success Metrics

### Goals

- Memungkinkan user menggabungkan 2 foto menjadi 1 foto dengan mudah.
- Menyediakan opsi edit gaya (cartoon, oil painting, dll).
- Monetisasi lewat sistem credit-based.

### Success Metrics

- Conversion upload → generate ≥ 40%
- Completion rate halaman edit ≥ 70%
- Paid conversion ≥ 5%
- Waktu generate < 30 detik per foto

## 4. Target Users

### Primary Users

- Anak muda (18–35).
- Pengguna sosial media (IG, TikTok, Threads).
- Pasangan LDR, teman, konten kreator.

### Secondary Users

- UMKM (konten promosi).
- Gift / surprise maker.

## 5. User Journey (High Level)

1.  User membuka homepage → Login via Google.
2.  Upload 2 foto + input prompt.
3.  AI generate foto gabungan.
4.  User edit (style / efek).
5.  Save hasil.
6.  Jika credit habis → popup pembayaran.

## 6. Features & Requirements

### 6.1 Page 1 – Homepage / Company Profile

**Objective:** Menjelaskan apa yang dijual & meyakinkan user.

**Functional Requirements:**

- **Hero section:** Headline + subheadline, CTA (“Coba Gratis”).
- **Sections:**
  - How it works (3 steps).
  - Example before/after.
  - Pricing preview.
  - FAQ singkat.

**Non-Functional:**

- Fast load (< 2s).
- SEO friendly.
- Mobile-first.

### 6.2 Authentication (New)

**Objective:** Identifikasi user & manajemen credit.

**Features:**

- **Login Method:** Google Sign-In (via Firebase).
- **Data Storage:** Sync user data ke Supabase (email, name, photoURL, credits).
- **Flow:**
  - User klik "Login with Google".
  - Firebase return auth token.
  - Frontend check user di Supabase:
    - If new: Create user di Supabase + Free credits.
    - If exist: Fetch data credits.

### 6.3 Page 2 – Upload Foto & Prompt

**Objective:** Mengumpulkan input untuk AI generation.

**Inputs:**

- Upload Foto A (mandatory).
- Upload Foto B (mandatory).
- Prompt text (optional).
  - _Example: “Make us standing side by side in a cafe, realistic lighting”_

**Functional Requirements:**

- **Validasi:** Hanya foto manusia, Max size (misal 5MB).
- Preview kedua foto.
- CTA: Generate Foto.

**Edge Cases:**

- Salah upload (non-human).
- Foto blur / wajah tidak terdeteksi.

### 6.4 Page 3 – Edit & Style Photo

**Objective:** Memberikan kontrol artistik tambahan.

**Features:**

- **Style presets:** Realistic, Cartoon, Oil Painting, Anime, Watercolor.
- **Adjustment (optional, v1 sederhana):** Strength slider (0–100%).
- Re-generate dengan style baru (pakai credit).

**UX Notes:**

- Live preview (atau loading skeleton).
- Tampilkan sisa credit.

### 6.5 Page 4 – Save, Download & Payment

**Objective:** Finalisasi & monetisasi.

**Save & Download:**

- Download image (JPG / PNG).
- Watermark jika free credit.

**Credit System:**

- 1 generate = 1 credit.
- Edit style ulang = 1 credit.

**Payment Flow:**

- Jika credit = 0, tampilkan **Popup modal**:
  - “Credit kamu habis”.
  - **Pilihan paket:** 10 credits, 30 credits, Unlimited (monthly).
  - **Payment method:** E-wallet (GoPay, OVO, DANA), QRIS.

## 7. Monetization Model

- **Freemium**
  - Free: 1–2 credit + watermark.
- **Paid Credits**
  - One-time purchase.
  - Subscription (future): Unlimited generate, Priority processing.

## 8. Technical Requirements (High Level)

- **Frontend:**
  - **Core:** React + Vite + TypeScript.
  - **Auth:** Firebase Authentication (Google Sign-In).
  - **State Management:** XState (useful for complex generation flows).
  - **Data Fetching:** React Query (TanStack Query).
  - **Styling:** TailwindCSS (Simple theme, avoid complex custom styles).
- **Backend / BaaS:**
  - **Database:** Supabase (PostgreSQL) for User Data & Credits.
  - **Storage:** Supabase Storage (or similar) for images.
  - **Logic:** Payment webhook handling.
- **AI / Model:**
  - **Provider:** Gemini Pro 3 (Student Account).
  - **Capabilities:** Face detection & alignment, Image blending / diffusion, Style transfer.

## 9. Risks & Mitigations

| Risk                  | Mitigation               |
| :-------------------- | :----------------------- |
| Hasil AI tidak mirip  | Prompt helper & contoh   |
| Abuse / konten ilegal | Content moderation       |
| Generate lama         | Queue & async processing |
| Cost AI mahal         | Credit limitation        |

## 10. Future Enhancements

- Background selector.
- Pose templates.
- Video / animated output.
- Share langsung ke IG / TikTok.
- Couple / group mode (3+ orang).

## 11. MVP Scope (IMPORTANT)

**MVP includes:**

- Upload 2 foto.
- Generate gabungan.
- 3 style dasar.
- Credit system sederhana.
- Download hasil.

**Out of scope (v1):**

- Video.
- Advanced manual editing.
- Community gallery.
