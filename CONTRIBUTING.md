# 🤝 SOP GitHub untuk Kolaborasi Proyek SYNAR

## 📌 Tujuan

Memastikan kolaborasi Capstone Project **SYNAR (System for UV & Sun Exposure Analysis and Recommendation)** berjalan terstruktur, aman, dan efisien tanpa konflik antar anggota tim.

---

## 🧩 Struktur Branch

* **main** → Branch production (final, stabil, siap demo)
* **dev** → Branch integrasi (gabungan semua fitur sebelum ke main)
* **feature/<nama-task>** → Branch untuk pengembangan fitur

  * Contoh:
    `feature/cnn-skin-classification`
    `feature/ui-dashboard`
    `feature/api-predict-endpoint`
* **bugfix/<nama-bug>** → Branch untuk perbaikan bug

  * Contoh:
    `bugfix/ui-error-display`
    `bugfix/api-validation-error`

---

## 👣 Alur Kerja Harian 

### 1. Sinkronisasi sebelum mulai kerja

```bash
git checkout dev
git pull origin dev
```

✅ Pastikan selalu menggunakan kode terbaru dari tim

---

### 2. Buat branch baru sesuai task

```bash
git checkout -b feature/nama-task
```

---

### 3. Kerjakan tugas masing-masing

* Coding sesuai jobdesk (AI / DS / FE / BE)
* Tidak mengubah bagian yang bukan tanggung jawab
* Test di local sebelum commit

---

### 4. Commit dan push perubahan

```bash
git add .
git commit -m "feat(ai): implementasi model CNN untuk klasifikasi kulit"
git push origin feature/nama-task
```

📌 Format commit:

```
type(scope): deskripsi

type: feat | fix | docs | refactor | test | chore
scope: ai | ds | fe | be | docs
```

Contoh:

```bash
feat(ds): complete EDA with UV correlation
fix(fe): fix UI crash on empty response
```

---

### 5. Pull Request ke branch `dev`

* Buka GitHub repo
* Klik **Compare & pull request**
* Base: `dev`, Compare: `feature/nama-task`
* Tambahkan deskripsi singkat
* Klik **Create Pull Request**

---

### 6. Review & Merge

* Minimal **1 approval (PM / anggota lain)**
* Pastikan:

  * Tidak ada conflict
  * Fitur berjalan
* Merge ke `dev`

---

### 7. Hapus branch setelah merge

```bash
# Hapus branch lokal
git branch -d feature/nama-task

# Hapus branch remote
git push origin --delete feature/nama-task
```

---

## 🔄 Alur Integrasi Utama

```
feature → dev → main
```

* Semua fitur → masuk ke `dev`
* Setelah stabil → PM merge ke `main`

🚫 Dilarang push langsung ke `main`

---

## 🧠 Pembagian Tanggung Jawab

### 🤖 AI Engineer

* Model CNN klasifikasi tipe kulit (Fitzpatrick)
* Model prediksi durasi berjemur
* Model serving (FastAPI/Flask)

---

### 📊 Data Scientist

* Crawling data NASA (historical)
* Data cleaning & preprocessing
* Exploratory Data Analysis (EDA)

---

### 🌐 Fullstack Developer

* Frontend (React + Vite)
* Backend API (Node.js / Express)
* Integrasi AI model & API cuaca

---

### 🧑‍💼 Project Manager

* Mengatur timeline & workflow GitHub
* Review Pull Request
* Menjaga stabilitas branch `main`

---

## ✅ Checklist Kolaborasi
* [ ] Sudah jadi collaborator repo GitHub
* [ ] Tidak push langsung ke `main`
* [ ] Selalu buat branch baru
* [ ] Selalu pull sebelum kerja
* [ ] Gunakan Pull Request
* [ ] Saling review Pull Request
* [ ] Merge hanya jika sudah dites dan tidak bug
* [ ] Minimal 1 approval sebelum merge
* [ ] Komunikasi aktif di WA/DC jika ada konflik

---
