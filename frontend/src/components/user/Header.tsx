import React, { useState } from 'react'; // React is automatically imported in newer versions but good practice
import { Link, useNavigate } from 'react-router-dom';
import ThemeToggle from '../ThemeToggle'; // Assuming this exists
import { useAppSelector } from '../../hooks/useAppSelector';
import { logout } from '../../features/auth/authSlice';
import { useAppDispatch } from '../../hooks/useAppDispatch';

const Header = () => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { user, isAuthenticated } = useAppSelector(state => state.auth);

    // Close dropdown when clicking outside
    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (isDropdownOpen && !event.target.closest('.relative')) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isDropdownOpen]);

    const handleLogout = () => {
        const confirmLogout = window.confirm('Are you sure you want to logout?');
        if (confirmLogout) {
            dispatch(logout());
            setIsDropdownOpen(false);
            navigate('/login');
        }
    };

    // Use isAuthenticated directly, no need for a separate isLoggedIn constant
    // const isLoggedIn = isAuthenticated; // Can remove this line

    return (
        <header className="fixed w-full top-0 z-50 bg-white dark:bg-gray-800 shadow-sm">
            <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
                <div className="flex items-center space-x-8">
                    <Link to="/" className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        QuickMate
                    </Link>
                    <div className="hidden md:flex space-x-6">
                        <Link to="/" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium">Home</Link>
                        <Link to="/services" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium">Services</Link>
                        <Link to="/providers" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium">Providers</Link>
                        <Link to="/about" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium">About Us</Link>
                    </div>
                </div>

                <div className="flex items-center space-x-4">
                    <ThemeToggle />
                    {/* Conditional rendering for Login/Register or User Dropdown */}
                    {isAuthenticated ? ( // Using isAuthenticated directly
                        <div className="relative">
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none"
                            >
                                <img src="https://via.placeholder.com/32" alt="User Avatar" className="w-8 h-8 rounded-full" />
                                {/* This is where the username is displayed */}
                                <span>{user?.name || 'My Account'}</span> 
                                <svg className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                </svg>
                            </button>
                            {isDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-md shadow-lg py-1 z-10">
                                    <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600">Profile</Link>
                                    <Link to="/dashboard" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600">Dashboard</Link>
                                    {user?.role === 'Admin' && <Link to="/admin" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600">Admin Panel</Link>}
                                    <button onClick={handleLogout} className="w-full text-left block px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-600">Logout</button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-x-2 hidden sm:block"> {/* Hide on small screens to avoid clutter */}
                            <Link to="/login">
                                <button className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium px-3 py-2 rounded-md">
                                    Login
                                </button>
                            </Link>
                            <Link to="/register">
                                <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-200">
                                    Register
                                </button>
                            </Link>
                        </div>
                    )}
                </div>
            </nav>
        </header>
    );
};

export default Header;