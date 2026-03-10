import { Routes } from '@angular/router';
import { LoginComponent } from './admin/login/login.component';
import { AuthGuard } from './admin/guards/auth.guard';
import { GuestGuard } from './admin/guards/guest.guard';
import { CashierGuard } from './admin/guards/cashier.guard';
import { StoreSelectorComponent } from './kiosk/store-selector/store-selector.component';
import { CustomerMenuComponent } from './kiosk/customer-menu/customer-menu.component';

export const routes: Routes = [
    {
        path: 'login',
        canActivate: [GuestGuard],
        component: LoginComponent
    },
    {
        path: 'admin',
        canActivate: [AuthGuard],
        loadChildren: () => import('./admin/admin.routes').then(m => m.ADMIN_ROUTES)
    },
    {
        path: 'kiosk',
        canActivate: [CashierGuard],
        component: StoreSelectorComponent
    },
    {
        path: 'kiosk/:storeId',
        canActivate: [CashierGuard],
        component: CustomerMenuComponent
    },
    { path: '', redirectTo: 'login', pathMatch: 'full' }
];
