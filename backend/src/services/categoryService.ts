// src/services/CategoryService.ts
import { CategoryRepository } from '../repositories/categoryRepository';
import { CommissionRuleRepository } from '../repositories/commissionRuleRepository';
import { ICategoryInput, ICategoryResponse, ICommissionRuleInput, ICommissionRuleResponse, ICategory } from '../types/category';
import { Types } from 'mongoose';

// Type for the commission input specific to the service layer (from controller)
interface ServiceCommissionRuleInput {
    flatFee?: number;
    categoryCommission?: number;
    status?: boolean;
    removeRule?: boolean; // Flag to indicate rule removal
}

export class CategoryService {
    private categoryRepository: CategoryRepository;
    private commissionRuleRepository: CommissionRuleRepository;

    constructor() {
        this.categoryRepository = new CategoryRepository();
        this.commissionRuleRepository = new CommissionRuleRepository();
    }

    /**
     * Creates a new category or subcategory.
     * Commission rule is only created if it's a top-level category (no parentId).
     * @param categoryInput Data for the new category/subcategory.
     * @param commissionRuleInput Optional commission rule data for top-level categories.
     * @returns The created category/subcategory and its associated commission rule (if applicable).
     */
    async createCategory(
        categoryInput: ICategoryInput,
        commissionRuleInput?: ServiceCommissionRuleInput // Type defined above
    ): Promise<{ category: ICategoryResponse; commissionRule?: ICommissionRuleResponse }> {

        let parentObjectId: Types.ObjectId | null = null;
        if (categoryInput.parentId) {
            if (!Types.ObjectId.isValid(categoryInput.parentId)) {
                throw new Error('Invalid parent category ID.');
            }
            parentObjectId = new Types.ObjectId(categoryInput.parentId);
            const parentCategory = await this.categoryRepository.findById(parentObjectId);
            if (!parentCategory) {
                throw new Error('Parent category not found.');
            }

            // Check for duplicate subcategory name under the same parent
            const existingSubcategory = await this.categoryRepository.findByNameAndParent(categoryInput.name, parentObjectId);
            if (existingSubcategory) {
                throw new Error('A subcategory with this name already exists under the specified parent.');
            }
        } else {
            // If no parentId, it's a top-level category, check for duplicate name globally
            const existingTopLevelCategory = await this.categoryRepository.findByName(categoryInput.name);
            if (existingTopLevelCategory) {
                throw new Error('A top-level category with this name already exists.');
            }
        }

        const categoryDataToCreate: ICategoryInput = {
            ...categoryInput,
            // parentId is handled as ObjectId in repository, but ICategoryInput expects string | null
            parentId: parentObjectId ? parentObjectId.toString() : null,
            status: categoryInput.status ?? true,
        };

        const createdCategoryDoc = await this.categoryRepository.create(categoryDataToCreate);
        // Cast to unknown first, then to the target type to bypass strict type checking
        const categoryResponse: ICategoryResponse = createdCategoryDoc.toJSON() as unknown as ICategoryResponse;

        let createdCommissionRule: ICommissionRuleResponse | undefined;

        // ONLY create commission rule if it's a TOP-LEVEL category (no parentId)
        if (!categoryInput.parentId && commissionRuleInput) {
            const ruleData: ICommissionRuleInput = {
                categoryId: createdCategoryDoc._id.toString(), // categoryId for commission rule
                flatFee: commissionRuleInput.flatFee,
                categoryCommission: commissionRuleInput.categoryCommission,
                status: commissionRuleInput.status ?? true,
            };
            const newRule = await this.commissionRuleRepository.create(ruleData);
            createdCommissionRule = newRule.toJSON() as unknown as ICommissionRuleResponse;
        }

        return { category: categoryResponse, commissionRule: createdCommissionRule };
    }

    /**
     * Updates an existing category or subcategory.
     * Commission rule is only updated/managed if the category is a top-level category.
     * @param categoryId The ID of the category/subcategory to update.
     * @param updateCategoryInput Partial data for the category/subcategory.
     * @param commissionRuleInput Optional commission rule data for top-level categories.
     * @returns The updated category/subcategory and its associated commission rule (if applicable).
     */
    async updateCategory(
        categoryId: string,
        updateCategoryInput: Partial<ICategoryInput>,
        commissionRuleInput?: ServiceCommissionRuleInput
    ): Promise<{ category: ICategoryResponse | null; commissionRule?: ICommissionRuleResponse | null }> {
        if (!Types.ObjectId.isValid(categoryId)) {
            throw new Error('Invalid category ID.');
        }

        const existingCategory = await this.categoryRepository.findById(categoryId);
        if (!existingCategory) {
            throw new Error('Category not found.');
        }

        // Handle parentId update (re-parenting)
        if (updateCategoryInput.parentId !== undefined) {
            if (updateCategoryInput.parentId === null) {
                // If setting to null, it becomes a top-level category
                updateCategoryInput.parentId = null;
            } else if (typeof updateCategoryInput.parentId === 'string' && Types.ObjectId.isValid(updateCategoryInput.parentId)) {
                const newParentObjectId = new Types.ObjectId(updateCategoryInput.parentId);
                if (existingCategory._id.equals(newParentObjectId)) {
                    throw new Error('Category cannot be its own parent.');
                }
                const parentCategory = await this.categoryRepository.findById(newParentObjectId);
                if (!parentCategory) {
                    throw new Error('New parent category not found.');
                }
                // TODO: Implement circular dependency check if needed for deep nesting
                updateCategoryInput.parentId = newParentObjectId.toString(); // Store as string for input
            } else {
                throw new Error('Invalid parent category ID provided.');
            }
        }

        // Check for duplicate name if name is being updated
        if (updateCategoryInput.name && updateCategoryInput.name !== existingCategory.name) {
            let existingWithNewName: ICategory | null = null;
            // Determine the scope for name uniqueness based on parentId change
            const targetParentId = updateCategoryInput.parentId !== undefined
                                 ? (updateCategoryInput.parentId === null ? null : new Types.ObjectId(updateCategoryInput.parentId))
                                 : existingCategory.parentId;

            if (targetParentId) { // If it's a subcategory
                existingWithNewName = await this.categoryRepository.findByNameAndParent(updateCategoryInput.name, targetParentId);
            } else { // If it's a top-level category (targetParentId is null)
                existingWithNewName = await this.categoryRepository.findByName(updateCategoryInput.name);
            }

            // If the name is being changed and the new name already exists for another category
            // under the same parent (or globally for top-level), throw an error
            if (existingWithNewName && existingWithNewName._id.toString() !== categoryId) {
                if (targetParentId) {
                    throw new Error('A subcategory with this name already exists under the specified parent.');
                } else {
                    throw new Error('A top-level category with this name already exists.');
                }
            }
        }

        const updatedCategoryDoc = await this.categoryRepository.update(categoryId, updateCategoryInput);
        const updatedCategory: ICategoryResponse | null = updatedCategoryDoc ? updatedCategoryDoc.toJSON() as unknown as ICategoryResponse : null;

        let updatedCommissionRule: ICommissionRuleResponse | null | undefined;

        // Determine if the category is currently top-level or becoming top-level
        const categoryIsCurrentlyTopLevel = existingCategory.parentId === null || existingCategory.parentId === undefined;
        const categoryIsBecomingTopLevel = updateCategoryInput.parentId === null; // Explicitly becoming top-level
        const shouldManageCommission = categoryIsCurrentlyTopLevel || categoryIsBecomingTopLevel;

        if (shouldManageCommission && commissionRuleInput !== undefined) {
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
                    status: commissionRuleInput.status ?? true,
                };

                if (existingRule) {
                    const result = await this.commissionRuleRepository.update(existingRule._id, ruleData);
                    updatedCommissionRule = result ? result.toJSON() as unknown as ICommissionRuleResponse : null;
                } else {
                    const result = await this.commissionRuleRepository.create(ruleData);
                    updatedCommissionRule = result ? result.toJSON() as unknown as ICommissionRuleResponse : null;
                }
            }
        } else if (!shouldManageCommission) {
            // If the category is becoming a subcategory or already is a subcategory,
            // and had an existing commission rule, proactively delete it.
            const oldRule = await this.commissionRuleRepository.findByCategoryId(categoryId);
            if (oldRule) {
                await this.commissionRuleRepository.delete(oldRule._id);
                updatedCommissionRule = null; // Indicate that the rule was removed
            }
        }


        return { category: updatedCategory, commissionRule: updatedCommissionRule };
    }

    /**
     * Gets a single category or subcategory by ID.
     * Includes commission rule if it's a top-level category.
     * @param categoryId The ID of the category/subcategory.
     * @returns The category/subcategory data and its commission rule (if applicable).
     */
    async getCategoryById(categoryId: string): Promise<{ category: ICategoryResponse; commissionRule?: ICommissionRuleResponse | null }> {
        if (!Types.ObjectId.isValid(categoryId)) {
            throw new Error('Invalid category ID.');
        }
        const categoryDoc = await this.categoryRepository.findById(categoryId);
        if (!categoryDoc) {
            throw new Error('Category not found.');
        }

        const category = categoryDoc.toJSON() as unknown as ICategoryResponse;

        let commissionRule: ICommissionRuleResponse | null = null;
        // Only fetch commission rule if it's a top-level category
        if (!categoryDoc.parentId) { // Check parentId from the actual document
            const ruleDoc = await this.commissionRuleRepository.findByCategoryId(categoryId);
            commissionRule = ruleDoc ? ruleDoc.toJSON() as unknown as ICommissionRuleResponse : null;
        }

        return {
            category: category,
            commissionRule: commissionRule
        };
    }

    /**
     * Fetches all top-level categories, including their subcategory counts and commission details.
     * @returns An array of top-level categories with aggregated details.
     */
    async getAllTopLevelCategoriesWithDetails(): Promise<
        Array<ICategoryResponse> // Simplified return type as commissionRule is already in ICategoryResponse
    > {
        // Find categories where parentId is null or undefined (top-level)
        const topLevelCategoryDocs = await this.categoryRepository.findAll({ parentId: null });

        const resultPromises = topLevelCategoryDocs.map(async (catDoc) => {
            const category = catDoc.toJSON() as unknown as ICategoryResponse; // Convert Mongoose Doc to clean JSON
            const subCategoryCount = await this.categoryRepository.countSubcategories(catDoc._id);
            const commissionRuleDoc = await this.commissionRuleRepository.findByCategoryId(catDoc._id);
            const commissionRule = commissionRuleDoc ? commissionRuleDoc.toJSON() as unknown as ICommissionRuleResponse : null;

            // Ensure category.parentId is explicitly null or undefined for top-level categories
            // If toJSON() doesn't set it to null when it's absent, we can enforce it here
            const finalCategory: ICategoryResponse = {
                ...category,
                parentId: category.parentId || null, // Ensure parentId is explicitly null if missing or undefined
                subCategoryCount,
                commissionRule,
            };
            return finalCategory;
        });
        return Promise.all(resultPromises);
    }

    /**
     * Fetches all subcategories for a given parent category ID.
     * @param parentId The ID of the parent category.
     * @returns An array of subcategory responses.
     */
    async getAllSubcategories(parentId: string): Promise<ICategoryResponse[]> {
        if (!Types.ObjectId.isValid(parentId)) {
            throw new Error('Invalid parent ID.');
        }
        const subcategoryDocs = await this.categoryRepository.findAll({ parentId: new Types.ObjectId(parentId) });
        return subcategoryDocs.map(doc => doc.toJSON() as unknown as ICategoryResponse);
    }

    /**
     * Fetches the global commission rule.
     */
    async getGlobalCommissionRule(): Promise<ICommissionRuleResponse> {
        let globalRule = await this.commissionRuleRepository.findGlobalRule();
        if (!globalRule) {
            // If no global rule exists, create a default one
            globalRule = await this.commissionRuleRepository.create({
                categoryId: null, // Signifies a global rule
                globalCommission: 0,
                status: true
            });
        }
        return globalRule.toJSON() as unknown as ICommissionRuleResponse;
    }

    /**
     * Updates the global commission rule.
     */
    async updateGlobalCommission(globalCommissionPercentage: number): Promise<ICommissionRuleResponse> {
        let globalRule = await this.commissionRuleRepository.findGlobalRule();
        if (globalRule) {
            const updatedRule = await this.commissionRuleRepository.update(globalRule._id, { globalCommission: globalCommissionPercentage });
            if (!updatedRule) {
                throw new Error('Failed to update global commission rule.');
            }
            return updatedRule.toJSON() as unknown as ICommissionRuleResponse;
        } else {
            // If no global rule exists, create it
            const newRule = await this.commissionRuleRepository.create({
                categoryId: null,
                globalCommission: globalCommissionPercentage,
                status: true
            });
            return newRule.toJSON() as unknown as ICommissionRuleResponse;
        }
    }

    /**
     * Deletes a category or subcategory.
     * If it's a top-level category, also deletes its associated commission rule.
     * Prevents deletion if the category has subcategories.
     * @param categoryId The ID of the category/subcategory to delete.
     * @returns The deleted category/subcategory response.
     */
    async deleteCategory(categoryId: string): Promise<ICategoryResponse> {
        if (!Types.ObjectId.isValid(categoryId)) {
            throw new Error('Invalid category ID.');
        }

        const categoryToDelete = await this.categoryRepository.findById(categoryId);
        if (!categoryToDelete) {
            throw new Error('Category not found.');
        }

        const subcategories = await this.categoryRepository.findAll({ parentId: new Types.ObjectId(categoryId) });
        if (subcategories.length > 0) {
            throw new Error('Cannot delete category with existing subcategories. Delete subcategories first.');
        }

        const deletedCategoryDoc = await this.categoryRepository.delete(categoryId);
        if (!deletedCategoryDoc) {
            throw new Error('Category not found (already deleted or concurrent modification).'); // More specific error
        }

        // Only attempt to delete commission rule if it was a top-level category
        if (!deletedCategoryDoc.parentId) {
            const commissionRule = await this.commissionRuleRepository.findByCategoryId(categoryId);
            if (commissionRule) {
                await this.commissionRuleRepository.delete(commissionRule._id);
            }
        }
        return deletedCategoryDoc.toJSON() as unknown as ICategoryResponse;
    }
}