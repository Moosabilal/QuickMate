// src/controllers/CommissionRuleController.ts
import { Request, Response, NextFunction } from 'express';
import { CommissionRuleRepository } from '../repositories/commissionRuleRepository'; // Use repository directly for simple list
import { Types } from 'mongoose';

export class CommissionRuleController {
  private commissionRuleRepository: CommissionRuleRepository;

  constructor() {
    this.commissionRuleRepository = new CommissionRuleRepository();
  }

  /**
   * @route GET /api/commissionrules/all
   * @desc Get all commission rules (global and category-specific)
   * @access Admin
   */
  getAllCommissionRules = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const rules = await this.commissionRuleRepository.findAll({});
      res.status(200).json(rules.map(rule => rule.toJSON()));
    } catch (error: any) {
      next(error);
    }
  };

  /**
   * @route GET /api/commissionrules/:id
   * @desc Get a specific commission rule by ID
   * @access Admin
   */
  getCommissionRuleById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      if (!Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid rule ID.' });
      }
      const rule = await this.commissionRuleRepository.findById(id);
      if (!rule) {
        return res.status(404).json({ message: 'Commission rule not found.' });
      }
      res.status(200).json(rule.toJSON());
    } catch (error: any) {
      next(error);
    }
  };

  // Note: Create/Update/Delete category-specific rules are handled by CategoryController
  // Update/Delete for global rule are also handled by CategoryController (via CategoryService)
  // This controller mainly for listing/viewing all rules.
}