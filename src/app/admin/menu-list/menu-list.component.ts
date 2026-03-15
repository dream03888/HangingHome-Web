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
  searchTerm: string = '';

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 10;

  // Master Catalog Modal State
  showMasterModal: boolean = false;
  isLoadingMaster: boolean = false;
  masterMenus: Menu[] = [];
  selectedMasterIds: Set<string> = new Set();
  isImporting: boolean = false;

  get allFilteredMenus(): Menu[] {
    if (!this.searchTerm.trim()) {
      return this.menus;
    }
    const term = this.searchTerm.toLowerCase().trim();
    return this.menus.filter(menu =>
      menu.name.toLowerCase().includes(term) ||
      (menu.name_eng && menu.name_eng.toLowerCase().includes(term))
    );
  }

  get paginatedMenus(): Menu[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.allFilteredMenus.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.allFilteredMenus.length / this.itemsPerPage);
  }

  get isMasterCatalog(): boolean {
    return this.storeId === '00000000-0000-0000-0000-000000000000';
  }

  get pages(): number[] {
    const pages = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  onSearch(event: any) {
    this.searchTerm = event.target.value;
    this.currentPage = 1; // Reset to first page
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('storeId');
      if (id) {
        this.storeId = id;

        // Let the pseudo store '00000...' render its menus natively
        if (id === '00000000-0000-0000-0000-000000000000') {
          this.store = { id: id, name: 'Master Catalog', description: 'Central Product Repository', is_stock_enabled: false } as Store;
        } else {
          this.loadStore(id);
        }

        this.loadproduct(id);
      }
    });

    // Listen for cross-client Socket.IO updates
    this.apisService.socket.on('menu_updated', (data: any) => {
      if (data.store_id === this.storeId) {
        this.loadproduct(this.storeId);
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
      const res = await this.apisService.updateProduct(updatedMenu);

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

  // ==== Master Catalog Import Logic ====
  async openMasterCatalogModal() {
    this.showMasterModal = true;
    this.isLoadingMaster = true;
    this.selectedMasterIds.clear();
    this.masterMenus = [];

    try {
      // Fetch from the injected pseudo-store pseudo-uuid
      const res = await this.apisService.getProduct('00000000-0000-0000-0000-000000000000');
      if (res.status === 200 && res.msg) {
        this.masterMenus = res.msg.filter((m: Menu) => m.product_active); // Only show active master items
      }
    } catch (error) {
      console.error('Failed to fetch master catalog', error);
    } finally {
      this.isLoadingMaster = false;
    }
  }

  closeMasterModal() {
    this.showMasterModal = false;
    this.selectedMasterIds.clear();
  }

  toggleMasterSelection(productId: string) {
    if (this.selectedMasterIds.has(productId)) {
      this.selectedMasterIds.delete(productId);
    } else {
      this.selectedMasterIds.add(productId);
    }
  }

  async importSelectedMasterItems() {
    if (this.selectedMasterIds.size === 0) return;
    this.isImporting = true;

    const payload = {
      target_store_id: this.storeId,
      master_product_ids: Array.from(this.selectedMasterIds)
    };

    try {
      const res = await this.apisService.cloneProductFromMaster(payload);
      if (res.status === 200) {
        this.closeMasterModal();
        // The socket 'menu_updated' listener will refresh the list automatically.
      } else {
        alert('Failed to import items: ' + res.msg);
      }
    } catch (e) {
      console.error(e);
      alert('System error occurred during import.');
    } finally {
      this.isImporting = false;
    }
  }
}
