// src/services/CategoryService.ts
import axiosInstance from "../API/axiosInstance";
import { Category, CategoryInput, CommissionRule, CommissionRuleInput } from "../types/category";

const CATEGORIES_PATH = '/categories';

export const categoryService = {

    /**
     * Creates a new category or subcategory.
     * The `formData` should include `parentId` if it's a subcategory.
     * Commission fields should be omitted from formData if it's a subcategory.
     * @param formData The FormData object containing category/subcategory data.
     * @returns The created Category object.
     */
    async createCategory(formData: FormData): Promise<Category> {
        console.log("Creating category/subcategory with data:");
        for (let [key, value] of formData.entries()) {
            console.log(`${key}: ${value}`);
        }
        try {
            const response = await axiosInstance.post(CATEGORIES_PATH, formData);
            console.log("Category/Subcategory created:", response.data);
            return response.data.category || response.data;
        } catch (error: any) {
            console.error("Error creating category/subcategory in service:", error);
            throw error;
        }
    },

    /**
     * Fetches a category or subcategory by its ID.
     * @param id The ID of the category or subcategory to fetch.
     * @returns The fetched Category object.
     */
    async getCategoryById(id: string): Promise<Category> {
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
     * @returns The updated Category object.
     */
    async updateCategory(id: string, formData: FormData): Promise<Category> {
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
     * @param parentId Optional. If provided, fetches subcategories of that parent. If not, fetches top-level categories.
     * @returns An array of Category objects.
     */
    async getAllCategories(parentId?: string): Promise<Category[]> {
        try {
            const params: { parentId?: string } = {};
            if (parentId) {
                params.parentId = parentId;
            }
            const response = await axiosInstance.get(CATEGORIES_PATH, { params });
            console.log("Fetched categories/subcategories:", response.data);
            return response.data.categories || response.data;
        } catch (error: any) {
            console.error("Error fetching categories/subcategories:", error);
            throw error;
        }
    },

    // Global commission rules are typically for the whole system, not individual categories.
    // If they are specific to a 'main' category type, this might need re-evaluation.
    // For now, keeping them separate from general category operations.

    /**
     * Fetches the global commission rule.
     * NOTE: This is likely for system-wide settings, not individual categories.
     * @returns The global CommissionRule object.
     */
    async getGlobalCommissionRule(): Promise<CommissionRule> {
        try {
            const response = await axiosInstance.get(`${CATEGORIES_PATH}/global-commission`); // Adjust path if needed
            console.log("Fetched global commission rule:", response.data);
            return response.data;
        } catch (error: any) {
            console.error("Error fetching global commission rule:", error);
            throw error;
        }
    },

    /**
     * Updates the global commission rule.
     * NOTE: This is likely for system-wide settings, not individual categories.
     * @param commissionRuleInput The new global commission rule details.
     * @returns The updated CommissionRule object.
     */
    async updateGlobalCommission(commissionRuleInput: CommissionRuleInput): Promise<CommissionRule> {
        try {
            const response = await axiosInstance.put(`${CATEGORIES_PATH}/global-commission`, commissionRuleInput); // Adjust path if needed
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
     * @returns The deleted Category object or a success confirmation.
     */
    async deleteCategory(id: string): Promise<Category> {
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