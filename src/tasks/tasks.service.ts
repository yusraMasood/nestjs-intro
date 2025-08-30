import { Injectable } from '@nestjs/common';
import { ITask } from './task.model';
import { randomUUID } from 'crypto';
import { CreateTaskDto } from './create-task.dto';

@Injectable()
export class TasksService {
  private tasks: ITask[] = [];

  findAll(): ITask[] {
    return this.tasks;
  }

  findOne(id: string): ITask | undefined {
    const task = this.tasks.find((task) => task?.id == id);
    return task;
  }

  create(createTaskDto: CreateTaskDto): ITask {
    const task = {
      id: randomUUID(),
      ...createTaskDto,
    };
    this.tasks.push(task);
    return task;
  }

  delete(id: string): void {
    this.tasks = this.tasks.filter((task) => task.id !== id);
  }
}
