import "reflect-metadata";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { initializeDatabase } from "./config/database";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("combined"));

app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "Product Metadata Microservice is running!",
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

app.get("/health", (req: Request, res: Response) => {
  res.json({
    status: "healthy",
    service: "product-metadata-service",
    timestamp: new Date().toISOString(),
  });
});

// Global error handler
app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  console.error("Error:", error);

  // Handle validation errors
  if (error.name === "ValidationError" || error.isJoi) {
    return res.status(400).json({
      error: "Validation Error",
      message: "Request validation failed",
      details: error.details || error.message,
    });
  }

  // Handle database connection errors
  if (
    error.message &&
    (error.message.includes("connect") || error.message.includes("database"))
  ) {
    return res.status(503).json({
      error: "Service Unavailable",
      message: "Database connection error",
    });
  }

  // Handle 404 errors
  if (error.status === 404) {
    return res.status(404).json({
      error: "Not Found",
      message: error.message || "Resource not found",
    });
  }

  // Generic error response
  res.status(error.status || 500).json({
    error: "Internal Server Error",
    message: error.message || "An unexpected error occurred",
  });
});

// 404 handler for unmatched routes
app.use("*", (req: Request, res: Response) => {
  res.status(404).json({
    error: "Not Found",
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

const start = async () => {
  try {
    const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 8080;
    const host = process.env.HOST || "0.0.0.0";

    await initializeDatabase();
    console.log("Database initialized successfully");

    app.listen(port, host, () => {
      console.log(`Server listening on ${host}:${port}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
};

start();
