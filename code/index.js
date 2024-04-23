const express = require("express");
const mysql = require("mysql");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Define your routes and middleware here

const port = 3000;

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

const db = mysql.createConnection({
  host: "localhost",
  port: "3306",
  user: "root",
  password: "",
  database: "issues",
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL database:", err);
    return;
  }
  console.log("Connected to MySQL database");
});

function logrequest(req, res, next) {
  console.log(`API ${req.method} ${req.url}`);
  next();
}

app.use(logrequest);

function queryPromise(sql, values) {
  return new Promise((resolve, reject) => {
    db.query(sql, values, (error, results, fields) => {
      if (error) {
        reject(error); // Reject the promise if there's an error
      } else {
        resolve(results); // Resolve the promise with the query results
      }
    });
  });
}

// POST route for handling ticket creation
app.post("/tickets", async (req, res) => {
  try {
    // Extracting inputs from the request body
    const { title, description, active } = req.body;

    // Check if title and description are provided
    if (!title || !description) {
      return res
        .status(400)
        .json({ error: "Title and Description are mandatory" });
    }

    // If active is not provided, default it to true
    const isActive = active !== undefined ? active : true;

    // Check if the 'active' field is a boolean
    if (typeof isActive !== "boolean") {
      return res
        .status(400)
        .json({ error: "'active' field must be a boolean" });
    }

    // SQL query to insert the ticket into the database
    const sql =
      "INSERT INTO tickets (title, description, active) VALUES (?, ?, ?)";

    // Execute the SQL query using queryPromise function
    const result = await queryPromise(sql, [title, description, isActive]);

    // Return success response with the created ticket details
    res.status(201).json({
      message: "Ticket created successfully",
      ticket: {
        id: result.insertId, // Assuming your result object contains an 'insertId' property
        title,
        description,
        active: isActive,
      },
    });
  } catch (error) {
    // Handle errors
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
