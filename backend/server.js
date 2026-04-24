  require("dotenv").config();
  const express = require("express");
  const cors = require("cors");
  const multer = require("multer");
  const fs = require("fs");
  const pdfParse = require("pdf-parse");
  const axios = require("axios");

  const app = express();

  app.use(cors());
  app.use(express.json());

  // ✅ Multer storage
  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "uploads/"),
    filename: (req, file, cb) =>
      cb(null, Date.now() + "-" + file.originalname),
  });

  const upload = multer({ storage });

  // ✅ Health check
  app.get("/", (req, res) => {
    res.send("Server is running...");
  });

  // ✅ Upload route
  app.post("/upload", upload.single("file"), async (req, res) => {
    let filePath;

    try {
      console.log("File received:", req.file);

      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

        const jobDesc = req.body.jobDesc || "";
      if (!jobDesc.trim()) {
        return res.status(400).json({
          strengths: [],
          weaknesses: ["Job description is missing"],
          suggestions: ["Please paste a job description"],
        });
      }

      if (!process.env.OPENROUTER_API_KEY) {
        return res.status(500).json({
          strengths: ["API key missing"],
          weaknesses: ["OpenRouter not configured"],
          suggestions: ["Add OPENROUTER_API_KEY in .env"],
        });
      }

      filePath = req.file.path;

      const buffer = fs.readFileSync(filePath);
      const data = await pdfParse(buffer);
      const resumeText = data.text;

      if (resumeText.trim().length > 12000) {
    return res.status(400).json({
      strengths: [],
      weaknesses: ["Resume too long"],
      suggestions: ["Upload a shorter resume"],
    });
  }

      console.log("OPENROUTER MODE ACTIVE");

      let parsed;

      try {
        const response = await axios.post(
          "https://openrouter.ai/api/v1/chat/completions",
          {
            model: "openai/gpt-3.5-turbo",
            messages: [
              {
                role: "user",
                content: `
  You are an expert ATS resume analyzer.

  Analyze the resume and return ONLY valid JSON.

  Format:
  {
    "score": 0,
    "strengths": [],
    "weaknesses": [],
    "suggestions": [],
    "missing_keywords": []
  }

  Rules:
  - Score must be between 0–100
  - PRIORITIZE match with job description
  - Check required skills, keywords, and relevance
  - Penalize missing important skills from job description
  - Extract important keywords from job description
  - Compare with resume and return missing ones in "missing_keywords"
  - Be strict like real ATS systems
  - Keep insights specific to SOFTWARE roles

  Job Description:
  ${jobDesc}

  Resume:
  ${resumeText}
  `
              },
            ],
          },
          {
            headers: {
              Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
              "Content-Type": "application/json",
            },
          }
        );

        const text =
          response?.data?.choices?.[0]?.message?.content || "";

        console.log("RAW AI RESPONSE:\n", text);

        const cleaned = text.replace(/```json|```/g, "").trim();

        const jsonStart = cleaned.indexOf("{");
        const jsonEnd = cleaned.lastIndexOf("}");

        try {
          const jsonString = cleaned.substring(jsonStart, jsonEnd + 1);
          parsed = JSON.parse(jsonString);
          if (parsed.score === undefined) {
          parsed.score = 50;
  }
  if (!parsed.missing_keywords) {
    parsed.missing_keywords = [];
  }
        } catch (err) {
          parsed = {
            strengths: ["Parsing failed"],
            weaknesses: ["AI format issue"],
            suggestions: ["Try again"],
            missing_keywords: []
          };
        }

      } catch (err) {
        console.error("OpenRouter ERROR:", err.message);

        parsed = {
          strengths: ["Request failed"],
          weaknesses: ["API issue"],
          suggestions: ["Check API key"],
        };
      }

      res.json(parsed);

    } catch (error) {
      console.error("Server error:", error);

      res.status(500).json({
        message: "Error processing resume",
        error: error.message,
      });

    } finally {
      if (filePath) {
        try {
          fs.unlinkSync(filePath);
        } catch {}
      }
    }
  });

  // ✅ Start server
  const PORT = 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });