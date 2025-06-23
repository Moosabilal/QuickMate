// src/pages/admin/CategoryCommissionManagement.tsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// import { useAppSelector } from '../../hooks/useAppSelector'; // Uncomment if using Redux
// import { useAppDispatch } from '../../hooks/useAppDispatch'; // Uncomment if using Redux
// import { logout } from '../../features/auth/authSlice'; // Uncomment if using Redux
import Sidebar from '../../components/admin/sidebar';
import Header from '../../components/admin/Header';
import { categoryService } from '../../services/categoryService'; // Import your backend service

// Import types from your centralized types file
import { ICategoryResponse, ICommissionRuleResponse } from '../../types/category';

// Define a combined type for categories as displayed in this table
// This will align with what getAllTopLevelCategoriesWithDetails returns
interface CategoryTableDisplay extends ICategoryResponse {
    // Corrected: Make subCategoryCount optional here to match ICategoryResponse
    subCategoriesCount?: number | undefined;
    commissionRule?: ICommissionRuleResponse | null;
}

const CategoryCommissionManagement = () => {
    const navigate = useNavigate();

    // State for fetched data
    const [categories, setCategories] = useState<CategoryTableDisplay[]>([]);
    const [globalCommissionRate, setGlobalCommissionRate] = useState<number>(0); // Initialize with 0 or a default
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Dummy Earnings Summary (keeping it for now as it's not part of the backend fetch logic here)
    const dummyEarningsSummary = {
        totalCommissionRevenue: '₹50,000',
        totalCommissionRevenueChange: '+10%',
        averageCommissionPerBooking: '₹25',
        averageCommissionPerBookingChange: '-5%',
        totalBookings: '2,000',
        totalBookingsChange: '+15%',
        commissionDeductionsToProviders: '₹5,000',
        commissionDeductionsToProvidersChange: '-2%',
    };
    const [showDeductions, setShowDeductions] = useState(true); // State for earnings summary toggle


    // Effect to fetch categories and global commission rate on component mount
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // Fetch top-level categories with subcategory counts and commission details
                // The type assertion here becomes valid after fixing CategoryTableDisplay
                // Using getAllTopLevelCategoriesWithDetails as per the repository update
                const fetchedCategories: CategoryTableDisplay[] = await categoryService.getAllCategories();
                console.log("Fetched categories:", fetchedCategories);
                setCategories(fetchedCategories);

                // Fetch global commission rule
                // const globalRule = await categoryService.getGlobalCommissionRule();
                // setGlobalCommissionRate(globalRule.globalCommission ?? 0); // Use nullish coalescing

            } catch (err: any) {
                console.error("Error fetching data:", err);
                setError(err.message || "Failed to load data.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []); // Empty dependency array means this runs once on mount

    const handleEditCategory = (categoryId: string) => {
        console.log('Edit Category:', categoryId);
        navigate(`/admin/categories/edit/${categoryId}`);
    };

    const handleToggleCategoryStatus = async (categoryId: string, currentStatus: boolean) => {
        console.log(`Toggle status for category ${categoryId} to ${currentStatus ? 'Inactive' : 'Active'}`);
        try {
            const formData = new FormData();
            formData.append('status', String(!currentStatus)); // Toggle the status

            // Find the category to get its name and description for the update payload
            const categoryToUpdate = categories.find(c => c._id === categoryId);
            if (categoryToUpdate) {
                formData.append('name', categoryToUpdate.name);
                // Ensure description is not null/undefined when appending
                formData.append('description', categoryToUpdate.description || '');
                // Also, if icon is present, send it back or 'null' if it was removed
                if (categoryToUpdate.icon) { // Use 'icon' as per updated types
                    formData.append('icon', categoryToUpdate.icon);
                } else {
                    formData.append('icon', 'null');
                }
            } else {
                console.warn(`Category with ID ${categoryId} not found for status toggle.`);
                setError("Category not found for status update.");
                setIsLoading(false);
                return;
            }

            await categoryService.updateCategory(categoryId, formData);

            // Optimistically update UI
            setCategories(prevCategories =>
                prevCategories.map(cat =>
                    cat._id === categoryId ? { ...cat, status: !currentStatus } : cat
                )
            );
        } catch (err: any) {
            console.error("Error toggling category status:", err);
            setError(err.message || "Failed to toggle category status.");
        }
    };

    const handleUpdateGlobalCommissionRate = async () => {
        console.log("Updating global commission to:", globalCommissionRate);
        try {
            await categoryService.updateGlobalCommission(globalCommissionRate);
            console.log("Global commission updated successfully!");
        } catch (err: any) {
            console.error("Error updating global commission:", err);
            setError(err.message || "Failed to update global commission rate.");
        }
    };

    const handleViewCategory = (categoryId: string) => {
        navigate(`/admin/categories/view/${categoryId}`);
    };

    if (isLoading) {
        return (
            <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
                <Sidebar />
                <div className="flex-1 flex flex-col items-center justify-center">
                    <Header />
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
                    <p className="mt-4 text-xl">Loading data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
                <Sidebar />
                <div className="flex-1 flex flex-col items-center justify-center">
                    <Header />
                    <p className="text-xl text-red-500">Error: {error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <Header />

                {/* Page Content */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900 p-6">
                    <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-gray-100">Category & Commission Management</h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">Manage service categories, subcategories, and commission rules for the platform.</p>

                    {/* Category Management */}
                    <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
                        <h2 className="text-2xl font-semibold mb-6">Category Management</h2>
                        <div className="overflow-x-auto mb-4">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Category Name</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Sub-Categories</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {categories.map((category) => (
                                        // Ensure no whitespace between <tr> and <td>, and between <td> tags
                                        <tr key={category._id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{category.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{category.subCategoriesCount ?? 0} Subcategories</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <span
                                                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                        category.status
                                                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                                                    }`}
                                                >
                                                    {category.status ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                                                    <button
                                                        onClick={() => handleEditCategory(category._id)}
                                                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleToggleCategoryStatus(category._id, category.status ?? false)}
                                                        className={`${
                                                            category.status
                                                                ? 'text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300'
                                                                : 'text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300'
                                                        }`}
                                                    >
                                                        {category.status ? 'Deactivate' : 'Activate'}
                                                    </button>
                                                    <button
                                                        onClick={() => handleViewCategory(category._id)}
                                                        className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                                                    >
                                                        View
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <button
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onClick={() => navigate('/admin/categories/new')}
                        >
                            Add New Category
                        </button>
                    </section>

                    {/* Commission Rules - Displaying category-specific rules */}
                    <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
                        <h2 className="text-2xl font-semibold mb-6">Commission Rules</h2>

                        {/* Global Commission Rate */}
                        <div className="flex items-center mb-6">
                            <label htmlFor="globalCommission" className="text-lg font-medium text-gray-700 dark:text-gray-300 mr-3">Global Commission Rate (%)</label>
                            <input
                                type="number"
                                id="globalCommission"
                                value={globalCommissionRate}
                                onChange={(e) => setGlobalCommissionRate(Number(e.target.value))}
                                onBlur={handleUpdateGlobalCommissionRate} // Update on blur
                                className="w-24 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        {/* Category-specific Commission Rules Table */}
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Category</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Commission %</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Flat Fee</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {categories.filter(cat => cat.commissionRule).map((category) => (
                                        // Ensure no whitespace between <tr> and <td>, and between <td> tags
                                        <tr key={category._id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{category.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                                {category.commissionRule?.categoryCommission !== undefined && category.commissionRule.categoryCommission !== null
                                                    ? `${category.commissionRule.categoryCommission}%`
                                                    : 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                                {category.commissionRule?.flatFee !== undefined && category.commissionRule.flatFee !== null
                                                    ? `₹${category.commissionRule.flatFee}`
                                                    : 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <span
                                                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                        category.commissionRule?.status
                                                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                                                    }`}
                                                >
                                                    {category.commissionRule?.status ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                {/* Edit button will take them to the category edit page */}
                                                <button
                                                    onClick={() => handleEditCategory(category._id)}
                                                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-4"
                                                >
                                                    Edit
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* Earnings Summary (Remains as dummy data) */}
                    <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
                        <h2 className="text-2xl font-semibold mb-6">Earnings Summary</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                            {/* Total Commission Revenue */}
                            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                                <p className="text-sm text-gray-500 dark:text-gray-400">Total Commission Revenue</p>
                                <p className="text-2xl font-bold mt-1">{dummyEarningsSummary.totalCommissionRevenue}</p>
                                <p className={`text-sm mt-1 ${dummyEarningsSummary.totalCommissionRevenueChange.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                                    {dummyEarningsSummary.totalCommissionRevenueChange}
                                </p>
                            </div>
                            {/* Average Commission Per Booking */}
                            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                                <p className="text-sm text-gray-500 dark:text-gray-400">Average Commission Per Booking</p>
                                <p className="text-2xl font-bold mt-1">{dummyEarningsSummary.averageCommissionPerBooking}</p>
                                <p className={`text-sm mt-1 ${dummyEarningsSummary.averageCommissionPerBookingChange.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                                    {dummyEarningsSummary.averageCommissionPerBookingChange}
                                </p>
                            </div>
                            {/* Total Bookings */}
                            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                                <p className="text-sm text-gray-500 dark:text-gray-400">Total Bookings</p>
                                <p className="text-2xl font-bold mt-1">{dummyEarningsSummary.totalBookings}</p>
                                <p className={`text-sm mt-1 ${dummyEarningsSummary.totalBookingsChange.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                                    {dummyEarningsSummary.totalBookingsChange}
                                </p>
                            </div>
                            {/* Commission Deductions to Providers */}
                            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                                <p className="text-sm text-gray-500 dark:text-gray-400">Commission Deductions to Providers</p>
                                <p className="text-2xl font-bold mt-1">{dummyEarningsSummary.commissionDeductionsToProviders}</p>
                                <p className={`text-sm mt-1 ${dummyEarningsSummary.commissionDeductionsToProvidersChange.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                                    {dummyEarningsSummary.commissionDeductionsToProvidersChange}
                                </p>
                            </div>
                        </div>

                        {/* Toggle for deductions */}
                        <div className="flex items-center justify-end">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-3">Show Commission Deductions to Providers</span>
                            <label htmlFor="toggle-deductions" className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    id="toggle-deductions"
                                    className="sr-only peer"
                                    checked={showDeductions}
                                    onChange={() => setShowDeductions(!showDeductions)}
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                            </label>
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
};

export default CategoryCommissionManagement;