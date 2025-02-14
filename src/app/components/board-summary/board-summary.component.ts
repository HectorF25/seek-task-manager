import { Component, Input } from '@angular/core';
import { Task } from '../../models/task.model';
import { TaskModalComponent } from '../task-modal/task-modal.component';
import { TaskService } from '../../components/task/task.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-board-summary',
  templateUrl: './board-summary.component.html',
  styleUrls: ['./board-summary.component.css'],
  imports: [TaskModalComponent, CommonModule]
})
export class BoardSummaryComponent {
  @Input() tasks: Task[] = [];

  selectedTask: Task | null = null;
  showModal: boolean = false;

  constructor(private readonly taskService: TaskService) {}

  get totalTasks() {
    return this.tasks.length;
  }

  get delayedTasks() {
    const now = new Date();
    return this.tasks.filter(task => {
      if (task.status === 'completed' || task.finalDate === null || task.initialDate === null) return false;
      const finalDate = new Date((task.finalDate) ?? '');
      return (now.getTime() - finalDate.getTime()) / (1000 * 60 * 60 * 24) > 1;
    }).length;
  }

  get unestimatedTasks() {
    return this.tasks.filter(task => {
      return task.status !== 'completed' && !task.finalDate;
    }).length;
  }

  get notStartedTasks() {
    return this.tasks.filter(task => task.status === 'todo' && task.initialDate).length;
  }

  get tasksByStatus() {
    return {
      todo: this.tasks.filter(task => task.status === 'todo').length,
      inProgress: this.tasks.filter(task => task.status === 'in-progress').length,
      completed: this.tasks.filter(task => task.status === 'completed').length
    };
  }

  openTaskModal() {
    this.selectedTask = null; // Crear nueva tarea
    this.showModal = true;
  }

  saveTask(task: Task) {
    this.taskService.addTask(task);
    this.showModal = false;
  }
}
