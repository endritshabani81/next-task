import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { isAuthenticated } from "./api/client";
import LoginPage from "./pages/LoginPage";
import ProductListPage from "./pages/ProductListPage";
import ProductFormPage from "./pages/ProductFormPage";
import DeletedProductsPage from "./pages/DeletedProductsPage";
import Layout from "./components/Layout";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen h-full bg-gray-50">
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ProductListPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/products"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ProductListPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/products/new"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ProductFormPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/products/:id/edit"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ProductFormPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/products/deleted"
              element={
                <ProtectedRoute>
                  <Layout>
                    <DeletedProductsPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
