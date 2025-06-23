// src/routes/index.ts
import { createBrowserRouter } from 'react-router-dom';
import React, { lazy } from 'react'; // Import lazy from React
import CategoryDetailsPage from '../pages/admin/CategoryDetailsPage';

// Lazy load your page components
const Home = lazy(() => import('../pages/user/Home'));
const Login = lazy(() => import('../pages/Login'));
const Register = lazy(() => import('../pages/user/Register'));
const ProtectedRoute = lazy(() => import('../components/ProtectedRoute'));
const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'));
const CategoryCommissionManagement = lazy(() => import('../pages/admin/Category'));
// Assuming CategoryForm is in Add&EditCategory.tsx based on your snippet comments
const CategoryForm = lazy(() => import('../pages/admin/Add&EditCategory'));
// Assuming ServiceForm is in subCategoryForm.tsx based on your snippet comments
const ServiceForm = lazy(() => import('../pages/admin/subCategoryForm'));
// const CategoryDetailsPage = lazy(() => import('../pages/admin/CategoryDetailsPage')); // Assuming you have this from previous steps

// Note: dummyEditCategoryData is removed from here.
// CategoryForm will now fetch its own data based on URL params for editing.

const router = createBrowserRouter([
  { path: '/', element: <Home /> },
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
  // Protected routes for admin
  {
    element: <ProtectedRoute roles={['Admin']} />,
    children: [
      { path: '/admin', element: <AdminDashboard /> },
      { path: '/admin/categories', element: <CategoryCommissionManagement /> },
      { path: '/admin/categories/new', element: <CategoryForm /> },
      { path: '/admin/categories/view/:categoryId', element: <CategoryDetailsPage />},
      // The :categoryId param is automatically available via useParams in CategoryForm
      { path: '/admin/categories/edit/:categoryId', element: <CategoryForm /> },
      // { path: '/admin/categories/view/:id', element: <CategoryDetailsPage /> }, // Route for viewing category details
      { path: '/admin/subcategories/new/:parentId', element: <ServiceForm /> },
      // Add route for editing subcategories if needed, similar to category edit
      // { path: '/admin/subcategories/edit/:parentId/:subcategoryId', element: <ServiceForm /> },
    ],
  },
]);

export default router;