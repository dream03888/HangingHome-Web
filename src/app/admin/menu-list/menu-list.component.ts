import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AdminDataService } from '../services/admin-data.service';
import { AuthService } from '../services/auth.service';
import { ApisService } from '../services/apis.service';
import { Menu, Store } from '../models/admin.models';
import { TranslatePipe } from '../pipes/translate.pipe';

@Component({
  selector: 'app-menu-list',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe],
  templateUrl: './menu-list.component.html',
  styleUrl: './menu-list.component.scss'
})
export class MenuListComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private adminData = inject(AdminDataService);
  public authService = inject(AuthService);
  private apisService = inject(ApisService);

  storeId!: string;
  store: Store | undefined;
  menus: Menu[] = [];
  isLoadingMenus = true;

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('storeId');
      if (id) {
        this.storeId = id;
        this.loadStore(id);
        this.loadproduct(id);
      }
    });
  }



  async loadproduct(store_id: string) {
    this.isLoadingMenus = true;
    try {
      const res = await this.apisService.getProduct(store_id);
      console.log('kuyyyyyyyyyyyyyyyyyyyyyyyyyyyyy', res.msg);

      if (res.status === 200) {
        this.menus = res.msg || [];
      } else {
        this.menus = [];
      }
    } catch (error) {
      console.error('Failed to load menus for menu list', error);
      this.menus = [];
    } finally {
      this.isLoadingMenus = false;
    }
  }

  async loadStore(id: string) {
    try {
      const res = await this.apisService.GetStore();
      if (res.status === 200) {
        const stores: Store[] = res.msg || [];
        this.store = stores.find(s => s.id === id);
      }
    } catch (error) {
      console.error('Failed to load store for menu list', error);
    }
  }

  async toggleMenuStatus(menu: Menu) {
    if (!this.authService.hasPermission('toggle_menu') && !this.authService.hasPermission('manage_menus')) {
      return;
    }

    try {
      const updatedMenu = { ...menu, product_active: !menu.product_active };
      // Call your API to update the menu. Wait for success before updating UI
      const res = await this.apisService.createProduct(updatedMenu); // Assuming createProduct acts as upsert/update

      if (res.status === 200) {
        // Update local state if successful
        menu.product_active = !menu.product_active;
      } else {
        console.error('Failed to toggle status');
      }

    } catch (error) {
      console.error('API Error toggling menu status:', error);
    }
  }
}
