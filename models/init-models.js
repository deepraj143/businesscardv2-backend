var DataTypes = require("sequelize").DataTypes;
var _branch = require("./branch");
var _company = require("./company");
var _employee = require("./employee");
var _mycards = require("./mycards");
var _template_category = require("./template_category");
var _templates = require("./templates");
var _user_access = require("./user_access");
var _user_login = require("./user_login");
var _user_roles = require("./user_roles");

function initModels(sequelize) {
  var branch = _branch(sequelize, DataTypes);
  var company = _company(sequelize, DataTypes);
  var employee = _employee(sequelize, DataTypes);
  var mycards = _mycards(sequelize, DataTypes);
  var template_category = _template_category(sequelize, DataTypes);
  var templates = _templates(sequelize, DataTypes);
  var user_access = _user_access(sequelize, DataTypes);
  var user_login = _user_login(sequelize, DataTypes);
  var user_roles = _user_roles(sequelize, DataTypes);

  branch.belongsTo(company, { as: "company", foreignKey: "company_id"});
  company.hasMany(branch, { as: "branches", foreignKey: "company_id"});
  employee.belongsTo(company, { as: "company", foreignKey: "company_id"});
  company.hasMany(employee, { as: "employees", foreignKey: "company_id"});
  mycards.belongsTo(company, { as: "company", foreignKey: "company_id"});
  company.hasMany(mycards, { as: "mycards", foreignKey: "company_id"});
  templates.belongsTo(template_category, { as: "template_category_template_category", foreignKey: "template_category"});
  template_category.hasMany(templates, { as: "templates", foreignKey: "template_category"});
  mycards.belongsTo(templates, { as: "template", foreignKey: "template_id"});
  templates.hasMany(mycards, { as: "mycards", foreignKey: "template_id"});
  company.belongsTo(user_login, { as: "user", foreignKey: "user_id"});
  user_login.hasMany(company, { as: "companies", foreignKey: "user_id"});
  mycards.belongsTo(user_login, { as: "user", foreignKey: "user_id"});
  user_login.hasMany(mycards, { as: "mycards", foreignKey: "user_id"});
  user_access.belongsTo(user_login, { as: "user", foreignKey: "user_id"});
  user_login.hasMany(user_access, { as: "user_accesses", foreignKey: "user_id"});
  user_access.belongsTo(user_roles, { as: "role", foreignKey: "role_id"});
  user_roles.hasMany(user_access, { as: "user_accesses", foreignKey: "role_id"});

  return {
    branch,
    company,
    employee,
    mycards,
    template_category,
    templates,
    user_access,
    user_login,
    user_roles,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
