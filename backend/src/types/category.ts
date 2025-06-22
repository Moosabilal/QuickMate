// src/types/index.d.ts
import { Types } from 'mongoose';

// --- Category Types ---
// Data shape for creating/updating a category (what typically comes from frontend)
export interface ICategoryInput {
  name: string;
  description?: string;
  parentId?: string | null; // string from frontend, will be converted to ObjectId in service/controller
  status?: boolean;
  iconUrl?: string; // URL after image upload
}

// Data shape for category document as stored in DB and returned
export interface ICategoryResponse extends Omit<ICategoryInput, 'parentId'> {
  _id: Types.ObjectId;
  parentId?: Types.ObjectId | null; // Stored as ObjectId in DB
  createdAt: Date;
  updatedAt: Date;
  // For GET all categories, we might add:
  subCategoryCount?: number;
}

// --- Commission Rule Types ---
// Data shape for creating/updating a commission rule
export interface ICommissionRuleInput {
  categoryId?: string | null; // string from frontend, will be converted to ObjectId or null for global
  globalCommission?: number; // Only for global rule
  flatFee?: number; // For category-specific flat fee
  categoryCommission?: number; // For category-specific percentage commission
  status?: boolean;
}

// Data shape for commission rule document as stored in DB and returned
export interface ICommissionRuleResponse extends Omit<ICommissionRuleInput, 'categoryId'> {
  _id: Types.ObjectId;
  categoryId?: Types.ObjectId | null; // Stored as ObjectId in DB
  createdAt: Date;
  updatedAt: Date;
}

// --- Combined Frontend Form Data (for Category & Commission) ---
// This reflects the structure your frontend CategoryForm might send
export interface ICategoryFormCombinedData {
  _id?: string; // Optional for new categories
  name: string;
  description: string;
  iconUrl?: string;
  status: boolean; // Frontend boolean for 'Active'/'InActive'
  parentId?: string | null; // For linking to a parent category
  subCategories?: string[]; // Frontend concept, actual sub-categories are separate Category docs

  // Commission Rule specific fields as sent from frontend
  commissionType: 'percentage' | 'flat' | 'none'; // 'none' if no custom commission
  commissionValue: number | ''; // Can be empty string if no value
  commissionStatus: boolean; // Frontend boolean for 'Active'/'InActive'
}