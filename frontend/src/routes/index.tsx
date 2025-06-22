import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Home from '../pages/user/Home';
import Login from '../pages/Login';
import Register from '../pages/user/Register';
import ProtectedRoute from '../components/ProtectedRoute';
import AdminDashboard from '../pages/admin/AdminDashboard'; // Placeholder for later
import CategoryCommissionManagement from '../pages/admin/Category';
import CategoryForm from '../pages/admin/Add&EditCategory';

// Dummy data for editing a category (in a real app, you'd fetch this from Redux state or an API)
  const dummyEditCategoryData = {
    _id: 'cat1',
    name: 'Home Cleaning',
    description: 'Comprehensive cleaning services for homes.',
    iconUrl: 'https://via.placeholder.com/80/60a5fa/ffffff?text=🧹',
    status: true,
    subCategories: ['Regular Cleaning', 'Deep Cleaning', 'Move-In/Out Cleaning'],
    commissionType: 'percentage' as 'percentage',
    commissionValue: 10,
    commissionStatus: true,
  };


const router = createBrowserRouter([
  { path: '/', element: <Home /> },
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
  {
    element: <ProtectedRoute roles={['Admin']} />,
    children: [
      { path: '/admin', element: <AdminDashboard /> },
      { path: '/admin/categories', element: <CategoryCommissionManagement /> },
      { path: '/admin/categories/new', element: <CategoryForm /> },
      { path: '/admin/categories/edit/:categoryId', element: <CategoryForm initialCategoryData={dummyEditCategoryData} /> },
      
    ],
  },
]);

const AppRoutes = () => <RouterProvider router={router} />;
export default AppRoutes;