import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { CreateUserDto } from "../dto/create-user.dto";
import { Project } from "../../projects/entities/project.entity";
import { ProjectUser } from "../../project-users/entities/project-user.entity";
import { Event } from '../../events/entities/event.entity';


@Entity()
export class User {

  constructor(datas: CreateUserDto) {
    Object.assign(this, datas);
  }

  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  username: string;

  @Column({ select: false })
  password: string;

  @Column({ default: "Employee" })
  role: "Employee" | "Admin" | "ProjectManager";

  @OneToMany(() => Project, (project) => project.referringEmployee)
  projects: Project[];

  @OneToMany(() => ProjectUser, (projectUser) => projectUser.user)
  projectUser: ProjectUser[];

  @OneToMany(() => Event, (event) => event.user)
  public events: Event[];
}
