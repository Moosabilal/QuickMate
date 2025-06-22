// src/models/Category.ts
import { Schema, HydratedDocument, InferSchemaType, Types, model } from "mongoose";

// First, define the raw schema type for InferSchemaType
const CategorySchema = new Schema({
    name:{
        type: String,
        required: true,
        trim: true,
        unique: true, // Added: Category names should be unique
    },
    description: {
        type: String,
        required: false,
        trim: true,
    },
    parentId: {
        type: Schema.Types.ObjectId,
        ref: 'Category',
        default: null,
        required: false,
    },
    status: {
        type: Boolean,
        default: true, // Default to true for 'Active'
    },
    iconUrl: { // Renamed from 'image' and made optional
        type: String,
        required: false,
    },
}, {
    timestamps: true
});

// Infer the plain TypeScript type from the schema
type CategorySchemaType = InferSchemaType<typeof CategorySchema>;

// Now, define ICategory as a HydratedDocument of that inferred type.
// This automatically includes Mongoose document methods like .toJSON(), .save(), etc.
export interface ICategory extends HydratedDocument<CategorySchemaType> {}

export const Category = model<ICategory>('Category', CategorySchema);