import {
  Column,
  DeepPartial,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Project } from '../../projects/entities/project.entity';

@Entity()
export class ProjectUser {
  constructor(datas: DeepPartial<ProjectUser>) {
    Object.assign(this, datas);
  }

  @PrimaryGeneratedColumn('uuid')
  public id!: string;

  @Column({ type: 'date' })
  public startDate!: Date;

  @Column({ type: 'date' })
  public endDate!: Date;

  @Column({ type: 'uuid' })
  public projectId!: string;

  @Column({ type: 'uuid' })
  public userId!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  public user!: User;

  @ManyToOne(() => Project, (project) => project.projectUser)
  @JoinColumn({ name: 'projectId' })
  public project!: Project;
}
