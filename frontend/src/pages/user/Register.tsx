import { useState, useEffect } from 'react'; // Import useEffect
import { authService } from '../../services/authService';
import { useNavigate, Link } from 'react-router-dom';
import ThemeToggle from '../../components/ThemeToggle';
import { useAppSelector } from '../../hooks/useAppSelector'; // Import useAppSelector
import { useAppDispatch } from '../../hooks/useAppDispatch'; // Import useAppDispatch
import { login } from '../../features/auth/authSlice';
import { toast } from 'react-toastify'; // Import toast

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState(''); // Added confirmPassword state
    const [role, setRole] = useState('Customer'); // Default to Customer
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    // Get authentication state from Redux
    const { isAuthenticated, user } = useAppSelector((state) => state.auth);

    // --- Redirection Logic for already logged-in users ---
    useEffect(() => {
        if (isAuthenticated) {
            // Redirect based on user role
            if (user?.role === 'Admin') {
                navigate('/admin', { replace: true });
            } else {
                navigate('/', { replace: true }); // Default to homepage for 'Customer' or 'ServiceProvider'
            }
            toast.info('You are already logged in!');
        }
    }, [isAuthenticated, user, navigate]); // Dependencies: re-run if these states change

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) { // Add password confirmation check
            setError('Passwords do not match');
            toast.error('Passwords do not match');
            return;
        }

        setLoading(true); // Set loading to true
        setError(''); // Clear previous errors
        try {
            const { user, token } = await authService.register(name, email, password, role);
            dispatch(login({ user, token }));
            // Navigation after successful registration is already handled by the useEffect above.
            // Removing this line for consistency and to prevent conflicts:
            // navigate(user.role === 'Admin' ? '/admin' : '/');
            toast.success(`Welcome to QuickMate, ${user.name}!`); // Show success toast on registration
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
            toast.error(err.response?.data?.message || 'Registration failed.');
        } finally {
            setLoading(false); // Set loading to false
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-emerald-100 dark:from-gray-950 dark:to-teal-950 p-4">
            <div className="relative bg-white dark:bg-gray-800 p-8 md:p-10 rounded-2xl shadow-xl w-full max-w-md transform transition-all duration-300 hover:shadow-2xl">
                {/* Theme Toggle */}
                <div className="absolute top-4 right-4">
                    <ThemeToggle />
                </div>

                <div className="text-center mb-8">
                    {/* QuickMate Branding */}
                    <h1 className="text-4xl font-extrabold text-teal-600 dark:text-teal-400 mb-2">
                        QuickMate
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 text-lg">
                        Join us to find or provide amazing services!
                    </p>
                </div>

                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 text-center">
                    Create Your QuickMate Account
                </h2>

                {error && (
                    <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-md relative mb-4" role="alert">
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label
                            htmlFor="name"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                        >
                            Full Name
                        </label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="mt-1 w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 focus:border-transparent transition duration-200"
                            placeholder="John Doe"
                            required
                        />
                    </div>
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
                            className="mt-1 w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 focus:border-transparent transition duration-200"
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
                            className="mt-1 w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 focus:border-transparent transition duration-200"
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    <div>
                        <label
                            htmlFor="confirm-password"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                        >
                            Confirm Password
                        </label>
                        <input
                            id="confirm-password"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="mt-1 w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 focus:border-transparent transition duration-200"
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    <div>
                        <label
                            htmlFor="role"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                        >
                            Account Type
                        </label>
                        <div className="relative"> {/* Added relative positioning for custom arrow */}
                            <select
                                id="role"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="mt-1 w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 appearance-none pr-8"
                            >
                                <option value="Customer">I need services (Customer)</option>
                                <option value="ServiceProvider">I offer services (Service Provider)</option>
                                {/* Note: 'Admin' role should ideally not be selectable here for security */}
                            </select>
                            {/* Custom arrow for select box */}
                            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400 dark:text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 text-white font-semibold py-3 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50"
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Registering...
                            </span>
                        ) : (
                            'Create My QuickMate Account!'
                        )}
                    </button>
                </form>

                <p className="text-center text-sm text-gray-600 dark:text-gray-300 mt-6">
                    Already have an account?{' '}
                    <Link to="/login" className="font-medium text-teal-600 hover:text-teal-500 dark:text-teal-400 dark:hover:text-teal-300">
                        Login here
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Register;