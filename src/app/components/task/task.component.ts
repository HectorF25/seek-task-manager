import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { Task } from '../../models/task.model';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-task',
  templateUrl: './task.component.html',
  standalone: true,
  styleUrls: ['./task.component.css'],
  imports: [FormsModule, ReactiveFormsModule, CommonModule]
})
export class TaskComponent {
  @Input() task!: Task;
  @Output() edit = new EventEmitter<Task>();
  @Output() delete = new EventEmitter<number>();
  @Output() taskSelected = new EventEmitter<Task>();

  onDragStart(event: DragEvent) {
    if (this.task?.id) {
      console.log('onDragStart', this.task.id);
      event.dataTransfer?.setData('text/plain', this.task.id.toString());
      const dragElement = event.currentTarget as HTMLElement;
      const clone = dragElement.cloneNode(true) as HTMLElement;
      clone.style.opacity = '1';
      clone.style.position = 'absolute';
      clone.style.top = '-9999px';
      clone.style.left = '-9999px';

      document.body.appendChild(clone);

      event.dataTransfer!.setDragImage(clone, 0, 0);
      event.dataTransfer!.effectAllowed = "move";
      localStorage.setItem('draggedTask', this.task.id.toString());

    }
  }

  @HostListener('touchstart', ['$event'])
  onTouchStart(event: TouchEvent) {
    if (this.task?.id) {
      localStorage.setItem('draggedTask', this.task.id.toString());
    }
  }

  openTaskModal() {
    this.taskSelected.emit(this.task);
  }
}
