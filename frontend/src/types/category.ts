// src/types/category.d.ts (or similar path)

export interface CategoryInput {
  name: string;
  description?: string;
  icon?: string; // This could be a URL or a base64 string if you're sending it directly
  status: boolean; // Based on your ERD 'status' field
  parentid?: string | null; // For sub-categories
  // Note: Sub-categories as an array of strings in your UI might be
  // handled separately on the backend, or the backend expects category IDs for parentid.
  // We'll stick to ERD for `parentid` and assume subCategories logic is frontend/related categories.
}

export interface Category extends CategoryInput {
  _id: string; // MongoDB _id
  // Add any other fields that the backend might return after creation, e.g., createdAt, updatedAt
}

export interface CommissionRuleInput {
    categoryId?: string; // Optional if this rule is for a global commission
    globalCommission?: number; // Percentage, for global rule
    categoryCommission?: number; // Percentage, for category specific rule
    flatFee?: number; // Flat amount, for category specific rule
    // The status for commission rules from your UI implies it's managed here too.
    // However, your ERD for CommissionRules doesn't explicitly have a `status` field,
    // only `globalCommission`, `categoryId`, `flatFee`, `categoryCommission`.
    // If your backend expects a status for commission rules, you'd add it here.
    status?: boolean; // Assuming status for commission rules based on UI
}

export interface CommissionRule extends CommissionRuleInput {
    _id: string; // MongoDB _id
}

// Combine for the data structure you showed in CategoryForm
// This might be more of a client-side representation before sending to API
export interface CategoryFormCombinedData {
  _id?: string;
  name: string;
  description: string;
  iconUrl?: string; // Client-side URL for preview/upload
  status: boolean; // boolean true/false for active/inactive in frontend
  subCategories: string[]; // List of subcategory names
  commissionType: 'percentage' | 'flat';
  commissionValue: number | '';
  commissionStatus: boolean; // boolean true/false for active/inactive commission
  // Potentially, if `parentid` is involved in 'subCategories', the backend mapping would occur.
}