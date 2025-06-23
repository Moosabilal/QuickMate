// src/pages/admin/subCategoryForm.tsx (or ServiceForm.tsx)
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import Sidebar from '../../components/admin/sidebar';
import Header from '../../components/admin/Header';
import { categoryService } from '../../services/categoryService'; // Import your shared service

// It's highly recommended to define these in a shared `src/types/category.ts` file
// and import them here for consistency across your frontend and backend.
// For now, I'm defining them directly here for the fix.

// Interface for form input (what you construct to send to the backend)
interface SubCategoryFormInput {
    _id?: string; // Optional for new subcategories
    name: string;
    description?: string | null; // <-- Changed to allow string, null, or undefined
    iconUrl?: string | null;
    status: boolean;
    parentId?: string; // Crucial for subcategories
}

// Interface for fetched data (what your backend actually returns for a subcategory by ID)
interface ISubcategoryFetchData {
    _id: string;
    name: string;
    description?: string | null; // <-- Changed to allow string, null, or undefined
    iconUrl?: string | null;
    status: boolean;
    parentId?: string | null; // This will be present for subcategories
    // No commissionRule or commission-related fields expected here for subcategories
}


const SubCategoryForm: React.FC = () => {
    const { parentId, subcategoryId } = useParams<{ parentId: string; subcategoryId?: string }>();
    const navigate = useNavigate();

    // Form states - NO COMMISSION STATES FOR SUB CATEGORIES
    const [name, setName] = useState('');
    const [description, setDescription] = useState<string>(''); // Initialize as empty string
    const [icon, setIcon] = useState<File | null>(null);
    const [iconPreview, setIconPreview] = useState<string | null>(null);
    const [status, setStatus] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [isFormLoading, setIsFormLoading] = useState(true); // For initial data fetch
    const [fetchError, setFetchError] = useState<string | null>(null);

    const isEditing = !!subcategoryId; // Determine if it's editing a subcategory

    // Effect to fetch initial data for editing a subcategory
    useEffect(() => {
        const fetchSubcategoryData = async () => {
            if (isEditing && subcategoryId) {
                setIsFormLoading(true);
                setFetchError(null);
                try {
                    // Use getCategoryById to fetch the subcategory data
                    // The backend's categoryService.getCategoryById returns ICategoryResponse,
                    // which contains `description?: string | null;`
                    const response = await categoryService.getCategoryById(subcategoryId);
                    const fetchedData: ISubcategoryFetchData = response.category; // Assuming response.category is the data

                    setName(fetchedData.name);
                    // Ensure description is always a string for the textarea value
                    setDescription(fetchedData.description ?? ''); // Use nullish coalescing to default to empty string if null/undefined
                    setIconPreview(fetchedData.iconUrl || null);
                    setStatus(fetchedData.status);
                    // No commission-related states to set for subcategories
                } catch (error) {
                    console.error('Error fetching subcategory for edit:', error);
                    setFetchError('Failed to load subcategory data. Please try again.');
                } finally {
                    setIsFormLoading(false);
                }
            } else {
                // For new subcategory, reset form
                setName('');
                setDescription('');
                setIcon(null);
                setIconPreview(null);
                setStatus(true);
                setIsFormLoading(false);
            }
        };

        fetchSubcategoryData();
    }, [isEditing, subcategoryId]); // parentId is not a direct dependency for fetching existing subcategory data

    const handleIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setIcon(file);
            setIconPreview(URL.createObjectURL(file));
        }
    };

    const handleRemoveIcon = () => {
        setIcon(null);
        setIconPreview(null);
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
            setIcon(file);
            setIconPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const formData = new FormData();
        formData.append('name', name);
        // Ensure description is always a string when appending to FormData, even if empty
        formData.append('description', description);
        formData.append('status', String(status));

        // IMPORTANT: DO NOT APPEND COMMISSION FIELDS FOR SUBCATEGORIES

        if (icon) {
            formData.append('categoryIcon', icon);
        } else if (isEditing && iconPreview === null) {
            // If editing and icon was removed, signal backend to clear it
            formData.append('iconUrl', 'null'); // Backend should interpret 'null' string as actual null
        } else if (isEditing && iconPreview) {
            // No new file, but there was an existing icon; keep it (Cloudinary URL)
            formData.append('iconUrl', iconPreview); // Send existing URL back
        }

        // THIS IS THE KEY DIFFERENCE: Add parentId for new subcategories
        if (!isEditing && parentId) {
            formData.append('parentId', parentId);
        }
        // If editing, the parentId is typically immutable unless your backend allows re-parenting,
        // in which case you might fetch and re-send it, or add a field for it.
        // For simplicity, we assume parentId is set only on creation.
        // If you did want to allow re-parenting for subcategories, you'd add:
        // if (isEditing && parentId) { formData.append('parentId', parentId); }
        // BUT BE CAREFUL with circular dependencies if you implement that.

        try {
            if (isEditing && subcategoryId) {
                console.log('Updating Subcategory with FormData:', Object.fromEntries(formData));
                // Assuming updateCategory expects FormData or a plain object conforming to Partial<ICategoryInput>
                await categoryService.updateCategory(subcategoryId, formData);
                console.log("Subcategory updated successfully!");
            } else {
                // Ensure parentId is truly available for new subcategories
                if (!parentId) {
                    throw new Error("Parent category ID is missing for new subcategory creation.");
                }
                console.log('Adding New Subcategory with FormData:', Object.fromEntries(formData));
                await categoryService.createCategory(formData); // createCategory also accepts FormData
                console.log("Subcategory created successfully!");
            }
            // Navigate back to the parent category's view page or a subcategory list page
            navigate(`/admin/categories/view/${parentId || ''}`);
        } catch (error) {
            console.error('Error saving subcategory:', error);
            setFetchError(`Failed to save subcategory: ${error instanceof Error ? error.message : String(error)}`);
        } finally {
            setIsLoading(false);
            if (iconPreview && icon instanceof File) {
                // Clean up the object URL created for the preview
                URL.revokeObjectURL(iconPreview);
            }
        }
    };

    if (isFormLoading) {
        return (
            <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
                <Sidebar />
                <div className="flex-1 flex flex-col items-center justify-center">
                    <Header />
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
                    <p className="mt-4 text-xl">Loading subcategory data...</p>
                </div>
            </div>
        );
    }

    if (fetchError && !isLoading) {
        return (
            <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
                <Sidebar />
                <div className="flex-1 flex flex-col items-center justify-center">
                    <Header />
                    <p className="text-xl text-red-500">Error: {fetchError}</p>
                    <Link to={`/admin/categories/view/${parentId || ''}`} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Back to Parent Category</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900 p-6">
                    <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                            {isEditing ? 'Edit Subcategory' : `Add New Subcategory`}
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mb-8">
                            {isEditing ? 'Update service subcategory details.' : `Create a new service subcategory for parent ID: ${parentId}.`}
                        </p>

                        {isLoading && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                                <div className="flex flex-col items-center">
                                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
                                    <p className="mt-4 text-white text-lg">Saving subcategory...</p>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* Subcategory Information */}
                            <section className="border-b border-gray-200 dark:border-gray-700 pb-8">
                                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6">Subcategory Information</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Subcategory Name</label>
                                        <input
                                            type="text"
                                            id="name"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                                            placeholder="e.g., Deep Cleaning"
                                            required
                                            disabled={isLoading}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Subcategory Description (Optional)</label>
                                        <textarea
                                            id="description"
                                            rows={3}
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500 transition duration-200 resize-y"
                                            placeholder="Briefly describe this subcategory"
                                            disabled={isLoading}
                                        ></textarea>
                                    </div>
                                </div>

                                <div className="mt-6">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Upload Subcategory Icon/Image (Optional)</label>
                                    <div
                                        className={`flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition duration-200 relative ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        onDragOver={handleDragOver}
                                        onDrop={handleDrop}
                                    >
                                        {iconPreview ? (
                                            <>
                                                <img src={iconPreview} alt="Subcategory Icon Preview" className="max-h-full max-w-full object-contain rounded-md" />
                                                <button
                                                    type="button"
                                                    onClick={handleRemoveIcon}
                                                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                                                    aria-label="Remove image"
                                                    disabled={isLoading}
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
                                    <span className="text-base font-medium text-gray-700 dark:text-gray-300">Subcategory Status</span>
                                    <label htmlFor="status-toggle" className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            id="status-toggle"
                                            className="sr-only peer"
                                            checked={status}
                                            onChange={() => setStatus(!status)}
                                            disabled={isLoading}
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>
                            </section>

                            {/* COMMISSION SETTINGS SECTION REMOVED FOR SUB CATEGORIES */}

                            <div className="flex justify-between items-center pt-6">
                                <button
                                    type="button"
                                    onClick={() => navigate(`/admin/categories/view/${parentId || ''}`)} // Go back to parent category details
                                    className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition duration-200"
                                    disabled={isLoading}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition duration-200"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <div className="flex items-center">
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            {isEditing ? 'Updating...' : 'Saving...'}
                                        </div>
                                    ) : (
                                        isEditing ? 'Update Subcategory' : 'Save Subcategory'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default SubCategoryForm;