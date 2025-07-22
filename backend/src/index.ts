import "reflect-metadata";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import { initializeDatabase } from "./config/database";
import { productRoutes } from "./routes/product.routes";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("combined"));

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Product Metadata API",
      description: "API for managing product metadata",
      version: "1.0.0",
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 8080}`,
        description: "Development server",
      },
    ],
    tags: [
      {
        name: "products",
        description: "Product related endpoints",
      },
    ],
    paths: {
      "/products": {
        get: {
          tags: ["products"],
          summary: "Get all products",
          responses: {
            "200": { description: "List of products" },
          },
          security: [{ bearerAuth: [] }],
        },
        post: {
          tags: ["products"],
          summary: "Create a new product",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["name", "description", "tags", "price"],
                  properties: {
                    name: { type: "string" },
                    description: { type: "string" },
                    tags: { type: "array", items: { type: "string" } },
                    price: { type: "number" },
                  },
                },
              },
            },
          },
          responses: {
            "201": { description: "Product created" },
          },
          security: [{ bearerAuth: [] }],
        },
      },
      "/products/{id}": {
        get: {
          tags: ["products"],
          summary: "Get product by ID",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            "200": { description: "Product found" },
          },
          security: [{ bearerAuth: [] }],
        },
        put: {
          tags: ["products"],
          summary: "Update product",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    description: { type: "string" },
                    tags: { type: "array", items: { type: "string" } },
                    price: { type: "number" },
                  },
                },
              },
            },
          },
          responses: {
            "200": { description: "Product updated" },
          },
          security: [{ bearerAuth: [] }],
        },
        delete: {
          tags: ["products"],
          summary: "Soft delete product",
          description:
            "Marks a product as deleted without permanently removing it",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            "204": { description: "Product soft deleted successfully" },
          },
          security: [{ bearerAuth: [] }],
        },
      },
      "/products/{id}/restore": {
        patch: {
          tags: ["products"],
          summary: "Restore soft-deleted product",
          description: "Restores a previously soft-deleted product",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            "200": { description: "Product restored successfully" },
            "404": { description: "Product not found" },
            "400": { description: "Product is not deleted" },
          },
          security: [{ bearerAuth: [] }],
        },
      },
      "/products/deleted": {
        get: {
          tags: ["products"],
          summary: "Get all soft-deleted products",
          description: "Retrieves all products that have been soft-deleted",
          responses: {
            "200": { description: "List of deleted products" },
          },
          security: [{ bearerAuth: [] }],
        },
      },
      "/suggest-tags": {
        post: {
          tags: ["products"],
          summary: "Get AI-powered tag suggestions",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["name", "description"],
                  properties: {
                    name: { type: "string" },
                    description: { type: "string" },
                  },
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Tag suggestions generated",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      suggestedTags: {
                        type: "array",
                        items: { type: "string" },
                      },
                    },
                  },
                },
              },
            },
          },
          security: [{ bearerAuth: [] }],
        },
      },
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
        },
      },
    },
  },
  apis: [],
};

const swaggerSpec = swaggerOptions.definition;

app.get("/api-docs.json", (req: Request, res: Response) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

app.use(
  "/docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "Product Metadata API Documentation",
  })
);

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

app.use("/", productRoutes);

app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  console.error("Error:", error);

  if (error.name === "ValidationError" || error.isJoi) {
    return res.status(400).json({
      error: "Validation Error",
      message: "Request validation failed",
      details: error.details || error.message,
    });
  }

  if (
    error.message &&
    (error.message.includes("connect") || error.message.includes("database"))
  ) {
    return res.status(503).json({
      error: "Service Unavailable",
      message: "Database connection error",
    });
  }

  if (error.status === 404) {
    return res.status(404).json({
      error: "Not Found",
      message: error.message || "Resource not found",
    });
  }

  res.status(error.status || 500).json({
    error: "Internal Server Error",
    message: error.message || "An unexpected error occurred",
  });
});

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
      console.log(`API Documentation available at http://${host}:${port}/docs`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
};

start();
