import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ApisService } from '../../services/apis.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
    selector: 'app-promotion-usage',
    standalone: true,
    imports: [CommonModule, TranslatePipe],
    template: `
    <div class="page-container">
      <div class="page-header">
        <div class="header-content">
          <div class="d-flex align-items-center gap-3">
            <button class="btn-icon header-back" (click)="goBack()" [title]="'COMMON.BACK' | translate">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
            </button>
            <div>
              <span class="category-chip mb-1">PROMOTION HISTORY</span>
              <h2 class="page-title">Usage Report: {{ promoCode }}</h2>
            </div>
          </div>
          <button class="btn-secondary" (click)="exportToCSV()" [disabled]="usageData.length === 0">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="me-2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Export to CSV
          </button>
        </div>
      </div>

      <div class="content-body" style="padding: 24px; max-width: 1240px; margin: 0 auto;">
        
        <!-- Summary Cards -->
        <div class="stats-grid mb-6">
          <div class="stat-card">
            <div class="stat-label">Total Transactions</div>
            <div class="stat-value">{{ usageData.length }}</div>
            <div class="stat-trend neutral">Bills using this code</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Total Savings Generated</div>
            <div class="stat-value">{{ totalSavings | number:'1.2-2' }} <small>THB</small></div>
            <div class="stat-trend down">Total discounts given</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Total Revenue (Net)</div>
            <div class="stat-value primary">{{ totalRevenue | number:'1.2-2' }} <small>THB</small></div>
            <div class="stat-trend up">Net income from these bills</div>
          </div>
        </div>

        <div class="form-card" style="padding: 0; overflow: hidden; border: 1px solid var(--border-soft);">
          <div class="table-responsive">
            <table class="modern-table">
              <thead>
                <tr>
                  <th style="width: 40px;"></th>
                  <th>Receipt #</th>
                  <th>Date & Time</th>
                  <th>Store</th>
                  <th>Method</th>
                  <th class="text-right">Subtotal</th>
                  <th class="text-right">Discount</th>
                  <th class="text-right">Net Total</th>
                  <th class="text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                <ng-container *ngFor="let order of usageData">
                  <tr class="action-row" (click)="toggleOrderDetails(order)" [class.expanded]="expandedOrderId === order.id">
                    <td class="text-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                        [style.transform]="expandedOrderId === order.id ? 'rotate(90deg)' : 'rotate(0)'" style="transition: transform 0.2s;">
                        <polyline points="9 18 15 12 9 6"></polyline>
                      </svg>
                    </td>
                    <td>
                      <span class="pos-ref">{{ order.pos_ref_no }}</span>
                      <div class="text-muted" style="font-size: 0.7rem;">ID: {{ order.id.slice(0,8) }}</div>
                    </td>
                    <td>{{ order.order_date | date:'dd/MM/yyyy HH:mm' }}</td>
                    <td>{{ order.store_name }}</td>
                    <td>
                      <span class="payment-badge">
                        <ng-container [ngSwitch]="order.payment_method">
                          <svg *ngSwitchCase="'CASH'" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="me-1"><rect x="2" y="6" width="20" height="12" rx="2"></rect><circle cx="12" cy="12" r="2"></circle><path d="M6 12h.01M18 12h.01"></path></svg>
                          <svg *ngSwitchCase="'CARD'" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="me-1"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
                          <svg *ngSwitchDefault xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="me-1"><rect x="2" y="4" width="20" height="16" rx="2"></rect><path d="M7 15h0M2 9.5h20"></path></svg>
                        </ng-container>
                        {{ order.payment_method }}
                      </span>
                    </td>
                    <td class="text-right">{{ order.subtotal | number:'1.2-2' }}</td>
                    <td class="text-right text-danger">-{{ order.discount_amount | number:'1.2-2' }}</td>
                    <td class="text-right bold">{{ order.total_amount | number:'1.2-2' }}</td>
                    <td class="text-center">
                      <span class="status-badge" [class]="order.order_status.toLowerCase()">
                        {{ order.order_status }}
                      </span>
                    </td>
                  </tr>
                  
                  <!-- Detail Expansion -->
                  <tr *ngIf="expandedOrderId === order.id" class="detail-row">
                    <td colspan="9" style="background: rgba(255,255,255,0.01); border-top: none;">
                      <div class="detail-content p-4">
                        <div *ngIf="order.isLoadingDetails" class="d-flex justify-content-center py-4">
                          <div class="spinner-border spinner-border-sm text-primary"></div>
                        </div>
                        
                        <div *ngIf="!order.isLoadingDetails && order.details" class="item-list">
                          <h4 class="mb-3" style="font-size: 0.9rem; font-weight: 700; color: var(--text-muted);">PURCHASED ITEMS</h4>
                          <div class="item-table-wrapper">
                            <table class="item-table">
                              <thead>
                                <tr>
                                  <th>Item Name</th>
                                  <th class="text-center">Qty</th>
                                  <th class="text-right">Price</th>
                                  <th class="text-right">Total</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr *ngFor="let item of order.details.items">
                                  <td>
                                    <div class="item-name">{{ item.name }}</div>
                                    <div class="item-eng">{{ item.name_eng }}</div>
                                  </td>
                                  <td class="text-center">x{{ item.quantity }}</td>
                                  <td class="text-right">{{ item.price_at_time_of_sale | number:'1.2-2' }}</td>
                                  <td class="text-right">{{ (item.price_at_time_of_sale * item.quantity) | number:'1.2-2' }}</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                </ng-container>

                <tr *ngIf="usageData.length === 0 && !isLoading">
                  <td colspan="9" class="empty-state">
                    <div class="empty-content">
                      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="mb-4 text-muted">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10 9 9 9 8 9"></polyline>
                      </svg>
                      <p>No usage records found for this promotion.</p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
    }
    .stat-card {
      background: var(--card-bg);
      border: 1px solid var(--border-soft);
      border-radius: 16px;
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .stat-label {
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .stat-value {
      font-size: 2rem;
      font-weight: 800;
      color: var(--text-main);
    }
    .stat-value.primary { color: var(--brand-primary); }
    .stat-value small { font-size: 1rem; color: var(--text-muted); }
    .stat-trend {
      font-size: 0.75rem;
      font-weight: 500;
    }
    .stat-trend.up { color: #10b981; }
    .stat-trend.down { color: #ef4444; }
    .stat-trend.neutral { color: var(--text-muted); }

    .action-row { cursor: pointer; transition: background 0.2s; }
    .action-row:hover { background: rgba(255, 255, 255, 0.03) !important; }
    .action-row.expanded { background: rgba(99, 102, 241, 0.05) !important; }

    .pos-ref {
      font-family: 'JetBrains Mono', monospace;
      font-weight: 700;
      color: var(--brand-primary);
    }
    .payment-badge {
      display: inline-flex;
      align-items: center;
      font-size: 0.7rem;
      font-weight: 700;
      padding: 2px 8px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 4px;
      text-transform: uppercase;
    }
    .status-badge {
      font-size: 0.7rem;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: 20px;
      text-transform: uppercase;
    }
    .status-badge.completed { background: rgba(16, 185, 129, 0.1); color: #10b981; }
    .status-badge.pending { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
    .status-badge.cancelled { background: rgba(239, 68, 68, 0.1); color: #ef4444; }

    .modern-table th { background: rgba(255,255,255,0.02); }
    .text-right { text-align: right; }
    .text-center { text-align: center; }
    .bold { font-weight: 700; }
    
    .item-table-wrapper {
      background: rgba(0,0,0,0.2);
      border-radius: 8px;
      padding: 12px;
    }
    .item-table {
      width: 100%;
      border-collapse: collapse;
    }
    .item-table th {
      text-align: left;
      font-size: 0.75rem;
      color: var(--text-muted);
      border-bottom: 1px solid var(--border-soft);
      padding: 8px;
    }
    .item-table td {
      padding: 8px;
      border-bottom: 1px solid rgba(255,255,255,0.03);
      vertical-align: top;
    }
    .item-name { font-weight: 600; color: var(--text-main); font-size: 0.85rem; }
    .item-eng { font-size: 0.7rem; color: var(--text-muted); }

    .empty-state {
      padding: 80px 0;
      text-align: center;
    }
    .empty-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      color: var(--text-muted);
    }
  `]
})
export class PromotionUsageComponent implements OnInit {
    usageData: any[] = [];
    promoCode = '';
    promoId = '';
    isLoading = true;
    expandedOrderId: string | null = null;

    totalRevenue = 0;
    totalSavings = 0;

    private route = inject(ActivatedRoute);
    private apisService = inject(ApisService);
    private location = inject(Location);

    ngOnInit() {
        this.route.paramMap.subscribe(params => {
            this.promoId = params.get('id') || '';
            this.promoCode = params.get('code') || 'Unknown Code';
            if (this.promoId) {
                this.loadUsageData();
            }
        });
    }

    async loadUsageData() {
        this.isLoading = true;
        try {
            const res = await this.apisService.getPromotionUsage(this.promoId);
            if (res.status === 200) {
                this.usageData = res.msg || [];
                this.calculateTotals();
            }
        } catch (e) {
            console.error('Error loading usage data', e);
        } finally {
            this.isLoading = false;
        }
    }

    async toggleOrderDetails(order: any) {
        if (this.expandedOrderId === order.id) {
            this.expandedOrderId = null;
            return;
        }

        this.expandedOrderId = order.id;

        if (!order.details && !order.isLoadingDetails) {
            order.isLoadingDetails = true;
            try {
                const res = await this.apisService.getOrderDetails(order.id);
                if (res.status === 200) {
                    order.details = res.msg;
                }
            } catch (e) {
                console.error('Error loading order details', e);
            } finally {
                order.isLoadingDetails = false;
            }
        }
    }

    calculateTotals() {
        this.totalRevenue = this.usageData.reduce((s, o) => s + parseFloat(o.total_amount || 0), 0);
        this.totalSavings = this.usageData.reduce((s, o) => s + parseFloat(o.discount_amount || 0), 0);
    }

    exportToCSV() {
        if (this.usageData.length === 0) return;

        const headers = ['Receipt #', 'Date', 'Time', 'Store', 'Payment Method', 'Subtotal', 'Discount', 'Net Total', 'Status'];
        const rows = this.usageData.map(o => {
            const date = new Date(o.order_date);
            return [
                o.pos_ref_no,
                date.toLocaleDateString('en-GB'),
                date.toLocaleTimeString('en-GB'),
                o.store_name,
                o.payment_method,
                o.subtotal,
                o.discount_amount,
                o.total_amount,
                o.order_status
            ];
        });

        const csvContent = [
            headers.join(','),
            ...rows.map(r => r.map(v => `"${v}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `promotion_usage_${this.promoCode}_${new Date().getTime()}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    goBack() {
        this.location.back();
    }
}
