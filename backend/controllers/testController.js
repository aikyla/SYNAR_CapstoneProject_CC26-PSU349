const { sendSuccess } = require("../utils/responseHelper");
const asyncHandler = require("../utils/asyncHandler");
const db = require("../config/firebase");

/**
 * GET /api/test
 * Simple endpoint to verify the server is responding.
 */
exports.getTest = (req, res) => {
  sendSuccess(res, { data: { message: "Test endpoint is working" } });
};

/**
 * GET /api/test/protected
 * Protected endpoint that requires a valid JWT token.
 * Returns the decoded user info from the token.
 */
exports.getProtected = (req, res) => {
  sendSuccess(res, {
    data: { user: req.user },
  });
};

/**
 * GET /api/test/db
 * Writes a test document to Firestore to verify database connectivity.
 */
exports.testDatabase = asyncHandler(async (req, res) => {
  const doc = await db.collection("test").add({
    message: "Firebase connected",
    timestamp: new Date(),
  });

  sendSuccess(res, {
    data: { documentId: doc.id },
  });
});