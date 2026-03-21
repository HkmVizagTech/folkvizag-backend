const { db, admin } = require('../config/firebase');
const { validateAuth } = require('../middlewares/auth');
const functions = require('firebase-functions');

exports.submitSadhana = async (data, context) => {
  const uid = await validateAuth(context);
  const { rounds, date } = data; // expected YYYY-MM-DD
  
  if (!rounds || rounds < 0) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid rounds submitted');
  }

  // Prevent backdated entries - require 'today' matching system time roughly
  const todayString = new Date().toISOString().split('T')[0];
  if (date !== todayString) {
    throw new functions.https.HttpsError('invalid-argument', 'Sadhana entries must be recorded for today only.');
  }

  const docId = `${uid}_${date}`;
  const sadhanaRef = db.collection("sadhana").doc(docId);
  const existing = await sadhanaRef.get();

  if (existing.exists) {
    throw new functions.https.HttpsError("already-exists", "Sadhana already submitted for today");
  }

  const statsRef = db.collection("users").doc(uid);
  
  await db.runTransaction(async (t) => {
    const userDoc = await t.get(statsRef);
    const userData = userDoc.data() || {};
    
    // Streaks and Gamification Logic
    let currentStreak = 1;
    let score = rounds * 10;
    
    // Simple yesterday check based on string payload for streak tracking
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = yesterday.toISOString().split('T')[0];
    
    if (userData.lastSadhanaDate === yesterdayString) {
      currentStreak = (userData.streak || 0) + 1;
      score += (currentStreak * 5); // Bonus score
    }

    t.set(sadhanaRef, {
      uid,
      date,
      rounds,
      streak: currentStreak,
      score,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
    
    t.update(statsRef, {
      streak: currentStreak,
      score: (userData.score || 0) + score,
      lastSadhanaDate: date
    });
  });

  return { success: true, message: "Sadhana recorded successfully" };
};
