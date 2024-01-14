import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  HttpStatus,
  UseGuards,
  Req,
} from "@nestjs/common";

import { UserService } from "./user.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { GetMealVouchersDto } from "./dto/get-meal-vouchers.dto";
import { GetUserDto } from "./dto/get-user.dto";
import { Response } from "express";
import { UsersGuard } from "./user.guards";


@Controller("users")
export class UserController {

  constructor(private readonly userService: UserService) { }

  @Post('auth/sign-up')
  async signup(@Body() createUserDto: CreateUserDto, @Res() res: Response) {

    const user = await this.userService.create(createUserDto);

    return res.status(HttpStatus.CREATED).json(user);
  }


  @Post('auth/login')
  async login(@Body() UpdateUserDto: UpdateUserDto, @Res() res: Response) {

    const accessToken = await this.userService.login(UpdateUserDto);

    if ('access_token' in accessToken) {
      return res
        .status(HttpStatus.CREATED)
        .json({ access_token: accessToken.access_token });
    } else {
      return res.status(HttpStatus.UNAUTHORIZED).send('password');
    }

  }

  @UseGuards(UsersGuard)
  @Get("me")
  async getMe(@Req() req: Request, @Res() res: Response) {

    const { id } = req['user'] as { id: string; username: string };


    const user = await this.userService.findOne(id);

    if (!user) {
      return res.status(HttpStatus.NOT_FOUND).send('User not found');
    }
    return res.status(HttpStatus.OK).json(user);
  }

  @UseGuards(UsersGuard)
  @Get()
  async getAllUsers(@Res() res: Response) {
    const users = await this.userService.findAll();

    if (!users) {
      return res.status(HttpStatus.NOT_FOUND).send('Users not found');
    }

    return res.status(HttpStatus.OK).json(users);
  }


  @UseGuards(UsersGuard)
  @Get(':id')
  async getUser(@Param() { id }: GetUserDto, @Res() res: Response) {
    const user = await this.userService.findOne(id);

    if (!('error' in user)) {
      return res.status(HttpStatus.OK).json(user);
    }

    const { error } = user;

    if (error === 'User not found') {
      return res.status(HttpStatus.NOT_FOUND).send('User not found');
    }

    return res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .send('Internal server error');
  }

  @UseGuards(UsersGuard)
  @Get(':id/meal-vouchers/:month')
  async getMealVouchers(
    @Param() { id, month }: GetMealVouchersDto,
    @Res() res: Response,
  ) {
    const mealVouchers = await this.userService.getMealVouchers(id, month);

    if ('error' in mealVouchers) {
      if (mealVouchers.error === 'User not found') {
        return res.status(HttpStatus.NOT_FOUND).send('User not found');
      }
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send('Internal server error');
    }
    return res.status(HttpStatus.OK).json(mealVouchers);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.userService.remove(+id);
  }
}
