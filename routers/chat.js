const express = require("express");
require("dotenv").config();

const router = express.Router();
const checkRunStatus = require("../pollingUtils/chatStatusPolling");

const OpenAI = require("../connections/openAIFactory");
const openai = OpenAI.getInstance();

const helperMethods = require("../openAIUtils/helperMethods");

router.post("/chat", async (req, res) => {
  //const thread = await openai.beta.threads.create();
  const threadId = process.env.THREAD_ID;
  const reqMessage = req.body;
  console.log("body-->" + reqMessage);
  console.log(reqMessage);
  res.json({
    totalSize: "1",
    records: "success",
    ThreadId: threadId,
  });
  helperMethods.setThreadId(threadId);
  console.log("threadId-->" + threadId);
  const { message, run } = await helperMethods.sendManager(reqMessage);

  checkRunStatus(threadId, run.id, Date.now())
    .then((finalRunStatus) => {
      console.log("Final Run Status:", JSON.stringify(finalRunStatus));
      helperMethods.handleChatStatus(finalRunStatus);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
  res.json({
    totalSize: "1",
    records: "success",
    ThreadId: threadId,
  });
});

module.exports = router;
