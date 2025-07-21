import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { getDeletedProducts, restoreProduct } from "../api/products";
import type { Product } from "../types/product";

const DeletedProductsPage = () => {
  const [restoreModalOpen, setRestoreModalOpen] = useState(false);
  const [productToRestore, setProductToRestore] = useState<Product | null>(
    null
  );
  const queryClient = useQueryClient();

  const {
    data: deletedProducts = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["deleted-products"],
    queryFn: getDeletedProducts,
  });

  const restoreMutation = useMutation({
    mutationFn: restoreProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["deleted-products"] });
      setRestoreModalOpen(false);
      setProductToRestore(null);
    },
    onError: (error) => {
      console.error("Error restoring product:", error);
    },
  });

  const handleRestoreClick = (product: Product) => {
    setProductToRestore(product);
    setRestoreModalOpen(true);
  };

  const handleRestoreConfirm = () => {
    if (productToRestore) {
      restoreMutation.mutate(productToRestore.id);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Error loading deleted products</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 btn btn-primary"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Deleted Products
            </h1>
            <p className="mt-2 text-gray-600">
              Manage and restore soft-deleted products
            </p>
          </div>
          <Link to="/products" className="btn btn-secondary">
            ← Back to Products
          </Link>
        </div>
      </div>

      {deletedProducts.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg
              className="mx-auto h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No deleted products
          </h3>
          <p className="text-gray-600">
            Products that are deleted will appear here and can be restored.
          </p>
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Deleted At
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {deletedProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {product.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {product.description.length > 60
                          ? `${product.description.substring(0, 60)}...`
                          : product.description}
                      </div>
                      <div className="mt-1">
                        {product.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 mr-1"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {formatPrice(product.price)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {product.deletedAt && formatDate(product.deletedAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleRestoreClick(product)}
                      disabled={restoreMutation.isPending}
                      className="text-green-600 hover:text-green-900 disabled:opacity-50"
                    >
                      Restore
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {restoreModalOpen && productToRestore && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <svg
                  className="h-6 w-6 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </div>
              <h3 className="ml-2 text-lg font-medium text-gray-900">
                Restore Product
              </h3>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to restore "{productToRestore.name}"? This
              product will be moved back to the active products list.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setRestoreModalOpen(false);
                  setProductToRestore(null);
                }}
                disabled={restoreMutation.isPending}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleRestoreConfirm}
                disabled={restoreMutation.isPending}
                className="btn bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
              >
                {restoreMutation.isPending ? "Restoring..." : "Restore"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeletedProductsPage;
