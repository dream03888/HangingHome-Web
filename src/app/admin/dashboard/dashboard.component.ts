import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ApisService } from '../services/apis.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  storeId: string = '';
  totalRevenue: number = 0;
  totalOrders: number = 0;
  topItems: any[] = [];
  isLoading: boolean = true;

  route = inject(ActivatedRoute);
  apisService = inject(ApisService);

  async ngOnInit() {
    this.storeId = this.route.snapshot.paramMap.get('storeId') || '';
    if (this.storeId) {
      await this.loadDashboardData();
    }
  }

  async loadDashboardData() {
    this.isLoading = true;
    try {
      const summaryRes: any = await this.apisService.getSalesSummary(this.storeId);
      if (summaryRes.status === 200) {
        this.totalRevenue = summaryRes.msg?.totalRevenue || 0;
        this.totalOrders = summaryRes.msg?.totalOrders || 0;
      }

      const topItemsRes: any = await this.apisService.getTopSellingItems(this.storeId);
      if (topItemsRes.status === 200) {
        this.topItems = topItemsRes.msg || [];
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      this.isLoading = false;
    }
  }
}
