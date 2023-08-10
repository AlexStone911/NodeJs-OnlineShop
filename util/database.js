const mysql = require("mysql2");

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  database: "nodeshop_schema",
  password: "",
});

module.exports = pool.promise();
