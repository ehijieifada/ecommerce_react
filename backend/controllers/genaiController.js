import { GoogleGenAI } from "@google/genai";
import { companyInfo } from "../data/companyInfo.js";

let ai = null;

function getAI() {
  if (ai) return ai;
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    console.error("Missing GEMINI_API_KEY in backend environment. Set it in backend/.env or your deployment env.");
    return null;
  }

  try {
    ai = new GoogleGenAI({ apiKey: key });
    return ai;
  } catch (err) {
    console.error("Failed to initialize GoogleGenAI client:", err);
    return null;
  }
}

export const generateResponse = async (req, res) => {
  try {
    const { userMessage } = req.body || {};
  if (!userMessage) return res.status(400).json({ error: "userMessage is required" });

  const client = getAI();
  if (!client) return res.status(500).json({ error: "Gemini client not configured on server" });

    const context = `Company Name: ${companyInfo.name}\nDescription: ${companyInfo.description}\nLocation: ${companyInfo.location}\n\nCategories: ${companyInfo.categories.join(", ")}\n\nContact:\n  - Email: ${companyInfo.contact.email}\n  - Phone: ${companyInfo.contact.phone}\n  - WhatsApp: ${companyInfo.contact.whatsapp}\n  - Hours: ${companyInfo.contact.hours}\n\nSocial:\n  - Facebook: ${companyInfo.social.facebook}\n  - Instagram: ${companyInfo.social.instagram}\n  - Twitter: ${companyInfo.social.twitter}\n\nWebsite: ${companyInfo.website}\n\nDelivery Policy:\n  - Overview: ${companyInfo.deliveryPolicy.overview}\n  - Delivery Time: ${companyInfo.deliveryPolicy.deliveryTime}\n  - Shipping Partners: ${companyInfo.deliveryPolicy.shippingPartners.join(", ")}\n  - Tracking Available: ${companyInfo.deliveryPolicy.trackingAvailable ? "Yes" : "No"}\n  - Delivery Fees: ${companyInfo.deliveryPolicy.fees}\n\nReturn Policy:\n  - Overview: ${companyInfo.returnPolicy.overview}\n  - Conditions:\n    ${companyInfo.returnPolicy.conditions.map((c) => `- ${c}`).join("\\n    ")}\n  - Refund Time: ${companyInfo.returnPolicy.refundTime}\n\nPayment Methods: ${companyInfo.paymentMethods.join(", ")}\n\nFAQs:\n${companyInfo.faqs
      .map((faq, index) => `${index + 1}. Q: ${faq.question}\n   A: ${faq.answer}`)
      .join("\n")}`;

    const promptUser = `You are a helpful assistant for the company ${companyInfo.name}. Use the following company info to assist with any questions:\n\n${context}\n\nUser: ${userMessage}`;

    const result = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            { text: promptUser },
          ],
        },
      ],
    });

    const text = result?.response?.text ?? result?.text ?? null;
    if (!text) return res.status(500).json({ error: "No text returned from Gemini" });

    return res.json({ text });
  } catch (err) {
    console.error("genai error:", err);
    return res.status(500).json({ error: "Gemini generation failed" });
  }
};
