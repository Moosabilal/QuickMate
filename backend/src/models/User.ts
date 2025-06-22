import mongoose, { Schema, Document, HydratedDocument, InferSchemaType } from 'mongoose';

// export interface IUser extends Document {
//   name: string;
//   email: string;
//   password: string;
//   role: 'Customer' | 'ServiceProvider' | 'Admin';
//   createdAt: Date;
// }

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['Customer', 'ServiceProvider', 'Admin'], default: 'Customer' },
  createdAt: { type: Date, default: Date.now },
});

type UserSchemaType = InferSchemaType<typeof UserSchema>;
export type IUser = HydratedDocument<UserSchemaType>

export default mongoose.model<IUser>('User', UserSchema);