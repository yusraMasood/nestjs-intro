import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './create-task.dto';
import { FindOneParams } from './find-one.params';
import { UpdateTaskDto } from './update-task.dto';
import { WrongTaskStatusException } from './Exceptions/wrong-task-status.exception';
import { Task } from './task.entity';
import { CreateTaskLabelDto } from './create-task-label.dto';

@Controller('tasks')
export class TasksController {
  constructor(private tasksService: TasksService) {}
  @Get()
  public async findAll(): Promise<Task[]> {
    return await this.tasksService.findAll();
  }
  @Get('/:id')
  public async findOne(@Param() params: FindOneParams): Promise<Task> {
    return this.findOneOrFail(params.id);
  }
  @Post()
  public async create(@Body() createTaskDto: CreateTaskDto): Promise<Task> {
    return await this.tasksService.create(createTaskDto);
  }

  @Patch('/:id')
  public async updateTaskStatus(
    @Param() params: FindOneParams,
    @Body() updateTaskDto: UpdateTaskDto,
  ): Promise<Task> {
    const task = await this.findOneOrFail(params.id);
    try {
      return await this.tasksService.update(task, updateTaskDto);
    } catch (error) {
      if (error instanceof WrongTaskStatusException) {
        throw new BadRequestException([error.message]);
      }
      throw error;
    }
  }
  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async delete(@Param() params: FindOneParams): Promise<void> {
    const task = await this.findOneOrFail(params.id);
    this.tasksService.delete(task);
  }

  private async findOneOrFail(id: string): Promise<Task> {
    const task = await this.tasksService.findOne(id);
    if (!task) {
      throw new NotFoundException();
    }
    return task;
  }
  @Post(':id/labels')
  public async addLabels(
    @Param() { id }: FindOneParams,
    @Body() labels: CreateTaskLabelDto[],
  ): Promise<Task> {
    const task = await this.findOneOrFail(id);
    return await this.tasksService.addLables(task, labels);
  }
  @Delete(':id/labels')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async removeLabels(
    @Param() { id }: FindOneParams,
    @Body() labelNames: string[],
  ): Promise<void> {
    const task = await this.findOneOrFail(id);
    await this.tasksService.removeLabels(task, labelNames);
  }
}
