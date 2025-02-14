import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Task } from '../../models/task.model';

@Component({
  selector: 'app-task-modal',
  templateUrl: './task-modal.component.html',
  styleUrls: ['./task-modal.component.css'],
  imports: [FormsModule, ReactiveFormsModule, CommonModule]
})
export class TaskModalComponent {
  @Input() task: Task | null = null;
  @Output() save = new EventEmitter<Task>();
  @Output() close = new EventEmitter<void>();
  @Output() delete = new EventEmitter<string>();

  isEditing: boolean = false;
  tempTask: Task = this.task ? { ...this.task } : this.getNewTask();

  getNewTask(): Task {
    return {
      id: '',
      title: '',
      description: '',
      status: 'todo',
      initialDate: '',
      finalDate: '',
      subTasks: []
    };
  }

  ngOnChanges() {
    if (this.task) {
      this.tempTask = JSON.parse(JSON.stringify(this.task));
      this.isEditing = false;
    } else {
      this.tempTask = this.getNewTask();
      this.isEditing = true;
    }
  }

  addSubTask() {
    this.tempTask.subTasks.push({ id: new Date().getTime().toString(), title: '', completed: false });
  }

  removeSubTask(index: number) {
    this.tempTask.subTasks.splice(index, 1);
  }

  validate() {
    if (!this.tempTask.title) {
      alert("El título es obligatorio.");
      return false;
    }
    if (!this.tempTask.description) {
      alert("La descripción es obligatoria.");
      return false;
    }
    if (this.tempTask.status === 'in-progress' && !this.tempTask.finalDate) {
      alert("La fecha de finalización es obligatoria.");
      return false;
    }
    return true;
  }

  hasEmptySubTasks(): boolean {
    return this.tempTask.subTasks.some(subTask => !subTask.title.trim());
  }

  onSave() {
    if (this.validate()) {
      this.save.emit(this.tempTask);
      this.isEditing = false;
    }
  }

  deleteTask(taskId: string) {
    this.delete.emit(taskId);
    this.close.emit();
  }

  onClose() {
    this.ngOnChanges(); // Restablecer los valores antes de cerrar
    this.close.emit();
  }

}
