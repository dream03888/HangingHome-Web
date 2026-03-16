import { Routes } from '@angular/router';
import { LoginComponent } from './admin/login/login.component';
import { AuthGuard } from './admin/guards/auth.guard';
import { GuestGuard } from './admin/guards/guest.guard';

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
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: '**', redirectTo: 'login' }
];
