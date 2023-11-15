const config = {
  threadId: null,
};

require("dotenv").config();
const CircularJSON = require("circular-json");
const salesforceMethod = require("./methodUtils");
const methodManager = require("./methodManager");
const checkRunStatus = require("../pollingUtils/chatStatusPolling");
const OpenAI = require("../connections/openAIFactory");
const openai = OpenAI.getInstance();

const sendMessage = async (message) => {
  const messageStatus = await openai.beta.threads.messages.create(
    config.threadId,
    {
      role: "user",
      content: message,
    }
  );
  console.log("Message-->" + JSON.stringify(messageStatus));
  return messageStatus;
};

const runThread = async () => {
  const run = await openai.beta.threads.runs.create(config.threadId, {
    assistant_id: process.env.ASSISTANT_ID,
  });
  console.log("Run-->" + JSON.stringify(run));
  return run;
};

const sendManager = async (message) => {
  const messageStatus = await sendMessage(message);
  const run = await runThread();
  return { messageStatus, run };
};

const submitToolOutputs = async (result, run) => {
  console.log(`submitToolOutputs-->${result}`);
  console.log(result);
  console.log(String(result));
  openai.beta.threads.runs.submitToolOutputs(config.threadId, run.id, {
    tool_outputs: result,
  });
};

const handleChatStatus = async (runStatus) => {
  if (runStatus.status === "completed") {
    salesforceMethod.createPlatformEventRecord("completed");
  } else {
    salesforceMethod.createPlatformEventRecord("function");

    let toolCalls = runStatus.required_action.submit_tool_outputs.tool_calls;
    let toolOutputs = [];
    for (let i = 0; i < toolCalls.length; i++) {
      const methodName = toolCalls[i].function.name;
      const result = await methodManager.executeMethod(
        methodName,
        toolCalls[i]
      );
      const output = {
        tool_call_id: toolCalls[i].id,
        output: `These are result ${JSON.stringify(result)}`,
      };
      toolOutputs.push(output);
    }

    // const methodName = toolCalls[0].function.name;
    // const result = await methodManager.executeMethod(methodName, runStatus);

    if (toolOutputs.length > 0) {
      const toolOutput = await submitToolOutputs(toolOutputs, runStatus);
      checkRunStatus(config.threadId, runStatus.id, Date.now())
        .then((finalRunStatus) => {
          console.log("Final Run Status:", JSON.stringify(finalRunStatus));
          salesforceMethod.createPlatformEventRecord("completed");
        })
        .catch((error) => {
          salesforceMethod.createPlatformEventRecord("error");
          console.error("Error:", error);
        });
    }
    salesforceMethod.createPlatformEventRecord("completed");
  }
};

const setThreadId = (threadId) => {
  config.threadId = threadId;
};

module.exports = {
  sendMessage,
  runThread,
  sendManager,
  handleChatStatus,
  setThreadId,
};
