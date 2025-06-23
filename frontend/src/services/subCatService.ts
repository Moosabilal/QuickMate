// src/services/CategoryService.ts
import axiosInstance from "../API/axiosInstance"; // Import the configured instance
// import config from "../API/config"; // No longer needed directly for base URL

// API_URL is now handled by the baseURL in axiosInstance. We just need the path.
const CATEGORIES_PATH = '/services';
// const COMMISSION_RULES_PATH = '/commissionrules'; // This path might be for separate rule management, not direct category updates

export const subCatService = {

    async getSubCategoriesByServiceId(serviceId: string): Promise<any> {
        try {
            const response = await axiosInstance.get(`${CATEGORIES_PATH}/${serviceId}/subcategories`);
            return response.data;
        } catch (error: any) {
            console.error(`Error fetching sub-categories for service ID ${serviceId}:`, error);
            throw error;
        }
    },

    async createSubCategory(serviceId: string, formData: FormData): Promise<any> {
        try {
            const response = await axiosInstance.post(`${CATEGORIES_PATH}/${serviceId}/subcategories`, formData);
            return response.data;
        } catch (error: any) {
            console.error(`Error creating sub-category for service ID ${serviceId}:`, error);
            throw error;
        }
    },

    async updateSubCategory(serviceId: string, subCategoryId: string, formData: FormData): Promise<any> {
        try {
            const response = await axiosInstance.put(`${CATEGORIES_PATH}/${serviceId}/subcategories/${subCategoryId}`, formData);
            return response.data;
        } catch (error: any) {
            console.error(`Error updating sub-category with ID ${subCategoryId} for service ID ${serviceId}:`, error);
            throw error;
        }
    },

    async deleteSubCategory(serviceId: string, subCategoryId: string): Promise<any> {
        try {
            const response = await axiosInstance.delete(`${CATEGORIES_PATH}/${serviceId}/subcategories/${subCategoryId}`);
            return response.data;
        } catch (error: any) {
            console.error(`Error deleting sub-category with ID ${subCategoryId} for service ID ${serviceId}:`, error);
            throw error;
        }
    }
    
};