# SYNAR_CapstoneProject_CC26-PSU349
<div align="center">

# ☀️ SYNAR — Sun Your Awareness

### Sistem Prediksi Risiko Radiasi Sinar UV Berbasis Machine Learning
**Capstone Project — Coding Camp DBS Foundation 2026**


[![Fullstack Developer](https://img.shields.io/badge/Fullstack-Developer-0ea5e9?style=for-the-badge)]()
[![AI Engineer](https://img.shields.io/badge/AI-Engineer-8b5cf6?style=for-the-badge)]()
[![Data Scientist](https://img.shields.io/badge/Data-Scientist-f59e0b?style=for-the-badge)]()

</div>

---

## Daftar Isi

1.  [Overview](#overview)
2.  [Ringkasan Non-Teknis](#ringkasan-non-teknis)
3.  [Fitur Utama](#fitur-utama)
4.  [Arsitektur Sistem](#arsitektur-sistem)
5.  [Penjelasan Arsitektur](#penjelasan-arsitektur)
6.  [Tech Stack](#tech-stack)
7.  [Keputusan Desain](#keputusan-desain)
8.  [Machine Learning](#machine-learning)
9.  [API Documentation](#api-documentation)
10. [Struktur Proyek](#struktur-proyek)
11. [Panduan Instalasi & Setup](#panduan-instalasi--setup)
12. [Menjalankan Aplikasi](#menjalankan-aplikasi)
13. [Deployment](#deployment)
14. [Tim Pengembang](#tim-pengembang)
15. [Lisensi](#lisensi)

---

## Overview

**SYNAR (Sun Your Awareness)** adalah aplikasi web berbasis kecerdasan buatan yang membantu pengguna mengetahui **tingkat risiko radiasi sinar ultraviolet (UV)** secara *real-time* berdasarkan lokasi geografis dan tipe kulit mereka. Aplikasi ini menggunakan **model Machine Learning** untuk memprediksi tingkat bahaya paparan UV dan memberikan **rekomendasi perlindungan** yang dipersonalisasi.

Platform ini mendigitalisasi seluruh alur analisis risiko UV dari deteksi lokasi otomatis via GPS, pengambilan data cuaca dan indeks UV *real-time*, hingga prediksi risiko oleh model ML dan perhitungan batas waktu paparan aman seluruhnya diakses melalui satu antarmuka web yang responsif tanpa perlu instalasi apapun.

---

## Ringkasan Non Teknis

> Untuk pengguna umum, advisor, dan penguji capstone.

Paparan radiasi UV berlebihan merupakan salah satu penyebab utama kerusakan kulit, penuaan dini, hingga risiko kanker kulit. Sayangnya, sebagian besar masyarakat tidak menyadari seberapa berbahaya sinar UV di lokasi mereka pada waktu tertentu apalagi memahami berapa lama aman berada di luar ruangan.

**SYNAR** hadir sebagai solusi digital untuk masalah tersebut:

-   **Untuk pengguna umum:** Cukup buka situs website, izinkan akses GPS (atau ketik nama lokasi), pilih tipe kulit (atau foto untuk scan wajah), lalu tekan satu tombol. Dalam hitungan detik, SYNAR menampilkan indeks UV saat ini dan parameter lainnya yang mempengaruhi, tingkat risiko, batas waktu aman di luar ruangan, kondisi cuaca lengkap, hingga tips perlindungan semua dalam bahasa Indonesia yang mudah dipahami.

-   **Untuk wisatawan dan pekerja lapangan:** Aplikasi mendukung pencarian lokasi di seluruh dunia dengan deteksi timezone otomatis (WIB/WITA/WIT/UTC), sehingga pengguna di manapun dapat mengetahui risiko UV di lokasi tujuan mereka.

-   **Dari sisi teknologi:** Seluruh prediksi risiko dihasilkan oleh model Machine Learning yang dilatih menggunakan dataset cuaca historis dari NASA POWER dan Model CNN yang juga telah dilatih. Sistem backend bertindak sebagai *orchestrator* yang menggabungkan data dari tiga API eksternal sebelum meneruskannya ke layanan ML untuk inferensi.

---

## Fitur Utama

| Fitur | Deskripsi |
|---|---|
| 🌍 **Deteksi Lokasi Otomatis** | Mendukung GPS browser dan pencarian lokasi manual dengan autocomplete global via Nominatim OpenStreetMap. |
| ☀️ **Indeks UV Real-Time** | Data UV terkini dari Open Meteo API dengan mekanisme *fallback* estimasi otomatis jika API tidak tersedia. |
| 🤖 **Prediksi Risiko ML** | Model Machine Learning mengklasifikasikan tingkat risiko berdasarkan kombinasi suhu, kelembapan, angin, dan tutupan awan. |
| 🧑 **Skala Fitzpatrick** | Penyesuaian rekomendasi berdasarkan 6 tipe kulit Fitzpatrick dari sangat terang hingga sangat gelap. |
| ⏱️ **Batas Waktu Aman** | Perhitungan waktu paparan aman yang mempertimbangkan indeks UV, tipe kulit, dan sudut elevasi matahari secara astronomis. |
| 🌤️ **Info Cuaca Lengkap** | Menampilkan suhu, kelembapan, kecepatan angin, dan persentase tutupan awan dari OpenWeatherMap. |
| 📐 **Posisi Matahari** | Kalkulasi sudut elevasi matahari secara astronomis untuk koreksi tingkat paparan UV yang lebih akurat. |
| 🕐 **Multi-Timezone** | Deteksi otomatis dan tampilan waktu WIB, WITA, WIT, atau UTC berdasarkan koordinat lokasi. |
| 📱 **Responsive Design** | Antarmuka glassmorphism dengan animasi Framer Motion, optimal di mobile dan desktop. |

---

## Arsitektur Sistem

<img width="1536" height="1024" alt="visual" src="https://github.com/user-attachments/assets/e1c8c086-d668-4383-8686-7c910bebdaa1" />

---

## Penjelasan Arsitektur

Aplikasi menggunakan arsitektur **3-Tier Microservice** di mana setiap *layer* bertanggung jawab atas satu domain fungsional:

### 1. Frontend React SPA

Antarmuka pengguna dibangun menggunakan **React** dengan desain *glassmorphism* dan animasi **Framer Motion**. Komponen utama (`App.js`) menangani seluruh *state management* termasuk input lokasi, pemilihan tipe kulit, dan rendering hasil. Pencarian lokasi menggunakan *debounced autocomplete* (600ms) yang memanggil Nominatim API langsung dari browser.

Semua logika perhitungan batas waktu aman dan sudut elevasi matahari juga dijalankan di sisi klien untuk mengurangi beban server dan memberikan respons instan.

### 2. Backend API Node.js / Express

`server.js` bertindak sebagai **orchestrator** yang mengkoordinasikan seluruh alur data antara frontend, layanan cuaca eksternal, dan sistem Machine Learning berbasis CNN dalam satu request.

Backend memiliki beberapa tanggung jawab utama:

1. Mengambil data cuaca *real-time* dari **OpenWeatherMap** seperti suhu, kelembapan, kecepatan angin, dan persentase tutupan awan.
2. Mengambil indeks UV terkini dari **Open-Meteo**, termasuk mekanisme *fallback estimation* apabila API gagal merespons.
3. Melakukan *reverse geocoding* menggunakan **Nominatim OpenStreetMap** untuk mengubah koordinat menjadi nama lokasi yang lebih mudah dipahami pengguna.
4. Mengirim seluruh fitur cuaca dan parameter pengguna ke **Backend ML (Flask)** melalui endpoint `POST /predict`.
5. Backend ML kemudian memproses data menggunakan model **Convolutional Neural Network (CNN)** yang telah dilatih untuk melakukan analisis tingkat risiko paparan UV dan estimasi waktu aman paparan matahari berdasarkan tipe kulit dari foto pengguna.

Hasil inferensi dari model CNN digabungkan dengan data cuaca dan informasi lokasi menjadi satu *aggregated response* yang kemudian dikirim kembali ke frontend. Backend juga menangani konversi timezone otomatis seperti WIB, WITA, WIT, maupun waktu lokal berdasarkan koordinat pengguna.

### 3. Backend ML Python / Flask

Layanan Machine Learning berjalan sebagai **microservice independen** berbasis Python dan Flask yang bertugas melakukan inferensi prediksi risiko paparan sinar UV. Arsitektur terpisah ini memungkinkan proses AI berjalan secara modular dan lebih mudah dikembangkan maupun di-*deploy* secara mandiri.

Saat aplikasi pertama kali dijalankan atau di-*deploy*, model terlatih (`model_synar.pkl`). Model tersebut merupakan hasil pelatihan berbasis **Convolutional Neural Network (CNN)** dan Dataset pelatihan paramater cuaca yang digunakan untuk menganalisis pola hubungan antara parameter cuaca dan tingkat risiko paparan UV.

Backend ML menerima beberapa fitur lingkungan seperti:

- `temp` (suhu)
- `humidity` (kelembapan)
- `wind` (kecepatan angin)
- `cloud` (persentase tutupan awan)
- indeks UV
- tipe kulit Fitzpatrick pengguna

Data tersebut diproses melalui endpoint `POST /predict` untuk menghasilkan:

1. Prediksi tingkat risiko paparan UV
2. Estimasi *safe time*
3. Kategori risiko (*aman*, *sedang*, *berbahaya*, dan seterusnya)

Selain inferensi model CNN, sistem juga menghitung estimasi waktu aman paparan matahari menggunakan pendekatan **Minimal Erythemal Dose (MED)** yang disesuaikan dengan tipe kulit Fitzpatrick serta intensitas indeks UV saat itu. Kombinasi pendekatan AI dan perhitungan medis ini memungkinkan rekomendasi yang lebih personal dan adaptif terhadap kondisi lingkungan pengguna secara *real-time*.

---

## Tech Stack

| Layer | Teknologi | Rationale |
|---|---|---|
| Frontend | React (Create React App) | Ekosistem mature, component-based, dan mendukung pengembangan SPA secara modular |
| Styling | Tailwind CSS | Utility-first CSS framework untuk membangun UI responsif dengan cepat |
| Animasi | Framer Motion | Library animasi deklaratif untuk React dengan transisi yang smooth |
| Backend API | Express.js (Node.js) | Framework backend minimalis dan cepat untuk API orchestration |
| HTTP Client | Axios | Mendukung request asynchronous, interceptor, dan timeout handling |
| Backend ML | Flask (Python) | Micro-framework ringan yang ideal untuk serving model Machine Learning |
| Deep Learning | Convolutional Neural Network (CNN) | Digunakan untuk melakukan analisis pola dan inferensi risiko paparan UV |
| ML Library | Scikit-Learn | Digunakan untuk preprocessing, pipeline, dan integrasi model Machine Learning |
| Model Storage | Google Drive + gdown | Penyimpanan model `.pkl` dengan mekanisme auto-download saat deployment |
| Deployment | Railway | Platform deployment cloud yang mendukung layanan Node.js dan Python secara terintegrasi |
| Geocoding | Nominatim (OpenStreetMap) | Layanan geocoding open-source untuk pencarian lokasi dan reverse geocoding global |
| Weather API | OpenWeatherMap | Penyedia data cuaca real-time seperti suhu, kelembapan, dan kecepatan angin |
| UV API | Open-Meteo | Penyedia data indeks UV real-time dengan akses gratis dan ringan |

---

## Keputusan Desain

### Mengapa perhitungan elevasi matahari di frontend?

Perhitungan sudut elevasi matahari bersifat deterministik (hanya butuh latitude, longitude, dan waktu UTC). Menjalankannya di sisi klien menghilangkan satu *round-trip* ke server dan memberikan respons instan tanpa menambah beban backend.

### Mengapa Open-Meteo untuk UV dan bukan OpenWeatherMap?

OpenWeatherMap menghentikan endpoint UV Index gratis sejak 2023. Open-Meteo menyediakan data UV *real-time* tanpa API key dan tanpa batas *rate limit* yang ketat — ideal untuk aplikasi publik. Sebagai *fallback*, sistem mengestimasi UV dari suhu dan tutupan awan jika Open-Meteo tidak tersedia.

### Mengapa model di-host di Google Drive?

File model `.pkl` berukuran cukup besar untuk di-commit ke Git. Menyimpannya di Google Drive dan mengunduhnya secara otomatis saat *cold start* (`gdown`) menjaga repository tetap ringan tanpa memerlukan infrastruktur penyimpanan tambahan.

---

## Machine Learning

### Dataset

| Aspek | Detail |
|---|---|
| **Sumber** | NASA POWER (Prediction Of Worldwide Energy Resources) |
| **Lokasi Referensi** | Beberapa spot pantai yang menjadi lokasi favorit berjemur di indonesia |
| **Rentang Data** | 1 Januari 2020 — 31 Desember 2025 (hourly) |
| **Preprocessing** | Google Colab Notebook |

### Input Features

| Fitur | Satuan | Deskripsi |
|---|---|---|
| `temp` | °C | Suhu udara |
| `humidity` | % | Kelembapan relatif |
| `wind` | m/s | Kecepatan angin |
| `cloud` | 0–1 | Fraksi tutupan awan |

### Klasifikasi Risiko UV

| Indeks UV | Level Risiko | Warna |
|---|---|---|
| 0 – 2 | 🟢 **Aman** | Hijau |
| 3 – 5 | 🟡 **Sedang** | Kuning |
| 6 – 7 | 🟠 **Berbahaya** | Oranye |
| 8+ | 🔴 **Sangat Berbahaya** | Merah |

### Perhitungan Batas Waktu Aman

Aplikasi menggunakan **Minimal Erythemal Dose (MED)** — dosis radiasi minimum yang menyebabkan kemerahan kulit — yang disesuaikan berdasarkan tipe kulit Fitzpatrick:

| Tipe Kulit | Label | MED (J/m²) | Deskripsi |
|---|---|---|---|
| I | Sangat terang | 200 | Selalu terbakar |
| II | Terang | 250 | Biasanya terbakar |
| III | Kuning langsat | 300 | Kadang terbakar |
| IV | Sawo matang | 450 | Jarang terbakar |
| V | Cokelat gelap | 600 | Sangat jarang terbakar |
| VI | Sangat gelap | 1000 | Tidak pernah terbakar |

**Formula dasar (Backend ML):**
```
Safe Time (menit) = MED / (UV Index × 1.5)
```

**Koreksi tambahan (Frontend):** Batas waktu aman juga dikoreksi dengan dua faktor penalti:
- **Penalti UV Absolut** — UV > 7 mendapat faktor pengali 1.2×
- **Penalti Elevasi Matahari** — Sudut > 65° (tegak lurus) mendapat pengali 1.35×, sedangkan sudut < 30° mendapat pengali 0.8× karena radiasi lebih miring

---

## API Documentation

### `POST /synar` — Main Endpoint

Endpoint utama pada backend Node.js yang mengorkestrasikan seluruh alur data.

**Request Body:**
```json
{
  "lat": -8.72,
  "lon": 115.17,
  "skin_type": 3
}
```

| Parameter | Tipe | Wajib | Deskripsi |
|---|---|---|---|
| `lat` | `number` | ✅ | Latitude lokasi (-90 s/d 90) |
| `lon` | `number` | ✅ | Longitude lokasi (-180 s/d 180) |
| `skin_type` | `number` | ✅ | Tipe kulit Fitzpatrick (1–6) |

**Response (200 OK):**
```json
{
  "source": "OPENWEATHER + OPENMETEO",
  "location": "Sanur",
  "realtime": "2026-05-08T12:00:00.000Z",
  "weather": {
    "temp": 30.5,
    "humidity": 75,
    "wind": 3.2,
    "cloud": 0.4
  },
  "uv": {
    "value": 7,
    "source": "open-meteo",
    "time_wib": "08/05/2026, 19.00",
    "time_local": "08/05/2026, 19.00",
    "is_wib": true,
    "note": "update ±10 menit"
  },
  "result": {
    "risk": "Berbahaya",
    "safe_time": 28.57,
    "uv": 7,
    "model_output": "..."
  }
}
```

### `POST /predict` — ML Inference

Endpoint langsung ke layanan Machine Learning (Python/Flask).

**Request Body:**
```json
{
  "temp": 30,
  "humidity": 70,
  "wind": 2,
  "cloud": 0.5,
  "skin_type": 3,
  "uv": 5
}
```

**Response:**
```json
{
  "risk": "Sedang",
  "safe_time": 40.0,
  "uv": 5,
  "model_output": "..."
}
```

---

## Struktur Proyek

```
Menyusul
```

---

## Panduan Instalasi & Setup

**Langkah-langkah:**

1.  **Clone repositori ini:**
    ```bash
    git clone https://github.com/<username>/synar.git
    cd synar
    ```

2.  **Setup Backend ML (Python):**
    ```bash
    cd backend-ml

    # Buat virtual environment
    python -m venv venv

    # Aktifkan (Windows)
    venv\Scripts\activate

    # Aktifkan (Linux/Mac)
    source venv/bin/activate

    # Install dependencies
    pip install -r requirements.txt

    cd ..
    ```
    > *Catatan: Model `model_synar.pkl` akan diunduh otomatis dari Google Drive saat pertama kali server dijalankan.*

3.  **Setup Backend Node.js:**
    ```bash
    cd backend

    # Install dependencies
    npm install

    cd ..
    ```

4.  **Setup Frontend:**
    ```bash
    cd frontend

    # Install dependencies
    npm install

    cd ..
    ```

---

## Menjalankan Aplikasi

Buka **tiga terminal terpisah** untuk menjalankan ketiga service secara bersamaan:

1.  **Terminal 1 — Backend ML (Python):**
    ```bash
    cd backend-ml
    python app.py
    ```
    *Server ML berjalan di `http://localhost:5000`*

2.  **Terminal 2 — Backend Node.js:**
    ```bash
    cd backend
    npm start
    ```
    *Server API berjalan di `http://localhost:3001`*

3.  **Terminal 3 — Frontend React:**
    ```bash
    cd frontend
    npm start
    ```
    *Aplikasi terbuka di `http://localhost:3000`*

> ⚠️ **Penting:** Pastikan Backend ML sudah berjalan *sebelum* Backend Node.js, karena Node.js akan mem-proxy request ke endpoint ML.

---

## Deployment

Aplikasi telah di-deploy ke production menggunakan **Railway**:

| Service | Platform | URL |
|---|---|---|
| Backend API (Node.js) | Railway | *(sesuaikan)* |
| Backend ML (Python) | Railway | *(sesuaikan)* |
| Frontend (React) | Netlify | *(sesuaikan)* |

> *Catatan: Pada free tier Railway, service mungkin mengalami cold start (delay 10–30 detik pada request pertama setelah idle).*

---

## Tim Pengembang

| Nama | Universitas | Peran |
|:-----|:------------|:------|
| Siapa ini nama PM nya | *(Universitas)* | AI Engineer |
| *Syahrul Bassam Yusuf* | *Universitas Muhammadiyah Prof. Dr. Hamka* | AI Engineer |
| *Ekananda Kinanthi Rahayu* | *Universitas Trunojoyo Madura* | Data Science |
| *Satriyo Akbar Maulana* | *Universitas Mercu Buana* | Data Science |
| *Nadia Putri Fortunella* | *Politeknik Negeri Semarang* | FrontEnd Developer |
| *Dicky Zibran* | *Universitas Wijaya Putra* | BackEnd Developer |


---

## Lisensi

Proyek ini dilisensikan di bawah [Lisensi MIT](./LICENSE).

Copyright © 2026 SYNAR Team
---

<div align="center">
  <sub>Dibuat dengan ❤️ oleh Tim SYNAR  Capstone Project 2026 by DBS Foundation</sub>
</div>
