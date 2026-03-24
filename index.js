const functions = require('firebase-functions');
console.log("BACKEND: Firebase Functions Initializing...");

// Import Handlers
// (These will be uncommented as we build them)
const authHandler = require('./handlers/authHandler');
const eventHandler = require('./handlers/eventHandler');
const attendanceHandler = require('./handlers/attendanceHandler');
const sadhanaHandler = require('./handlers/sadhanaHandler');
const accommodationHandler = require('./handlers/accommodationHandler');
const paymentHandler = require('./handlers/paymentHandler');
const sevaHandler = require('./handlers/sevaHandler');
const cors = require('cors')({ origin: true });

// Helper to wrap functions with CORS support for Cloud Run/Fetch compatibility
const wrapWithCors = (handler, type = 'call') => {
  if (type === 'call') {
    return functions.https.onCall(async (data, context) => {
      // onCall handles CORS automatically in standard Firebase, 
      // but for Cloud Run/Manual Fetch we ensure it works.
      return handler(data, context);
    });
  }
  return functions.https.onRequest((req, res) => {
    cors(req, res, () => handler(req, res));
  });
};

// --- AUTHENTICATION ---
exports.onUserCreate = functions.auth.user().onCreate(authHandler.onUserCreate);

// --- EVENTS ---
exports.createEvent = functions.https.onCall(eventHandler.createEvent);

// --- ATTENDANCE ---
exports.verifyAttendance = functions.https.onCall(attendanceHandler.verifyAttendance);

// --- SADHANA ---
exports.submitSadhana = functions.https.onCall(sadhanaHandler.submitSadhana);
exports.getSadhanaMe = functions.https.onCall(sadhanaHandler.getSadhanaMe);
exports.getSadhanaAdmin = functions.https.onCall(sadhanaHandler.getSadhanaAdmin);

// --- ACCOMMODATION ---
exports.updateAccommodationStatus = functions.https.onCall(accommodationHandler.updateAccommodationStatus);

// --- SEVAS ---
exports.createSeva = functions.https.onCall(sevaHandler.createSeva);
exports.joinSeva = functions.https.onCall(sevaHandler.joinSeva);
exports.cancelSeva = functions.https.onCall(sevaHandler.cancelSeva);
exports.getSevas = functions.https.onCall(sevaHandler.getSevas);
exports.getMySevas = functions.https.onCall(sevaHandler.getMySevas);
exports.getSevaParticipants = functions.https.onCall(sevaHandler.getSevaParticipants);
exports.markSevaAttendance = functions.https.onCall(sevaHandler.markAttendance);

// --- PAYMENTS ---
exports.createOrder = functions.https.onCall(paymentHandler.createOrder);
exports.razorpayWebhook = functions.https.onRequest(paymentHandler.razorpayWebhook);

// --- TEST ---
exports.ping = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    res.json({ result: { success: true, message: 'pong' } });
  });
});
