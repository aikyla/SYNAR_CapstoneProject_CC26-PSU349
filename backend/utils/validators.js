/**
 * Input validation utilities for the API.
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

/**
 * Validates that a string is a properly formatted email address.
 * @param {string} email
 * @returns {boolean}
 */
const isValidEmail = (email) => {
  return typeof email === "string" && EMAIL_REGEX.test(email.trim());
};

/**
 * Validates that a password meets minimum requirements.
 * @param {string} password
 * @returns {boolean}
 */
const isValidPassword = (password) => {
  return typeof password === "string" && password.trim().length >= MIN_PASSWORD_LENGTH;
};

module.exports = { isValidEmail, isValidPassword, MIN_PASSWORD_LENGTH };
