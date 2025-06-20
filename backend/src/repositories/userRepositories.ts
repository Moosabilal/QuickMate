import User, { IUser } from '../models/User';
import bcrypt from 'bcrypt';

export class UserRepository {
  async findByEmail(email: string): Promise<IUser | null> {
    return User.findOne({ email });
  }

  async create(userData: { name: string; email: string; password: string; role: string }): Promise<IUser> {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const user = new User({ ...userData, password: hashedPassword });
    return user.save();
  }
}