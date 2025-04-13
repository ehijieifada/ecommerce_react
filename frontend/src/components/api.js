import { GoogleGenAI } from "@google/genai";
import { companyInfo } from "../assets/botassets";

const ai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GEMINI_API_KEY,
});

export const fetchGeminiResponse = async (userMessage) => {
  try {
    const context = `
Company Name: ${companyInfo.name}
Description: ${companyInfo.description}
Location: ${companyInfo.location}

Categories: ${companyInfo.categories.join(", ")}

Contact:
  - Email: ${companyInfo.contact.email}
  - Phone: ${companyInfo.contact.phone}
  - WhatsApp: ${companyInfo.contact.whatsapp}
  - Hours: ${companyInfo.contact.hours}

Social:
  - Facebook: ${companyInfo.social.facebook}
  - Instagram: ${companyInfo.social.instagram}
  - Twitter: ${companyInfo.social.twitter}

Website: ${companyInfo.website}

Delivery Policy:
  - Overview: ${companyInfo.deliveryPolicy.overview}
  - Delivery Time: ${companyInfo.deliveryPolicy.deliveryTime}
  - Shipping Partners: ${companyInfo.deliveryPolicy.shippingPartners.join(", ")}
  - Tracking Available: ${companyInfo.deliveryPolicy.trackingAvailable ? "Yes" : "No"}
  - Delivery Fees: ${companyInfo.deliveryPolicy.fees}

Return Policy:
  - Overview: ${companyInfo.returnPolicy.overview}
  - Conditions:
    ${companyInfo.returnPolicy.conditions.map((c) => `- ${c}`).join("\n    ")}
  - Refund Time: ${companyInfo.returnPolicy.refundTime}

Payment Methods: ${companyInfo.paymentMethods.join(", ")}

FAQs:
${companyInfo.faqs
  .map((faq, index) => `${index + 1}. Q: ${faq.question}\n   A: ${faq.answer}`)
  .join("\n")}
`;

    const result = await ai.models.generateContent({
      model: "gemini-1.5-pro",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `You are a helpful assistant for the company Trendify Hub. Use the following company info to assist with any questions:\n\n${context}`,
            },
            {
              text: userMessage,
            },
          ],
        },
      ],
    });

    const text = result?.response?.text ?? result?.text;
    if (!text) throw new Error("No response text found.");
    return text;
  } catch (err) {
    console.error("Gemini error:", err);
    return "Oops! I couldn't fetch a response right now.";
  }
};
