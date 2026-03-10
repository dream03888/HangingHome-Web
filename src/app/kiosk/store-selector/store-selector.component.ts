import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApisService } from '../../admin/services/apis.service';
import { Store } from '../../admin/models/admin.models';

@Component({
  selector: 'app-store-selector',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './store-selector.component.html',
  styleUrl: './store-selector.component.scss'
})
export class StoreSelectorComponent implements OnInit {
  private apisService = inject(ApisService);
  stores: Store[] = [];
  isLoading = true;

  async ngOnInit() {
    try {
      const res = await this.apisService.GetStore();
      if (res.status === 200 || res.status === 201) {
        // Filter out inactive stores for the public view if we had an isActive flag
        this.stores = res.msg || [];
      }
    } catch (err) {
      console.error('Failed to load stores', err);
    } finally {
      this.isLoading = false;
    }
  }
}
