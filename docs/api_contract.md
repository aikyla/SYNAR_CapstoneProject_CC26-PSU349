# 📡 API Contract - SYNAR

## 📌 Deskripsi

Dokumen ini mendefinisikan kontrak API untuk sistem **SYNAR (System for UV & Sun Exposure Analysis and Recommendation)**.
API digunakan untuk komunikasi antara frontend, backend, dan layanan AI dalam memberikan rekomendasi durasi paparan sinar matahari yang aman.

---

---

## 📦 Format Umum

### Request

* Content-Type: `application/json` atau `multipart/form-data`

### Response Success

```json
{
  "status": "success",
  "data": {}
}
```

### Response Error

```json
{
  "status": "error",
  "message": "Error description"
}
```

---

## 🤖 1. Klasifikasi Tipe Kulit (CNN)

### Endpoint

```http
POST /predict/skin-type
```

### Deskripsi

Mengklasifikasikan tipe kulit pengguna berdasarkan gambar wajah menggunakan model CNN (Fitzpatrick Scale).

---

### Request

* Content-Type: `multipart/form-data`

| Field | Type | Required | Description                     |
| ----- | ---- | -------- | ------------------------------- |
| image | file | ✅        | Gambar wajah pengguna (jpg/png) |

---

### Response

```json
{
  "status": "success",
  "data": {
    "skin_type": 3,
    "confidence": 0.92
  }
}
```

---

## ☀️ 2. Prediksi Rekomendasi Paparan UV

### Endpoint

```http
POST /predict/uv-safety
```

### Deskripsi

Menghasilkan rekomendasi durasi berjemur berdasarkan kondisi cuaca dan tipe kulit pengguna.

---

### Request

* Content-Type: `application/json`

```json
{
  "skin_type": 3,
  "uv_index": 8.5,
  "temperature": 30,
  "humidity": 70,
  "cloud_cover": 20,
  "wind_speed": 5
}
```

---

### Field Description

| Field       | Type    | Required | Description                  |
| ----------- | ------- | -------- | ---------------------------- |
| skin_type   | integer | ✅        | Tipe kulit (1–6 Fitzpatrick) |
| uv_index    | float   | ✅        | Indeks UV                    |
| temperature | float   | ✅        | Suhu udara (°C)              |
| humidity    | float   | ✅        | Kelembaban (%)               |
| cloud_cover | float   | ✅        | Tutupan awan (%)             |
| wind_speed  | float   | ✅        | Kecepatan angin (m/s)        |

---

### Response

```json
{
  "status": "success",
  "data": {
    "recommended_duration": "15-20 minutes",
    "risk_level": "High",
    "recommendation": "Gunakan sunscreen dan hindari paparan langsung pada pukul 12.00–14.00"
  }
}
```

---

## 🌍 3. Data Cuaca Real-Time

### Endpoint

```http
GET /weather
```

### Deskripsi

Mengambil data cuaca real-time berdasarkan lokasi pengguna (menggunakan API eksternal, misalnya NASA/Weather API).

---

### Query Parameters

| Parameter | Type  | Required | Description |
| --------- | ----- | -------- | ----------- |
| lat       | float | ✅        | Latitude    |
| lon       | float | ✅        | Longitude   |

---

### Contoh Request

```http
GET /weather?lat=-8.65&lon=115.22
```

---

### Response

```json
{
  "status": "success",
  "data": {
    "uv_index": 7.8,
    "temperature": 29,
    "humidity": 75,
    "cloud_cover": 30,
    "wind_speed": 4
  }
}
```

---

## 🔗 4. Alur Integrasi Sistem

```text
User Input (Image + Location)
        ↓
[Frontend]
        ↓
POST /predict/skin-type → (AI CNN)
        ↓
GET /weather → (API eksternal)
        ↓
POST /predict/uv-safety → (Model ML)
        ↓
[Frontend Display Result]
```

---

## ⚠️ Error Handling

### Contoh Error Response

```json
{
  "status": "error",
  "message": "Invalid input: image file is required"
}
```

### Jenis Error

* 400 → Bad Request (input tidak valid)
* 404 → Endpoint tidak ditemukan
* 500 → Server error

---

## 📌 Catatan Penting

* Semua response menggunakan format JSON
* Format request & response **tidak boleh diubah tanpa diskusi tim**
* Model AI hanya menerima input numerik yang telah divalidasi
* File gambar maksimal 5MB
* Data API eksternal hanya digunakan saat inference (real-time)

---

## 🚀 Versi API

```text
v1.0 (Initial Release - Capstone MVP)
```

---

## 🤝 Maintainer

* Project Manager: Aikylla
* AI Engineer Team
* Data Scientist Team
* Fullstack Developer Team

---

💡 Dokumen ini menjadi acuan utama integrasi antar tim.
Perubahan harus disepakati bersama sebelum diimplementasikan.
