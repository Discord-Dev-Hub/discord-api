import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { SignupDto } from './dto/SignupDto';
import { InjectModel } from '@nestjs/mongoose';

import { Model, Types } from 'mongoose';
import bcrypt from 'bcrypt';
import { User, UserDocument } from './entity/User';
import { SignupResponseDto } from './dto/SignupResponseDto';
import { Jwt } from '@/utils/jwt';
import { LoginRequestDto } from './dto/LoginRequestDto';
import { LoginResponseDto } from './dto/LoginResponseDto';
import { GuildService } from '../guild/guild.service';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly guildService: GuildService,
  ) {}

  async getGuilds(userId: string) {
    return this.guildService.getGuilds(userId);
  }

  async getProfile(userId: string) {
    const user = await this.userModel.findOne({ _id: new Types.ObjectId(userId) }).lean();

    if (!user) {
      throw new NotFoundException();
    }

    return user;
  }

  async login(dto: LoginRequestDto) {
    const { email, password } = dto;
    const user = await this.userModel.findOne({ email }).select('+hash').exec();

    if (!user) {
      throw new HttpException('Incorrect email or password', HttpStatus.UNAUTHORIZED);
    }

    const match = await bcrypt.compare(password, user.hash);

    if (!match) {
      throw new HttpException('Incorrect email or password', HttpStatus.UNAUTHORIZED);
    }

    const accessToken = Jwt.sign(user.id);
    const profile = user.toJSON() as any as User;
    delete profile.hash;

    return new LoginResponseDto({ profile, accessToken });
  }

  async create(dto: SignupDto) {
    const [existingEmail, existingUsername] = await Promise.all([
      this.userModel.findOne({ email: dto.email }, { lean: true }),
      this.userModel.findOne({ name: dto.username }, { lean: true }),
    ]);

    if (existingEmail) {
      throw new HttpException('This email is already in use', HttpStatus.UNPROCESSABLE_ENTITY);
    }

    if (existingUsername) {
      throw new HttpException(
        'This user-name is taken, please choose another',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const hash = await bcrypt.hash(dto.password, 10);

    const user = await this.userModel.create({
      username: dto.username.trim(),
      email: dto.email.trim(),
      displayName: dto.displayName.trim(),
      hash,
      dateOfBirth: dto.dateOfBirth,
    });

    const accessToken = Jwt.sign(user.id);
    return new SignupResponseDto({
      profile: user,
      accessToken,
    });
  }
}
