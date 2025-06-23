// src/routes/categoryRoutes.ts
import { Router } from 'express';
import { body, param, query } from 'express-validator'; // Import query for getAllCategories
import { CategoryController } from '../controllers/categoryController';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware';
import multer from 'multer';

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

// Apply authentication and authorization middleware
const isAdmin = [authenticateToken, authorizeRoles(['Admin'])];

// Validation for category/subcategory creation/update
const categoryValidation = [
    body('name')
        .trim()
        .notEmpty().withMessage('Category name is required.')
        .isLength({ min: 2, max: 100 }).withMessage('Category name must be between 2 and 100 characters.'),
    body('description')
        .trim()
        .optional({ nullable: true, checkFalsy: true })
        .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters.'),
    body('status')
        .isBoolean().withMessage('Status must be a boolean.')
        .toBoolean(), // Convert to boolean

    // parentId is optional, and if provided, should be a valid MongoDB ID string
    body('parentId')
        .optional({ nullable: true, checkFalsy: true }) // Allow null, empty string, or undefined
        .isMongoId().withMessage('Invalid parent category ID.'),

    // Commission fields are conditional based on parentId
    // Only validate if parentId is NOT provided (i.e., it's a top-level category)
    body('commissionType')
        .optional()
        .custom((value, { req }) => {
            if (req.body.parentId) { // If parentId is present, it's a subcategory
                // For subcategories, commission fields should be absent or ignored.
                // We'll handle this in the controller/service by simply not processing them.
                // Here, we just ensure they aren't provided when they shouldn't be, or simply ignore them.
                // For validation, we can skip if parentId exists.
                return true;
            }
            // For top-level categories, commissionType is required and must be valid.
            if (!value) throw new Error('Commission type is required for main categories.');
            if (!['percentage', 'flat', 'none'].includes(value)) {
                throw new Error('Invalid commission type. Must be percentage, flat, or none.');
            }
            return true;
        }),
    body('commissionValue')
        .optional()
        .custom((value, { req }) => {
            if (req.body.parentId) { // Subcategory, skip validation
                return true;
            }
            // For top-level categories:
            if (req.body.commissionType === 'none') {
                return true; // No value expected if type is 'none'
            }
            if (req.body.commissionType && (req.body.commissionType === 'percentage' || req.body.commissionType === 'flat')) {
                if (value === undefined || value === null || value === '') {
                    throw new Error('Commission value is required for selected commission type.');
                }
                const numValue = Number(value);
                if (isNaN(numValue) || numValue < 0) {
                    throw new Error('Commission value must be a non-negative number.');
                }
                if (req.body.commissionType === 'percentage' && (numValue > 100)) {
                    throw new Error('Percentage commission cannot exceed 100%.');
                }
            }
            return true;
        }),
    body('commissionStatus')
        .optional()
        .custom((value, { req }) => {
            if (req.body.parentId) { // Subcategory, skip validation
                return true;
            }
            // For top-level categories, commissionStatus must be boolean if provided.
            if (value !== undefined) {
                if (typeof value !== 'boolean' && value !== 'true' && value !== 'false') {
                    throw new Error('Commission status must be a boolean.');
                }
                req.body.commissionStatus = String(value).toLowerCase() === 'true'; // Ensure boolean conversion
            }
            return true;
        }),
];

// Category/Subcategory Routes
router.post('/', isAdmin, upload.single('categoryIcon'), categoryValidation, categoryController.createCategory);
router.put('/:id', isAdmin, upload.single('categoryIcon'), categoryValidation, categoryController.updateCategory);

// We keep getCategoryById as is, it will fetch a category or subcategory by its ID.
router.get('/:id', isAdmin, categoryController.getCategoryById);

// This route will now handle fetching all top-level categories OR subcategories by parentId.
router.get('/', isAdmin, [
    query('parentId').optional().isMongoId().withMessage('Invalid parentId query parameter.')
], categoryController.getAllCategories); // Renamed from getAllCategoriesWithDetails in controller

router.delete('/:id', isAdmin, categoryController.deleteCategory);

// Global Commission Rule Routes (These remain distinct as they are "global" and not per category/subcategory)
router.get('/global-commission', isAdmin, categoryController.getGlobalCommission);
router.put('/global-commission', isAdmin, [
    body('globalCommission')
        .isFloat({ min: 0, max: 100 }).withMessage('Global commission must be a number between 0 and 100.')
], categoryController.updateGlobalCommission);


export default router;