import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminDataService } from '../services/admin-data.service';
import { AuthService } from '../services/auth.service';
import { TranslatePipe } from '../pipes/translate.pipe';
import { ApisService } from '../services/apis.service';
import { Store } from '../models/admin.models';

@Component({
  selector: 'app-store-list',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe],
  templateUrl: './store-list.component.html',
  styleUrl: './store-list.component.scss'
})
export class StoreListComponent implements OnInit {
  private adminData = inject(AdminDataService);
  public authService = inject(AuthService);

  stores: Store[] = [];

  constructor(private apis: ApisService) { }

  async ngOnInit() {
    await this.getStores();
  }

  async getStores() {
    try {
      const res = await this.apis.GetStore();
      console.log('Stores from API:', res.msg);

      if (res.status == 200) {
        const fetchedStores = res.msg || [];

        // Filter exactly like it was done originally
        if (this.authService.isSuperAdmin()) {
          this.stores = fetchedStores;
        } else {
          const currentUser = this.authService.currentUserValue;
          this.stores = fetchedStores.filter((s: Store) => s.id === currentUser?.storeId);
        }
      }
    } catch (error) {
      console.error('Error fetching stores:', error);
    }
  }

  async deleteStore(storeId: string, storeName: string) {
    if (confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบสาขา "${storeName}"?\nการกระทำนี้ไม่สามารถย้อนกลับได้`)) {
      try {
        const res = await this.apis.deleteStore(storeId);
        if (res.status === 200) {
          this.stores = this.stores.filter(s => s.id !== storeId);
        } else {
          alert('ไม่สามารถลบสาขาได้ อาจมีข้อมูลเมนู พนักงาน หรือคลังสินค้าผูกอยู่\nError: ' + res.msg);
        }
      } catch (e) {
        console.error('Delete failed', e);
      }
    }
  }
}
