import { Router } from 'express';
import { body, param } from 'express-validator';
import { CategoryController } from '../controllers/categoryController';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware'; // Corrected import path/filename if you renamed it
import multer from 'multer'; // For handling file uploads

// Configure Multer for file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Files will be temporarily stored in the 'uploads/' directory
  },
  filename: (req, file, cb) => {
    // Append current timestamp to filename to avoid collisions
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

const router = Router();
const categoryController = new CategoryController();

// Validation chains for category-related operations
const validateCategoryBody = [
  body('name')
    .isString().notEmpty().withMessage('Category name is required.')
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Category name must be between 2 and 100 characters.'),
  body('description').optional().isString().trim(),
  body('parentId')
    .optional({ nullable: true }).isMongoId().withMessage('Invalid parent category ID.')
    .customSanitizer(value => value === '' ? null : value), // Treat empty string as null
  body('status')
    .isBoolean().withMessage('Category status must be a boolean (true for Active, false for InActive).')
    .toBoolean(), // Convert string "true"/"false" to boolean

  // Commission fields (from frontend ICategoryFormCombinedData)
  body('commissionType')
    .optional().isIn(['percentage', 'flat', 'none']).withMessage('Invalid commission type.'),
  body('commissionValue')
    .optional().custom((value, { req }) => {
      if (req.body.commissionType && req.body.commissionType !== 'none' && value === '') {
        throw new Error('Commission value cannot be empty if commission type is specified.');
      }
      if (value !== '' && isNaN(Number(value))) {
        throw new Error('Commission value must be a number.');
      }
      if (req.body.commissionType === 'percentage' && (Number(value) < 0 || Number(value) > 100)) {
        throw new Error('Percentage commission must be between 0 and 100.');
      }
      if (req.body.commissionType === 'flat' && Number(value) < 0) {
        throw new Error('Flat fee commission must be a non-negative number.');
      }
      return true;
    }),
  body('commissionStatus')
    .optional().isBoolean().withMessage('Commission status must be a boolean.')
    .toBoolean(),
];

const validateGlobalCommissionBody = [
  body('globalCommission')
    .isFloat({ min: 0, max: 100 }).withMessage('Global commission must be a number between 0 and 100.'),
];

// Apply authentication and authorization middleware
// Use authenticateToken first, then authorizeRoles with the specific role
const isAdmin = [authenticateToken, authorizeRoles(['Admin'])];

// Category Routes
router.post('/', isAdmin, upload.single('categoryIcon'), validateCategoryBody, categoryController.createCategory);
router.put('/:id', isAdmin, upload.single('categoryIcon'), validateCategoryBody, categoryController.updateCategory);
router.get('/:id', isAdmin, categoryController.getCategoryById);
router.get('/', isAdmin, categoryController.getAllCategoriesWithDetails);
router.delete('/:id', isAdmin, categoryController.deleteCategory);

// Global Commission Rule Routes (managed via category controller as per structure)
router.get('/global-commission', isAdmin, categoryController.getGlobalCommission);
router.put('/global-commission', isAdmin, validateGlobalCommissionBody, categoryController.updateGlobalCommission);


export default router;