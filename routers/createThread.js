const express = require("express");
const OpenAI = require("../connections/openAIFactory");
const openai = OpenAI.getInstance();

const router = express.Router();

router.get("/createthread", async (req, res) => {
  const thread = await openai.beta.threads.create();
  res.json({
    threadId: thread.id,
  });
});

module.exports = router;
