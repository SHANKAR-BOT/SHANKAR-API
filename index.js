const express = require("express");
      secure = require('ssl-express-www');
      cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const log = require("./includes/log")
const config = require("./config.json");

global.config = config;
global.api = new Map(); // Ensure global.api is initialized here
const router = require("./includes/router");
const app = express();

app.use(express.json());

app.use(express.static(path.join(__dirname, 'includes', 'public')));

app.use(router);
app.enable('trust proxy');
app.set("json spaces", 2);
app.use(cors());
app.use(secure);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Add this route to your Express server (e.g., in index.js)
app.get("/config", (req, res) => {
  res.json(global.config);
});

// Endpoint to serve the API list
app.get("/api-list", (req, res) => {
  const apiList = Array.from(global.api.values()).map(api => api.config);
  res.json(apiList);
});

// Serve the documentation page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "includes", "web", "index.html"));
});

// Serve the 404 page for unknown routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "includes", "web", "404.html"));
});

const PORT = process.env.PORT || global.config.port || 3000;

app.listen(PORT, () => {
  log.main(`Server is running on port ${PORT}`);
});
