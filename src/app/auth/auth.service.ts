import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.development';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private user: User | null = null;
  private sessionTimeout: any;
  private inactivityTimeout: any;
  private readonly inactivityLimit = 10 * 60 * 1000; // 10 minutos de inactividad
  private modalShown = false;
  private readonly sessionExpiredSubject = new BehaviorSubject<string | null>(null);
  sessionExpired$ = this.sessionExpiredSubject.asObservable();

  constructor(
    private readonly router: Router,
    private readonly ngZone: NgZone,
    private readonly http: HttpClient
  ) {
    this.initSessionTracking();
  }

  login(username: string, password: string) {
    this.http.post<any>(environment.API_AUTH_URL + '/login', { email: username, password }).subscribe({
      next: (response) => {
        if (response.code === '00') {
          const userData = response.data.auth[0];
          const tokenData = response.data.token;

          this.user = userData;
          const expiration = Number(tokenData.expirationDate) * 1000;
          localStorage.setItem('user', JSON.stringify(this.user || {}));
          localStorage.setItem('session_expiration', expiration.toString());
          localStorage.setItem('token', tokenData.token);

          this.resetSessionTimers(expiration);
          setTimeout(() => {
            this.router.navigate(['/dashboard']);
          }, 1000);

          this.sessionExpiredSubject.next(null);
        } else {
          console.error('Error en login:', response.message);
          this.sessionExpiredSubject.next(response.message);
        }
      },
      error: (error) => {
        console.error('Error en login:', error);
        this.sessionExpiredSubject.next('Error al iniciar sesión. Intente de nuevo.');
      }
    });
  }


  register(user: User) {
    return this.http.post<any>(environment.API_AUTH_URL + '/register', user);
  }

  logout(reason: string | null = null) {
    this.user = null;
    localStorage.removeItem('user');
    localStorage.removeItem('session_expiration');
    localStorage.removeItem('last_activity');
    localStorage.removeItem('token');
    localStorage.removeItem('tasks');
    this.clearTimers();

    setTimeout(() => {
      this.router.navigate(['/login']);
    }, 100); // Pequeño delay para evitar posibles conflictos de navegación
  }

  getUser(): User | null {
    const userData = localStorage.getItem('user');
    try {
      return userData ? JSON.parse(userData) : null;
    } catch (e) {
      return null;
    }
  }

  getUserId(): string {
    return this.getUser()?.userId ?? '1';
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    const user = this.getUser();
    const expiration = Number(localStorage.getItem('session_expiration'));

    if (!user || (expiration && Date.now() > expiration)) {
      return false;
    }
    return true;
  }


  resetInactivityTimer() {
    const expiration = Number(localStorage.getItem('session_expiration'));
    this.resetSessionTimers(expiration);
  }

  private resetSessionTimers(expiration: number) {
    this.clearTimers();
    const timeRemaining = expiration - Date.now();

    if (timeRemaining > 0) {
      this.sessionTimeout = setTimeout(() => this.showModal('Su sesión ha expirado.'), timeRemaining);
      this.inactivityTimeout = setTimeout(() => this.showModal('Se detectó inactividad. Cerrando sesión...'), this.inactivityLimit);
    } else {
      this.showModal('Su sesión ha expirado.');
    }
  }

  private clearTimers() {
    clearTimeout(this.sessionTimeout);
    clearTimeout(this.inactivityTimeout);
  }

  private showModal(message: string) {
    if (this.modalShown) return;
    this.modalShown = true;
    this.logout(message);
    this.sessionExpiredSubject.next(message);
  }


  private initSessionTracking() {
    if (this.isLoggedIn()) {
      const expiration = Number(localStorage.getItem('session_expiration'));
      this.resetSessionTimers(expiration);
      this.trackActivity();
    }
  }

  private trackActivity() {
    document.addEventListener('mousemove', () => this.resetInactivityTimer());
    document.addEventListener('keydown', () => this.resetInactivityTimer());
  }
}
