import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class StoreAccessGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean {

    // The storeId is typically in the route params 'storeId' or 'id'
    const storeId = route.paramMap.get('storeId') || route.paramMap.get('id');

    if (!storeId) {
      // If there's no storeId in the URL, logic shouldn't block it here
      return true;
    }

    if (this.authService.canAccessStore(storeId)) {
      return true;
    }

    alert('Unauthorized: You do not have permission to manage this store.');
    this.router.navigate(['/admin/stores']);
    return false;
  }
}
