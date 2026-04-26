const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

const postRoutes = require("./routes/postRoutes");
const logger = require("./middleware/logger");
const errorHandler = require("./middleware/errorHandler");

dotenv.config();

const app = express();
const projectRoot = path.resolve(__dirname, "..");
const port = process.env.PORT || 5000;

let cachedDb = null;
let cachedConnectionPromise = null;

async function connectToDatabase() {
  if (cachedDb) {
    return cachedDb;
  }

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is missing in the environment.");
  }

  if (!cachedConnectionPromise) {
    cachedConnectionPromise = mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
  }

  try {
    cachedDb = await cachedConnectionPromise;
    return cachedDb;
  } catch (error) {
    cachedConnectionPromise = null;
    throw error;
  }
}

app.set("trust proxy", true);

const configuredOrigins = (process.env.CLIENT_ORIGIN || "https://infozap-omega.vercel.app")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    if (!origin) {
      callback(null, true);
      return;
    }

    try {
      const parsedOrigin = new URL(origin);
      const isConfiguredOrigin = configuredOrigins.includes(origin);
      const isLocalOrigin = ["localhost", "127.0.0.1"].includes(parsedOrigin.hostname);
      const isVercelOrigin = parsedOrigin.hostname === "infozap-omega.vercel.app"
        || parsedOrigin.hostname.endsWith(".vercel.app");

      if (isConfiguredOrigin || isLocalOrigin || isVercelOrigin) {
        callback(null, true);
        return;
      }
    } catch (error) {
      // Ignore parse failures and fall through to the block below.
    }

    callback(null, true);
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

const ensureDatabaseConnection = async (req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (error) {
    error.statusCode = error.statusCode || 500;
    next(error);
  }
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger);
app.use(express.static(projectRoot));

app.get("/", (req, res) => {
  res.sendFile(path.join(projectRoot, "index.html"));
});

app.get(["/about", "/about.html"], (req, res) => {
  res.sendFile(path.join(projectRoot, "about.html"));
});

app.get(["/category", "/category.html"], (req, res) => {
  res.sendFile(path.join(projectRoot, "category.html"));
});

app.get(["/compose", "/compose.html"], (req, res) => {
  res.sendFile(path.join(projectRoot, "compose.html"));
});

app.get(["/post", "/post.html"], (req, res) => {
  res.sendFile(path.join(projectRoot, "post.html"));
});

app.get("/api", (req, res) => {
  res.json({
    success: true,
    message: "Infozap API is running.",
  });
});

app.use("/api/posts", ensureDatabaseConnection, postRoutes);

app.use((req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
});

app.use(errorHandler);

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Infozap backend running on port ${port}`);
  });
}

module.exports = app;

