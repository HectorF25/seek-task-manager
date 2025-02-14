import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Task } from '../../models/task.model';
import { AuthService } from '../../auth/auth.service';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private readonly tasksSubject = new BehaviorSubject<Task[]>([]);
  tasks$ = this.tasksSubject.asObservable();

  constructor(
    private readonly http: HttpClient,
    private readonly authService: AuthService
  ) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  private getUserId(): string {
    return this.authService.getUserId();
  }

  loadTasks(): void {
    const userId = this.getUserId();
    this.http.get<{ data: { tasks: Task[] } }>(`${environment.API_TASK_URL}/tasks/${userId}`, {
      headers: this.getAuthHeaders()
    })
    .pipe(
      tap(response => console.log('API Response:', response)), // Verificar la estructura de respuesta
      tap(response => this.tasksSubject.next(response?.data?.tasks ?? []))
    )
    .subscribe();
  }

  addTask(task: Task): void {
    const userId = this.getUserId();
    this.http.post<{ data: { tasks: Task[] } }>(`${environment.API_TASK_URL}/create-task/${userId}`, task, {
      headers: this.getAuthHeaders()
    })
    .pipe(
      tap(response => {
        console.log('API Response:', response);
        const newTask = response.data.tasks[0];
        this.tasksSubject.next([...this.tasksSubject.value, newTask]);
      })
    )
    .subscribe();
  }

  updateTask(task: Task): void {
    const taskId = task.id;
    this.http.put<{ data: { tasks: Task[] } }>(`${environment.API_TASK_URL}/update-task/${taskId}`, task, {
      headers: this.getAuthHeaders()
    })
    .pipe(
      tap(response => {
        console.log('API Response:', response);
        const updatedTask = response.data.tasks[0];
        this.tasksSubject.next(this.tasksSubject.value.map(t => t.id === updatedTask.id ? updatedTask : t));
      })
    )
    .subscribe();
  }

  updateTaskStatus(taskId: string, task: Task): void {
    this.http.put<{ data: { tasks: Task[] } }>(`${environment.API_TASK_URL}/update-task/${taskId}`, task, {
      headers: this.getAuthHeaders()
    })
    .pipe(
      tap(response => {
        console.log('API Response:', response.data);
        const updatedTask = response.data.tasks[0];
        console.log('Updated Task:', updatedTask);
        this.tasksSubject.next(this.tasksSubject.value.map(t => t.id === updatedTask.id ? updatedTask : t));
      })
    )
    .subscribe();
  }

  deleteTask(taskId: string): void {
    this.http.delete<{ correlationId: string; code: string; message: string }>(
      `${environment.API_TASK_URL}/delete-task/${taskId}`,
      {
        headers: this.getAuthHeaders()
      }
    )
    .pipe(
      tap(response => {
        console.log('API Response:', response);

        if (response.code === "00") { // Verificar éxito en la eliminación
          this.tasksSubject.next(this.tasksSubject.value.filter(t => t.id !== taskId));
        } else {
          console.error('Error al eliminar la tarea:', response.message);
        }
      })
    )
    .subscribe();
  }

  updateTaskOrder(tasks: Task[]) {
    this.tasksSubject.next([...tasks]);
  }

}
