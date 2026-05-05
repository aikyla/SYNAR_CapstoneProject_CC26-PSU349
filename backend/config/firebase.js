const admin = require("firebase-admin");

/**
 * Inisialisasi Firebase Admin SDK.
 * Kredensial diambil dari environment variable FIREBASE_SERVICE_ACCOUNT
 * yang berisi JSON service account key dalam satu baris.
 */
const initializeFirebase = () => {
  // Cegah inisialisasi ganda
  if (admin.apps.length > 0) {
    return admin.firestore();
  }

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;

  if (!serviceAccountJson) {
    throw new Error(
      "Environment variable FIREBASE_SERVICE_ACCOUNT tidak ditemukan. " +
      "Pastikan file .env sudah dikonfigurasi dengan benar."
    );
  }

  let serviceAccount;
  try {
    serviceAccount = JSON.parse(serviceAccountJson);
  } catch (err) {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT bukan JSON yang valid. " +
      "Pastikan isi .env sudah benar (satu baris JSON)."
    );
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  console.log("🔥 Firebase Admin SDK berhasil diinisialisasi");

  return admin.firestore();
};

// Export fungsi inisialisasi dan getter Firestore
const db = initializeFirebase();

module.exports = { db, admin };