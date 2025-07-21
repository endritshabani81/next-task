import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getProductById,
  createProduct,
  updateProduct,
  suggestTags,
} from "../api/products";
import type { CreateProductDto, UpdateProductDto } from "../types/product";

interface FormData {
  name: string;
  description: string;
  tags: string;
  price: string;
}

interface FormErrors {
  name?: string;
  description?: string;
  tags?: string;
  price?: string;
}

const ProductFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    tags: "",
    price: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  const {
    data: product,
    isLoading: isLoadingProduct,
    error: loadError,
  } = useQuery({
    queryKey: ["product", id],
    queryFn: () => getProductById(id!),
    enabled: isEdit,
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description,
        tags: product.tags.join(", "),
        price: product.price.toString(),
      });
    }
  }, [product]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      navigate("/products");
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductDto }) =>
      updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product", id] });
      navigate("/products");
    },
  });

  // Tag suggestion mutation
  const tagSuggestionMutation = useMutation({
    mutationFn: suggestTags,
    onSuccess: (data) => {
      setFormData((prev) => ({
        ...prev,
        tags: data.suggestedTags.join(", "),
      }));
    },
    onError: (error) => {
      console.error("Error getting tag suggestions:", error);
      // You could show a toast notification here
    },
  });

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Product name is required";
    } else if (formData.name.length > 255) {
      newErrors.name = "Product name must be 255 characters or less";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    } else if (formData.description.length > 1000) {
      newErrors.description = "Description must be 1000 characters or less";
    }

    if (!formData.tags.trim()) {
      newErrors.tags = "At least one tag is required";
    }

    const price = parseFloat(formData.price);
    if (!formData.price.trim()) {
      newErrors.price = "Price is required";
    } else if (isNaN(price) || price <= 0) {
      newErrors.price = "Price must be a positive number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const tagsArray = formData.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    const productData: CreateProductDto = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      tags: tagsArray,
      price: parseFloat(formData.price),
    };

    if (isEdit && id) {
      updateMutation.mutate({ id, data: productData });
    } else {
      createMutation.mutate(productData);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSuggestTags = async () => {
    if (!formData.name.trim() || !formData.description.trim()) {
      alert("Please enter a product name and description first");
      return;
    }

    setIsLoadingSuggestions(true);
    tagSuggestionMutation.mutate({
      name: formData.name.trim(),
      description: formData.description.trim(),
    });
    setIsLoadingSuggestions(false);
  };

  if (isEdit && isLoadingProduct) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isEdit && loadError) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <div className="text-sm text-red-700">
          Error loading product: {loadError.message}
        </div>
      </div>
    );
  }

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white shadow-sm rounded-lg p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {isEdit ? "Edit Product" : "Create New Product"}
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            {isEdit
              ? "Update the product information below."
              : "Fill in the details to create a new product."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product Name */}
          <div>
            <label htmlFor="name" className="label">
              Product Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`input ${
                errors.name
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                  : ""
              }`}
              placeholder="Enter product name"
              disabled={isLoading}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="label">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className={`input ${
                errors.description
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                  : ""
              }`}
              placeholder="Enter product description"
              disabled={isLoading}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          {/* Tags */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="tags" className="label">
                Tags * (comma-separated)
              </label>
              <button
                type="button"
                onClick={handleSuggestTags}
                disabled={
                  isLoading ||
                  isLoadingSuggestions ||
                  tagSuggestionMutation.isPending
                }
                className="text-sm btn btn-secondary py-1 px-2"
              >
                {isLoadingSuggestions || tagSuggestionMutation.isPending
                  ? "Suggesting..."
                  : "🤖 Auto-Suggest Tags"}
              </button>
            </div>
            <input
              type="text"
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleInputChange}
              className={`input ${
                errors.tags
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                  : ""
              }`}
              placeholder="e.g., electronics, gadget, wireless"
              disabled={isLoading}
            />
            {errors.tags && (
              <p className="mt-1 text-sm text-red-600">{errors.tags}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              Separate multiple tags with commas
            </p>
          </div>

          {/* Price */}
          <div>
            <label htmlFor="price" className="label">
              Price * (USD)
            </label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              step="0.01"
              min="0"
              className={`input ${
                errors.price
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                  : ""
              }`}
              placeholder="0.00"
              disabled={isLoading}
            />
            {errors.price && (
              <p className="mt-1 text-sm text-red-600">{errors.price}</p>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <Link to="/products" className="btn btn-secondary">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading
                ? isEdit
                  ? "Updating..."
                  : "Creating..."
                : isEdit
                ? "Update Product"
                : "Create Product"}
            </button>
          </div>
        </form>

        {/* Error Messages */}
        {(createMutation.error || updateMutation.error) && (
          <div className="mt-4 rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-700">
              {createMutation.error?.message || updateMutation.error?.message}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductFormPage;
