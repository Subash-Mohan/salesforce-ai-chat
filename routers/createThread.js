const OpenAI = require("../connections/openAIFactory");
const openai = OpenAI.getInstance();

router.get("/createthread", async (req, res) => {
  const thread = await openai.beta.threads.create();
  res.json({
    threadId: thread.id,
  });
});
