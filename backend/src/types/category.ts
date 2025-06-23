// src/types/category.ts
import { Types, Document } from 'mongoose';

// --- Category Types ---
// Data shape for creating/updating a category (what typically comes from frontend/controller)
export interface ICategoryInput {
    name: string;
    description?: string | null; // Allow null for description
    parentId?: string | Types.ObjectId | null; // string from frontend/controller, will be converted to ObjectId in service/repository
    status?: boolean;
    iconUrl?: string | null; // URL after image upload
}

// Data shape for category document as stored in DB and returned by Mongoose
// This extends Document to correctly reflect Mongoose's internal type
export interface ICategory extends Document {
    _id: Types.ObjectId;
    name: string;
    description?: string | null; // Match DB schema (can be null)
    parentId?: Types.ObjectId | null; // Stored as ObjectId in DB, can be null for top-level
    status: boolean; // Assuming it's always set and boolean
    iconUrl?: string | null;
    createdAt: Date;
    updatedAt: Date;
    // Mongoose documents implicitly have .toJSON()
}

// Data shape for category document as returned by API/Service
// This is the clean JSON response, often after .toJSON()
export interface ICategoryResponse extends Omit<ICategoryInput, 'parentId'> {
    _id: string; // Convert ObjectId to string for API response
    parentId?: string | null; // Converted ObjectId to string for API response
    createdAt: string; // Convert Date to string for API response
    updatedAt: string; // Convert Date to string for API response
    // For GET all categories (especially top-level), we might add:
    subCategoryCount?: number;
    // Commission rule is explicitly for top-level categories
    commissionRule?: ICommissionRuleResponse | null;
}

// --- Commission Rule Types ---
// Data shape for creating/updating a commission rule
export interface ICommissionRuleInput {
    categoryId?: string | null; // string from frontend/controller, will be converted to ObjectId or null for global
    globalCommission?: number; // Only for global rule
    flatFee?: number; // For category-specific flat fee
    categoryCommission?: number; // For category-specific percentage commission
    status?: boolean; // Now consistently boolean
}

// Data shape for commission rule document as stored in DB and returned by Mongoose
// This extends Document to correctly reflect Mongoose's internal type
export interface ICommissionRule extends Document {
    _id: Types.ObjectId;
    categoryId?: Types.ObjectId | null; // Stored as ObjectId in DB, can be null for global rule
    globalCommission?: number;
    flatFee?: number;
    categoryCommission?: number;
    status: boolean; // Assuming it's always set and boolean
    createdAt: Date;
    updatedAt: Date;
    // Mongoose documents implicitly have .toJSON()
}

// Data shape for commission rule document as returned by API/Service
export interface ICommissionRuleResponse extends Omit<ICommissionRuleInput, 'categoryId'> {
    _id: string; // Convert ObjectId to string for API response
    categoryId?: string | null; // Converted ObjectId to string for API response
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
    iconUrl?: string | null; // URL of the icon, can be null if not provided
    status: boolean; // Frontend boolean for 'Active'/'InActive'
    parentId?: string | null; // For linking to a parent category (should be null for top-level form)

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
    iconUrl?: string | null;
    status: boolean;
    parentId?: string | null; // Will be present for subcategories
    // No commissionRule or commission-related fields expected here for subcategories
}