const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const PORT = 3001;

const SalesforceConnection = require("./connections/SalesforceConnection");
const salesforceConnection = new SalesforceConnection();

const salesforceTest = require("./routers/salesforceTest");
const chat = require("./routers/chat");
const getMessages = require("./routers/getMessages");
const createThread = require("./routers/createThread");

app.use(
  cors({
    origin: "https://adaptiq-a4-dev-ed.develop.lightning.force.com", // Replace with your Salesforce instance URL
    optionsSuccessStatus: 200, // Some legacy browsers (IE11, various SmartTVs) choke on 204
  })
);
app.use(async (req, res, next) => {
  try {
    const userInfo = await salesforceConnection.connect();
    req.salesforceConnection = salesforceConnection.getConnection();
    req.userInfo = userInfo;
    next();
  } catch (error) {
    res.status(500).json({ error: "Salesforce login failed" });
  }
});

app.get("/", salesforceTest);
app.get("/chat", chat);
app.get("/getmessages", getMessages);
app.get("/createthread", createThread);

app.listen(process.env.PORT || PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
