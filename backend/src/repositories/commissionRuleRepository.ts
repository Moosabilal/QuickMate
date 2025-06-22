// src/repositories/CommissionRuleRepository.ts
import { CommissionRule, ICommissionRule } from '../models/Commission';
import { ICommissionRuleInput } from '../types/category'; // Use centralized types
import { Types } from 'mongoose';

export class CommissionRuleRepository {
  /**
   * Creates a new commission rule.
   * @param ruleData Data for the new commission rule.
   * @returns The created commission rule document.
   */
  async create(ruleData: ICommissionRuleInput): Promise<ICommissionRule> {
    const rule = new CommissionRule(ruleData);
    await rule.save();
    return rule;
  }

  /**
   * Finds a commission rule by its ID.
   * @param id The ID of the rule.
   * @returns The rule document, or null if not found.
   */
  async findById(id: string | Types.ObjectId): Promise<ICommissionRule | null> {
    return CommissionRule.findById(id).exec();
  }

  /**
   * Finds a commission rule by category ID.
   * @param categoryId The ID of the category.
   * @returns The rule document for the category, or null.
   */
  async findByCategoryId(categoryId: string | Types.ObjectId): Promise<ICommissionRule | null> {
    return CommissionRule.findOne({ categoryId: new Types.ObjectId(categoryId) }).exec();
  }

  /**
   * Finds the global commission rule (where categoryId is null).
   * @returns The global rule document, or null.
   */
  async findGlobalRule(): Promise<ICommissionRule | null> {
    return CommissionRule.findOne({ categoryId: null }).exec();
  }

  /**
   * Finds all commission rules.
   * @param filter An optional filter object.
   * @returns An array of commission rule documents.
   */
  async findAll(filter: any = {}): Promise<ICommissionRule[]> {
    return CommissionRule.find(filter).exec();
  }

  /**
   * Updates an existing commission rule by ID.
   * @param id The ID of the rule to update.
   * @param updateData Data to update.
   * @returns The updated rule document, or null if not found.
   */
  async update(id: string | Types.ObjectId, updateData: Partial<ICommissionRuleInput>): Promise<ICommissionRule | null> {
    return CommissionRule.findByIdAndUpdate(id, updateData, { new: true }).exec();
  }

  /**
   * Deletes a commission rule by ID.
   * @param id The ID of the rule to delete.
   * @returns The deleted rule document, or null if not found.
   */
  async delete(id: string | Types.ObjectId): Promise<ICommissionRule | null> {
    return CommissionRule.findByIdAndDelete(id).exec();
  }
}