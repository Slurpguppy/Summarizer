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

// Set maximum character limit to stay within Groq API limits
const MAX_CHARACTERS = 15000; // Adjust as needed
// Function to truncate text to the character limit
const truncateText = (text) => text.substring(0, MAX_CHARACTERS);

// Function to clean AI response
const cleanAIResponse = (response) => {
  // Remove common introductory phrases
  const introPatterns = [
    /^(Here is a summary.*|Here is the shortened and summarized article.*|Here is the summarized article.*|Here is the summary of the article.*|Here is a summarized version of the article within the 100-150 token limit.*|Here's a shortened version of the article.*|Here is the article summarized in 100-150 tokens:*|This is a summary of.*|Here's a summary of the article:*|Here is the summarized text:*|Here is a rewritten version of the article:*|Summary:)/i,
    // Add more patterns as needed
  ];

  for (const pattern of introPatterns) {
    response = response.replace(pattern, "").trim();
  }

  return response;
};

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
app.post("/api/chat", async (req, res) => {
  const userMessage = req.body.message;

  try {
    // Extract URL from userMessage (you might want to validate the URL)
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = userMessage.match(urlRegex);

    if (urls && urls.length > 0) {
      const articleUrl = urls[0];

      // Check if the URL is from MSN.com
      if (articleUrl.includes("msn.com")) {
        return res.json({
          response: "The link you provided is from MSN.com, which cannot be summarized. Please copy the article text instead.",
        });
      }

      // Fetch and process the article content
      const articleContent = await fetchArticleContent(articleUrl); // Get the first URL
      const truncatedContent = truncateText(articleContent); // Truncate the content

      // Send the fetched content to Groq for summarization
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `Summarize articles from provided links without introductions or summaries.

                      Your responses must fit within 100 and 150 tokens.

                      If a link is broken, suggest copying the article's text instead.

                      ONLY include text or information that is directly related to the article's content, do NOT include anything like "Here's a shortened version of the article.", or "Here is the article summarized in 100-150 tokens:"`,
          },
          {
            role: "user",
            content: truncatedContent, // Use the truncated article content
          },
        ],
        model: "llama3-8b-8192",
      });

      let aiResponse = completion.choices[0]?.message?.content || "No response";

      // Clean the AI response
      aiResponse = cleanAIResponse(aiResponse); // Clean the response

      // Format the AI response to include spaces between paragraphs
      aiResponse = aiResponse.replace(/(\n\s*\n)/g, "\n\n"); // This will ensure double line breaks are preserved

      res.json({ response: aiResponse });
    } else {
      // If no URLs are found, treat the input as plain text
      const truncatedText = truncateText(userMessage); // Truncate the input text

      // Send the plain text to Groq for summarization
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `You shorten and summarize the following text. Your responses must fit within 100 and 150 tokens.`,
          },
          {
            role: "user",
            content: truncatedText, // Use the truncated input text
          },
        ],
        model: "llama3-8b-8192",
      });

      let aiResponse = completion.choices[0]?.message?.content || "No response";

      // Clean the AI response
      aiResponse = cleanAIResponse(aiResponse); // Clean the response

      // Format the AI response to include spaces between paragraphs
      aiResponse = aiResponse.replace(/(\n\s*\n)/g, "\n\n"); // This will ensure double line breaks are preserved

      res.json({ response: aiResponse });
    }
  } catch (error) {
    console.error("Error in Groq API:", error);
    res.status(500).json({ error: "Something went wrong!" });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
