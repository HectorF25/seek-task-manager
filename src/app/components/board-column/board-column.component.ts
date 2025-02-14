import { Component, Input, HostListener, OnInit, ChangeDetectorRef } from '@angular/core';
import { Task } from '../../models/task.model';
import { TaskComponent } from '../task/task.component';
import { TaskModalComponent } from '../task-modal/task-modal.component';
import { CommonModule } from '@angular/common';
import { TaskService } from '../../components/task/task.service';


@Component({
  selector: 'app-board-column',
  templateUrl: './board-column.component.html',
  styleUrls: ['./board-column.component.css'],
  standalone: true,
  imports: [TaskComponent, CommonModule, TaskModalComponent]
})
export class BoardColumnComponent implements OnInit {
  @Input() status!: 'todo' | 'in-progress' | 'completed';
  tasks: Task[] = [];
  globalTask: Task[] = [];

  selectedTask: Task | null = null;
  showModal: boolean = false;

  draggedTaskId: string | null = null;
  draggedOverIndex: number | null = null;

  constructor(private readonly taskService: TaskService, private readonly cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.taskService.tasks$.subscribe(tasks => {
      this.globalTask = tasks ?? [];
      this.tasks = tasks?.filter(task => task.status === this.status) ?? [];
      this.cdr.detectChanges();
    });
  }


  openTaskModal(task: Task | null = null) {
    this.selectedTask = task;
    this.showModal = true;
  }

  closeTaskModal() {
    this.showModal = false;
    this.selectedTask = null;
  }

  saveTask(task: Task) {
    if (task.id) {
      this.taskService.updateTask(task);
    } else {
      this.taskService.addTask(task);
    }
    this.closeTaskModal();
  }

  deleteTask(taskId?: string) {
    if (taskId === undefined) {
      console.error('No se puede eliminar la tarea sin un ID.');
      return;
    }
    this.taskService.deleteTask(taskId);
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    const taskId = event.dataTransfer?.getData('text/plain');
    console.log('onDrop', taskId);
    if (taskId) {
      this.moveTask(taskId);
    }
  }

  @HostListener('touchend', ['$event'])
  onTouchEnd(event: TouchEvent) {
    const taskId = localStorage.getItem('draggedTask');
    localStorage.removeItem('draggedTask');

    if (!taskId) return;

    const touch = event.changedTouches[0];
    const touchElement = document.elementFromPoint(touch.clientX, touch.clientY) as HTMLElement;

    if (touchElement && touchElement.closest('.board-column') === event.currentTarget) {
      this.moveTask(taskId);
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.dataTransfer!.dropEffect = "move";
  }

  private moveTask(taskId: string) {
    console.log('moveTask', taskId);
    console.log('this.tasks', this.globalTask);
    const task = this.globalTask.find(task => task.id === taskId);
    if (task && task.status !== this.status) {
      task.status = this.status;
      this.taskService.updateTaskStatus(taskId, task);
    }
  }

  onDragStart(event: DragEvent, taskId: string) {
    this.draggedTaskId = taskId;
    event.dataTransfer?.setData('text/plain', taskId);
    event.dataTransfer!.effectAllowed = 'move';
  }

  onDragOverTask(event: DragEvent, index: number) {
    event.preventDefault();
    this.draggedOverIndex = index;
  }

  onDropTask(event: DragEvent, index: number) {
    event.preventDefault();

    if (!this.draggedTaskId) return;

    const draggedIndex = this.tasks.findIndex(task => task.id === this.draggedTaskId);

    if (draggedIndex === -1 || draggedIndex === index) return;

    const [movedTask] = this.tasks.splice(draggedIndex, 1);
    this.tasks.splice(index, 0, movedTask);

    this.taskService.updateTaskOrder(this.tasks);

    this.draggedTaskId = null;
    this.draggedOverIndex = null;
  }

}
