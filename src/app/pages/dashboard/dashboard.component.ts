import { Component, OnInit } from '@angular/core';
import { BoardColumnComponent } from '../../components/board-column/board-column.component';
import { BoardSummaryComponent } from '../../components/board-summary/board-summary.component';
import { NavbarComponent } from "../../components/navbar/navbar.component";
import { CommonModule } from '@angular/common';
import { AuthService } from '../../auth/auth.service';
import { TaskService } from '../../components/task/task.service';
import { Task } from '../../models/task.model';
import { Observable, map } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  imports: [BoardColumnComponent, NavbarComponent, BoardSummaryComponent, CommonModule]
})
export class DashboardComponent implements OnInit {
  statuses: ('todo' | 'in-progress' | 'completed')[] = ['todo', 'in-progress', 'completed'];
  tasks$: Observable<Task[]>;

  constructor(private readonly taskService: TaskService, private readonly authService: AuthService, private readonly router: Router) {
    this.tasks$ = this.taskService.tasks$.pipe(
      map(tasks => tasks ?? [])
    );
  }

  ngOnInit(): void {
    this.taskService.loadTasks(); // Cargar tareas desde el backend
  }
}
