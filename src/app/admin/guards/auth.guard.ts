import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) { }

  async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Promise<boolean> {

    // Await initial token verification
    await this.authService.isReady;

    if (this.authService.isAuthenticated()) {
      return true;
    }

    // Not logged in, so redirect to login page
    this.router.navigate(['/login']);
    return false;
  }
}
