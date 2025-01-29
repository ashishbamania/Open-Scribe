const express = require("express");
const multer = require("multer");
const cors = require("cors");
const OpenAI = require("openai");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");

const app = express();
const upload = multer({ dest: "uploads/" });
dotenv.config();

app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post("/transcribe", upload.single("audio"), async (req, res) => {
  try {
    const filePath = req.file.path + ".webm";
    fs.renameSync(req.file.path, filePath);

    const response = await openai.audio.transcriptions.create({
      file: fs.createReadStream(filePath),
      model: "whisper-1",
    });

    // Clean up: delete the temporary file
    fs.unlinkSync(filePath);

    res.json({ transcription: response.text });
  } catch (error) {
    console.error("Error:", error);
    // Clean up on error
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (e) {
        console.error("Error deleting file:", e);
      }
    }
    res.status(500).json({ error: "Transcription failed" });
  }
});

app.post("/format-consultation", async (req, res) => {
  try {
    const { transcription } = req.body;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "You are a medical scribe. Format the following consultation transcription into a proper medical consultation note with appropirate sections described. This should be in a way a healthcare profressional writes medical notes.Use only the information provided in the transcription.",
        },
        {
          role: "user",
          content: transcription,
        },
      ],
    });

    res.json({ formattedNote: response.choices[0].message.content });
  } catch (error) {
    console.error("Error formatting consultation:", error);
    res.status(500).json({ error: "Formatting failed" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
