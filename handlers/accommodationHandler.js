const { db, admin } = require('../config/firebase');
const { validateAdminOrHead } = require('../middlewares/auth');
const { sendWhatsAppMessage } = require('../services/notificationService');

exports.updateAccommodationStatus = async (data, context) => {
  const user = await validateAdminOrHead(context);
  
  const { reqId, status } = data; // status: 'approved' | 'rejected' | 'recommended'

  // folks_head can only 'recommend', main admins hold the keys to approve/reject
  if (user.role === 'folks_head' && status !== 'recommended') {
     throw new Error('Folks Heads can only recommend accommodation requests.');
  }

  if (!reqId || !['approved', 'rejected', 'recommended'].includes(status)) {
    throw new Error('Invalid or missing parameters');
  }

  const reqRef = db.collection("accommodation").doc(reqId);
  const reqDoc = await reqRef.get();
  
  if (!reqDoc.exists) {
    throw new Error('Accommodation request does not exist');
  }

  // Double check the request belongs to people in the folks head group
  const targetUserDoc = await db.collection("users").doc(reqDoc.data().userId).get();
  if (user.role === 'folks_head' && targetUserDoc.data().assignedGroup !== user.uid) {
     throw new Error('Unauthorized to recommend accommodations outside your designated assigned group.');
  }

  await reqRef.update({
    status,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });

  // Notify User dynamically via Whatsapp Service
  const userId = reqDoc.data().userId;
  if(userId) {
     const userDoc = await db.collection("users").doc(userId).get();
     if(userDoc.exists && userDoc.data().phone) {
       await sendWhatsAppMessage(userDoc.data().phone, `Accommodation Status Updated: ${status.toUpperCase()}`);
     }
  }

  return { success: true };
};
