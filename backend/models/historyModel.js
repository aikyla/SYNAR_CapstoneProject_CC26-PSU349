const { db } = require("../config/firebase");

/**
 * Model untuk koleksi "history" di Firestore.
 * Menyediakan fungsi CRUD untuk data riwayat prediksi pengguna.
 */

const COLLECTION_NAME = "history";

/**
 * Simpan data history baru ke Firestore.
 * @param {object} data - Data history yang akan disimpan
 * @returns {Promise<object>} - Object berisi historyId dan data yang disimpan
 */
const saveHistory = async (data) => {
  const historyData = {
    ...data,
    createdAt: new Date().toISOString(),
  };

  const docRef = await db.collection(COLLECTION_NAME).add(historyData);

  return {
    historyId: docRef.id,
    ...historyData,
  };
};

/**
 * Ambil semua history berdasarkan userId.
 * Hasil diurutkan dari yang terbaru.
 * @param {string} userId - ID pengguna
 * @returns {Promise<Array>} - Array of history objects
 */
const getHistoryByUser = async (userId) => {
  const snapshot = await db
    .collection(COLLECTION_NAME)
    .where("userId", "==", userId)
    .orderBy("createdAt", "desc")
    .get();

  return snapshot.docs.map((doc) => ({
    historyId: doc.id,
    ...doc.data(),
  }));
};

module.exports = { saveHistory, getHistoryByUser };
