const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

const isValidEmail = (email) => {
  return typeof email === "string" && EMAIL_REGEX.test(email.trim());
};

const isValidPassword = (password) => {
  return typeof password === "string" && password.trim().length >= MIN_PASSWORD_LENGTH;
};

module.exports = { isValidEmail, isValidPassword, MIN_PASSWORD_LENGTH };
