import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService, private readonly router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const isLoggedIn = this.authService.isLoggedIn();

    if (state.url === '/login' && isLoggedIn) {
      this.router.navigate(['/dashboard']);
      return false;
    }

    if (state.url === '/dashboard' && !isLoggedIn) {
      this.router.navigate(['/login']);
      return false;
    }

    return true;
  }
}
