const salesforceMethod = require("./methodUtils");
const methods = {
  "create-account": salesforceMethod.createAccountStrategy,
  "update-contact": salesforceMethod.updateContactStrategy,
  get_namedcredentials: salesforceMethod.getNamedCredentials,
  get_apexClassContent: salesforceMethod.retrieveApexClass,
  get_PermissionSetsAndProfileForUser:
    salesforceMethod.getPermissionSetsAndProfileForUser,
  get_orgID: salesforceMethod.getOrganizationId,
  update_namedCredentials: salesforceMethod.updateNamedCredentials,
};

const executeMethod = async (methodKey, runStatus) => {
  const method = methods[methodKey];
  if (method) {
    return await method(runStatus);
  } else {
    console.log(`Error at executeMethod ${methodKey}`);
    return `Error at executeMethod ${methodKey}`;
  }
};

module.exports = { executeMethod };
