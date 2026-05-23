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
    .get();

  return snapshot.docs
    .map((doc) => {
      const data = doc.data();
      let createdAtStr = data.createdAt;
      
      // Jika createdAt adalah Firestore Timestamp, konversi ke ISO string
      if (createdAtStr && typeof createdAtStr.toDate === "function") {
        createdAtStr = createdAtStr.toDate().toISOString();
      } else if (createdAtStr && typeof createdAtStr._seconds === "number") {
        createdAtStr = new Date(createdAtStr._seconds * 1000).toISOString();
      }
      
      return {
        historyId: doc.id,
        ...data,
        createdAt: createdAtStr || new Date(0).toISOString(),
      };
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

const deleteHistoryById = async (historyId, userId) => {
  const docRef = db.collection(COLLECTION_NAME).doc(historyId);
  const doc = await docRef.get();

  if (!doc.exists) {
    return { deleted: false, reason: "not-found" };
  }

  const data = doc.data();
  if (data.userId !== userId) {
    return { deleted: false, reason: "forbidden" };
  }

  await docRef.delete();
  return { deleted: true, historyId };
};

const deleteHistoryByUserId = async (userId) => {
  const snapshot = await db
    .collection(COLLECTION_NAME)
    .where("userId", "==", userId)
    .get();

  if (snapshot.empty) {
    return { deletedCount: 0 };
  }

  const batch = db.batch();
  snapshot.docs.forEach((doc) => batch.delete(doc.ref));
  await batch.commit();

  return { deletedCount: snapshot.size };
};

module.exports = {
  saveHistory,
  getHistoryByUser,
  deleteHistoryById,
  deleteHistoryByUserId,
};
