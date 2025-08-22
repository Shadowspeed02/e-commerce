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

// Serve static files in production
if (process.env.NODE_ENV === "production") {
  const buildPath = path.join(__dirname, "build");
  console.log('Static files directory:', buildPath);

  // First, verify the build directory exists
  if (!fs.existsSync(buildPath)) {
    console.error(`Build directory not found at: ${buildPath}`);
    fs.mkdirSync(buildPath, { recursive: true });
    console.log('Created build directory');
  }

  // List contents of build directory
  console.log('Build directory contents:', fs.readdirSync(buildPath));

  // Serve static files
  app.use(express.static(buildPath));

  // Handle client-side routing
  app.get("*", (req, res, next) => {
    // Skip API routes
    if (req.path.startsWith('/api')) {
      return next();
    }

    const indexPath = path.join(buildPath, "index.html");
    console.log('Attempting to serve:', indexPath);

    // Check if index.html exists
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath, (err) => {
        if (err) {
          console.error('Error sending file:', err);
          res.status(500).send('Error loading application');
        }
      });
    } else {
      console.error('index.html not found at:', indexPath);
      res.status(404).send('Application files not found');
    }
  });
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
