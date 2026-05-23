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
    name: data.name || data.email.split("@")[0],
    photoUrl: data.photoUrl || null,
    skinType: data.skinType || 3,
    createdAt: new Date().toISOString(),
  };

  const docRef = await db.collection(COLLECTION_NAME).add(userData);

  return {
    userId: docRef.id,
    email: userData.email,
    name: userData.name,
    photoUrl: userData.photoUrl,
    skinType: userData.skinType,
  };
};

const findById = async (userId) => {
  const doc = await db.collection(COLLECTION_NAME).doc(userId).get();

  if (!doc.exists) return null;

  const data = doc.data();
  delete data.password;

  return { userId: doc.id, ...data };
};

const updateUser = async (userId, updates) => {
  const allowedUpdates = {};

  if (updates.name !== undefined) allowedUpdates.name = updates.name;
  if (updates.photoUrl !== undefined) allowedUpdates.photoUrl = updates.photoUrl;
  if (updates.skinType !== undefined) allowedUpdates.skinType = updates.skinType;

  allowedUpdates.updatedAt = new Date().toISOString();

  await db.collection(COLLECTION_NAME).doc(userId).update(allowedUpdates);

  return findById(userId);
};

const savePasswordResetToken = async ({ userId, tokenHash, expiresAt }) => {
  await db.collection(COLLECTION_NAME).doc(userId).update({
    resetPasswordTokenHash: tokenHash,
    resetPasswordExpiresAt: expiresAt,
    updatedAt: new Date().toISOString(),
  });
};

const findByPasswordResetTokenHash = async (tokenHash) => {
  const snapshot = await db
    .collection(COLLECTION_NAME)
    .where("resetPasswordTokenHash", "==", tokenHash)
    .limit(1)
    .get();

  if (snapshot.empty) return null;

  const doc = snapshot.docs[0];
  return { userId: doc.id, ...doc.data() };
};

const updatePassword = async (userId, hashedPassword) => {
  await db.collection(COLLECTION_NAME).doc(userId).update({
    password: hashedPassword,
    resetPasswordTokenHash: null,
    resetPasswordExpiresAt: null,
    updatedAt: new Date().toISOString(),
  });
};

const deleteUserById = async (userId) => {
  const docRef = db.collection(COLLECTION_NAME).doc(userId);
  const doc = await docRef.get();

  if (!doc.exists) {
    return { deleted: false, reason: "not-found" };
  }

  await docRef.delete();
  return { deleted: true, userId };
};

module.exports = {
  findByEmail,
  createUser,
  findById,
  updateUser,
  savePasswordResetToken,
  findByPasswordResetTokenHash,
  updatePassword,
  deleteUserById,
};
