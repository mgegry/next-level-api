import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository';
import { User } from '../entities/user.entity';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async getUserById(id: number): Promise<User | null> {
    return this.userRepository.findById(id);
  }

  async getUserByIdOrThrow(id: number): Promise<User> {
    const user = await this.getUserById(id);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    return user;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    email = email.trim().toLowerCase();
    return this.userRepository.findByEmail(email);
  }
}
