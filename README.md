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
9.  [API Documentation & Integrasi](#api-documentation--integrasi)
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

### Tampilan Aplikasi Web (React SPA)
<img width="1906" height="1078" alt="tampilan sistem synar" src="https://github.com/user-attachments/assets/cdb99d92-0afd-4d6e-b056-49f5ea774241" />

---

## Ringkasan Non-Teknis

> Untuk pengguna umum, advisor, dan penguji capstone.

Paparan radiasi UV berlebihan merupakan salah satu penyebab utama kerusakan kulit, penuaan dini, hingga risiko kanker kulit. Sayangnya, sebagian besar masyarakat tidak menyadari seberapa berbahaya sinar UV di lokasi mereka pada waktu tertentu apalagi memahami berapa lama aman berada di luar ruangan.

**SYNAR** hadir sebagai solusi digital untuk masalah tersebut:

-   **Untuk pengguna umum:** Cukup buka situs website, izinkan akses GPS (atau ketik nama lokasi), pilih tipe kulit (atau foto untuk scan wajah), lalu tekan satu tombol. Dalam hitungan detik, SYNAR menampilkan indeks UV saat ini dan parameter lainnya yang mempengaruhi, tingkat risiko, batas waktu aman di luar ruangan, kondisi cuaca lengkap, hingga tips perlindungan semua dalam bahasa Indonesia yang mudah dipahami.

-   **Untuk wisatawan dan pekerja lapangan:** Aplikasi mendukung pencarian lokasi di seluruh dunia dengan deteksi timezone otomatis (WIB/WITA/WIT/UTC), sehingga pengguna di manapun dapat mengetahui risiko UV di lokasi tujuan mereka.

-   **Dari sisi teknologi:** Seluruh prediksi risiko dihasilkan oleh model Machine Learning yang dilatih menggunakan dataset cuaca historis dari NASA POWER dan Model CNN yang juga telah dilatih. Sistem backend bertindak sebagai *orchestrator* yang menggabungkan data dari tiga API eksternal sebelum meneruskannya ke layanan ML untuk inferensi.

### Infografis Manfaat & Risiko Sinar Matahari
<img width="1918" height="1078" alt="infografis sinar matahari sumber manfaat atau ancaman" src="https://github.com/user-attachments/assets/7ca84182-baaf-4a98-ab2f-6eff1e8534a2" />

---

## Fitur Utama

| Fitur | Deskripsi |
|---|---|
|  **Deteksi Lokasi Otomatis** | Mendukung GPS browser dan pencarian lokasi manual dengan autocomplete global via Nominatim OpenStreetMap. |
|  **Indeks UV Real-Time** | Data UV terkini dari Open Meteo API dengan mekanisme *fallback* estimasi otomatis jika API tidak tersedia. |
|  **Prediksi Risiko ML** | Model Machine Learning mengklasifikasikan tingkat risiko berdasarkan kombinasi suhu, kelembapan, angin, dan tutupan awan. |
|  **Skala Fitzpatrick** | Penyesuaian rekomendasi berdasarkan 6 tipe kulit Fitzpatrick dari sangat terang hingga sangat gelap. |
|  **Batas Waktu Aman** | Perhitungan waktu paparan aman yang mempertimbangkan indeks UV, tipe kulit, dan sudut elevasi matahari secara astronomis. |
|  **Info Cuaca Lengkap** | Menampilkan suhu, kelembapan, kecepatan angin, dan persentase tutupan awan dari OpenWeatherMap. |
|  **Posisi Matahari** | Kalkulasi sudut elevasi matahari secara astronomis untuk koreksi tingkat paparan UV yang lebih akurat. |
|  **Multi-Timezone** | Deteksi otomatis dan tampilan waktu WIB, WITA, WIT, atau UTC berdasarkan koordinat lokasi. |
|  **Responsive Design** | Antarmuka glassmorphism dengan animasi Framer Motion, optimal di mobile dan desktop. |

---

## Arsitektur Sistem

<img width="1918" height="1078" alt="arsitektur sistem synar" src="https://github.com/user-attachments/assets/9476cbbd-093e-4eda-95a2-fedaf085d29f" />

---

## Penjelasan Arsitektur

Aplikasi menggunakan arsitektur **3-Tier Microservice** di mana setiap *layer* bertanggung jawab atas satu domain fungsional:

### 1. Frontend React SPA

Antarmuka pengguna dibangun menggunakan **React** dengan desain *glassmorphism* dan animasi **Framer Motion**. Komponen utama (`App.js`) menangani seluruh *state management* termasuk input lokasi, pemilihan tipe kulit, dan rendering hasil. Pencarian lokasi menggunakan *debounced autocomplete* (600ms) yang memanggil Nominatim API langsung dari browser.

Semua logika perhitungan batas waktu aman dan sudut elevasi matahari juga dijalankan di sisi klien untuk mengurangi beban server dan memberikan respons instan.

### 2. Backend API Node.js / Express

`server.js` bertindak sebagai **orchestrator** yang mengkoordinasikan seluruh alur data antara frontend, layanan cuaca eksternal, dan sistem Machine Learning CNN dan Regression dalam satu request.

Backend memiliki beberapa tanggung jawab utama:

1. Mengambil data cuaca *real-time* dari **OpenWeatherMap** seperti suhu, kelembapan, kecepatan angin, dan persentase tutupan awan.
2. Mengambil indeks UV terkini dari **Open-Meteo**, termasuk mekanisme *fallback estimation* apabila API gagal merespons.
3. Melakukan *reverse geocoding* menggunakan **Nominatim OpenStreetMap** untuk mengubah koordinat menjadi nama lokasi yang lebih mudah dipahami pengguna.
4. Mengirim seluruh fitur cuaca dan parameter pengguna ke **Backend ML (Flask)** melalui endpoint `POST /predict`.
5. Backend ML kemudian memproses data menggunakan model **Convolutional Neural Network (CNN)** yang telah dilatih untuk melakukan analisis tingkat risiko paparan UV dan estimasi waktu aman paparan matahari berdasarkan tipe kulit dari foto pengguna.

Hasil inferensi dari model CNN digabungkan dengan data cuaca dan informasi lokasi menjadi satu *aggregated response* yang kemudian dikirim kembali ke frontend. Backend juga menangani konversi timezone otomatis seperti WIB, WITA, WIT, maupun waktu lokal berdasarkan koordinat pengguna.

### 3. Backend ML Python / FastAPI (CNN & Regression Services)

Layanan Machine Learning berjalan sebagai **dua microservice independen** berbasis Python dan FastAPI yang bertugas melakukan deteksi kulit wajah (CNN) serta kalkulasi koreksi cuaca dan waktu luar ruangan terbaik (Regresi). Desain modular ini memisahkan beban komputasi AI sehingga masing-masing komponen dapat dikembangkan dan diskalakan secara mandiri.

####  AI CNN Fitzpatrick Classification Service (Port 8000)
Layanan ini memproses file foto wajah yang dikirimkan oleh pengguna untuk diklasifikasikan ke dalam 6 tipe kulit Fitzpatrick:
- **Teknologi**: TensorFlow/Keras (`SavedModel`), RetinaFace untuk deteksi wajah, segmentasi kulit wajah, dan ekstraksi fitur warna (LAB, HSV, ITA).
- **Endpoint**: `POST /predict` (Menerima multipart/form-data berupa file gambar wajah).
- **Hasil**: Label tipe kulit (Tipe 1–6) beserta persentase kepercayaan (*confidence score*).

####  AI Weather Regression & Best Time Service (Port 8001)
Layanan ini melakukan inferensi machine learning untuk menghitung durasi paparan sinar matahari yang aman serta merekomendasikan jam aktivitas luar ruangan terbaik:
- **Teknologi**: XGBoost pipelines (`correction_pipeline.pkl` dan `best_time_pipeline.pkl`) yang dilatih menggunakan dataset historis NASA POWER.
- **Endpoint 1 (`POST /predict/correction`)**: Menerima parameter UV index, tipe kulit, suhu, kelembaban, kecepatan angin, jam, dan bulan. Menghitung durasi dasar menggunakan rumus **Minimal Erythemal Dose (MED)** lalu mengoreksinya menggunakan model XGBoost.
- **Endpoint 2 (`POST /predict/best-time`)**: Menerima data prakiraan cuaca per jam. Model menentukan 3 jam terbaik (`best_hours`) dan 3 jam yang harus dihindari (`worst_hours`) untuk beraktivitas luar ruangan.

---

## Tech Stack

| Layer | Teknologi | Rationale |
|---|---|---|
| Frontend | React (Vite) | Build tool modern yang sangat cepat dengan dukungan Hot Module Replacement (HMR) |
| Styling | Tailwind CSS | Utility-first CSS framework untuk membangun UI responsif dengan cepat |
| Animasi | Framer Motion / Motion | Library animasi deklaratif untuk React dengan transisi yang smooth |
| Backend API | Express.js (Node.js) | Framework backend minimalis dan cepat untuk API orchestration & microservice communication |
| Backend ML | FastAPI (Python) | Web framework Python modern yang sangat cepat, asinkron, dan auto-generate OpenAPI/Swagger docs |
| Deep Learning | CNN & RetinaFace | Model deteksi wajah dan segmentasi kulit untuk mengklasifikasi tipe kulit Fitzpatrick (Tipe 1-6) |
| Machine Learning | XGBoost | Pipeline ML regresi untuk mengoreksi batas waktu paparan aman dan menghitung jam terbaik |
| Deployment | Railway | Platform deployment cloud yang mendukung layanan Node.js, Python FastAPI, dan hosting database |
| Geocoding | Nominatim (OpenStreetMap) | Layanan geocoding open-source untuk pencarian lokasi dan reverse geocoding global |
| Weather API | Open-Meteo | Penyedia data indeks UV dan cuaca real-time dengan akses gratis tanpa rate limit ketat |

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

### Dataset & Model Storage

Berikut adalah tautan repositori penyimpanan Model AI dan Dataset yang digunakan dalam proyek SYNAR:

| Kategori | Tautan Google Drive | Deskripsi |
|---|---|---|
|  **Model CNN** | [Google Drive Folder](https://drive.google.com/drive/folders/1QXozFBOqk_VzeyHYz7oK38GLHQB8JIVv?usp=sharing) | File model `SavedModel` TensorFlow untuk klasifikasi tipe kulit Fitzpatrick (Tipe 1-6) |
|  **Dataset Klasifikasi Kulit (Raw)** | [Google Drive Folder](https://drive.google.com/drive/folders/1Iy1MTckI1v8m7nFkt1glISpxICMuEgPU?usp=drive_link) | Dataset gambar wajah asli sebelum dilakukan prapemrosesan |
|  **Dataset Klasifikasi Kulit (Preprocessed)** | [Google Drive Folder](https://drive.google.com/drive/folders/1rlK45iPFX4ULP4l8qamLD79goFBOCI1c?usp=drive_link) | Gambar wajah hasil crop, segmentasi kulit, dan augmentasi untuk training CNN |
|  **Dataset Cuaca (Raw)** | [Google Drive File](https://drive.google.com/file/d/1r-QDBqEwjFVw_WZ52ubPUlL3PWGbCtvo/view?usp=sharing) | Data historis cuaca mentah dari stasiun cuaca dan satelit NASA POWER |
|  **Dataset Cuaca (Preprocessed)** | [Google Drive File](https://drive.google.com/file/d/1ui5qJU1Ez_j-MipnllQnrbysas_yplBH/view?usp=sharing) | Data cuaca hasil rekayasa fitur (sin/cos waktu, interaksi) untuk model XGBoost |

### Detail Data & Pelatihan Model

| Aspek | Detail |
|---|---|
| **Sumber Data Cuaca** | NASA POWER (Prediction Of Worldwide Energy Resources) |
| **Lokasi Referensi** | Beberapa spot pantai yang menjadi lokasi favorit berjemur di Indonesia |
| **Rentang Data** | 1 Januari 2020 — 31 Desember 2025 (hourly) |
| **Alat Preprocessing** | Google Colab Notebook & Python Pandas |

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

## API Documentation & Integrasi

Berikut adalah alur detail komunikasi dan kueri database (BE ➔ DB) dari 8 integrasi sistem di SYNAR beserta diagram alur data (*mindmap*) masing-masing:

### 1. Register (FE ➔ BE ➔ DB)
* **Keterangan:** Mendaftarkan akun pengguna baru.
* **Alur Integrasi:**
  * **FE ➔ BE:** `POST /api/auth/register`
    * *Body:* `{ name, email, password }`
  * **BE ➔ DB:** `db.collection("users").add(userData)`
    * *Payload:* `{ name, email, password: hashedPassword, skinType: 3, photoUrl: null, createdAt: "ISO_TIMESTAMP" }`
  * **BE ➔ FE:** Mengembalikan status `201 Created`
    * *Response:*
      ```json
      {
        "status": "success",
        "data": {
          "token": "jwt_token_string",
          "user": {
            "userId": "id_user_firestore",
            "name": "nama_user",
            "email": "user@example.com",
            "skinType": 3,
            "photoUrl": null
          }
        }
      }
      ```

---

### 2. Login (FE ➔ BE ➔ DB)
* **Keterangan:** Masuk ke aplikasi menggunakan akun terdaftar.
* **Alur Integrasi:**
  * **FE ➔ BE:** `POST /api/auth/login`
    * *Body:* `{ email, password }`
  * **BE ➔ DB:** `db.collection("users").where("email", "==", email).get()`
    * *Tugas:* Mencocokkan email untuk mendapatkan data password terenkripsi dari Firestore.
  * **BE ➔ FE:** Mengembalikan status `200 OK`
    * *Response:*
      ```json
      {
        "status": "success",
        "data": {
          "token": "jwt_token_string",
          "user": {
            "userId": "id_user_firestore",
            "name": "nama_user",
            "email": "user@example.com",
            "skinType": 3,
            "photoUrl": null
          }
        }
      }
      ```

---

### 3. Search & Reverse Geocode (FE ➔ BE ➔ Nominatim API)
* **Keterangan:** Mencari nama lokasi atau mendeteksi alamat berdasarkan koordinat GPS.
* **Alur Integrasi:**
  * **Pencarian Lokasi:**
    * **FE ➔ BE:** `GET /api/weather/geocode/search?q={nama_kota}`
    * **BE ➔ Nominatim:** `GET https://nominatim.openstreetmap.org/search?q={nama_kota}&format=json`
  * **Deteksi GPS (Reverse):**
    * **FE ➔ BE:** `GET /api/weather/geocode/reverse?lat={latitude}&lon={longitude}`
    * **BE ➔ Nominatim:** `GET https://nominatim.openstreetmap.org/reverse?lat={lat}&lon={lon}&format=json`
  * **BE ➔ FE:** Mengembalikan status `200 OK` dengan nama lokasi terformat.
    * *Response:*
      ```json
      {
        "status": "success",
        "data": {
          "displayName": "Kecamatan Sanur, Bali, Indonesia"
        }
      }
      ```

---

### 4. Fetch Weather & UV (FE ➔ BE ➔ Open-Meteo)
* **Keterangan:** Mengambil data cuaca dan indeks UV real-time berdasarkan koordinat.
* **Alur Integrasi:**
  * **FE ➔ BE:** `GET /api/weather/realtime?lat={lat}&lon={lon}`
  * **BE ➔ Open-Meteo:** `GET https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,cloud_cover,uv_index&timezone=auto`
  * **BE ➔ FE:** Mengembalikan status `200 OK` dengan data cuaca terformat.
    * *Response:*
      ```json
      {
        "status": "success",
        "data": {
          "temperature": 30.5,
          "humidity": 75,
          "wind_speed": 3.2,
          "cloud_cover": 40,
          "uv_index": 7,
          "current_time": "2026-06-05T08:00:00Z",
          "timezone": "Asia/Jakarta",
          "timezone_abbreviation": "WIB",
          "utc_offset_seconds": 25200
        }
      }
      ```

---

### 5. Predict with Camera (FE ➔ BE ➔ AI CNN ➔ AI Regresi ➔ DB)
* **Keterangan:** Deteksi wajah via kamera, klasifikasi tipe kulit, dan hitung batas waktu aman.
* **Alur Integrasi:**
  * **FE ➔ BE:** `POST /api/predict`
    * *Body:* `{ image_base64, weather }`
  * **BE ➔ AI CNN (Port 8000):** `POST http://localhost:8000/predict` (Multipart Form-Data)
  * **BE ➔ AI Regresi (Port 8001):** `POST http://localhost:8001/predict/correction`
    * *Body:* `{ uvi, skin_type, t2m, rh2m, ws2m, hr, bulan }`
  * **BE ➔ DB:** `db.collection("history").add(historyData)`
    * *Payload:*
      ```json
      {
        "userId": "id_user_aktif",
        "skin_type": 3,
        "uv_index": 7,
        "temperature": 30.5,
        "humidity": 75,
        "cloud_cover": 40,
        "wind_speed": 3.2,
        "recommended_duration": "28 mins",
        "risk_level": "Berbahaya",
        "recommendation": "Gunakan sunscreen minimal SPF 30 PA++++.",
        "location": "Sanur, Bali",
        "latitude": -8.72,
        "longitude": 115.17,
        "createdAt": "ISO_TIMESTAMP"
      }
      ```
  * **BE ➔ FE:** Mengembalikan status `200 OK`
    * *Response:*
      ```json
      {
        "status": "success",
        "data": {
          "skin_type": 3,
          "uv_index": 7,
          "risk_level": "High",
          "safe_time": "28 mins",
          "duration_minutes": 28.5,
          "note": "Gunakan sunscreen minimal SPF 30 PA++++."
        }
      }
      ```

---

### 6. Predict Manual Mode (FE ➔ BE ➔ AI Regresi)
* **Keterangan:** Menghitung koreksi waktu aman berdasarkan tipe kulit manual dan cuaca.
* **Alur Integrasi:**
  * **FE ➔ BE:** `POST /api/predict/correction`
    * *Body:* `{ skin_type, weather }`
  * **BE ➔ AI Regresi (Port 8001):** `POST http://localhost:8001/predict/correction`
    * *Body:* `{ uvi, skin_type, t2m, rh2m, ws2m, hr, bulan }`
  * **BE ➔ FE:** Mengembalikan status `200 OK`
    * *Response:*
      ```json
      {
        "status": "success",
        "data": {
          "skin_type": 3,
          "uv_index": 5,
          "safe_time": "40 mins",
          "duration_minutes": 40.0,
          "note": "Gunakan sunscreen minimal SPF 30 PA++++."
        }
      }
      ```

---

### 7. Predict Best Outdoor Hours (FE ➔ BE ➔ Open-Meteo ➔ AI Regresi)
* **Keterangan:** Merekomendasikan jam terbaik dan jam yang harus dihindari di luar ruangan.
* **Alur Integrasi:**
  * **FE ➔ BE:** `POST /api/predict/best-time`
    * *Body:* `{ bulan, lat, lon }`
  * **BE ➔ Open-Meteo:** `GET https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m&timezone=auto&forecast_days=1`
  * **BE ➔ AI Regresi (Port 8001):** `POST http://localhost:8001/predict/best-time`
    * *Body:* `{ bulan, t2m_per_jam, rh2m_per_jam, ws2m_per_jam }`
  * **BE ➔ FE:** Mengembalikan status `200 OK`
    * *Response:*
      ```json
      {
        "status": "success",
        "data": {
          "best_hours": ["07:00", "08:00", "16:00"],
          "worst_hours": ["11:00", "12:00", "13:00"]
        }
      }
      ```

---

### 8. User History (FE ➔ BE ➔ DB)
* **Keterangan:** Manajemen riwayat pengecekan pengguna.
* **Alur Integrasi:**
  * **Simpan Riwayat Baru:**
    * **FE ➔ BE:** `POST /api/history`
      * *Body:* `{ skin_type, uv_index, weather, risk_level, recommended_duration, recommendation, location, coords }`
    * **BE ➔ DB:** `db.collection("history").add(historyData)`
    * **BE ➔ FE:** Mengembalikan status `201 Created`
  * **Ambil Semua Riwayat:**
    * **FE ➔ BE:** `GET /api/history/{userId}`
    * **BE ➔ DB:** `db.collection("history").where("userId", "==", userId).get()`
    * **BE ➔ FE:** Mengembalikan status `200 OK`
      * *Response:*
        ```json
        {
          "status": "success",
          "data": [
            {
              "historyId": "id_dokumen_history",
              "userId": "id_user_aktif",
              "skin_type": 3,
              "uv_index": 7,
              "recommended_duration": "28 mins",
              "location": "Sanur, Bali",
              "createdAt": "ISO_TIMESTAMP"
            }
          ]
        }
        ```
  * **Hapus Riwayat:**
    * **FE ➔ BE:** `DELETE /api/history/{historyId}`
    * **BE ➔ DB:** `db.collection("history").doc(historyId).delete()`
    * **BE ➔ FE:** Mengembalikan status `200 OK`
      * *Response:*
        ```json
        {
          "status": "success",
          "data": {
            "deleted": true,
            "historyId": "id_dokumen_history"
          }
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
    git clone https://github.com/aikyla/SYNAR_CapstoneProject_CC26-PSU349.git
    cd SYNAR_CapstoneProject_CC26-PSU349
    ```

2.  **Setup AI Model (Python FastAPI):**
    ```bash
    cd ai-model

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

Buka **empat terminal terpisah** untuk menjalankan seluruh layanan secara lokal bersamaan:

1.  **Terminal 1 — Server AI CNN (Port 8000):**
    ```bash
    cd ai-model/app.py
    # Aktifkan venv lalu jalankan:
    $env:MODEL_BACKEND="savedmodel"
    uvicorn app:app --host 0.0.0.0 --port 8000 --reload
    ```
    *Layanan deteksi wajah/fitur kulit berjalan di `http://localhost:8000`*

2.  **Terminal 2 — Server AI Regresi (Port 8001):**
    ```bash
    cd ai-model/app.py
    # Aktifkan venv lalu jalankan:
    uvicorn app_regression:app --host 0.0.0.0 --port 8001 --reload
    ```
    *Layanan koreksi cuaca dan Best Time berjalan di `http://localhost:8001`*

3.  **Terminal 3 — Backend Node.js (Port 3000):**
    ```bash
    cd backend
    npm run dev
    ```
    *Server backend orkestrator berjalan di `http://localhost:3000/api/health`*

4.  **Terminal 4 — Frontend React (Port 5173):**
    ```bash
    cd frontend
    npm run dev
    ```
    *Aplikasi frontend berjalan di `http://localhost:5173`*

---

### Streamlit Prototype
Anda juga dapat mengakses prototipe dasbor model prediksi berbasis Streamlit melalui tautan berikut:
 **[SYNAR Streamlit App](https://synarcapstoneproject.streamlit.app/)**

<img width="1915" height="852" alt="tampilan streamlit" src="https://github.com/user-attachments/assets/b49cf816-7c55-4ea2-8142-ed57efc57085" />

---

## Tim Pengembang

| Nama | Universitas | Peran |
|:-----|:------------|:------|
| *Aikylla Zahra Permana* | *STIKOM Yos Sudarso Purwokerto* | AI Engineer |
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
  <sub>Dibuat oleh Tim SYNAR - Capstone Project 2026 by DBS Foundation</sub>
</div>
