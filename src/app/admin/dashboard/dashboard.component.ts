import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ApisService } from '../services/apis.service';

import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  storeId: string = '';
  totalRevenue: number = 0;
  totalOrders: number = 0;
  topItems: any[] = [];
  isLoading: boolean = true;

  // Filters
  startDate: string = '';
  endDate: string = '';
  activeTab: 'summary' | 'bills' | 'products' | 'payments' = 'summary';

  // Detailed Data
  billReport: any = { longRange: false, items: [] };
  productReport: any = { longRange: false, items: [] };
  paymentReport: any = { longRange: false, items: [] };

  // UI state
  expandedGroups: { [key: string]: boolean } = {};

  route = inject(ActivatedRoute);
  apisService = inject(ApisService);

  async ngOnInit() {
    this.storeId = this.route.snapshot.paramMap.get('storeId') || '';
    
    // Default to current month
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    this.startDate = firstDay.toISOString().split('T')[0];
    this.endDate = now.toISOString().split('T')[0];

    if (this.storeId) {
      await this.loadDashboardData();
    }
  }

  async loadDashboardData() {
    this.isLoading = true;
    try {
      const payload = { 
        storeId: this.storeId, 
        startDate: this.startDate ? `${this.startDate}T00:00:00.000Z` : undefined, 
        endDate: this.endDate ? `${this.endDate}T23:59:59.999Z` : undefined 
      };

      const summaryRes: any = await this.apisService.getSalesSummary(payload);
      if (summaryRes.status === 200) {
        this.totalRevenue = summaryRes.msg?.totalRevenue || 0;
        this.totalOrders = summaryRes.msg?.totalOrders || 0;
      }

      const topItemsRes: any = await this.apisService.getTopSellingItems(payload);
      if (topItemsRes.status === 200) {
        this.topItems = topItemsRes.msg || [];
      }

      // Load active tab details
      await this.loadTabDetails();

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async setTab(tab: 'summary' | 'bills' | 'products' | 'payments') {
    this.activeTab = tab;
    await this.loadTabDetails();
  }

  async loadTabDetails() {
    if (this.activeTab === 'summary') return;

    const payload = { 
      storeId: this.storeId, 
      startDate: this.startDate + 'T00:00:00.000Z', 
      endDate: this.endDate + 'T23:59:59.999Z' 
    };

    if (this.activeTab === 'bills') {
      const res: any = await this.apisService.getBuyPerBillDashboard(payload);
      if (res.status === 200) this.billReport = res.msg;
    } else if (this.activeTab === 'products') {
      const res: any = await this.apisService.getProductSalesDashboard(payload);
      if (res.status === 200) this.productReport = res.msg;
    } else if (this.activeTab === 'payments') {
      const res: any = await this.apisService.getPaymentDashboard(payload);
      if (res.status === 200) this.paymentReport = res.msg;
    }
  }

  toggleGroup(key: string) {
    this.expandedGroups[key] = !this.expandedGroups[key];
  }

  getGroupedItems(items: any[]) {
    if (!items) return [];
    const groups: { [key: string]: any[] } = {};
    items.forEach(item => {
      const key = item.grouping_key;
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });
    return Object.keys(groups).map(key => ({ key, items: groups[key] }));
  }

  // Helper to format grouping key (e.g., "2026-03" -> "March 2026")
  formatGroupKey(key: string): string {
    if (key.length === 7) { // YYYY-MM
      const [year, month] = key.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1);
      return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
    return key;
  }
}
