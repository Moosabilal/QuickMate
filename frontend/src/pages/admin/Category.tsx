import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../hooks/useAppSelector';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { logout } from '../../features/auth/authSlice'; // Adjust path as needed
import Sidebar from '../../components/admin/sidebar';
import Header from '../../components/admin/Header';

// Dummy Data
// In a real app, these would come from your backend API and Redux state.
interface Category {
  _id: string;
  name: string;
  subCategoriesCount: number; // For display in the table
  status: boolean; // Changed to boolean
}

interface CommissionRule {
  _id: string;
  categoryName: string; // For display in the table
  commissionPercentage?: number; // Commission %
  flatFee?: number; // Flat Fee
  status: boolean; // Changed to boolean
  categoryId: string; // Link to actual category
}

const dummyCategories: Category[] = [
  { _id: 'cat1', name: 'Home Maintenance', subCategoriesCount: 5, status: true },  // true for Active
  { _id: 'cat2', name: 'Pet Care', subCategoriesCount: 3, status: true },       // true for Active
  { _id: 'cat3', name: 'Personal Training', subCategoriesCount: 2, status: true }, // true for Active
  { _id: 'cat4', name: 'Event Planning', subCategoriesCount: 4, status: false },   // false for Inactive
  { _id: 'cat5', name: 'Tutoring', subCategoriesCount: 1, status: true },       // true for Active
];

const dummyCommissionRules: CommissionRule[] = [
  { _id: 'rule1', categoryId: 'cat1', categoryName: 'Home Maintenance', commissionPercentage: 10, flatFee: 5, status: true },  // true for Active
  { _id: 'rule2', categoryId: 'cat2', categoryName: 'Pet Care', commissionPercentage: 12, flatFee: 0, status: true },       // true for Active
  { _id: 'rule3', categoryId: 'cat3', categoryName: 'Personal Training', commissionPercentage: 15, flatFee: 10, status: true }, // true for Active
  { _id: 'rule4', categoryId: 'cat4', categoryName: 'Event Planning', commissionPercentage: 8, flatFee: 20, status: false },   // false for Inactive
];

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

const CategoryCommissionManagement = () => {

  const [globalCommissionRate, setGlobalCommissionRate] = useState(15); // Example initial value
  const [showDeductions, setShowDeductions] = useState(true);
  const navigate = useNavigate();

  const handleEditCategory = (categoryId: string) => {
    console.log('Edit Category:', categoryId);
    navigate(`/admin/categories/edit/${categoryId}`);
    // Implement navigation or modal for editing a category
  };

  // Changed currentStatus to boolean
  const handleToggleCategoryStatus = (categoryId: string, currentStatus: boolean) => {
    console.log(`Toggle status for category ${categoryId} to ${currentStatus ? 'Inactive' : 'Active'}`);
    // In a real app, dispatch an action to update category status in Redux and backend
    // You'd typically find the category by ID and update its status
  };

  const handleEditCommissionRule = (ruleId: string) => {
    console.log('Edit Commission Rule:', ruleId);
    // Implement navigation or modal for editing a commission rule
  };

  // Changed currentStatus to boolean
  const handleToggleCommissionRuleStatus = (ruleId: string, currentStatus: boolean) => {
    console.log(`Toggle status for commission rule ${ruleId} to ${currentStatus ? 'Inactive' : 'Active'}`);
    // In a real app, dispatch an action to update rule status in Redux and backend
    // You'd typically find the rule by ID and update its status
  };

   // NEW: Handle View Category
    const handleViewCategory = (categoryId: string) => {
      console.log('View Category:', categoryId);
        navigate(`/admin/categories/view/${categoryId}`);
    };


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
                  {dummyCategories.map((category) => (
                    <tr key={category._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{category.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{category.subCategoriesCount} Subcategories</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            category.status // Use boolean directly
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                          }`}
                        >
                          {category.status ? 'Active' : 'Inactive'} {/* Display 'Active' or 'Inactive' */}
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
                            onClick={() => handleToggleCategoryStatus(category._id, category.status)}
                            className={`${
                              category.status // Use boolean directly
                                ? 'text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300'
                                : 'text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300'
                            }`}
                          >
                            {category.status ? 'Deactivate' : 'Activate'} {/* Display 'Deactivate' or 'Activate' */}
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
              onClick={() => navigate('/admin/categories/new') }
            >
              Add New Category
            </button>
          </section>

          {/* Commission Rules */}
          <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-2xl font-semibold mb-6">Commission Rules</h2>

            <div className="flex items-center mb-6">
              <label htmlFor="globalCommission" className="text-lg font-medium text-gray-700 dark:text-gray-300 mr-3">Global Commission Rate (%)</label>
              <input
                type="number"
                id="globalCommission"
                value={globalCommissionRate}
                onChange={(e) => setGlobalCommissionRate(Number(e.target.value))}
                onBlur={() => console.log("Update global commission to:", globalCommissionRate)}
                className="w-24 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

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
                  {dummyCommissionRules.map((rule) => (
                    <tr key={rule._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{rule.categoryName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {rule.commissionPercentage !== undefined ? `${rule.commissionPercentage}%` : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {rule.flatFee !== undefined ? `₹${rule.flatFee}` : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            rule.status // Use boolean directly
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                          }`}
                        >
                          {rule.status ? 'Active' : 'Inactive'} {/* Display 'Active' or 'Inactive' */}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEditCommissionRule(rule._id)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-4"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleToggleCommissionRuleStatus(rule._id, rule.status)}
                          className={`${
                            rule.status // Use boolean directly
                              ? 'text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300'
                              : 'text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300'
                          }`}
                        >
                          {rule.status ? 'Deactivate' : 'Activate'} {/* Display 'Deactivate' or 'Activate' */}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Earnings Summary */}
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