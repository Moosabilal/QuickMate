// src/types/category.ts
import { Types, Document } from 'mongoose';

// --- Category Types ---
// Data shape for creating/updating a category (what typically comes from frontend/controller)
export interface ICategoryInput {
    name: string;
    description?: string | null; // Allow null for description
    parentid?: string | Types.ObjectId | null; // Changed from parentId to parentid
    status?: boolean;
    icon?: string | null; // Changed from iconUrl to icon
}

// Data shape for category document as stored in DB and returned by Mongoose
// This extends Document to correctly reflect Mongoose's internal type
export interface ICategory extends Document {
    _id: Types.ObjectId;
    name: string;
    description?: string | null; // Match DB schema (can be null)
    parentid?: Types.ObjectId | null; // Changed from parentId to parentid. Stored as ObjectId in DB, can be null for top-level
    status: boolean; // Assuming it's always set and boolean
    icon?: string | null; // Changed from iconUrl to icon
    createdAt: Date;
    updatedAt: Date;
    // Mongoose documents implicitly have .toJSON()
}

// Data shape for category document as returned by API/Service
// This is the clean JSON response, often after .toJSON()
export interface ICategoryResponse extends Omit<ICategoryInput, 'parentid'> { // Changed from parentId to parentid
    _id: string; // Convert ObjectId to string for API response
    parentid?: string | null; // Changed from parentId to parentid. Converted ObjectId to string for API response
    createdAt: string; // Convert Date to string for API response
    updatedAt: string;
    iconUrl: string; // Convert Date to string for API response
    // For GET all categories (especially top-level), we might add:
    subCategoryCount?: number | undefined; // Kept as needed by CategoryCommissionManagement
    // Commission rule is explicitly for top-level categories
    commissionStatus: boolean,
    commissionType: string | null,
    commissionValue: number | null // Kept as needed by CategoryCommissionManagement
    subCategories?: ICategoryResponse[]; // ADDED: To include nested subcategories for detail pages
}

// --- Commission Rule Types ---
// Data shape for creating/updating a commission rule
export interface ICommissionRuleInput {
    categoryid?: string | null; // Changed from categoryId to categoryid
    globalCommission?: number; // Only for global rule
    flatFee?: number; // For category-specific flat fee
    categoryCommission?: number; // For category-specific percentage commission
    status?: boolean; // Explicitly marked as optional, matching backend type
}

// Data shape for commission rule document as stored in DB and returned by Mongoose
// This extends Document to correctly reflect Mongoose's internal type
export interface ICommissionRule extends Document {
    _id: Types.ObjectId;
    categoryid?: Types.ObjectId | null; // Changed from categoryId to categoryid. Stored as ObjectId in DB, can be null for global rule
    globalCommission?: number;
    flatFee?: number;
    categoryCommission?: number;
    status: boolean; // Assuming it's always set and boolean
    createdAt: Date;
    updatedAt: Date;
    // Mongoose documents implicitly have .toJSON()
}

// Data shape for commission rule document as returned by API/Service
export interface ICommissionRuleResponse extends Omit<ICommissionRuleInput, 'categoryid'> { // Changed from categoryId to categoryid
    _id: string; // Convert ObjectId to string for API response
    categoryid?: string | null; // Changed from categoryId to categoryid. Converted ObjectId to string for API response
    createdAt: string;
    updatedAt: string;
}

// --- Combined Frontend Form Data (for Category & Commission) ---
// This reflects the structure your frontend CategoryForm might send
// This interface is specifically for the form that handles TOP-LEVEL categories with commission.
export interface ICategoryFormCombinedData {
    _id?: string; // Optional for new categories
    name: string;
    description: string;
    iconUrl?: string | null; // Changed from iconUrl to icon
    status: boolean; // Frontend boolean for 'Active'/'InActive'
    parentid?: string | null; // Changed from parentId to parentid. For linking to a parent category (should be null for top-level form)

    // These fields are only relevant for top-level categories
    commissionType: 'percentage' | 'flat' | 'none'; // 'none' if no custom commission
    commissionValue: number | ''; // Can be empty string if no value
    commissionStatus: boolean; // Frontend boolean for 'Active'/'InActive'
}

// Interface for fetching data for subcategory form (simplified, no commission)
export interface ISubcategoryFormFetchData {
    _id: string;
    name: string;
    description: string;
    iconUrl?: string | null; // Changed from iconUrl to icon
    status: boolean;
    parentid?: string | null; // Changed from parentId to parentid. Will be present for subcategories
    // No commissionRule or commission-related fields expected here for subcategories
}