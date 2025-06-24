import { Request, Response, NextFunction } from 'express';
import { CategoryService } from '../services/categoryService';
import { ICategoryInput, ICategoryFormCombinedData, ICategory } from '../types/category';
import { uploadToCloudinary } from '../utils/cloudinaryUpload';
import { validationResult } from 'express-validator';
import * as fs from 'fs';
import * as fsPromises from 'fs/promises';

interface AuthRequest extends Request {
  user?: { id: string; role: string };
  file?: Express.Multer.File;
}

type CommissionRuleInputController = {
  flatFee?: number;
  categoryCommission?: number;
  status?: boolean;
  removeRule?: boolean; 
};

export class CategoryController {
  private categoryService: CategoryService;

  constructor() {
    this.categoryService = new CategoryService();
  }

  createCategory = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      if (req.file && fs.existsSync(req.file.path)) {
        try {
          await fsPromises.unlink(req.file.path);
        } catch (fileErr) {
          console.error("Error deleting temp file after validation error:", fileErr);
        }
      }
      res.status(400).json({ errors: errors.array() });
      return;
    }

    try {
      const iconFile = req.file;
      let iconUrl: string | undefined | null;

      if (iconFile) {
        iconUrl = await uploadToCloudinary(iconFile.path);
      } else if (req.body.iconUrl === '') { 
        iconUrl = null;
      }

      const {
        name,
        description,
        status,
        parentId,
        commissionType,
        commissionValue,
        commissionStatus,
      } = req.body;

      const categoryInput: ICategoryInput = {
        name,
        description,
        status: status, 
        iconUrl: iconUrl,
        parentId: parentId === '' ? null : parentId ?? null, 
      };

      let commissionRuleInputForService: CommissionRuleInputController | undefined = undefined;

      if (!categoryInput.parentId) {
        const parsedCommissionValue = commissionValue !== '' ? Number(commissionValue) : undefined;

        if (commissionType === 'none') {
          commissionRuleInputForService = {
            removeRule: true,
            status: commissionStatus, 
          };
        } else if (commissionType && parsedCommissionValue !== undefined) {
          if (commissionType === 'percentage') {
            commissionRuleInputForService = {
              categoryCommission: parsedCommissionValue,
              flatFee: undefined,
              status: commissionStatus,
            };
          } else if (commissionType === 'flat') {
            commissionRuleInputForService = {
              flatFee: parsedCommissionValue,
              categoryCommission: undefined,
              status: commissionStatus,
            };
          }
        }
      }

      const { category, commissionRule } = await this.categoryService.createCategory(
        categoryInput,
        commissionRuleInputForService 
      );

      res.status(201).json({
        message: `${category.parentId ? 'Subcategory' : 'Category'} created successfully`,
        category,
        commissionRule, // Will be undefined if it's a subcategory
      });
      return;
    } catch (error: any) {
      if (req.file && fs.existsSync(req.file.path)) {
        try {
          await fsPromises.unlink(req.file.path);
        } catch (fileErr) {
          console.error("Error deleting temp file on createCategory error:", fileErr);
        }
      }
      if (error.message.includes('Category with this name already exists') || error.message.includes('A subcategory with this name already exists under the specified parent')) {
        res.status(409).json({ message: error.message });
        return;
      }
      next(error);
    }
  };

  /**
   * @route PUT /api/categories/:id
   * @desc Update an existing category (main or sub) with optional icon. Commission applies only to main categories.
   * @access Admin
   */
  updateCategory = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      if (req.file && fs.existsSync(req.file.path)) {
        try {
          await fsPromises.unlink(req.file.path);
        } catch (fileErr) {
          console.error("Error deleting temp file after validation error:", fileErr);
        }
      }
      res.status(400).json({ errors: errors.array() });
      return;
    }

    try {
      const { id } = req.params;
      const iconFile = req.file;
      let iconUrl: string | undefined | null;

      if (iconFile) {
        iconUrl = await uploadToCloudinary(iconFile.path);
      } else if (req.body.iconUrl === '') {
        iconUrl = null;
        // TODO: Add logic here to delete old image from Cloudinary if category.iconUrl had a public_id.
        // This would require fetching the existing category first to get the old iconUrl.
      } else if (req.body.iconUrl !== undefined) {
        iconUrl = req.body.iconUrl;
      }

      const {
        name,
        description,
        status,
        parentId, // Can be used for re-parenting if backend supports
        commissionType,
        commissionValue,
        commissionStatus,
      } = req.body;

      const updateCategoryData: Partial<ICategoryInput> = {
        name,
        description,
        status: status,
        iconUrl: iconUrl,
        parentId: parentId === '' ? null : (parentId || null), // Handle parentId for updates
      };

      let commissionRuleInputForService: CommissionRuleInputController | undefined = undefined;

      // Determine if the category being updated IS a top-level category or being CONVERTED to one.
      // This requires fetching the existing category first to know its current parentId state.
      // For simplicity here, we'll assume the `parentId` in the request body accurately
      // reflects whether it's a main category (no parentId) or subcategory (has parentId).
      // A more robust solution might involve fetching the category first.
      const isCurrentlyMainCategory = !parentId; // If no parentId in update request, assume it's a main category being updated

      if (isCurrentlyMainCategory) {
        const parsedCommissionValue = commissionValue !== '' ? Number(commissionValue) : undefined;

        if (commissionType === 'none') {
          commissionRuleInputForService = {
            removeRule: true,
            status: commissionStatus,
          };
        } else if (commissionType && parsedCommissionValue !== undefined) {
          if (commissionType === 'percentage') {
            commissionRuleInputForService = {
              categoryCommission: parsedCommissionValue,
              flatFee: undefined,
              status: commissionStatus,
            };
          } else if (commissionType === 'flat') {
            commissionRuleInputForService = {
              flatFee: parsedCommissionValue,
              categoryCommission: undefined,
              status: commissionStatus,
            };
          }
        }
      }
      // If updateCategoryData.parentId is present, commissionRuleInputForService remains undefined,
      // and the service will ignore commission updates for subcategories.

      const { category, commissionRule } = await this.categoryService.updateCategory(
        id,
        updateCategoryData,
        commissionRuleInputForService // This will be undefined if it's a subcategory
      );

      if (!category) {
        res.status(500).json({ message: 'Category update failed: category is null.' });
        return;
      }
      res.status(200).json({
        message: `${category.parentId ? 'Subcategory' : 'Category'} updated successfully`,
        category,
        commissionRule, // Will be undefined if it's a subcategory
      });
      return;
    } catch (error: any) {
      if (req.file && fs.existsSync(req.file.path)) {
        try {
          await fsPromises.unlink(req.file.path);
        } catch (fileErr) {
          console.error("Error deleting temp file on updateCategory error:", fileErr);
        }
      }
      if (error.message.includes('Category not found')) {
        res.status(404).json({ message: error.message });
        return;
      }
      if (error.message.includes('Category with this name already exists') || error.message.includes('A subcategory with this name already exists under the specified parent')) {
        res.status(409).json({ message: error.message });
        return;
      }
      next(error);
    }
  };

  /**
   * @route GET /api/categories/:id
   * @desc Get a single category or subcategory by ID, formatted for frontend form.
   * @access Admin
   */
  getCategoryById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { category, commissionRule } = await this.categoryService.getCategoryById(id);
      const subCategories = await this.categoryService.getAllSubcategories(id);

      // Frontend ICategoryFormCombinedData is designed for the main category form
      // Subcategory form expects a simpler object without commission.
      // We should map based on whether it has a parentId.

      // Base common properties for both category and subcategory
      const commonData = {
        _id: category._id.toString(),
        name: category.name,
        description: category.description || '',
        iconUrl: category.iconUrl || null,
        status: category.status ?? false,
        parentId: category.parentId ? category.parentId.toString() : null,
      };

      if (category.parentId) { // It's a subcategory
        // Simply return the common data as subcategories don't have commission fields
        res.status(200).json(commonData);
      } else { // It's a top-level category, include commission details
        const mappedCategoryForFrontend: ICategoryFormCombinedData = {
          ...commonData,
          commissionType: 'none', // Default
          commissionValue: '', // Default
          commissionStatus: false, // Default
        };

        if (commissionRule) {
          if (commissionRule.categoryCommission !== undefined && commissionRule.categoryCommission !== null) {
            mappedCategoryForFrontend.commissionType = 'percentage';
            mappedCategoryForFrontend.commissionValue = commissionRule.categoryCommission;
          } else if (commissionRule.flatFee !== undefined && commissionRule.flatFee !== null) {
            mappedCategoryForFrontend.commissionType = 'flat';
            mappedCategoryForFrontend.commissionValue = commissionRule.flatFee;
          }
          mappedCategoryForFrontend.commissionStatus = commissionRule.status ?? false;
        }
        res.status(200).json({
          ...mappedCategoryForFrontend,
          subCategories
        });
      }
      return;
    } catch (error: any) {
      if (error.message.includes('Category not found')) {
        res.status(404).json({ message: error.message });
        return;
      }
      next(error);
    }
  };

  /**
   * @route GET /api/categories
   * @desc Get all top-level categories with subcategory counts OR all subcategories of a specific parent.
   * @access Admin
   */
  getAllCategories = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { parentId } = req.query; // Get parentId from query params

      let categories: ICategory[] | import("../types/category").ICategoryResponse[];

      if (parentId) {
        // If parentId is provided, fetch subcategories
        categories = await this.categoryService.getAllSubcategories(parentId.toString());
        // For subcategories, we typically don't need commission details or subCategoryCount for the list view
        const mappedSubcategories = (categories as import("../types/category").ICategoryResponse[]).map(cat => ({
            _id: cat._id.toString(),
            name: cat.name,
            description: cat.description || '',
            iconUrl: cat.iconUrl || '',
            status: cat.status ?? false,
            parentId: cat.parentId ? cat.parentId.toString() : null,
            // No subCategoriesCount, commissionType, commissionValue, commissionStatus for subcategories list
        }));
        res.status(200).json(mappedSubcategories);

      } else {
        // If no parentId, fetch all top-level categories with details (including subCategoryCount and commission)
        categories = await this.categoryService.getAllTopLevelCategoriesWithDetails(); // This method name is good for top-level

        const mappedCategories = categories.map(cat => {
          // Type guard to check if commissionRule exists
          const hasCommissionRule = (obj: any): obj is { commissionRule: any } => 
            obj && typeof obj === 'object' && 'commissionRule' in obj && obj.commissionRule !== undefined && obj.commissionRule !== null;

          let commissionType = 'none';
          let commissionValue = '';
          let commissionStatus = false;

          if (hasCommissionRule(cat)) {
            if (cat.commissionRule.categoryCommission !== undefined && cat.commissionRule.categoryCommission !== null) {
              commissionType = 'percentage';
              commissionValue = cat.commissionRule.categoryCommission;
            } else if (cat.commissionRule.flatFee !== undefined && cat.commissionRule.flatFee !== null) {
              commissionType = 'flat';
              commissionValue = cat.commissionRule.flatFee;
            }
            commissionStatus = cat.commissionRule.status ?? false;
          }


          return {
            _id: cat._id.toString(),
            name: cat.name,
            description: cat.description || '',
            iconUrl: cat.iconUrl || '',
            status: cat.status ?? false,
            parentId: cat.parentId ? cat.parentId.toString() : null, // Should be null for top-level
            subCategoriesCount: (cat as any).subCategoryCount || 0, // Use 'as any' to access property if present
            subCategories: (cat as any).subCategories || [], // Use 'as any' to access property if present
            commissionType,
            commissionValue,
            commissionStatus,
          };
        });
        res.status(200).json(mappedCategories);
      }
      return;
    } catch (error: any) {
      next(error);
    }
  };

  /**
   * @route GET /api/categories/global-commission
   * @desc Get the global commission rule.
   * @access Admin
   */
  getGlobalCommission = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const globalRule = await this.categoryService.getGlobalCommissionRule();
      res.status(200).json(globalRule);
      return;
    } catch (error: any) {
      next(error);
    }
  };

  /**
   * @route PUT /api/categories/global-commission
   * @desc Update the global commission rule.
   * @access Admin
   */
  updateGlobalCommission = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    try {
      const { globalCommission } = req.body; // globalCommission is the number directly

      // Validation already done by express-validator but good to have a runtime check
      if (typeof globalCommission !== 'number' || globalCommission < 0 || globalCommission > 100) {
        res.status(400).json({ message: 'Invalid global commission value. Must be a number between 0 and 100.' });
        return;
      }

      const updatedRule = await this.categoryService.updateGlobalCommission(globalCommission);
      res.status(200).json({
        message: 'Global commission updated successfully',
        rule: updatedRule,
      });
      return;
    } catch (error: any) {
      next(error);
    }
  };

  /**
   * @route DELETE /api/categories/:id
   * @desc Delete a category and its associated commission rule (if it's a main category).
   * @access Admin
   */
  deleteCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const deletedCategory = await this.categoryService.deleteCategory(id);
      res.status(200).json({
        message: 'Category deleted successfully',
        category: deletedCategory,
      });
      return;
    } catch (error: any) {
      if (error.message.includes('Category not found')) {
        res.status(404).json({ message: error.message });
        return;
      }
      if (error.message.includes('Cannot delete category with existing subcategories')) {
        res.status(400).json({ message: error.message });
        return;
      }
      next(error);
    }
  };
}