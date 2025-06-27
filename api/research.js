export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { city, state, interests, bio } = req.body;

  const prompt = `
I am a high school student based in ${city}, ${state}, and my academic interests lie in ${interests}.
Can you find me the names of 3 professors at some local universities and their current research interests?
For each professor, output the following fields in this exact format, one after another, for all 3 professors:

Professor: [Full Name]
University: [University Name]
Research Keywords: [comma-separated keywords]
Bio: [2-3 sentences about their research and background]
Cold Email: [A complete, thoughtful cold email as described below]

The cold email should:
- Start with a greeting.
- Introduce me using this info: ${bio}
- In the second paragraph, discuss their research and show genuine interest.
- In the third paragraph, kindly ask for mentorship or research opportunities, mention a resume is attached, and end with "Sincerely, [Your Name]".

Please repeat this format for 3 different professors. Make sure each cold email is complete and ends with "Sincerely, [Your Name]".

Example format:
Professor: Dr. Jane Smith
University: University of Example
Research Keywords: neuroscience, brain imaging, cognition
Bio: Dr. Smith is a leading researcher in cognitive neuroscience, focusing on brain imaging techniques to study memory. She has published extensively on the neural basis of learning. Her recent work explores the intersection of AI and neuroscience.
Cold Email:
Dear Dr. Smith,
[...full email...]
Sincerely, [Your Name]

Professor: Dr. John Doe
University: Example State University
Research Keywords: artificial intelligence, robotics, machine learning
Bio: Dr. Doe's research centers on robotics and machine learning, with a focus on real-world applications. He has led several interdisciplinary projects. His recent papers explore the ethical implications of AI in society.
Cold Email:
Dear Dr. Doe,
[...full email...]
Sincerely, [Your Name]

[Repeat for a third professor]
`;

  try {
    const cohereRes = await fetch("https://api.cohere.ai/v1/generate", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.COHERE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "command-r-plus",
        prompt,
        max_tokens: 1500, // Increased to allow for 3 full professors and emails
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
