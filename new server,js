// Import necessary dependencies
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');
const axios = require('axios'); // Import axios
const Groq = require('groq-sdk');
const cheerio = require('cheerio'); // Import cheerio
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000; // Default to 3000 if no port is provided in .env

const JWT_SECRET = 'your_jwt_secret'; // Use a strong secret in production
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Middleware to parse JSON data and serve static files
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public')); // Serve static HTML/CSS/JS files

// MongoDB connection
mongoose.connect('mongodb+srv://wlratkowski:mc3H1mKsgbR6it8R@summydata.u5zjk.mongodb.net/?retryWrites=true&w=majority&appName=summydata', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// User Schema for authentication
const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});
const User = mongoose.model('User', UserSchema);

// Middleware to verify JWT token
function authenticateToken(req, res, next) {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(401).json({ message: 'Access denied, token missing!' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid token' });
        }
        req.user = user;
        next();
    });
}

// Routes for authentication
app.post('/register', async (req, res) => {
    const { email, username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
        email,
        username,
        password: hashedPassword,
    });

    try {
        await newUser.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(400).json({ message: 'Error registering user' });
    }
});

app.post('/login', async (req, res) => {
    const { emailOrUsername, password } = req.body;
    const user = await User.findOne({
        $or: [{ email: emailOrUsername }, { username: emailOrUsername }],
    });

    if (user && (await bcrypt.compare(password, user.password))) {
        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ token }); // Send JWT token
    } else {
        res.status(401).json({ message: 'Invalid email/username or password' });
    }
});

// Protected route example
app.get('/members', authenticateToken, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'about.html')); // Serve the members-only HTML page
});

// Article Summarization Logic from Groq and Scraping
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

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
