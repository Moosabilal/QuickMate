// src/models/CommissionRule.ts
import { Schema, HydratedDocument, InferSchemaType, Types, model } from 'mongoose';

const CommissionRuleSchema = new Schema({
    categoryId: {
        type: Schema.Types.ObjectId,
        ref: 'Category',
        required: false,
        unique: true,
        sparse: true,
    },
    globalCommission: {
        type: Number,
        required: false,
        min: 0,
        max: 100,
    },
    flatFee: {
        type: Number,
        required: false,
        min: 0,
    },
    categoryCommission: {
        type: Number,
        required: false,
        min: 0,
        max: 100,
    },
    status: {
        type: Boolean,
        default: true, // Default to true for 'Active'
    },
}, {
  timestamps: true,
});

CommissionRuleSchema.pre('validate', function(next) {
    if (this.categoryId === null || this.categoryId === undefined) {
        if (this.globalCommission === undefined || this.globalCommission === null) {
            this.invalidate('globalCommission', 'Global commission value is required for global rule.');
        }
        if (this.flatFee !== undefined || this.categoryCommission !== undefined) {
            this.invalidate('categoryCommission', 'Category-specific commission fields are not allowed for global rules.');
            this.invalidate('flatFee', 'Category-specific flat fee is not allowed for global rules.');
        }
    } else {
        if (this.globalCommission !== undefined) {
            this.invalidate('globalCommission', 'Global commission is not allowed for category-specific rules.');
        }
        const hasFlatFee = this.flatFee !== undefined && this.flatFee !== null;
        const hasCategoryCommission = this.categoryCommission !== undefined && this.categoryCommission !== null;

        if (!hasFlatFee && !hasCategoryCommission) {
            this.invalidate('commission', 'Either flatFee or categoryCommission must be provided for category rules.');
        }
        if (hasFlatFee && hasCategoryCommission) {
            this.invalidate('commission', 'Cannot have both flatFee and categoryCommission for category rules.');
        }
    }
    next();
});

type CommissionRuleSchemaType = InferSchemaType<typeof CommissionRuleSchema>;
export interface ICommissionRule extends HydratedDocument<CommissionRuleSchemaType> {} // Key change here

export const CommissionRule = model<ICommissionRule>('CommissionRule', CommissionRuleSchema);