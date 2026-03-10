import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
    providedIn: 'root'
})
export class GuestGuard implements CanActivate {
    constructor(private authService: AuthService, private router: Router) { }

    async canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Promise<boolean> {

        // Await initial token verification
        await this.authService.isReady;

        if (this.authService.isAuthenticated()) {
            // Already logged in, redirect to admin home instead of showing the login page
            this.router.navigate(['/admin/stores']);
            return false;
        }

        // Not logged in, can access the login page
        return true;
    }
}
