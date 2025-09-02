import { Injectable } from '@nestjs/common';
import { TaskStatus } from './task.model';
import { CreateTaskDto } from './create-task.dto';
import { UpdateTaskDto } from './update-task.dto';
import { WrongTaskStatusException } from './Exceptions/wrong-task-status.exception';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './task.entity';
import { Repository } from 'typeorm';
import { CreateTaskLabelDto } from './create-task-label.dto';
import { TaskLabel } from './task-label.entity';
import { FindTaskParams } from './find-task.params';
import { PaginationParams } from './common/pagination.params';

//Next goal
{
  /*
	1) Create an endpoint POST :/id/labels
 2) addLabels - mixing existing labels with new one
 3) 500 - we need a method to get unique labels to store
 
	*/
}
@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectRepository(TaskLabel)
    private readonly labelRepository: Repository<TaskLabel>,
  ) {}

  public async findAll(
    filters: FindTaskParams,
    pagination: PaginationParams,
  ): Promise<[Task[], number]> {
    const query = this.taskRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.labels', 'labels');
    if (filters.status) {
      query.andWhere('task.status = :status', { status: filters.status });
    }
    if (filters.search) {
      query.andWhere(
        '(task.title ILIKE :search OR task.description ILIKE :search)',
        { search: `%${filters.search}%` },
      );
    }
    if (filters.labels?.length) {
      const subQuery = query
        .subQuery()
        .select('labels.taskId')
        .from('task_label', 'labels')
        .where(
          'labels.name IN (:...names)',

          { names: filters.labels },
        )
        .getQuery();
      query.andWhere(`task.id IN ${subQuery}`);
      //query.andWhere('labels.name IN (:...names)', { names: filters.labels });
    }
    query.orderBy(`task.${filters.sortBy}`, filters.sortOrder);
    query.skip(pagination.offset).take(pagination.limit);
    return await query.getManyAndCount();
  }

  public async findOne(id: string): Promise<Task | null> {
    return await this.taskRepository.findOne({
      where: { id },
      relations: ['labels'],
    });
  }

  public async create(createTaskDto: CreateTaskDto): Promise<Task> {
    if (createTaskDto.labels) {
      createTaskDto.labels = this.getUniqueLabels(createTaskDto.labels);
    }
    return await this.taskRepository.save(createTaskDto);
  }

  public async delete(task: Task): Promise<void> {
    await this.taskRepository.remove(task);

    //can be used await this.taskRepository.delete(task.id);
  }

  public async update(task: Task, updateTaskDto: UpdateTaskDto): Promise<Task> {
    if (
      updateTaskDto.status &&
      !this.isValidStatusTransition(task.status, updateTaskDto.status)
    ) {
      throw new WrongTaskStatusException();
    }
    if (updateTaskDto.labels) {
      updateTaskDto.labels = this.getUniqueLabels(updateTaskDto.labels);
    }
    Object.assign(task, updateTaskDto);
    return await this.taskRepository.save(task);
  }

  public async addLables(
    task: Task,
    labelDtos: CreateTaskLabelDto[],
  ): Promise<Task> {
    {
      /*
			1) DeDuplicates DTOs - Done 
			2)Get existing names - Done
			3) New labels arent already existing - Done
			4)we save new ones, only if there are any real one
			*/
    }
    const names = new Set(task.labels.map((label) => label.name));

    const labels = this.getUniqueLabels(labelDtos)
      .filter((dto) => !names.has(dto.name))
      .map((label) => this.labelRepository.create(label));

    if (labels.length) {
      task.labels = [...task.labels, ...labels];
      return await this.taskRepository.save(task);
    }
    return task;
  }
  private isValidStatusTransition(
    currentStatus: TaskStatus,
    newStatus: TaskStatus,
  ): boolean {
    const statusOrder = [
      TaskStatus.OPEN,
      TaskStatus.IN_PROGRESS,
      TaskStatus.DONE,
    ];
    return statusOrder.indexOf(currentStatus) <= statusOrder.indexOf(newStatus);
  }
  private getUniqueLabels(
    labelDtos: CreateTaskLabelDto[],
  ): CreateTaskLabelDto[] {
    const uniqueLabels = [...new Set(labelDtos.map((label) => label.name))];
    return uniqueLabels.map((name) => ({ name }));
  }
  public async removeLabels(
    task: Task,
    labelsToRemove: string[],
  ): Promise<Task> {
    {
      /*
			1. Remove existing labels array
			2. Ways to solve 
			a) Remove labels from task-> label and save the task
			b)query builder  - SQL that delete label (low level)
			*/
    }
    task.labels = task.labels.filter(
      (label) => !labelsToRemove.includes(label.name),
    );
    return await this.taskRepository.save(task);
  }
}
