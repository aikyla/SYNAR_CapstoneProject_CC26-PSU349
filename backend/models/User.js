const db = require("../config/firebase");

const usersCollection = db.collection("users");

module.exports = usersCollection;