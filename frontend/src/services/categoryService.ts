// src/services/CategoryService.ts (Modified)
import axiosInstance from "../API/axiosInstance"; // Import the configured instance
// import config from "../API/config"; // No longer needed directly for base URL
import { Category, CategoryInput, CommissionRule, CommissionRuleInput, CategoryFormCombinedData } from "../types/category";

// API_URL is now handled by the baseURL in axiosInstance. We just need the path.
const CATEGORIES_PATH = '/categories';
const COMMISSION_RULES_PATH = '/commissionrules'; // if you have other endpoints under this

export const categoryService = {
    async createCategory(categoryData: CategoryInput): Promise<Category> {
        console.log("Creating category with data:", categoryData);
        try {
            // Use axiosInstance instead of axios
            const response = await axiosInstance.post(CATEGORIES_PATH, categoryData);
            console.log("Category created:", response.data);
            return response.data;
        } catch (error: any) {
            // Your global interceptor can handle basic 401 errors.
            // You might still want specific error handling here if needed.
            console.error("Error creating category in service:", error);
            throw error; // Re-throw so the component can catch it
        }
    },

    async getCategoryById(id: string): Promise<Category> {
        try {
            const response = await axiosInstance.get(`${CATEGORIES_PATH}/${id}`);
            return response.data;
        } catch (error: any) {
            console.error(`Error fetching category with ID ${id}:`, error);
            throw error;
        }
    },

    async updateCategory(id: string, categoryData: Partial<CategoryInput>, commissionRuleData?: any): Promise<Category> {
        try {
            // Note: If commissionRuleData also needs a separate endpoint, handle accordingly.
            // Assuming this update endpoint takes both category and rule data.
            const response = await axiosInstance.put(`${CATEGORIES_PATH}/${id}`, { categoryData, commissionRuleData });
            return response.data;
        } catch (error: any) {
            console.error(`Error updating category with ID ${id}:`, error);
            throw error;
        }
    },

    // ... add other service methods here, all using axiosInstance
};