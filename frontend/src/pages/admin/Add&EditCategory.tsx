import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../hooks/useAppSelector'; // Adjust path as needed
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { logout } from '../../features/auth/authSlice'; // Adjust path as needed
import Sidebar from '../../components/admin/sidebar';
import Header from '../../components/admin/Header';
import { categoryService } from '../../services/categoryService';

// Dummy Types for Category and Commission Data (adjust based on your ERD and Redux slices)
// This interface should ideally match ICategoryFormCombinedData from your backend types
interface CategoryData {
  _id?: string; // Optional for new categories
  name: string;
  description: string;
  iconUrl?: string | null; // Cloudinary URL, or null if removed/none
  status: boolean; // true for Active, false for Inactive
  commissionType: 'percentage' | 'flat' | 'none'; // Added 'none' as per backend validation
  commissionValue: number | ''; // Stores percentage or flat fee value, can be empty string for none
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

  // Form states
  const [categoryName, setCategoryName] = useState('');
  const [categoryDescription, setCategoryDescription] = useState('');
  const [categoryIcon, setCategoryIcon] = useState<File | null>(null); // For file upload
  const [categoryIconPreview, setCategoryIconPreview] = useState<string | null>(null); // For displaying preview
  const [categoryStatus, setCategoryStatus] = useState(true); // Default to active
  const [commissionType, setCommissionType] = useState<'percentage' | 'flat' | 'none'>('none'); // Default to 'none' for no commission
  const [commissionValue, setCommissionValue] = useState<number | ''>('');
  const [commissionStatus, setCommissionStatus] = useState(true); // Default to active
  const [submitAction, setSubmitAction] = useState<'save' | 'addSubcategory'>('save'); // New state to track which button was clicked
  const [isLoading, setIsLoading] = useState(false); // New loading state

  const isEditing = !!initialCategoryData; // Determine if it's an edit operation

  // Effect to populate form fields when in edit mode
  useEffect(() => {
    if (isEditing && initialCategoryData) {
      setCategoryName(initialCategoryData.name);
      setCategoryDescription(initialCategoryData.description);
      setCategoryIconPreview(initialCategoryData.iconUrl || null); // Load existing icon URL if any
      setCategoryStatus(initialCategoryData.status);

      // Handle commission data
      if (initialCategoryData.commissionType) { // Check if commissionType is set
        setCommissionType(initialCategoryData.commissionType);
        setCommissionValue(initialCategoryData.commissionValue);
        setCommissionStatus(initialCategoryData.commissionStatus);
      } else {
        setCommissionType('none'); // Default to none if no commission data
        setCommissionValue('');
        setCommissionStatus(true);
      }

    } else {
      // Reset form if switching to add mode (or initially in add mode)
      setCategoryName('');
      setCategoryDescription('');
      setCategoryIcon(null);
      setCategoryIconPreview(null);
      setCategoryStatus(true);
      setCommissionType('none'); // Reset to 'none' for new category
      setCommissionValue('');
      setCommissionStatus(true);
    }
  }, [isEditing, initialCategoryData]);


  const handleIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCategoryIcon(file);
      setCategoryIconPreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveIcon = () => {
    setCategoryIcon(null);
    setCategoryIconPreview(null);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true); // Set loading to true when submission starts

    const formData = new FormData();
    formData.append('name', categoryName);
    formData.append('description', categoryDescription);
    formData.append('status', String(categoryStatus)); // Convert boolean to string for FormData
    formData.append('commissionType', commissionType);

    // Only append commissionValue if commissionType is not 'none'
    if (commissionType !== 'none' && commissionValue !== '') {
      formData.append('commissionValue', String(commissionValue));
      formData.append('commissionStatus', String(commissionStatus)); // Only send status if commission type is not 'none'
    } else {
      // If commissionType is 'none' or value is empty, ensure commission related fields are not sent
      // or sent with specific values indicating removal/default if your backend requires it
      formData.append('commissionValue', ''); // Explicitly send empty if 'none'
      formData.append('commissionStatus', String(false)); // Or false for commission status
    }

    console.log('categoryIcon:', categoryIcon);
    // IMPORTANT: Handle iconUrl based on user interaction
    if (categoryIcon) {
      // Case 1: A new file was selected/dropped
      formData.append('categoryIcon', categoryIcon); // 'categoryIcon' matches the field name in multer setup
    } else if (isEditing && initialCategoryData?.iconUrl && !categoryIconPreview) {
      // Case 2: User explicitly removed an existing icon
      // Send an empty string for 'iconUrl' to signal to the backend to clear it
      formData.append('iconUrl', '');
    } else if (isEditing && initialCategoryData?.iconUrl && categoryIconPreview === initialCategoryData.iconUrl) {
      // Case 3: Editing, no new file, and the preview is still the original Cloudinary URL
      // This means the user did not change or remove the existing icon. Send the original URL back.
      formData.append('iconUrl', initialCategoryData.iconUrl);
    }
    // If not editing and no file, or editing and no initial icon and no new file, iconUrl will not be appended, which is fine.


    try {
      if (isEditing && initialCategoryData?._id) {
        // For update, send PUT request
        console.log('Updating Category with FormData:');
        await categoryService.updateCategory(initialCategoryData._id, formData);
        console.log("Category updated successfully!");
        navigate('/admin/categories'); // Always redirect to categories list after update
      } else {
        // For create, send POST request
        console.log('Adding New Category with FormData:');

        // Capture the response from categoryService.createCategory
        // Assuming categoryService.createCategory returns an object like { message: ..., category: { _id: ... }, ... }
        const response = await categoryService.createCategory(formData);

        // Check if the response contains the category object and its _id
        const newCategoryId  = response?._id;

        if (newCategoryId && submitAction === 'addSubcategory') {
          // If "Add Sub Category" button was clicked AND it's a new category
          navigate(`/admin/subcategories/new/${newCategoryId}`);
        } else {
          // Otherwise, redirect to the categories list
          navigate('/admin/categories');
        }
      }
    } catch (error) {
      console.error('Error saving category:', error);
      // TODO: Add user-facing error message display here
    } finally {
      setIsLoading(false); // Set loading to false when submission finishes (success or error)
      // Revoke the object URL after form submission (or when no longer needed)
      if (categoryIconPreview && categoryIcon) {
        URL.revokeObjectURL(categoryIconPreview);
      }
      // Reset submitAction for next submission
      setSubmitAction('save');
    }
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

            {isLoading && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
                  <p className="mt-4 text-white text-lg">Saving category...</p>
                </div>
              </div>
            )}

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
                      disabled={isLoading} // Disable input while loading
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
                      disabled={isLoading} // Disable input while loading
                    ></textarea>
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Upload Category Icon/Image (Optional)</label>
                  <div
                    className={`flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition duration-200 relative ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                  >
                    {categoryIconPreview ? (
                      <>
                        <img src={categoryIconPreview} alt="Category Icon Preview" className="max-h-full max-w-full object-contain rounded-md" />
                        <button
                          type="button"
                          onClick={handleRemoveIcon}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                          aria-label="Remove image"
                          disabled={isLoading} // Disable button while loading
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                          </svg>
                        </button>
                      </>
                    ) : (
                      <>
                        <svg className="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a3 3 0 013 3v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2.586a1 1 0 00.707-.293l2.414-2.414A1 1 0 0113.172 2h3.656a1 1 0 01.707.293l2.414 2.414A1 1 0 0121 5.828V19a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"></path>
                        </svg>
                        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">SVG, PNG, JPG or GIF (MAX. 800x400px)</p>
                      </>
                    )}
                    <input id="dropzone-file" type="file" className="hidden" onChange={handleIconUpload} accept="image/*" disabled={isLoading} />
                    <label htmlFor="dropzone-file" className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200 cursor-pointer" style={{ pointerEvents: isLoading ? 'none' : 'auto' }}>
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
                      disabled={isLoading} // Disable input while loading
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
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
                        value="none"
                        checked={commissionType === 'none'}
                        onChange={() => { setCommissionType('none'); setCommissionValue(''); setCommissionStatus(true); }} // Reset value if 'none'
                        disabled={isLoading} // Disable input while loading
                      />
                      <span className="ml-2 text-gray-900 dark:text-gray-100">None</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        className="form-radio text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-400"
                        name="commissionType"
                        value="percentage"
                        checked={commissionType === 'percentage'}
                        onChange={() => setCommissionType('percentage')}
                        disabled={isLoading} // Disable input while loading
                      />
                      <span className="ml-2 text-gray-900 dark:text-gray-100">Percentage</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        className="form-radio text-blue-600 focus:ring-blue-500 dark:focus:ring-4 dark:focus:ring-blue-400"
                        name="commissionType"
                        value="flat"
                        checked={commissionType === 'flat'}
                        onChange={() => setCommissionType('flat')}
                        disabled={isLoading} // Disable input while loading
                      />
                      <span className="ml-2 text-gray-900 dark:text-gray-100">Flat Fee</span>
                    </label>
                  </div>
                </div>

                {commissionType !== 'none' && ( // Only show value input if commission type is not 'none'
                  <>
                    {commissionType === 'percentage' && (
                      <div>
                        <label htmlFor="commissionPercentage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Commission Percentage</label>
                        <input
                          type="number"
                          id="commissionPercentage"
                          value={commissionValue}
                          onChange={(e) => setCommissionValue(e.target.value === '' ? '' : Number(e.target.value))}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                          placeholder="e.g., 10"
                          min="0"
                          max="100"
                          required // Make required if type is not 'none'
                          disabled={isLoading} // Disable input while loading
                        />
                      </div>
                    )}

                    {commissionType === 'flat' && (
                      <div>
                        <label htmlFor="flatFee" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Flat Fee</label>
                        <input
                          type="number"
                          id="flatFee"
                          value={commissionValue}
                          onChange={(e) => setCommissionValue(e.target.value === '' ? '' : Number(e.target.value))}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                          placeholder="e.g., 50"
                          min="0"
                          required // Make required if type is not 'none'
                          disabled={isLoading} // Disable input while loading
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
                          disabled={isLoading} // Disable input while loading
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </>
                )}
              </section>

              {/* Action Buttons */}
              <div className="flex justify-between items-center pt-6">
                {/* Left-aligned Cancel button */}
                <button
                  type="button"
                  onClick={() => navigate('/admin/categories')}
                  className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition duration-200"
                  disabled={isLoading} // Disable button while loading
                >
                  Cancel
                </button>

                {/* Right-aligned buttons: Add Sub Category and Save/Update */}
                <div className="flex space-x-4">
                  {/* The "Add Sub Category" button is now a submit button */}
                  {!isEditing && ( // Only show "Add Sub Category" button for new categories
                    <button
                      type="submit"
                      onClick={() => setSubmitAction('addSubcategory')} // Set action before submitting
                      className="px-6 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition duration-200"
                      title="Save category and then add subcategories to it"
                      disabled={isLoading} // Disable button while loading
                    >
                      {isLoading && submitAction === 'addSubcategory' ? (
                        <div className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Saving & Adding...
                        </div>
                      ) : (
                        'Save & Add Sub Category'
                      )}
                    </button>
                  )}

                  <button
                    type="submit"
                    onClick={() => setSubmitAction('save')} // Set action before submitting
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition duration-200"
                    disabled={isLoading} // Disable button while loading
                  >
                    {isLoading && submitAction === 'save' ? (
                      <div className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {isEditing ? 'Updating...' : 'Saving...'}
                      </div>
                    ) : (
                      isEditing ? 'Update Category' : 'Save Category'
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CategoryForm;