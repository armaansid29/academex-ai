export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { city, state, interests, bio } = req.body;

  const prompt = `
I am a high school student (unless otherwise mentioned in my ${bio}, in which case, use that information instead. For example, if I said university student, then use that, 
or if I said M2 student, then use that.)
based in ${city}, ${state}, and my academic interests lie in ${interests}.
Can you find me the names of 3 professors at some local universities and their current research interests?
For each professor, output the following fields in this exact format, one after another, for all 3 professors:

Professor: [Full Name]
University: [University Name]
Research Keywords: [comma-separated keywords]
Bio: [2-3 sentences about their research and background]
Cold Email: [A complete, thoughtful cold email as described below]

The cold email should:
- Start with a proper greeting.
- Introduce me using this info: ${bio}, as well as my research interests that I listed.
- In the second paragraph, scrape online to find their research and discuss it by selecting a specific project (preferably recent) and talking about specifics of it
and how it is geniunely interesting. Make sure to include specific detail to show thoughtfulness and genuine interest, but also only address it with the level of 
complexity that a high school student would be able to.
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

Here is a sample cold email that another AI wrote for me, and I admire the level of complexity with which it addresses the professor's work: 
Dear Professor Lee,

My name is [Your Name], and I am a high school senior from the Chicago area who will be joining Carnegie Mellon's School of Computer Science this fall. I am passionate about quantitative finance and particularly interested in the intersection of mathematical modeling and real-world financial markets.

I recently read about your work on the behavior of implied volatility surfaces, as well as the innovative applied research being conducted through the Financial Mathematics Project Lab. I was fascinated by the way you bridge rigorous mathematical theory with the practical realities faced by traders and risk managers — particularly your insights on how market conditions shape the volatility smile. It made me realize how powerful a deep mathematical understanding can be in building robust models for pricing and trading.

This summer, I would be honored to contribute to any research or projects you are leading, even if only in a small capacity. I have a strong background in mathematics (including multivariable calculus and probability), am proficient in Python, and have independently explored topics such as stochastic processes and basic options theory. I am eager to learn, highly self-motivated, and very interested in applying technical skills to real-world financial challenges.

If there is any opportunity to assist you or your team this summer — whether through a formal project or informal mentorship — I would love to discuss how I might best contribute.

Thank you very much for your time and consideration.

Sincerely,
[Your Name]
[Your Contact Information]

Use this email template as an example, specifically the way it formats everything and output your emails with similar formatting and depth.
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
