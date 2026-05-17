const admin = require("firebase-admin");

const initializeFirebase = () => {
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

  console.log("Firebase Admin SDK berhasil diinisialisasi");

  return admin.firestore();
};

const db = initializeFirebase();

module.exports = { db, admin };
