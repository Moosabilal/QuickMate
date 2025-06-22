import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../hooks/useAppSelector'; // Adjust path as needed
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { logout } from '../../features/auth/authSlice'; // Adjust path as needed
import Sidebar from '../../components/admin/sidebar';
import Header from '../../components/admin/Header';
import { categoryService } from '../../services/categoryService';

// Dummy Types for Category and Commission Data (adjust based on your ERD and Redux slices)
interface CategoryData {
  _id?: string; // Optional for new categories
  name: string;
  description: string;
  iconUrl?: string; // Or base64 string
  status: boolean; // true for Active, false for Inactive
  subCategories: string[];
  commissionType: 'percentage' | 'flat';
  commissionValue: number; // Stores percentage or flat fee value
  commissionStatus: boolean; // true for Active, false for Inactive
}

// Props for the component
interface CategoryFormProps {
  initialCategoryData?: CategoryData | null; // Pass data when editing, null/undefined for adding
}

const CategoryForm: React.FC<CategoryFormProps> = ({ initialCategoryData }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector(state => state.auth); // Get user from Redux state for header
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  // Form states
  const [categoryName, setCategoryName] = useState('');
  const [categoryDescription, setCategoryDescription] = useState('');
  const [categoryIcon, setCategoryIcon] = useState<File | null>(null); // For file upload
  const [categoryIconPreview, setCategoryIconPreview] = useState<string | null>(null); // For displaying preview
  const [categoryStatus, setCategoryStatus] = useState(true); // Default to active
  const [subCategoryInput, setSubCategoryInput] = useState('');
  const [subCategories, setSubCategories] = useState<string[]>([]);
  const [commissionType, setCommissionType] = useState<'percentage' | 'flat'>('percentage');
  const [commissionValue, setCommissionValue] = useState<number | ''>('');
  const [commissionStatus, setCommissionStatus] = useState(true); // Default to active

  const isEditing = !!initialCategoryData; // Determine if it's an edit operation

  // Effect to populate form fields when in edit mode
  useEffect(() => {
    if (isEditing && initialCategoryData) {
      setCategoryName(initialCategoryData.name);
      setCategoryDescription(initialCategoryData.description);
      setCategoryIconPreview(initialCategoryData.iconUrl || null); // Load existing icon URL if any
      setCategoryStatus(initialCategoryData.status);
      setSubCategories(initialCategoryData.subCategories);
      setCommissionType(initialCategoryData.commissionType);
      setCommissionValue(initialCategoryData.commissionValue);
      setCommissionStatus(initialCategoryData.commissionStatus);
    } else {
      // Reset form if switching to add mode (or initially in add mode)
      setCategoryName('');
      setCategoryDescription('');
      setCategoryIcon(null);
      setCategoryIconPreview(null);
      setCategoryStatus(true);
      setSubCategories([]);
      setSubCategoryInput('');
      setCommissionType('percentage');
      setCommissionValue('');
      setCommissionStatus(true);
    }
  }, [isEditing, initialCategoryData]);

  const handleLogout = () => {
    dispatch(logout());
    setIsProfileDropdownOpen(false);
  };

  const handleIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCategoryIcon(file);
      setCategoryIconPreview(URL.createObjectURL(file));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setCategoryIcon(file);
      setCategoryIconPreview(URL.createObjectURL(file));
    }
  };

  const handleAddSubCategory = () => {
    if (subCategoryInput.trim() && !subCategories.includes(subCategoryInput.trim())) {
      setSubCategories([...subCategories, subCategoryInput.trim()]);
      setSubCategoryInput('');
    }
  };

  const handleRemoveSubCategory = (subCatToRemove: string) => {
    setSubCategories(subCategories.filter(subCat => subCat !== subCatToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Prepare data based on whether it's an add or edit operation
    const categoryToSave: CategoryData = {
      name: categoryName,
      description: categoryDescription,
      iconUrl: categoryIconPreview || undefined, // Send URL if exists, otherwise undefined
      status: categoryStatus,
      subCategories: subCategories,
      commissionType: commissionType,
      commissionValue: Number(commissionValue),
      commissionStatus: commissionStatus,
    };

    if (isEditing && initialCategoryData?._id) {
      // Add _id for update operation
      categoryToSave._id = initialCategoryData._id;
      console.log('Updating Category:', categoryToSave);
      // await dispatch(updateCategory(categoryToSave)); // Example Redux dispatch for update
    } else {
      console.log('Adding New Category:', categoryToSave);
      await categoryService.createCategory(categoryToSave);
      // await dispatch(addCategory(categoryToSave)); // Example Redux dispatch for add
    }

    // In a real application, you'd send this data to your backend
    // and then navigate back to the category management page
    // navigate('/admin/categories'); // Redirect back after save/update
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
          <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              {isEditing ? 'Edit Category' : 'Add New Category'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              {isEditing ? 'Update service category details and offerings.' : 'Create a new service category to organize your offerings.'}
            </p>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Category Information */}
              <section className="border-b border-gray-200 dark:border-gray-700 pb-8">
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6">Category Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="categoryName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category Name</label>
                    <input
                      type="text"
                      id="categoryName"
                      value={categoryName}
                      onChange={(e) => setCategoryName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                      placeholder="e.g., Home Cleaning"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="categoryDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category Description (Optional)</label>
                    <textarea
                      id="categoryDescription"
                      rows={3}
                      value={categoryDescription}
                      onChange={(e) => setCategoryDescription(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500 transition duration-200 resize-y"
                      placeholder="Briefly describe this category"
                    ></textarea>
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Upload Category Icon/Image (Optional)</label>
                  <div
                    className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition duration-200"
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                  >
                    {categoryIconPreview ? (
                      <img src={categoryIconPreview} alt="Category Icon Preview" className="max-h-full max-w-full object-contain rounded-md" />
                    ) : (
                      <>
                        <svg className="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a3 3 0 013 3v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2.586a1 1 0 00.707-.293l2.414-2.414A1 1 0 0113.172 2h3.656a1 1 0 01.707.293l2.414 2.414A1 1 0 0121 5.828V19a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"></path>
                        </svg>
                        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">SVG, PNG, JPG or GIF (MAX. 800x400px)</p>
                      </>
                    )}
                    <input id="dropzone-file" type="file" className="hidden" onChange={handleIconUpload} accept="image/*" />
                    <label htmlFor="dropzone-file" className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200 cursor-pointer">
                      Upload Image
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-6">
                  <span className="text-base font-medium text-gray-700 dark:text-gray-300">Category Status</span>
                  <label htmlFor="category-status-toggle" className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      id="category-status-toggle"
                      className="sr-only peer"
                      checked={categoryStatus}
                      onChange={() => setCategoryStatus(!categoryStatus)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </section>

              {/* Sub-Categories */}
              <section className="border-b border-gray-200 dark:border-gray-700 pb-8">
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6">Sub-Categories</h2>
                <div className="flex items-center gap-2 mb-4">
                  <input
                    type="text"
                    value={subCategoryInput}
                    onChange={(e) => setSubCategoryInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSubCategory();
                      }
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                    placeholder="e.g., Deep Cleaning"
                  />
                  <button
                    type="button"
                    onClick={handleAddSubCategory}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  {subCategories.map((subCat, index) => (
                    <span
                      key={index}
                      className="flex items-center bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {subCat}
                      <button
                        type="button"
                        onClick={() => handleRemoveSubCategory(subCat)}
                        className="ml-2 text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100 focus:outline-none"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                      </button>
                    </span>
                  ))}
                </div>
              </section>

              {/* Commission Settings */}
              <section className="pb-8">
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6">Commission Settings</h2>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Commission Type</label>
                  <div className="flex space-x-4">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        className="form-radio text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-400"
                        name="commissionType"
                        value="percentage"
                        checked={commissionType === 'percentage'}
                        onChange={() => setCommissionType('percentage')}
                      />
                      <span className="ml-2 text-gray-900 dark:text-gray-100">Percentage</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        className="form-radio text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-400"
                        name="commissionType"
                        value="flat"
                        checked={commissionType === 'flat'}
                        onChange={() => setCommissionType('flat')}
                      />
                      <span className="ml-2 text-gray-900 dark:text-gray-100">Flat Fee</span>
                    </label>
                  </div>
                </div>

                {commissionType === 'percentage' && (
                  <div>
                    <label htmlFor="commissionPercentage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Commission Percentage (Optional)</label>
                    <input
                      type="number"
                      id="commissionPercentage"
                      value={commissionValue}
                      onChange={(e) => setCommissionValue(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                      placeholder="e.g., 10"
                      min="0"
                      max="100"
                    />
                  </div>
                )}

                {commissionType === 'flat' && (
                  <div>
                    <label htmlFor="flatFee" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Flat Fee (Optional)</label>
                    <input
                      type="number"
                      id="flatFee"
                      value={commissionValue}
                      onChange={(e) => setCommissionValue(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                      placeholder="e.g., 50"
                      min="0"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between mt-6">
                  <span className="text-base font-medium text-gray-700 dark:text-gray-300">Commission Status</span>
                  <label htmlFor="commission-status-toggle" className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      id="commission-status-toggle"
                      className="sr-only peer"
                      checked={commissionStatus}
                      onChange={() => setCommissionStatus(!commissionStatus)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </section>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 pt-6">
                <button
                  type="button"
                  onClick={() => navigate('/admin/categories')}
                  className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition duration-200"
                >
                  {isEditing ? 'Update Category' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CategoryForm;