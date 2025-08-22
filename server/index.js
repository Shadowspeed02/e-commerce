import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import * as dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import UserRouter from "./routes/User.js";
import ProductRoutes from "./routes/Products.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));

//error handel
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || "Something went wrong";
  return res.status(status).json({
    success: false,
    status,
    message,
  });
});

// API routes
app.use("/api/user/", UserRouter);
app.use("/api/products/", ProductRoutes);

// Then handle static files and client routing
if (process.env.NODE_ENV === "production") {
  console.log('Current directory:', __dirname);
  console.log('Project root:', PROJECT_ROOT);
  
  // Try multiple possible build locations
  const buildPaths = [
    path.join(PROJECT_ROOT, 'client/build'),
    path.join(PROJECT_ROOT, 'build'),
    path.join(__dirname, 'build'),
    path.join(process.cwd(), 'client/build')
  ];

  let buildPath = null;
  for (const path of buildPaths) {
    console.log('Checking build path:', path);
    if (fs.existsSync(path)) {
      buildPath = path;
      console.log('Found build directory at:', buildPath);
      break;
    }
  }

  if (buildPath) {
    // Serve static files
    app.use(express.static(buildPath));

    // Handle client-side routing
    app.get("*", (req, res, next) => {
      if (req.path.startsWith('/api')) {
        return next();
      }
      res.sendFile(path.join(buildPath, "index.html"), (err) => {
        if (err) {
          console.error('Error sending file:', err);
          res.status(500).send('Error loading application');
        }
      });
    });
  } else {
    console.error('No build directory found in any of the expected locations');
    app.get("*", (req, res) => {
      if (!req.path.startsWith('/api')) {
        res.status(404).send('Build files not found');
      }
    });
  }
} else {
  app.get("/", (req, res) => {
    res.status(200).json({
      message: "Hello GFG Developers",
    });
  });
}

const connectDB = () => {
  mongoose.set("strictQuery", true);
  mongoose
    .connect(process.env.MODNO_DB)
    .then(() => console.log("Connected to MONGO DB"))
    .catch((err) => {
      console.error("failed to connect with mongo");
      console.error(err);
    });
};

const startServer = async () => {
  try {
    connectDB();
    const PORT = process.env.PORT || 8080;
    app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
  } catch (error) {
    console.log(error);
  }
};

startServer();
