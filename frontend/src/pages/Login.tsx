import { useState } from 'react';
import { authService } from '../services/authService';
import { useNavigate, Link } from 'react-router-dom'; // Added Link
import ThemeToggle from '../components/ThemeToggle';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { login } from '../features/auth/authSlice';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // Added loading state
  const navigate = useNavigate();
  const dispatch = useAppDispatch();


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); // Set loading to true on submit
    setError(''); // Clear previous errors
    try {
      const { user, token } = await authService.login(email, password);
      dispatch(login({user, token}))
      navigate(user.role === 'Admin' ? '/admin' : '/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false); // Set loading to false after attempt
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-100 dark:from-gray-950 dark:to-gray-850 p-4">
      <div className="relative bg-white dark:bg-gray-800 p-8 md:p-10 rounded-2xl shadow-xl w-full max-w-md transform transition-all duration-300 hover:shadow-2xl">
        {/* Theme Toggle */}
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>

        <div className="text-center mb-8">
          {/* QuickMate Branding */}
          <h1 className="text-4xl font-extrabold text-blue-600 dark:text-blue-400 mb-2">
            QuickMate
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Login as a Service Provider
          </p>
        </div>

        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 text-center">
          Access Your Account
        </h2>

        {error && (
          <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-md relative mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition duration-200"
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition duration-200"
              placeholder="••••••••"
              required
            />
          </div>

          <div className="flex justify-end text-sm">
            <Link to="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold py-3 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            disabled={loading} // Disable button when loading
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Logging In...
              </span>
            ) : (
              'Login to QuickMate'
            )}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 dark:text-gray-300 mt-6">
          New to QuickMate?{' '}
          <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;