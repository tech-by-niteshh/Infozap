const path = require("path");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const connectDB = require("./config/db");
const postRoutes = require("./routes/postRoutes");
const logger = require("./middleware/logger");
const errorHandler = require("./middleware/errorHandler");

dotenv.config();

const app = express();
const projectRoot = path.resolve(__dirname, "..");
const port = process.env.PORT || 5000;

app.set("trust proxy", true);

const configuredOrigins = (process.env.CLIENT_ORIGIN || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const isAllowedOrigin = (origin) => {
  if (!origin) {
    return true;
  }

  if (configuredOrigins.length === 0) {
    return true;
  }

  if (configuredOrigins.includes(origin)) {
    return true;
  }

  try {
    const parsedOrigin = new URL(origin);
    return ["localhost", "127.0.0.1"].includes(parsedOrigin.hostname);
  } catch (error) {
    return false;
  }
};

const ensureDatabaseConnection = async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    error.statusCode = error.statusCode || 500;
    next(error);
  }
};

app.use(
  cors({
    origin(origin, callback) {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);
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
