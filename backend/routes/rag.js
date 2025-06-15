const express = require("express");
const router = express.Router();
const runRAG = require("../services/ragService");

router.post("/", async (req, res) => {
  const { question } = req.body;

  if (!question) {
    return res.status(400).json({ error: "Question is required" });
  }

  try {
    const answer = await runRAG(question);
    res.json({ answer });
  } catch (err) {
    console.error("Error in /api/rag:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

module.exports = router;
