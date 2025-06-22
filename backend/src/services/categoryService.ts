// src/services/CategoryService.ts
import { CategoryRepository } from '../repositories/categoryRepository';
import { CommissionRuleRepository } from '../repositories/commissionRuleRepository';
// Ensure these types correctly reflect 'status: boolean'
import { ICategoryInput, ICategoryResponse, ICommissionRuleInput, ICommissionRuleResponse } from '../types/category';
import { Types } from 'mongoose';

export class CategoryService {
  private categoryRepository: CategoryRepository;
  private commissionRuleRepository: CommissionRuleRepository;

  constructor() {
    this.categoryRepository = new CategoryRepository();
    this.commissionRuleRepository = new CommissionRuleRepository();
  }

  async createCategory(
    categoryInput: ICategoryInput,
    // The input for commission rule here should also align with the service's internal handling.
    // If the service's internal processing also changes to boolean, this should be boolean.
    // Assuming it's now boolean for consistency with ICommissionRuleInput
    commissionRuleInput?: {
      flatFee?: number;
      categoryCommission?: number;
      status?: boolean; // Changed to boolean here
    }
  ): Promise<{ category: ICategoryResponse; commissionRule?: ICommissionRuleResponse }> {
    const existingCategory = await this.categoryRepository.findByName(categoryInput.name);
    if (existingCategory) {
      throw new Error('Category with this name already exists.');
    }

    let parentObjectId: string | null = null;
    if (categoryInput.parentId) {
      if (!Types.ObjectId.isValid(categoryInput.parentId)) {
        throw new Error('Invalid parent category ID.');
      }
      parentObjectId = new Types.ObjectId(categoryInput.parentId).toString();
      const parentCategory = await this.categoryRepository.findById(parentObjectId);
      if (!parentCategory) {
        throw new Error('Parent category not found.');
      }
    }

    const categoryDataToCreate: ICategoryInput = {
      ...categoryInput,
      parentId: parentObjectId,
      status: categoryInput.status ?? true, // Use ?? true to default to active if undefined
    };
    const createdCategory = await this.categoryRepository.create(categoryDataToCreate);
    // Directly cast to ICategoryResponse. Ensure Mongoose model's 'status' is boolean for this to be clean.
    const categoryResponse: ICategoryResponse = createdCategory.toJSON() as ICategoryResponse;

    let createdCommissionRule: ICommissionRuleResponse | undefined;
    if (commissionRuleInput) {
      const ruleData: ICommissionRuleInput = {
        categoryId: createdCategory._id.toString(),
        flatFee: commissionRuleInput.flatFee,
        categoryCommission: commissionRuleInput.categoryCommission,
        status: commissionRuleInput.status ?? true, // Use ?? true to default to active if undefined
      };
      const newRule = await this.commissionRuleRepository.create(ruleData);
      // Directly cast. Ensure Mongoose commission rule model's 'status' is boolean.
      createdCommissionRule = newRule.toJSON() as ICommissionRuleResponse;
    }

    return { category: categoryResponse, commissionRule: createdCommissionRule };
  }

  async updateCategory(
    categoryId: string,
    updateCategoryInput: Partial<ICategoryInput>,
    commissionRuleInput?: {
      flatFee?: number;
      categoryCommission?: number;
      status?: boolean; // Changed to boolean here
      removeRule?: boolean;
    }
  ): Promise<{ category: ICategoryResponse | null; commissionRule?: ICommissionRuleResponse | null }> {
    if (!Types.ObjectId.isValid(categoryId)) {
      throw new Error('Invalid category ID.');
    }

    const existingCategory = await this.categoryRepository.findById(categoryId);
    if (!existingCategory) {
      throw new Error('Category not found.');
    }

    // Handle parentId update
    if (updateCategoryInput.parentId !== undefined) {
      if (updateCategoryInput.parentId === null) {
        updateCategoryInput.parentId = null;
      } else if (typeof updateCategoryInput.parentId === 'string' && Types.ObjectId.isValid(updateCategoryInput.parentId)) {
        const newParentId = new Types.ObjectId(updateCategoryInput.parentId).toString();
        if (existingCategory._id.equals(new Types.ObjectId(newParentId))) {
          throw new Error('Category cannot be its own parent.');
        }
        const parentCategory = await this.categoryRepository.findById(newParentId);
        if (!parentCategory) {
          throw new Error('Parent category not found.');
        }
        updateCategoryInput.parentId = newParentId;
      } else {
        throw new Error('Invalid parent category ID provided.');
      }
    }

    // Ensure status is handled as boolean if present in updateCategoryInput
    if (updateCategoryInput.status !== undefined) {
        updateCategoryInput.status = updateCategoryInput.status; // No change needed, already boolean
    }


    const updatedCategoryDoc = await this.categoryRepository.update(categoryId, updateCategoryInput);
    const updatedCategory: ICategoryResponse | null = updatedCategoryDoc ? updatedCategoryDoc.toJSON() as ICategoryResponse : null;

    let updatedCommissionRule: ICommissionRuleResponse | null | undefined;
    if (commissionRuleInput !== undefined) {
      const existingRule = await this.commissionRuleRepository.findByCategoryId(categoryId);

      if (commissionRuleInput.removeRule) {
        if (existingRule) {
          await this.commissionRuleRepository.delete(existingRule._id);
          updatedCommissionRule = null;
        }
      } else {
        const ruleData: ICommissionRuleInput = {
          categoryId: categoryId,
          flatFee: commissionRuleInput.flatFee,
          categoryCommission: commissionRuleInput.categoryCommission,
          status: commissionRuleInput.status ?? true, // Use ?? true to default if undefined
        };

        if (existingRule) {
          const result = await this.commissionRuleRepository.update(existingRule._id, ruleData);
          updatedCommissionRule = result ? result.toJSON() as ICommissionRuleResponse : null;
        } else {
          const result = await this.commissionRuleRepository.create(ruleData);
          updatedCommissionRule = result ? result.toJSON() as ICommissionRuleResponse : null;
        }
      }
    }

    return { category: updatedCategory, commissionRule: updatedCommissionRule };
  }

  async getCategoryById(categoryId: string): Promise<{ category: ICategoryResponse; commissionRule?: ICommissionRuleResponse | null }> {
    if (!Types.ObjectId.isValid(categoryId)) {
      throw new Error('Invalid category ID.');
    }
    const category = await this.categoryRepository.findById(categoryId);
    if (!category) {
      throw new Error('Category not found.');
    }
    const commissionRule = await this.commissionRuleRepository.findByCategoryId(categoryId);
    // Ensure category.status is boolean for ICategoryResponse, and commissionRule.status for ICommissionRuleResponse
    return {
      category: category.toJSON() as ICategoryResponse,
      commissionRule: commissionRule ? commissionRule.toJSON() as ICommissionRuleResponse : null
    };
  }

  async getAllCategoriesWithDetails(): Promise<
    Array<ICategoryResponse & { subCategoryCount: number; commissionRule?: ICommissionRuleResponse | null }>
  > {
    const categories = await this.categoryRepository.findAll({});
    const resultPromises = categories.map(async (cat) => {
      const subCategoryCount = await this.categoryRepository.countSubcategories(cat._id);
      const commissionRule = await this.commissionRuleRepository.findByCategoryId(cat._id);
      return {
        ...cat.toJSON() as ICategoryResponse, // Ensure status is boolean here
        subCategoryCount,
        commissionRule: commissionRule ? commissionRule.toJSON() as ICommissionRuleResponse : null, // Ensure status is boolean here
      };
    });
    return Promise.all(resultPromises);
  }

  async getGlobalCommissionRule(): Promise<ICommissionRuleResponse> {
    let globalRule = await this.commissionRuleRepository.findGlobalRule();
    if (!globalRule) {
      globalRule = await this.commissionRuleRepository.create({
        categoryId: null,
        globalCommission: 0,
        status: true // Changed to boolean true
      });
    }
    return globalRule.toJSON() as ICommissionRuleResponse; // Ensure status is boolean here
  }

  async updateGlobalCommission(globalCommissionPercentage: number): Promise<ICommissionRuleResponse> {
    let globalRule = await this.commissionRuleRepository.findGlobalRule();
    if (globalRule) {
      const updatedRule = await this.commissionRuleRepository.update(globalRule._id, { globalCommission: globalCommissionPercentage });
      if (!updatedRule) {
        throw new Error('Failed to update global commission rule.');
      }
      return updatedRule.toJSON() as ICommissionRuleResponse; // Ensure status is boolean here
    } else {
      const newRule = await this.commissionRuleRepository.create({
        categoryId: null,
        globalCommission: globalCommissionPercentage,
        status: true // Changed to boolean true
      });
      return newRule.toJSON() as ICommissionRuleResponse; // Ensure status is boolean here
    }
  }

  async deleteCategory(categoryId: string): Promise<ICategoryResponse> {
    if (!Types.ObjectId.isValid(categoryId)) {
      throw new Error('Invalid category ID.');
    }

    const subcategories = await this.categoryRepository.findAll({ parentId: new Types.ObjectId(categoryId) });
    if (subcategories.length > 0) {
      throw new Error('Cannot delete category with existing subcategories. Delete subcategories first.');
    }

    const deletedCategory = await this.categoryRepository.delete(categoryId);
    if (!deletedCategory) {
      throw new Error('Category not found.');
    }

    const commissionRule = await this.commissionRuleRepository.findByCategoryId(categoryId);
    if (commissionRule) {
      await this.commissionRuleRepository.delete(commissionRule._id);
    }
    return deletedCategory.toJSON() as ICategoryResponse; // Ensure status is boolean here
  }
}