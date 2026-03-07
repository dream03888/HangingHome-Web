import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class SuperAdminGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) { }

  canActivate(): boolean | UrlTree {
    if (this.authService.isSuperAdmin()) {
      return true;
    }

    alert('Access Denied: You must be a Super Admin to access this page.');
    return this.router.parseUrl('/admin/stores');
  }
}
