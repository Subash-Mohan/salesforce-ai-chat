const express = require("express");
require("dotenv").config();

const router = express.Router();
const checkRunStatus = require("../pollingUtils/chatStatusPolling");

const OpenAI = require("../connections/openAIFactory");
const openai = OpenAI.getInstance();

const helperMethods = require("../openAIUtils/helperMethods");

router.get("/chat:message", async (req, res) => {
  const thread = await openai.beta.threads.create();
  const threadId = thread.id;
  const reqMessage = req.params.message;
  console.log(reqMessage);
  helperMethods.setThreadId(threadId);
  //   const message = await openai.beta.threads.messages.create(threadId, {
  //     role: "user",
  //     content: "Give me all the named credentials in the salesforce org",
  //   });
  //   console.log("Message-->" + JSON.stringify(message));

  //   const run = await openai.beta.threads.runs.create(threadId, {
  //     assistant_id: process.env.ASSISTANT_ID,
  //   });
  //   console.log("Run-->" + JSON.stringify(run));
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
