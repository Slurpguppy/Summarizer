require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const Groq = require('groq-sdk');

const app = express();
const port = process.env.PORT || 8000;

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Middleware to parse JSON data
app.use(bodyParser.json());
app.use(express.static('public')); // Serve static HTML/CSS/JS files

// Route for the root URL
app.get("/", (req, res) => {
  res.send("Hello, world! Your server is running.");
});

// Endpoint to handle AI conversation
app.post("/api/chat", async (req, res) => {
  const userMessage = req.body.message;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You summarize articles in websites sent to you.",
        },
        {
          role: "user",
          content: userMessage,
        },
      ],
      model: "llama3-8b-8192",
    });

    const aiResponse = completion.choices[0]?.message?.content || "No response";
    res.json({ response: aiResponse });
  } catch (error) {
    console.error("Error in Groq API:", error);
    res.status(500).json({ error: "Something went wrong!" });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

