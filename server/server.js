const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

const authRouter = require("./routes/auth");

dotenv.config();

function validateEnvironment() {
  const requiredVariables = ["MONGO_URI", "JWT_SECRET"];
  const missingVariables = requiredVariables.filter((name) => !process.env[name]);

  if (missingVariables.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVariables.join(", ")}`);
  }
}

async function connectToDatabase(connectionString) {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  return mongoose.connect(connectionString);
}

function createServer() {
  const app = express();
  const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim());

  app.use(
    cors({
      origin: allowedOrigins,
      credentials: true,
    }),
  );
  app.use(express.json());

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/api/auth", authRouter);

  app.use((error, _req, res, _next) => {
    console.error(error);
    res.status(500).json({
      message: "Unexpected server error.",
    });
  });

  return app;
}

async function startServer() {
  validateEnvironment();

  const port = Number(process.env.PORT || 5000);
  const app = createServer();

  await connectToDatabase(process.env.MONGO_URI);

  app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
  });
}

if (require.main === module) {
  startServer().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}

module.exports = {
  connectToDatabase,
  createServer,
  startServer,
};

