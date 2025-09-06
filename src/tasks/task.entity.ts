import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TaskLabel } from './task-label.entity';
import { TaskStatus } from './task.model';
import { User } from '../users/user.entity';

@Entity()
//one to many
// user that has many tasks
// 1 . User -user-id
//2. Task - task- userid
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: false,
  })
  title: string;

  @Column({
    type: 'text',
    nullable: false,
  })
  description: string;

  @Column({
    type: 'enum',
    enum: TaskStatus,
    default: TaskStatus.OPEN,
  })
  status: TaskStatus;

  @Column()
  userId: string;

  @ManyToOne(() => User, (user) => user.tasks, { nullable: false })
  user: User;

  @OneToMany(() => TaskLabel, (label) => label.task, {
    cascade: true,
    orphanedRowAction: 'delete',
  })
  labels: TaskLabel[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  //synchrozise: if i remove some column, it lost all data previously, its better to use in dev mode only
}
