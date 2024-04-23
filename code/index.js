const express = require("express");
const mysql = require("mysql");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

// Define your routes and middleware here

const port = 3000;

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
