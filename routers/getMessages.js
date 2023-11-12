const express = require("express");
require("dotenv").config();

const router = express.Router();

const OpenAI = require("../connections/openAIFactory");
const openai = OpenAI.getInstance();

router.get("/getmessages", async (req, res) => {
  const threadId = process.env.THREAD_ID;
  const messages = await openai.beta.threads.messages.list(threadId);
  console.log("Messages-->" + JSON.stringify(messages));

  res.json(messages);
});

module.exports = router;
