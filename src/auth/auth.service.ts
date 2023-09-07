import { HttpException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { compare, hash } from 'bcrypt';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly jwtservice: JwtService,
  ) {}

  async createUser(createUserDto: CreateUserDto) {
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new HttpException('Email already registered!', 400);
    }

    const protectedPassword = await this.hashPassword(createUserDto.password);

    const user = await this.userRepository.save({
      ...createUserDto,
      password: protectedPassword,
    });

    const payload = {
      name: user.name,
      sub: user.id,
      role: user.role,
    };

    return {
      access_token: this.jwtservice.sign(payload),
    };
  }

  async login(user: any) {
    const userDb = await this.userRepository.findOne({
      where: {
        id: user.id,
      },
    });

    const payload = {
      name: user.name,
      sub: user.id,
      role: userDb.role,
    };

    return {
      access_token: this.jwtservice.sign(payload),
    };
  }

  private hashPassword(password: string): Promise<string> {
    return hash(password, 10);
  }

  async validateUser(email: string, password: string) {
    const user = await this.userRepository.findOne({
      where: { email },
    });

    const validPassword = await compare(password, user.password);

    if (user && validPassword) {
      const { email, password, ...rest } = user;
      return rest;
    }

    return null;
  }
}
