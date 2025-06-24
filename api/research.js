export default async function handler(req, res) {
  console.log("Request received:", req.method, req.body);
  if (req.method !== 'POST') {
    console.log("Wrong method:", req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { city, state, interests } = req.body;
  const prompt = `The user lives in ${city}, ${state}, and is interested in "${interests}".`;

  try {
    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }]
      })
    });

    const data = await openaiRes.json();
    console.log("OpenAI response status:", openaiRes.status, data);

    if (!openaiRes.ok) {
      return res.status(openaiRes.status).json({ error: data });
    }

    const reply = data.choices?.[0]?.message?.content || "No response from ChatGPT.";
    res.status(200).json({ reply });

  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Error calling OpenAI API." });
  }
}
