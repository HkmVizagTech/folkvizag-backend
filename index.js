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
exports.ping = functions.https.onCall(() => ({ success: true, message: 'pong' }));
