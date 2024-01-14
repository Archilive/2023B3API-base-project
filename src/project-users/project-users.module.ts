import { Module, ValidationPipe } from '@nestjs/common';
import { ProjectUsersService } from './project-users.service';
import { ProjectUsersController } from './project-users.controller';
import { Project } from '../projects/entities/project.entity';
import { User } from '../user/entities/user.entity';
import { ProjectUser } from './entities/project-user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';
import { ProjectsModule } from '../projects/projects.module';
import { ProjectsService } from '../projects/projects.service';
import { UserService } from '../user/user.service';

@Module({
  imports: [TypeOrmModule.forFeature([ProjectUser, Project, User]),
  JwtModule.register({}),
    UserModule,
    ProjectsModule,
  ],
  controllers: [ProjectUsersController],
  providers: [
    ProjectUsersService,
    ProjectsService,
    UserService,
    {
      provide: 'APP_PIPE',
      useValue: new ValidationPipe({
        transform: true,
      }),
    },
  ],
})
export class ProjectUsersModule { }
