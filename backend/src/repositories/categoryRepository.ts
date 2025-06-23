// src/repositories/CategoryRepository.ts
import { Category, ICategory } from '../models/Categories'; // Assuming Categories.ts defines the Mongoose model
import { ICategoryInput } from '../types/category'; // Use centralized types
import { Types } from 'mongoose';

export class CategoryRepository {
    /**
     * Creates a new category in the database.
     * @param categoryData Data for the new category.
     * @returns The created category document.
     */
    async create(categoryData: ICategoryInput): Promise<ICategory> {
        // Convert parentId string to ObjectId if present
        const dataToSave = { ...categoryData };
        if (dataToSave.parentId && typeof dataToSave.parentId === 'string') {
            dataToSave.parentId = new Types.ObjectId(dataToSave.parentId);
        } else if (dataToSave.parentId === null) {
             dataToSave.parentId = null; // Explicitly keep null
        } else {
             delete dataToSave.parentId; // Remove if undefined
        }

        const category = new Category(dataToSave);
        await category.save();
        return category;
    }

    /**
     * Finds a category by its ID.
     * @param id The ID of the category.
     * @returns The category document, or null if not found.
     */
    async findById(id: string | Types.ObjectId): Promise<ICategory | null> {
        return Category.findById(id).exec();
    }

    /**
     * Finds a category by its name, for top-level categories (parentId: null).
     * @param name The name of the category.
     * @returns The category document, or null if not found.
     */
    async findByName(name: string): Promise<ICategory | null> {
        return Category.findOne({ name, parentId: null }).exec();
    }

    /**
     * Finds a subcategory by its name under a specific parent.
     * @param name The name of the subcategory.
     * @param parentId The ID of the parent category.
     * @returns The subcategory document, or null if not found.
     */
    async findByNameAndParent(name: string, parentId: string | Types.ObjectId): Promise<ICategory | null> {
        const parentObjectId = new Types.ObjectId(parentId);
        return Category.findOne({ name, parentId: parentObjectId }).exec();
    }

    /**
     * Finds all categories based on a filter.
     * @param filter An optional filter object (e.g., { parentId: someId, status: true }).
     * If filter.parentId is null, it finds top-level categories.
     * @returns An array of category documents.
     */
    async findAll(filter: any = {}): Promise<ICategory[]> {
        // Convert parentId string in filter to ObjectId if present
        const queryFilter = { ...filter };
        if (queryFilter.parentId && typeof queryFilter.parentId === 'string') {
            queryFilter.parentId = new Types.ObjectId(queryFilter.parentId);
        }
        return Category.find(queryFilter).exec();
    }

    /**
     * Updates an existing category by ID.
     * @param id The ID of the category to update.
     * @param updateData Data to update.
     * @returns The updated category document, or null if not found.
     */
    async update(id: string | Types.ObjectId, updateData: Partial<ICategoryInput>): Promise<ICategory | null> {
        // Handle parentId conversion for update
        const dataToUpdate = { ...updateData };
        if (dataToUpdate.parentId !== undefined) {
            if (dataToUpdate.parentId === null) {
                dataToUpdate.parentId = null; // Explicitly set to null
            } else if (typeof dataToUpdate.parentId === 'string' && Types.ObjectId.isValid(dataToUpdate.parentId)) {
                dataToUpdate.parentId = new Types.ObjectId(dataToUpdate.parentId);
            } else {
                // If it's undefined or invalid, remove it from updateData
                delete dataToUpdate.parentId;
            }
        }
        return Category.findByIdAndUpdate(id, dataToUpdate, { new: true }).exec();
    }

    /**
     * Deletes a category by ID.
     * @param id The ID of the category to delete.
     * @returns The deleted category document, or null if not found.
     */
    async delete(id: string | Types.ObjectId): Promise<ICategory | null> {
        return Category.findByIdAndDelete(id).exec();
    }

    /**
     * Counts the number of direct subcategories for a given parent ID.
     * @param parentId The ID of the parent category.
     * @returns The count of subcategories.
     */
    async countSubcategories(parentId: string | Types.ObjectId): Promise<number> {
        return Category.countDocuments({ parentId: new Types.ObjectId(parentId) }).exec();
    }
}