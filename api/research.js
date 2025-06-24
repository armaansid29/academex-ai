export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { city, state, interests } = req.body;

  const prompt = `I am a high school student based in ${city}, ${state}, and I'm interested in ${interests}. What are some academic or research opportunities (local or online) that I can explore?`;

  try {
    const cohereRes = await fetch("https://api.cohere.ai/v1/generate", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.COHERE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "command-r-plus", // or use "command" for slightly faster model
        prompt,
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    const data = await cohereRes.json();
    console.log("Cohere status:", cohereRes.status, data);

    if (!cohereRes.ok) {
      return res.status(cohereRes.status).json({ error: data });
    }

    const reply = data.generations?.[0]?.text?.trim() || "No response from Cohere.";
    return res.status(200).json({ reply });
  } catch (err) {
    console.error("Cohere API error:", err);
    return res.status(500).json({ error: "Server error calling Cohere API." });
  }
}
