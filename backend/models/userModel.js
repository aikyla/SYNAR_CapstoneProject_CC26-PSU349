const { db } = require("../config/firebase");

/**
 * Model untuk koleksi "users" di Firestore.
 * Menyediakan fungsi CRUD untuk data pengguna.
 */

const COLLECTION_NAME = "users";

/**
 * Cari user berdasarkan email.
 * @param {string} email - Email pengguna (sudah di-lowercase dan trim)
 * @returns {Promise<object|null>} - User object atau null jika tidak ditemukan
 */
const findByEmail = async (email) => {
  const snapshot = await db
    .collection(COLLECTION_NAME)
    .where("email", "==", email)
    .get();

  if (snapshot.empty) return null;

  const doc = snapshot.docs[0];
  return { userId: doc.id, ...doc.data() };
};

/**
 * Buat user baru.
 * @param {object} data - Data user { email, password }
 * @returns {Promise<object>} - User object yang baru dibuat
 */
const createUser = async (data) => {
  const userData = {
    ...data,
    createdAt: new Date().toISOString(),
  };

  const docRef = await db.collection(COLLECTION_NAME).add(userData);

  return {
    userId: docRef.id,
    email: userData.email,
  };
};

module.exports = { findByEmail, createUser };
