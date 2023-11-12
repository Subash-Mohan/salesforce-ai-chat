const OpenAI = require("../connections/openAIFactory");
const openai = OpenAI.getInstance();

const retrieveRunStatus = (threadId, runId) => {
  return new Promise((resolve, reject) => {
    openai.beta.threads.runs
      .retrieve(threadId, runId)
      .then((runStatus) => {
        console.log("runStatus-->" + JSON.stringify(runStatus));
        resolve(runStatus);
      })
      .catch((error) => {
        console.error("Error:", error);
        reject(error);
      });
  });
};

const checkRunStatus = (threadId, runId, startTime, maxDuration = 60000) => {
  const currentTime = Date.now();
  const elapsedTime = currentTime - startTime;

  if (elapsedTime >= maxDuration) {
    console.log("Timeout reached. Exiting...");
    return Promise.resolve(null); // Or handle the timeout as needed
  }

  return retrieveRunStatus(threadId, runId).then((runStatus) => {
    if (
      runStatus &&
      (runStatus.status === "completed" ||
        runStatus.status === "requires_action")
    ) {
      return runStatus;
    } else {
      console.log("Retrying...");
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(checkRunStatus(threadId, runId, startTime, maxDuration));
        }, 2000); // Retry every 2 seconds
      });
    }
  });
};

const checkFunctionstatus = (runStatus) => {
  for (let i = 0; i < runStatus.tools; i++) {
    if (runStatus.tools[i].type === "function") return true;
  }
  return false;
};

module.exports = checkRunStatus;
