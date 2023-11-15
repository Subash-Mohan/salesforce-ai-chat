const express = require("express");
const OpenAI = require("../connections/openAIFactory");
const openai = OpenAI.getInstance();

const router = express.Router();

router.get("/cancelrun/:runId", async (req, res) => {
  const runId = req.params.runId;
  try {
    const run = await openai.beta.threads.runs.cancel(
      process.env.THREAD_ID,
      runId
    );
    res.json({ status: "canceled" });
  } catch (err) {
    res.json({ status: JSON.stringify(err) });
  }
});

module.exports = router;
