// src/services/CategoryService.ts
import axiosInstance from "../API/axiosInstance";
import {
    ICategoryInput,
    ICategoryResponse, // Use ICategoryResponse for data coming from the API
    ICommissionRuleInput,
    ICommissionRuleResponse, // Use ICommissionRuleResponse for data coming from the API
} from "../types/category"; // Ensure this path is correct for your updated types

const CATEGORIES_PATH = '/categories';
const CATEGORIES_TOP_LEVEL_DETAILS_PATH = '/categories/top-level-details';
const GLOBAL_COMMISSION_PATH = '/commission-rules/global'; // Adjust if your backend path is different, e.g., /categories/global-commission

export const categoryService = {

    /**
     * Creates a new category or subcategory.
     * The `formData` should include `parentid` if it's a subcategory.
     * Commission fields should be omitted from formData if it's a subcategory.
     * @param formData The FormData object containing category/subcategory data.
     * @returns The created ICategoryResponse object.
     */
    async createCategory(formData: FormData): Promise<ICategoryResponse> {
        console.log("Creating category/subcategory with data:");
        for (let [key, value] of formData.entries()) {
            console.log(`${key}: ${value}`);
        }
        try {
            const response = await axiosInstance.post(CATEGORIES_PATH, formData);
            console.log("Category/Subcategory created:", response.data);
            // Assuming the backend returns the created category directly or nested under 'category'
            return response.data.category || response.data;
        } catch (error: any) {
            console.error("Error creating category/subcategory in service:", error);
            throw error;
        }
    },

    /**
     * Fetches a category or subcategory by its ID.
     * @param id The ID of the category or subcategory to fetch.
     * @returns The fetched ICategoryResponse object.
     */
    async getCategoryById(id: string): Promise<ICategoryResponse> {
        try {
            const response = await axiosInstance.get(`${CATEGORIES_PATH}/${id}`);
            console.log(`Fetched category/subcategory with ID ${id}:`, response.data);
            return response.data;
        } catch (error: any) {
            console.error(`Error fetching category/subcategory with ID ${id}:`, error);
            throw error;
        }
    },

    /**
     * Updates a category or subcategory by ID.
     * Commission fields should be omitted from formData if it's a subcategory.
     * @param id The ID of the category or subcategory to update.
     * @param formData The FormData object containing all updated data.
     * @returns The updated ICategoryResponse object.
     */
    async updateCategory(id: string, formData: FormData): Promise<ICategoryResponse> {
        console.log(`Updating category/subcategory with ID ${id} and FormData:`);
        for (let [key, value] of formData.entries()) {
            console.log(`${key}: ${value}`);
        }
        try {
            const response = await axiosInstance.put(`${CATEGORIES_PATH}/${id}`, formData);
            console.log("Category/Subcategory updated:", response.data);
            return response.data;
        } catch (error: any) {
            console.error(`Error updating category/subcategory with ID ${id} in service:`, error);
            throw error;
        }
    },

    /**
     * Fetches all top-level categories OR all subcategories of a specific parent.
     * @param parentid Optional. If provided, fetches subcategories of that parent. If not, fetches top-level categories.
     * @returns An array of ICategoryResponse objects.
     */
    async getAllCategories(parentid?: string): Promise<ICategoryResponse[]> { // Changed from parentId to parentid
        try {
            console.log('parenud', parentid); // Changed from parentId to parentid
            const params: { parentid?: string } = {}; // Changed from parentId to parentid
            if (parentid) { // Changed from parentId to parentid
                params.parentid = parentid; // Changed from parentId to parentid
            }
            console.log('find params:', params);
            const response = await axiosInstance.get(CATEGORIES_PATH, { params });
            console.log("Fetched categories/subcategories:", response.data);
            console.log("Fetched categories/subcateasdasdfgories:", response.data.categories);
            // Assuming the backend returns categories directly or nested under 'categories'
            return response.data.categories || response.data;
        } catch (error: any) {
            console.error("Error fetching categories/subcategories:", error);
            throw error;
        }
    },

    /**
     * Fetches all top-level categories with their subcategory counts and associated commission rules.
     * This is specifically for the CategoryCommissionManagement page.
     * @returns An array of ICategoryResponse objects, each potentially including subCategoryCount and commissionRule.
     */
    // async getAllTopLevelCategoriesWithDetails(): Promise<ICategoryResponse[]> {
    //     try {
    //         const response = await axiosInstance.get(CATEGORIES_TOP_LEVEL_DETAILS_PATH);
    //         console.log("Fetched top-level categories with details:", response.data);
    //         return response.data.categories || response.data; // Adjust based on actual backend response structure
    //     } catch (error: any) {
    //         console.error("Error fetching top-level categories with details:", error);
    //         throw error;
    //     }
    // },

    /**
     * Fetches the global commission rule.
     * @returns The global ICommissionRuleResponse object.
     */
    async getGlobalCommissionRule(): Promise<ICommissionRuleResponse> {
        try {
            // Updated path to be more explicit for global commission rule
            const response = await axiosInstance.get(GLOBAL_COMMISSION_PATH);
            console.log("Fetched global commission rule:", response.data);
            return response.data;
        } catch (error: any) {
            console.error("Error fetching global commission rule:", error);
            throw error;
        }
    },

    /**
     * Updates the global commission rule.
     * @param globalCommission The new global commission percentage.
     * @returns The updated ICommissionRuleResponse object.
     */
    async updateGlobalCommission(globalCommission: number): Promise<ICommissionRuleResponse> {
        try {
            // Create the ICommissionRuleInput object from the number
            const commissionRuleInput: ICommissionRuleInput = {
                globalCommission: globalCommission,
                status: true, // Explicitly set status as it's now optional in ICommissionRuleInput based on backend type
                // other fields like categoryid, flatFee, categoryCommission are not applicable here
            };
            const response = await axiosInstance.put(GLOBAL_COMMISSION_PATH, commissionRuleInput);
            console.log("Global commission rule updated:", response.data);
            return response.data;
        } catch (error: any) {
            console.error("Error updating global commission rule:", error);
            throw error;
        }
    },

    /**
     * Deletes a category or subcategory by its ID.
     * @param id The ID of the category or subcategory to delete.
     * @returns The deleted ICategoryResponse object or a success confirmation.
     */
    async deleteCategory(id: string): Promise<ICategoryResponse> {
        try {
            const response = await axiosInstance.delete(`${CATEGORIES_PATH}/${id}`);
            console.log(`Category/Subcategory with ID ${id} deleted:`, response.data);
            return response.data;
        } catch (error: any) {
            console.error(`Error deleting category/subcategory with ID ${id}:`, error);
            throw error;
        }
    },
};