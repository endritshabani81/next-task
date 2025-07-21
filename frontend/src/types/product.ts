export interface Product {
  id: string;
  name: string;
  description: string;
  tags: string[];
  price: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface CreateProductDto {
  name: string;
  description: string;
  tags: string[];
  price: number;
}

export interface UpdateProductDto {
  name?: string;
  description?: string;
  tags?: string[];
  price?: number;
}

export interface ApiError {
  error: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface AuthToken {
  token: string;
}

export interface TagSuggestionRequest {
  name: string;
  description: string;
}

export interface TagSuggestionResponse {
  suggestedTags: string[];
}
