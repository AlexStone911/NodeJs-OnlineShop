const Sequelize = require("sequelize");

const sequelize = new Sequelize("nodeshop_schema", "root", "", {
  dialect: "mysql",
  host: "localhost",
});

module.exports = sequelize;
