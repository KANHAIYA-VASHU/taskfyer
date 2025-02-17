import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connect from "./src/db/connect.js";
import cookieParser from "cookie-parser";
import fs from "node:fs";
import errorHandler from "./src/helpers/errorhandler.js";

dotenv.config();

const port = process.env.PORT || 8000;
const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health check route (important for Render)
app.get("/", (req, res) => {
  res.send("Server is running successfully!");
});

// Error handler middleware
app.use(errorHandler);

// Load all routes dynamically
const routeFiles = fs.readdirSync("./src/routes");

routeFiles.forEach((file) => {
  console.log(`Loading route file: ${file}`);
  import(`./src/routes/${file}`)
    .then((route) => {
      console.log(`✅ Successfully loaded ${file}`);
      app.use("/api/v1", route.default);
    })
    .catch((err) => {
      console.log(`❌ Failed to load route file ${file}:`, err.message);
    });
});

// Start the server
const server = async () => {
  try {
    await connect();
    app.listen(port, "0.0.0.0", () => {
      console.log(`✅ Server is running on port ${port}`);
    });
  } catch (error) {
    console.log("❌ Failed to start server:", error.message);
    process.exit(1);
  }
};

server();
