const SalesforceConnection = require("../connections/SalesforceConnection");
const salesforceConnection = new SalesforceConnection();
const conn = salesforceConnection.getConnection();

const createAccountStrategy = (request, response) => {
  // Implement the logic for creating a Salesforce account
};

const updateContactStrategy = (request, response) => {
  // Implement the logic for updating a Salesforce contact
};

const retrieveApexClass = async (runStatus) => {
  const { apexClassName } = JSON.parse(
    runStatus.required_action.submit_tool_outputs.tool_calls[0].function
      .arguments
  );
  try {
    const query = `SELECT Body FROM ApexClass WHERE Name = '${apexClassName}'`;
    const result = await conn.query(query);
    console.log("Result retrieveApexClass-->" + JSON.stringify(result));
    const apexClassBody = result.records[0].Body;
    console.log("Apex Class Body:", apexClassBody);
    return apexClassBody;
  } catch (err) {
    console.log("Error retrieving retrieveApexClass:" + err);
  }
};

const getNamedCredentials = async (runStatus) => {
  try {
    const query = "SELECT Id, DeveloperName, Endpoint FROM NamedCredential";
    const result = await conn.query(query);

    const namedCredentials = result.records.map((record) => {
      return {
        id: record.Id,
        developerName: record.DeveloperName,
        endpoint: record.Endpoint,
      };
    });

    return namedCredentials;
  } catch (err) {
    console.error("Error retrieving named credentials:" + err);
    throw err;
  }
};

const getPermissionSetsAndProfileForUser = async (runStatus) => {
  const { name } = JSON.parse(
    runStatus.required_action.submit_tool_outputs.tool_calls[0].function
      .arguments
  );
  try {
    const query = `
      SELECT Id, PermissionSetId, PermissionSet.Name, PermissionSet.ProfileId, PermissionSet.Profile.Name, AssigneeId, Assignee.Name
      FROM PermissionSetAssignment
      WHERE Assignee.Name = '${name}'
    `;

    const result = await conn.query(query);
    console.log(
      `getPermissionSetsAndProfileForUser-->${JSON.stringify(result)}`
    );
    if (result.records && result.records.length > 0) {
      const permissionSets = result.records.map((record) => ({
        id: record.Id,
        permissionSetId: record.PermissionSetId,
        permissionSetName: record.PermissionSet.Name,
        profileId: record.PermissionSet.ProfileId,
        profileName:
          record.PermissionSet.Profile != null
            ? record.PermissionSet.Profile.Name
            : null,
        assigneeId: record.AssigneeId,
        assigneeName: record.Assignee.Name,
      }));

      return permissionSets;
    } else {
      return "Profile Record not found";
    }
  } catch (error) {
    console.error(error);
    return "Failed to retrieve Permission Sets for the user";
  }
};

const getOrganizationId = async () => {
  try {
    const query = "SELECT Id, Name FROM Organization";
    const result = await conn.query(query);

    if (result.records && result.records.length > 0) {
      const organizationId = result.records[0].Id;
      const name = result.records[0].Name;
      return `Id: ${organizationId}, OrgName: ${name}`;
    } else {
      return "Organization record not found";
    }
  } catch (error) {
    console.error(error);
    return "Failed to retrieve Organization ID";
  }
};

const createPlatformEventRecord = (eventType) => {
  const payload = { Event_Type__c: eventType };
  conn.sobject("open_integration__e").create(payload, function (err, ret) {
    if (err || !ret.success) {
      console.log(
        "Error at createPlatformEventRecord-->" + JSON.stringify(err)
      );
      throw err;
    }

    console.log("Published Platform Event:", ret.id);
    return true;
  });
};

module.exports = {
  createAccountStrategy,
  updateContactStrategy,
  getNamedCredentials,
  createPlatformEventRecord,
  retrieveApexClass,
  getPermissionSetsAndProfileForUser,
  getOrganizationId,
};
