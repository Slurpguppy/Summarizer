require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios'); // Import axios
const Groq = require('groq-sdk');
const cheerio = require('cheerio'); // Import cheerio

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

// Function to fetch article content and extract the main text
const fetchArticleContent = async (url) => {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data); // Load the HTML

    // Extract the main content; adjust the selector based on the website's structure
    const mainContent = $('article').text() || $('body').text(); // Modify selectors as needed
    return mainContent.trim();
  } catch (error) {
    console.error("Error fetching article:", error);
    throw new Error("Could not fetch article content.");
  }
};

// Endpoint to handle AI conversation
// Endpoint to handle AI conversation
app.post("/api/chat", async (req, res) => {
  const userMessage = req.body.message;

  try {
    // Extract URL from userMessage (you might want to validate the URL)
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = userMessage.match(urlRegex);

    if (urls && urls.length > 0) {
      const articleContent = await fetchArticleContent(urls[0]); // Get the first URL
      
      // Send the fetched content to Groq for summarization
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `You shorten and summarize articles in websites sent to you. Your responses must fit within 100 and 150 tokens.`,
          },
          {
            role: "user",
            content: articleContent, // Use the article content instead of userMessage
          },
        ],
        model: "llama-3.1-70b-versatile",
      });

      let aiResponse = completion.choices[0]?.message?.content || "No response";

      // Format the AI response to include spaces between paragraphs
      aiResponse = aiResponse.replace(/(\n\s*\n)/g, "\n\n"); // This will ensure double line breaks are preserved

      res.json({ response: aiResponse });
    } else {
      res.status(400).json({ error: "No valid URL found in the message." });
    }
  } catch (error) {
    console.error("Error in Groq API:", error);
    res.status(500).json({ error: "Something went wrong!" });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
