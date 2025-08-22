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

// Serve static files from the React app
if (process.env.NODE_ENV === "production") {
  // Log the current directory and build path for debugging
  console.log('Current directory:', __dirname);
  const clientBuildPath = path.resolve(__dirname, "build");
  console.log('Build path:', clientBuildPath);
  
  // Serve static files
  app.use(express.static(clientBuildPath));

  // Handle all other routes by serving index.html
  app.get("*", (req, res) => {
    const indexPath = path.join(clientBuildPath, "index.html");
    console.log('Attempting to serve:', indexPath);
    
    // Check if the file exists before sending
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      console.error('index.html not found at:', indexPath);
      res.status(404).send('Build files not found');
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
