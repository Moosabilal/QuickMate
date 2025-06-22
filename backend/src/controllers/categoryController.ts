// src/controllers/CategoryController.ts
import { Request, Response, NextFunction } from 'express';
import { CategoryService } from '../services/categoryService';
// Assuming ICategoryFormCombinedData, ICategoryInput from '../types/category' are correctly defined with boolean status
import { ICategoryFormCombinedData, ICategoryInput } from '../types/category';
import { uploadToCloudinary } from '../utils/cloudinaryUpload';
import { validationResult } from 'express-validator';

// Assuming AuthRequest from authMiddleware if not globally declared
interface AuthRequest extends Request {
  user?: { id: string; role: string };
}

// IMPORTANT: This type should now reflect what CategoryService methods expect for commission rule status, which is boolean.
type CommissionRuleInputService = {
    flatFee?: number;
    categoryCommission?: number;
    status?: boolean; // CHANGED: Now boolean, to match CategoryService and types/category.ts
    removeRule?: boolean;
};

export class CategoryController {
  private categoryService: CategoryService;

  constructor() {
    this.categoryService = new CategoryService();
  }

  /**
   * @route POST /api/categories
   * @desc Create a new category with optional icon and commission rule.
   * @access Admin
   */
  createCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    console.log("Request body:", req.body); // Debugging line to check request body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    try {
      const iconFile = req.file;
      let iconUrl: string | undefined;

      if (iconFile) {
        iconUrl = await uploadToCloudinary(iconFile.path);
      }

      const {
        name,
        description,
        status, // boolean from frontend
        parentId,
        commissionType,
        commissionValue,
        commissionStatus, // boolean from frontend
      }: ICategoryFormCombinedData = req.body;

      const categoryInput: ICategoryInput = {
        name,
        description,
        parentId: parentId === '' ? null : parentId,
        status: status, // Directly use boolean
        iconUrl,
      };

      // REMOVE THIS MAPPING: const commissionStatusMappedForService = (commissionStatus ? 'Active' : 'InActive') as 'Active' | 'InActive';
      // Commission status from frontend is already boolean, and service now expects boolean.

      let commissionRuleInputForService: CommissionRuleInputService | undefined;

      if (commissionType && commissionType !== 'none' && commissionValue !== '') {
        if (commissionType === 'percentage') {
          commissionRuleInputForService = {
            categoryCommission: Number(commissionValue),
            status: commissionStatus, // DIRECTLY USE THE BOOLEAN 'commissionStatus' HERE
          };
        } else if (commissionType === 'flat') {
          commissionRuleInputForService = {
            flatFee: Number(commissionValue),
            status: commissionStatus, // DIRECTLY USE THE BOOLEAN 'commissionStatus' HERE
          };
        }
      }

      const { category, commissionRule } = await this.categoryService.createCategory(
        categoryInput,
        commissionRuleInputForService
      );

      res.status(201).json({
        message: 'Category created successfully',
        category,
        commissionRule,
      });
      return;
    } catch (error: any) {
      if (error.message.includes('Category with this name already exists')) {
        res.status(409).json({ message: error.message });
        return;
      }
      next(error);
    }
  };

  /**
   * @route PUT /api/categories/:id
   * @desc Update an existing category with optional icon and commission rule.
   * @access Admin
   */
  updateCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    try {
      const { id } = req.params;
      const iconFile = req.file;
      let iconUrl: string | undefined = req.body.iconUrl;

      if (iconFile) {
        iconUrl = await uploadToCloudinary(iconFile.path);
      } else if (req.body.iconUrl === '') {
        iconUrl = undefined;
      }

      const {
        name,
        description,
        status, // boolean from frontend
        parentId,
        commissionType,
        commissionValue,
        commissionStatus, // boolean from frontend
      }: ICategoryFormCombinedData = req.body;

      const updateCategoryData: Partial<ICategoryInput> = {
        name,
        description,
        parentId: parentId === '' ? null : parentId,
        status: status, // Directly use boolean
        iconUrl,
      };

      // REMOVE THIS MAPPING: const commissionStatusMappedForService = (commissionStatus ? 'Active' : 'InActive') as 'Active' | 'InActive';

      let commissionRuleInputForService: CommissionRuleInputService | undefined;

      if (commissionType === 'none' || (commissionType && commissionValue === '')) {
          commissionRuleInputForService = {
              removeRule: true,
              status: commissionStatus // DIRECTLY USE THE BOOLEAN 'commissionStatus' HERE
          };
      } else if (commissionType && commissionValue !== '') {
        if (commissionType === 'percentage') {
          commissionRuleInputForService = {
            categoryCommission: Number(commissionValue),
            flatFee: undefined,
            status: commissionStatus, // DIRECTLY USE THE BOOLEAN 'commissionStatus' HERE
          };
        } else if (commissionType === 'flat') {
          commissionRuleInputForService = {
            flatFee: Number(commissionValue),
            categoryCommission: undefined,
            status: commissionStatus, // DIRECTLY USE THE BOOLEAN 'commissionStatus' HERE
          };
        }
      }

      const { category, commissionRule } = await this.categoryService.updateCategory(
        id,
        updateCategoryData,
        commissionRuleInputForService
      );

      res.status(200).json({
        message: 'Category updated successfully',
        category,
        commissionRule,
      });
      return;
    } catch (error: any) {
      if (error.message.includes('Category not found')) {
        res.status(404).json({ message: error.message });
        return;
      }
      if (error.message.includes('Category with this name already exists')) {
        res.status(409).json({ message: error.message });
        return;
      }
      next(error);
    }
  };

  /**
   * @route GET /api/categories/:id
   * @desc Get a single category by ID, formatted for frontend form.
   * @access Admin
   */
  getCategoryById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { category, commissionRule } = await this.categoryService.getCategoryById(id);

      // Transform backend data to frontend ICategoryFormCombinedData
      const mappedCategoryForFrontend: ICategoryFormCombinedData = {
        _id: category._id.toString(),
        name: category.name,
        description: category.description || '',
        iconUrl: category.iconUrl || '',
        status: category.status ?? false, // Handle potential undefined with nullish coalescing
        parentId: category.parentId ? category.parentId.toString() : null,
        subCategories: [],
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
        // commissionRule.status from service is now boolean, directly assign
        mappedCategoryForFrontend.commissionStatus = commissionRule.status ?? false; // Handle potential undefined
      }

      res.status(200).json(mappedCategoryForFrontend);
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
   * @desc Get all categories with subcategory counts and commission details.
   * @access Admin
   */
  getAllCategoriesWithDetails = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const categories = await this.categoryService.getAllCategoriesWithDetails();
      // Assuming your service now returns `status: boolean` for categories and commission rules,
      // no further mapping is needed here unless you want to default undefined to false explicitly.
      res.status(200).json(categories);
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
      // Assuming globalRule.status is already boolean from the service
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
      const { globalCommission } = req.body;

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
   * @desc Delete a category and its associated commission rule.
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