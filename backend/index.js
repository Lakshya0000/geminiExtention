const express = require('express');
const cors = require('cors');
const app = express();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const port = 3000;
const { inject } = require('@vercel/analytics');
const path = require('path');

const corsOptions = {
  origin: (origin, callback) => {
    if (origin && origin.startsWith('chrome-extension://')) {
      callback(null, true); // Allow the request
    } else {
      callback(new Error('Not allowed by CORS')); // Deny the request
    }
  },
  optionsSuccessStatus: 200, // For legacy browsers
};

app.use(cors(corsOptions));

async function generateStory(apiKey, prompt) {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    inject();
    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        return text;
    } catch (error) {
        console.error("Error generating story:", error);
        return `An error occurred while generating the story. ${apiKey} and ${prompt}`;
    }
}

app.post('/submit', async (req, res) => {
    const { apiKey, message } = req.body;
   
    try {
        const story = await generateStory(apiKey, message);
        res.json({ message: story });
    } catch (error) {
        console.error("Error processing request:", error);
        res.status(500).json({ message: "An error occurred." });
    }
});

app.get('/' , (req, res) =>{
  res.json({message : 'to use api post request to /submit'})
})
app.get("/privacy", (req, res) => {
    res.sendFile(path.join(__dirname, 'privacy.html'));
  
  });

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
