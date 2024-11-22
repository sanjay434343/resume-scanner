require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Serve main.html on the root route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "main.html"));
});

// Process Resume Text Endpoint
app.post("/analyze", async (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: "Text is required for analysis" });
  }

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: `Score the following resume and provide improvement suggestions: "${text}"`,
              },
            ],
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const suggestions = response.data.contents?.[0]?.parts?.[0]?.text;

    if (!suggestions) {
      return res.status(500).json({ error: "Failed to get suggestions from Gemini API." });
    }

    res.json({
      success: true,
      suggestions,
    });
  } catch (error) {
    console.error("Error calling Gemini API:", error.message);
    res.status(500).json({ error: "An error occurred while processing the request." });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});