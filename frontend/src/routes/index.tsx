import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import ProtectedRoute from '../components/ProtectedRoute';
import AdminDashboard from '../pages/AdminDashboard'; // Placeholder for later

const router = createBrowserRouter([
  { path: '/', element: <Home /> },
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
  {
    element: <ProtectedRoute roles={['Admin']} />,
    children: [{ path: '/admin', element: <AdminDashboard /> }],
  },
]);

const AppRoutes = () => <RouterProvider router={router} />;
export default AppRoutes;