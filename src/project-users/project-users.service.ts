import { ConflictException, Injectable } from '@nestjs/common';
import { CreateProjectUserDto } from './dto/create-project-user.dto';
import { UpdateProjectUserDto } from './dto/update-project-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { ProjectsService } from '../projects/projects.service';
import { UserService } from '../user/user.service';
import { ProjectUser } from './entities/project-user.entity';

@Injectable()
export class ProjectUsersService {

  constructor(
    @InjectRepository(ProjectUser)
    private readonly projectUsersRepository: Repository<ProjectUser>,
    private readonly userService: UserService,
    private readonly projectsService: ProjectsService,
  ) { }

  async create(createProjectUserDto: CreateProjectUserDto) {
    const user = await this.userService.findOne(createProjectUserDto.userId);

    const dateConflict = await this.projectUsersRepository.findOne({
      where: {
        userId: createProjectUserDto.userId,
        startDate: LessThanOrEqual(createProjectUserDto.endDate),
        endDate: MoreThanOrEqual(createProjectUserDto.startDate),
      },
    });

    if (dateConflict) {
      throw new ConflictException(`User with ID ${createProjectUserDto.userId} is already assigned to another project for the requested period`);
    }


    if ('error' in user) {
      if (user.error === 'User not found') {
        return user
      }
      return { error: 'Internal server error' } as const;
    }

    const project = await this.projectsService.findOne(createProjectUserDto.projectId);

    if ('error' in project) {
      if (project.error === 'project not found') {
        return project
      }
      return { error: 'Internal server error' } as const;
    }

    const CreateProjectUser = new ProjectUser({
      ...createProjectUserDto,
      user: user,
      project: project,
    });

    return this.projectUsersRepository.save(CreateProjectUser);
  }



  async findAll() {
    const projectUsers = await this.projectUsersRepository.find({
      relations: { project: true },
    });

    if (!projectUsers) {
      return { error: 'No project User' } as const;
    }

    return projectUsers;
  }

  async findAllByUserId(userId: string) {
    const projectUsers = await this.projectUsersRepository.find({
      where: { userId },
      // relations: { project: true },
    });

    if (!projectUsers) {
      return { error: 'User not found' } as const;
    }
    return projectUsers;
  }

  async findOne(id: string) {
    const projectUsers = await this.projectUsersRepository.findOne({
      where: { id },
    });

    if (!projectUsers) {
      return { error: 'No project User' } as const;
    }

    return projectUsers;
  }


}
