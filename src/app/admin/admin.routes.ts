import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './admin-layout/admin-layout.component';
import { StoreListComponent } from './store-list/store-list.component';
import { StoreFormComponent } from './store-form/store-form.component';
import { MenuListComponent } from './menu-list/menu-list.component';
import { MenuFormComponent } from './menu-form/menu-form.component';
import { MenuSetComponent } from './menu-set/menu-set.component';
import { StoreAccessGuard } from './guards/store-access.guard';
import { SuperAdminGuard } from './guards/super-admin.guard';
import { DashboardComponent } from './dashboard/dashboard.component';
import { InventoryListComponent } from './inventory-list/inventory-list.component';
import { StockTransactionComponent } from './stock-transaction/stock-transaction.component';
import { RecipeManagerComponent } from './recipe-manager/recipe-manager.component';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      { path: '', redirectTo: 'stores', pathMatch: 'full' },
      { path: 'stores', component: StoreListComponent },
      { path: 'stores/new', component: StoreFormComponent },
      { path: 'stores/:id/edit', component: StoreFormComponent, canActivate: [StoreAccessGuard] },
      { path: 'stores/:storeId/menus', component: MenuListComponent, canActivate: [StoreAccessGuard] },
      { path: 'stores/:storeId/menus/new', component: MenuFormComponent, canActivate: [StoreAccessGuard] },
      { path: 'stores/:storeId/menus/:menuId/edit', component: MenuFormComponent, canActivate: [StoreAccessGuard] },
      { path: 'stores/:storeId/menu-sets', component: MenuSetComponent, canActivate: [StoreAccessGuard] },

      // Inventory
      { path: 'stores/:storeId/inventory', component: InventoryListComponent, canActivate: [StoreAccessGuard] },
      { path: 'stores/:storeId/transactions', component: StockTransactionComponent, canActivate: [StoreAccessGuard] },
      { path: 'stores/:storeId/recipes/:productId', component: RecipeManagerComponent, canActivate: [StoreAccessGuard] },

      // Dashboard
      {
        path: 'stores/:storeId/dashboard',
        canActivate: [StoreAccessGuard],
        loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent)
      },

      // Settings (Super Admin Only)
      {
        path: 'settings',
        canActivate: [SuperAdminGuard],
        loadComponent: () => import('./settings/settings.component').then(m => m.SettingsComponent),
        children: [
          { path: '', redirectTo: 'users', pathMatch: 'full' },
          { path: 'users', loadComponent: () => import('./settings/user-list/user-list.component').then(m => m.UserListComponent) },
          { path: 'users/new', loadComponent: () => import('./settings/user-form/user-form.component').then(m => m.UserFormComponent) },
          { path: 'users/:id/edit', loadComponent: () => import('./settings/user-form/user-form.component').then(m => m.UserFormComponent) }
        ]
      }
    ]
  }
];
