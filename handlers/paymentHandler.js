const { db, admin } = require('../config/firebase');
const { validateAuth } = require('../middlewares/auth');
const functions = require('firebase-functions');
const crypto = require('crypto');
const Razorpay = require('razorpay');

// Use env variables in production (functions.config().razorpay...)
const rzp = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_your_key_id",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "your_key_secret",
});

exports.createOrder = async (data, context) => {
  const uid = await validateAuth(context);
  const { amount, eventId } = data; // amount in standard format

  try {
    const options = {
      amount: amount * 100, // Make it paise for Razorpay
      currency: "INR",
      receipt: `receipt_${uid}_${Date.now()}`,
    };

    const order = await rzp.orders.create(options);

    // Track pending payment state
    await db.collection("payments").doc(order.id).set({
      userId: uid,
      amount,
      eventId: eventId || null,
      status: "pending",
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return order;
  } catch (error) {
    throw new functions.https.HttpsError("internal", error.message);
  }
};

exports.razorpayWebhook = async (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET || "your_webhook_secret";
  const signature = req.headers["x-razorpay-signature"];
  const body = req.body;

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(JSON.stringify(body))
    .digest("hex");

  if (signature !== expectedSignature) {
    return res.status(400).send("Invalid signature");
  }

  const event = body.event;
  if (event === "payment.captured") {
    const orderId = body.payload.payment.entity.order_id;
    
    // Webhook enforces truth over client updates
    await db.collection("payments").doc(orderId).update({
      status: "completed",
      verified: true,
      capturedAt: admin.firestore.FieldValue.serverTimestamp()
    });
  }

  res.status(200).send("ok");
};
