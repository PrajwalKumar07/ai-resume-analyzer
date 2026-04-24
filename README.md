# AI Resume Analyzer

## Overview

AI-powered Resume Analyzer that evaluates resumes against job descriptions using NLP techniques. The system generates an ATS score, identifies strengths and weaknesses, and highlights missing keywords to improve job matching.

---

## Features

* ATS Score generation (0–100)
* Resume vs Job Description matching
* Strengths and weaknesses detection
* Actionable suggestions for improvement
* Missing keywords extraction
* Clean and structured UI

---

## Tech Stack

* Frontend: React.js
* Backend: Node.js, Express.js
* AI Integration: OpenRouter API
* PDF Parsing: pdf-parse

---

## How It Works

1. Upload a resume (PDF)
2. Paste the job description
3. The system analyzes and returns:

   * ATS Score
   * Strengths and weaknesses
   * Suggestions
   * Missing keywords

---

## Project Structure

```
resume-analyzer/
├── frontend/   # React UI
├── backend/    # Express API + AI processing
```

---

## Key Highlights

* Full-stack application integrating AI-based analysis
* Implements ATS-style resume evaluation logic
* Focus on usability and structured output
* Designed for real-world job matching scenarios

---

## Security Note

Sensitive files such as `.env`, `node_modules`, and uploads are excluded using `.gitignore`.

---

## Author

Prajwal Kumar
GitHub: https://github.com/PrajwalKumar07/
