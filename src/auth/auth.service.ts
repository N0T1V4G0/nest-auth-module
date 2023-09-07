import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtservice: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.userService.findByEmail(email);

    if (user && user.password === password) {
      const { email, password, ...rest } = user;
      return rest;
    }

    return null;
  }

  async login(user: any) {
    const userr = await this.userService.findOne(+user.id);
    const payload = {
      name: user.name,
      sub: user.id,
      role: userr.role,
    };

    return {
      access_token: this.jwtservice.sign(payload),
    };
  }
}
