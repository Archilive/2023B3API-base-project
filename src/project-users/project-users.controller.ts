import { Controller, Get, Post, Body, Param, UseGuards, Res, HttpStatus, Req, } from '@nestjs/common';
import { ProjectUsersService } from './project-users.service';
import { CreateProjectUserDto } from './dto/create-project-user.dto';
import { UsersGuard } from '../user/user.guards';
import { Request, Response } from 'express';


@Controller('project-users')
export class ProjectUsersController {
  constructor(private readonly projectUsersService: ProjectUsersService) { }


  @UseGuards(UsersGuard)
  @Post()
  async create(@Body() createProjectUserDto: CreateProjectUserDto, @Req() req: Request, @Res() res: Response) {

    const CreateProjectUser = await this.projectUsersService.create(createProjectUserDto);

    const user = req['user'] as { id: string; username: string; role: string };

    if ('error' in CreateProjectUser) {

      if (CreateProjectUser.error === 'User not found') {
        return res.status(HttpStatus.NOT_FOUND).send('User not found')
      }

      if (CreateProjectUser.error === 'project not found') {
        return res.status(HttpStatus.NOT_FOUND).send('Project not found')
      }

      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send('Internal server error');
    }

    if (user.role !== 'Admin' && user.role !== 'ProjectManager') {
      return res.status(HttpStatus.UNAUTHORIZED).send('You are not Admin or ProjectManager')
    }

    return res.status(HttpStatus.CREATED).json(CreateProjectUser);
  }


  @UseGuards(UsersGuard)
  @Get()
  async findAll(@Req() req: Request, @Res() res: Response) {
    const { role, id } = req['user'] as { role: string, id: string };

    let users;

    if (role === 'Admin' || role === 'ProjectManager') {

      users = await this.projectUsersService.findAllByUserId(id);

      if ('error' in users) {
        return res.status(HttpStatus.NOT_FOUND).send('');
      }
    } else {

      users = await this.projectUsersService.findAllByUserId(id);

      if ('error' in users) {
        return res.status(HttpStatus.OK).send('No projects');
      }
    }

    return res
      .status(HttpStatus.OK)
      .json(users);
  }

  @UseGuards(UsersGuard)
  @Get(':id')
  async findOne(@Param() { id: paramId }, @Req() req: Request, @Res() res: Response) {
    const { role } = req['user'] as { role: string };

    let user;

    if (role === 'Admin' || role === 'ProjectManager') {
      user = await this.projectUsersService.findOne(paramId);

      if ("error" in user) {
        return res.status(HttpStatus.NOT_FOUND).send('No Project User');
      }
    }

    return res.status(HttpStatus.OK).json(user);
  }
}
