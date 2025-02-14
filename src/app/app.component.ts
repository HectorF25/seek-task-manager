import { Component, OnInit } from '@angular/core';
import { AuthService } from './auth/auth.service';
import { RouterOutlet } from '@angular/router';
import { SessionModalComponent } from './components/session-modal/session-modal.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [RouterOutlet, SessionModalComponent]
})
export class AppComponent implements OnInit {
  title = 'task-manager-app';
  message: string = '';
  showModal: boolean = false;

  constructor(private readonly authService: AuthService) {}

  ngOnInit() {
    this.authService.sessionExpired$.subscribe(message => {
      if (message) {
        this.message = message;
        this.showModal = true;

        // Redirigir al usuario después de 3 segundos
        setTimeout(() => {
          this.showModal = false;
          this.authService.logout();
        }, 3000);
      }
    });
  }


  closeModal() {
    this.showModal = false;
  }
}
