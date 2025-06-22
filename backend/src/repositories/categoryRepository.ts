// src/repositories/CategoryRepository.ts
import { Category, ICategory } from '../models/Categories';
import { ICategoryInput } from '../types/category'; // Use centralized types
import { Types } from 'mongoose';

export class CategoryRepository {
  /**
   * Creates a new category in the database.
   * @param categoryData Data for the new category.
   * @returns The created category document.
   */
  async create(categoryData: ICategoryInput): Promise<ICategory> {
    const category = new Category(categoryData);
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
   * Finds a category by its name.
   * @param name The name of the category.
   * @returns The category document, or null if not found.
   */
  async findByName(name: string): Promise<ICategory | null> {
    return Category.findOne({ name }).exec();
  }

  /**
   * Finds all categories based on a filter.
   * @param filter An optional filter object (e.g., { parentId: someId, status: 'Active' }).
   * @returns An array of category documents.
   */
  async findAll(filter: any = {}): Promise<ICategory[]> {
    return Category.find(filter).exec();
  }

  /**
   * Updates an existing category by ID.
   * @param id The ID of the category to update.
   * @param updateData Data to update.
   * @returns The updated category document, or null if not found.
   */
  async update(id: string | Types.ObjectId, updateData: Partial<ICategoryInput>): Promise<ICategory | null> {
    return Category.findByIdAndUpdate(id, updateData, { new: true }).exec();
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