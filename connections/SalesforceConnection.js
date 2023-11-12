const jsforce = require("jsforce");
require("dotenv").config();

class SalesforceConnection {
  constructor() {
    if (SalesforceConnection.instance) {
      return SalesforceConnection.instance;
    }

    const { SF_LOGIN_URL } = process.env;
    this.connection = new jsforce.Connection({ loginUrl: SF_LOGIN_URL });

    SalesforceConnection.instance = this;
  }

  async connect() {
    return new Promise((resolve, reject) => {
      const { SF_USERNAME, SF_PASSWORD, SF_SECURITY_TOKEN } = process.env;
      this.connection.login(
        SF_USERNAME,
        SF_PASSWORD + SF_SECURITY_TOKEN,
        (err, userInfo) => {
          if (err) {
            console.error(err);
            reject(err);
          } else {
            console.log("Salesforce connection established");
            resolve(userInfo);
          }
        }
      );
    });
  }

  getConnection() {
    return this.connection;
  }
}

module.exports = SalesforceConnection;
