export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const { city, state, interests } = req.body;
  console.log("Request body:", req.body);

  const prompt = `User is in ${city}, ${state}, interested in "${interests}". Suggest local academic or research opportunities.`;

  try {
    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
      }),
    });
    const data = await openaiRes.json();
    console.log("OpenAI status:", openaiRes.status, data);

    if (!openaiRes.ok) {
      return res.status(openaiRes.status).json({ error: data });
    }

    const reply = data.choices?.[0]?.message?.content || "No response";
    res.status(200).json({ reply });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Server error calling OpenAI." });
  }
}
