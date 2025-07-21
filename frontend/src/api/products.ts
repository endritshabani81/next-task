import type {
  Product,
  CreateProductDto,
  UpdateProductDto,
  TagSuggestionRequest,
  TagSuggestionResponse,
} from "../types/product";
import { apiClient } from "./client";

// Product CRUD operations
export const getAllProducts = async (): Promise<Product[]> => {
  return apiClient.get<Product[]>("/products");
};

export const getProductById = async (id: string): Promise<Product> => {
  return apiClient.get<Product>(`/products/${id}`);
};

export const createProduct = async (
  data: CreateProductDto
): Promise<Product> => {
  return apiClient.post<Product>("/products", data);
};

export const updateProduct = async (
  id: string,
  data: UpdateProductDto
): Promise<Product> => {
  return apiClient.put<Product>(`/products/${id}`, data);
};

export const deleteProduct = async (id: string): Promise<void> => {
  return apiClient.delete<void>(`/products/${id}`);
};

// AI Tag suggestions
export const suggestTags = async (
  data: TagSuggestionRequest
): Promise<TagSuggestionResponse> => {
  return apiClient.post<TagSuggestionResponse>("/suggest-tags", data);
};

// Health check
export const healthCheck = async (): Promise<{
  status: string;
  service: string;
  timestamp: string;
}> => {
  return apiClient.get("/health");
};

// Soft delete operations
export const getDeletedProducts = async (): Promise<Product[]> => {
  return apiClient.get<Product[]>("/products/deleted");
};

export const restoreProduct = async (id: string): Promise<Product> => {
  return apiClient.patch<Product>(`/products/${id}/restore`);
};
