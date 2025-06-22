// src/routes/commissionRuleRoutes.ts
import { Router } from 'express';
import { CommissionRuleController } from '../controllers/commissionRuleController';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware';

const router = Router();
const commissionRuleController = new CommissionRuleController();

const isAdmin = [authenticateToken, authorizeRoles(['Admin'])];

// Routes for general commission rule management/viewing
router.get('/all', isAdmin, commissionRuleController.getAllCommissionRules);
router.get('/:id', isAdmin, commissionRuleController.getCommissionRuleById);

export default router;