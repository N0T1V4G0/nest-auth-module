import { Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}

  async validateUser(email: string, password: string) {
    const user = await this.userService.findByEmail(email);

    if (user && user.password === password) {
      const { email, password, ...rest } = user;
      return rest;
    }

    return null;
  }
}
