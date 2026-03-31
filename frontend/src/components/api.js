export const fetchGeminiResponse = async (userMessage) => {
  try {
    const apiUrl = import.meta.env.VITE_API_URL || "";
    const res = await fetch(`${apiUrl}/api/genai`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userMessage }),
    });

    if (!res.ok) {
      console.error("Backend genai error", await res.text());
      return "Oops! I couldn't fetch a response right now.";
    }

    const data = await res.json();
    return data.text || "Sorry, no response from assistant.";
  } catch (err) {
    console.error("fetchGeminiResponse error:", err);
    return "Oops! I couldn't fetch a response right now.";
  }
};
