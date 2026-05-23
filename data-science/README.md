# SYNAR Dashboard

Paparan sinar ultraviolet (UV) yang berlebihan saat berjemur di pantai dapat menyebabkan berbagai masalah kesehatan seperti kulit terbakar (sunburn), penuaan dini, hingga meningkatkan risiko kanker kulit. Namun, banyak wisatawan tidak menyadari bahaya ini karena kurangnya informasi real-time tentang tingkat UV dan waktu aman berjemur.

## Fitur filter di sidebar

- 📍 Pilih Lokasi (Bali, Lombok, Raja Ampat) - bisa multi pilih
- 📊 Rentang UV Index (slider 0-20)
- 📅 Informasi dataset (total data, periode, dll)

## Struktur Folder

CAPSTONE/
│
├── 📂 dashboard/ # Dashboard Streamlit
│ ├── dashboard.py # Main dashboard app
│ ├── SYNAR.ipynb # EDA & Visualisasi notebook
│ ├── ab_testing.png # Hasil A/B testing
│ ├── validasi_leakage.png # Validasi data leakage (jika ada)
│ ├── clean_data.csv # Data setelah cleaning
│ ├── dataset_features.csv # Data final + feature engineering ⭐
│ ├── raw_data_gabungan.csv # Data mentah gabungan 3 lokasi
│ ├── train.csv # 80% data training
│ ├── val.csv # 10% data validation
│ ├── test.csv # 10% data testing
│ ├── data_dictionary.csv # Penjelasan setiap kolom
│ └── feature_spec.md # Spesifikasi fitur untuk ML
│
├── 📂 data/ # Data mentah dari NASA POWER
│ ├── Pantai Sanur - Bali.csv # Data Sanur (Bali)
│ ├── Pantai Senggigi - Lombok.csv # Data Senggigi (Lombok)
│ └── Waisai - Raja Ampat.csv # Data Waisai (Raja Ampat)
│
├── README.md # Dokumentasi proyek
└── requirements.txt # Dependencies

## Setup Environment

Install semua library yang dibutuhkan dengan perintah berikut:

pip install -r requirements.txt

## Menjalankan Dashboard

Masuk ke folder dashboard:

cd dashboard

Jalankan dashboard dengan perintah berikut:

streamlit run dashboard.py

Jika terjadi error pada Windows / Python 3.14, gunakan:

py -m streamlit run dashboard.py

## Requirements

Gunakan versi library berikut agar tidak terjadi error:

matplotlib==3.10.9
numpy==2.4.4
pandas==3.0.2
seaborn==0.13.2
streamlit==1.56.0

## Catatan

- Pastikan file `dataset_features.csv` berada dalam folder `dashboard`
- Pastikan semua library sudah terinstall
- Gunakan command `streamlit run dashboard.py` sesuai instruksi