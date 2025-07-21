import { Router, Request, Response, NextFunction } from "express";
import { validate } from "class-validator";
import { plainToInstance } from "class-transformer";
import { AppDataSource } from "../config/database";
import { Product } from "../entity/Product";
import { CreateProductDto, UpdateProductDto } from "../dto/product.dto";
import { TagSuggestionDto } from "../dto/tag-suggestion.dto";
import { authMiddleware } from "../middleware/auth.middleware";
import { AiService } from "../services/ai.service";

const router = Router();

const getProductRepository = () => AppDataSource.getRepository(Product);

router.post(
  "/products",
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto = plainToInstance(CreateProductDto, req.body);
      const errors = await validate(dto);

      if (errors.length > 0) {
        return res.status(400).json({
          error: "Validation failed",
          details: errors.map((error) => ({
            property: error.property,
            constraints: error.constraints,
          })),
        });
      }

      const productRepository = getProductRepository();
      const product = productRepository.create(dto);
      const savedProduct = await productRepository.save(product);

      res.status(201).json(savedProduct);
    } catch (error) {
      console.error("Error creating product:", error);
      next(error);
    }
  }
);

router.get(
  "/products",
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const productRepository = getProductRepository();
      const products = await productRepository.find();
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      next(error);
    }
  }
);

router.get(
  "/products/deleted",
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const productRepository = getProductRepository();
      const deletedProducts = await productRepository
        .createQueryBuilder("product")
        .where("product.deletedAt IS NOT NULL")
        .withDeleted()
        .getMany();

      res.json(deletedProducts);
    } catch (error) {
      console.error("Error fetching deleted products:", error);
      next(error);
    }
  }
);

router.get(
  "/products/:id",
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const productRepository = getProductRepository();
      const product = await productRepository.findOne({ where: { id } });

      if (!product) {
        return res.status(404).json({
          error: "Product not found",
          message: `Product with ID ${id} does not exist`,
        });
      }

      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      next(error);
    }
  }
);

router.put(
  "/products/:id",
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const dto = plainToInstance(UpdateProductDto, req.body);
      const errors = await validate(dto);

      if (errors.length > 0) {
        return res.status(400).json({
          error: "Validation failed",
          details: errors.map((error) => ({
            property: error.property,
            constraints: error.constraints,
          })),
        });
      }

      const productRepository = getProductRepository();
      const product = await productRepository.findOne({ where: { id } });

      if (!product) {
        return res.status(404).json({
          error: "Product not found",
          message: `Product with ID ${id} does not exist`,
        });
      }

      Object.assign(product, dto);
      const updatedProduct = await productRepository.save(product);

      res.json(updatedProduct);
    } catch (error) {
      console.error("Error updating product:", error);
      next(error);
    }
  }
);

router.delete(
  "/products/:id",
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const productRepository = getProductRepository();
      const product = await productRepository.findOne({ where: { id } });

      if (!product) {
        return res.status(404).json({
          error: "Product not found",
          message: `Product with ID ${id} does not exist`,
        });
      }

      await productRepository.softRemove(product);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting product:", error);
      next(error);
    }
  }
);

router.patch(
  "/products/:id/restore",
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const productRepository = getProductRepository();

      const product = await productRepository.findOne({
        where: { id },
        withDeleted: true,
      });

      if (!product) {
        return res.status(404).json({
          error: "Product not found",
          message: `Product with ID ${id} does not exist`,
        });
      }

      if (!product.deletedAt) {
        return res.status(400).json({
          error: "Product not deleted",
          message: "Product is not currently deleted and cannot be restored",
        });
      }

      await productRepository.restore(id);

      const restoredProduct = await productRepository.findOne({
        where: { id },
      });

      res.json(restoredProduct);
    } catch (error) {
      console.error("Error restoring product:", error);
      next(error);
    }
  }
);

router.post(
  "/suggest-tags",
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto = plainToInstance(TagSuggestionDto, req.body);
      const errors = await validate(dto);

      if (errors.length > 0) {
        return res.status(400).json({
          error: "Validation failed",
          details: errors.map((error) => ({
            property: error.property,
            constraints: error.constraints,
          })),
        });
      }

      const aiService = new AiService();
      const suggestedTags = await aiService.suggestTags(
        dto.name,
        dto.description
      );

      res.json({ suggestedTags });
    } catch (error) {
      console.error("Error generating tag suggestions:", error);

      if (error instanceof Error) {
        if (
          error.message.includes("network") ||
          error.message.includes("fetch")
        ) {
          return res.status(503).json({
            error: "Service Unavailable",
            message:
              "AI service is currently unavailable. Please try again later.",
          });
        }

        if (error.message.includes("timeout")) {
          return res.status(408).json({
            error: "Request Timeout",
            message: "AI service response timed out. Please try again.",
          });
        }
      }

      next(error);
    }
  }
);

export { router as productRoutes };
