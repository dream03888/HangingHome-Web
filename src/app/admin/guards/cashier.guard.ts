import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
    providedIn: 'root'
})
export class CashierGuard implements CanActivate {
    constructor(private authService: AuthService, private router: Router) { }

    async canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Promise<boolean> {

        // Await initial token verification
        await this.authService.isReady;

        if (!this.authService.isAuthenticated()) {
            // Not logged in, so redirect to login page
            this.router.navigate(['/login']);
            return false;
        }

        // Check if user has permission to access kiosk
        if (this.authService.hasPermission('access_kiosk') || this.authService.isSuperAdmin()) {
            return true;
        }

        // Attempted to access Kiosk but has no permission, redirect to their default home
        this.router.navigate(['/admin/stores']);
        return false;
    }
}
