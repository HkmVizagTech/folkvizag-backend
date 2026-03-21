const axios = require('axios');

const sendWhatsAppMessage = async (phone, message) => {
  try {
    // const WHATSAPP_API_URL = "https://api.whatsapp.com/send"; 
    // const WHATSAPP_TOKEN = "your_whatsapp_token";
    
    // await axios.post(WHATSAPP_API_URL, {
    //   to: phone,
    //   message: message,
    // }, {
    //   headers: { 'Authorization': `Bearer ${WHATSAPP_TOKEN}` }
    // });
    
    console.log(`[WHATSAPP-STUB] Message verified mapped to ${phone}: ${message}`);
    return true;
  } catch (error) {
    console.error("WhatsApp notification failed", error);
    return false;
  }
};

module.exports = {
  sendWhatsAppMessage
};
