const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  const conn = req.salesforceConnection;

  conn.query("SELECT Id, Name FROM Account", (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Salesforce query failed" });
    }
    res.json({
      totalSize: result.totalSize,
      records: result.records,
    });
  });
});

module.exports = router;
