require("dotenv").config();
const { OpenAI } = require("openai");

class OpenAIFactory {
  constructor() {
    this.openaiInstance = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  getInstance() {
    return this.openaiInstance;
  }
}

const openAIFactory = new OpenAIFactory();

module.exports = openAIFactory;
