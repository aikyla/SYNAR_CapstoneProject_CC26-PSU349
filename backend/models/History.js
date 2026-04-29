const db = require("../config/firebase");

const historyCollection = db.collection("history");

module.exports = historyCollection;
