import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, DeepPartial, OneToMany } from "typeorm";
import { User } from "../../user/entities/user.entity";
import { ProjectUser } from "../../project-users/entities/project-user.entity";

@Entity()
export class Project {

  constructor(datas: DeepPartial<Project>) {
    Object.assign(this, datas);
  }

  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column({ type: 'uuid' })
  referringEmployeeId: string;

  @ManyToOne(() => User, (user) => user.projects)
  @JoinColumn({ name: 'referringEmployeeId' })
  referringEmployee: User;

  @OneToMany(() => ProjectUser, (projectUser) => projectUser.project)
  @JoinColumn({ name: 'projectUserId' })
  projectUser: ProjectUser[];
}
