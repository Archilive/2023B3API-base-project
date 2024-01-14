import { Controller, Get, Post, Body, Patch, Param, Delete, Res, Req, UseGuards, HttpStatus, } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { UsersGuard } from '../user/user.guards';
import { Request, Response } from 'express';
// import { UserService } from '../user/user.service';



@Controller('projects')
export class ProjectsController {
  constructor(
    private readonly projectsService: ProjectsService,
    // private readonly userService: UserService,
  ) { }

  @UseGuards(UsersGuard)
  @Post()
  async create(@Body() { name, referringEmployeeId }: CreateProjectDto, @Req() req: Request, @Res() res: Response) {

    const user = req['user'] as { id: string; username: string; role: string };

    if (user.role !== 'Admin') {
      return res.status(HttpStatus.UNAUTHORIZED).send('You are not Admin')
    }

    const project = await this.projectsService.create({ name, referringEmployeeId });

    if ('error' in project) {

      if (project.error === 'You are not a Project Manager') {
        return res.status(HttpStatus.UNAUTHORIZED).send('You are not a Project Manager')
      }
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send('Internal server error');
    }

    return res.status(HttpStatus.CREATED).json(project);
  }

  @UseGuards(UsersGuard)
  @Get()
  async findAll(@Req() req: Request, @Res() res: Response) {
    const { role, id } = req['user'] as { role: string, id: string };

    let projects;

    if (role === 'Employee') {
      projects = await this.projectsService.findAllBy(id);

      if ('error' in projects) {
        return res.status(HttpStatus.NOT_FOUND).send('Projets not found');
      }
    }

    if (role === 'Admin' || role === 'ProjectManager') {
      projects = await this.projectsService.findAll();

      if ('error' in projects) {
        return res.status(HttpStatus.NOT_FOUND).send('Projets not found');
      }
    }
    return res.status(HttpStatus.OK).json(projects);
  }


  @UseGuards(UsersGuard)
  @Get(':id')
  async findOne(@Param() { id: paramId }, @Req() req: Request, @Res() res: Response) {
    const { role, id: tokenId } = req['user'] as { role: string, id: string };

    let projects;

    if (role === 'Employee') {
      projects = await this.projectsService.findOneBy(tokenId, paramId);

      if ('error' in projects) {
        return res.status(HttpStatus.FORBIDDEN).send('Forbidden');
      }

      return res.status(HttpStatus.OK).json(projects);
    }

    if (role === 'Admin' || role === 'ProjectManager') {
      projects = await this.projectsService.findOne(paramId);

      if ('error' in projects) {
        return res.status(HttpStatus.NOT_FOUND).send('Projets not found');
      }

      return res.status(HttpStatus.OK).json(projects);
    }
  }
}
