import { Request, Response } from 'express';
import { AuthService } from '../services/authService';

export class AuthController {
  private authService = new AuthService();

  async register(req: Request, res: Response) {
    try {
      const { name, email, password, role } = req.body;
      const result = await this.authService.register(name, email, password, role);
      res.status(201).json(result);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const result = await this.authService.login(email, password);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}