import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { UserRepository } from '../repositories/userRepositories';

export class AuthService {
  private userRepo = new UserRepository();

  async register(name: string, email: string, password: string, role: string) {
    const existingUser = await this.userRepo.findByEmail(email);
    if (existingUser) throw new Error('Email already exists');

    const user = await this.userRepo.create({ name, email, password, role });
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET!, { expiresIn: '1h' });
    return { user: { id: user._id, name: user.name, email: user.email, role: user.role }, token };
  }

  async login(email: string, password: string) {
    const user = await this.userRepo.findByEmail(email);
    if (!user) throw new Error('Invalid credentials');

    const isMatch = await bcrypt.compare(password, user.password as string);
    if (!isMatch) throw new Error('Invalid credentials');

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET!, { expiresIn: '1h' });
    return { user: { id: user._id, name: user.name, email: user.email, role: user.role }, token };
  }
}