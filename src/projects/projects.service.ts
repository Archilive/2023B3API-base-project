import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Project } from './entities/project.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserService } from '../user/user.service';

@Injectable()
export class ProjectsService {

  constructor(
    @InjectRepository(Project)
    private readonly projectsRepository: Repository<Project>,
    private readonly userService: UserService,
  ) { }

  async create({ name, referringEmployeeId }: CreateProjectDto) {

    const referringEmployee = await this.userService.findOne(referringEmployeeId);

    if ('error' in referringEmployee) {
      if (referringEmployee.error === 'User not found') {
        return referringEmployee
      }
      return
    }


    if (referringEmployee.role !== 'ProjectManager') {
      return ({ error: 'You are not a Project Manager' }) as const
    }

    const project = new Project({ name, referringEmployee });

    const savedProject = await this.projectsRepository.save(project);

    return savedProject;
  }

  async findAll() {
    const projects = await this.projectsRepository.find({
      relations: { referringEmployee: true },
    });

    if (!projects) {
      return ({ error: 'projects not found' }) as const
    }

    return projects;
  }


  async findAllBy(id: string) {
    const projects = await this.projectsRepository.find({
      where: { projectUser: { userId: id } },
      relations: { referringEmployee: true },
    });

    if (!projects) {
      return ({ error: 'projects not found' }) as const
    }

    return projects;
  }

  async findOne(id: string) {
    const project = await this.projectsRepository.findOne({
      where: { id }, relations: { referringEmployee: true },
    });

    if (!project) {
      return ({ error: 'project not found' }) as const
    }
    return project;
  }

  async findOneBy(userId: string, projectId: string) {
    const project = await this.projectsRepository.findOne({
      where: { id: projectId, projectUser: { userId } },
      relations: { referringEmployee: true },
    });

    if (!project) {
      return ({ error: 'Forbidden' }) as const;
    }
    return project;
  }
}
