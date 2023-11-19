import { ApiBody, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

import { UserService } from './user.service';
import { Body, Controller, Get, HttpStatus, Param, Post } from '@nestjs/common';
import { SignupDto } from './dto/SignupDto';
import { SignupResponseDto } from './dto/SignupResponseDto';
import { User } from './entity/User';
import { LoginRequestDto } from './dto/LoginRequestDto';
import { LoginResponseDto } from './dto/LoginResponseDto';
import { PublicEndpoint } from '../auth/auth.decorator';

@Controller('user')
@ApiTags('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  @ApiBody({ type: SignupDto })
  @ApiResponse({ status: HttpStatus.CREATED, type: SignupResponseDto })
  @PublicEndpoint()
  create(@Body() dto: SignupDto) {
    return this.userService.create(dto);
  }

  @Post('login')
  @ApiResponse({ status: HttpStatus.OK, type: LoginResponseDto })
  @ApiBody({ type: LoginRequestDto })
  @PublicEndpoint()
  login(@Body() dto: LoginRequestDto) {
    return this.userService.login(dto);
  }

  @Get(':userId')
  @ApiResponse({ type: User })
  getUser(@Param('userId') userIdOrName: string) {
    return this.userService.getProfile(userIdOrName);
  }

  @Get(':userId/guilds')
  @ApiParam({ name: 'userId', type: String, required: true })
  @ApiResponse({ status: HttpStatus.CREATED, type: String })
  getGuilds(@Param('userId') userId: string) {
    return this.userService.getGuilds(userId);
  }
}
