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

      // Promotions (Global Menu)
      { path: 'promotions', loadComponent: () => import('./promotions/promotion-list/promotion-list.component').then(m => m.PromotionListComponent) },
      { path: 'promotions/new', loadComponent: () => import('./promotions/promotion-form/promotion-form.component').then(m => m.PromotionFormComponent) },
      { path: 'promotions/:id/edit', loadComponent: () => import('./promotions/promotion-form/promotion-form.component').then(m => m.PromotionFormComponent) },

      // Coupons (Universal Batch System)
      { path: 'coupons', loadComponent: () => import('./promotions/coupon-list/coupon-list.component').then(m => m.CouponListComponent) },
      { path: 'coupons/new', loadComponent: () => import('./promotions/coupon-form/coupon-form.component').then(m => m.CouponFormComponent) },

      {
        path: 'promotions/:id/usage/:code',
        loadComponent: () => import('./promotions/promotion-usage/promotion-usage.component').then(m => m.PromotionUsageComponent)
      },
      {
        path: 'master-options',
        loadComponent: () => import('./master-options/master-options.component').then(m => m.MasterOptionsComponent)
      },

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
