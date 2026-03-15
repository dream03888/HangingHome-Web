import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { ApisService } from '../../services/apis.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-coupon-list',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div class="header-content">
          <div>
            <h2 class="page-title">{{ 'COUPON.TITLE' | translate }}</h2>
            <p class="page-subtitle">{{ 'COUPON.SUB' | translate }}</p>
          </div>
        </div>
        <button class="btn-primary" routerLink="new" *ngIf="isSuperAdmin">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          {{ 'COUPON.ADD' | translate }}
        </button>
      </div>

      <div *ngIf="isLoading" class="loading-container">
        <div class="spinner"></div>
        <p>{{ 'COUPON.LOADING' | translate }}</p>
      </div>

      <div *ngIf="!isLoading && campaigns.length === 0" class="empty-state card">
        <div class="empty-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
        </div>
        <h3>{{ 'COUPON.NO_CAMPAIGNS' | translate }}</h3>
        <p>{{ 'COUPON.EMPTY_SUB' | translate }}</p>
        <button class="btn-primary mt-4" routerLink="new" *ngIf="isSuperAdmin">{{ 'COUPON.GET_STARTED' | translate }}</button>
      </div>

      <div class="coupon-grid" *ngIf="!isLoading && campaigns.length > 0">
        <div class="coupon-card" *ngFor="let cam of campaigns">
          <div class="card-glow" [ngClass]="cam.discount_type"></div>
          
          <div class="card-header">
            <div class="prefix-badge">
              <span class="prefix-label">{{ 'COUPON.BATCH_PREFIX' | translate }}</span>
              <span class="prefix-code">{{ cam.prefix }}</span>
            </div>
            <span class="status-pill" [class.active]="cam.is_active">
              {{ cam.is_active ? ('COUPON.ACTIVE' | translate) : ('COUPON.INACTIVE' | translate) }}
            </span>
          </div>

          <div class="card-body">
            <h3 class="campaign-name">{{ cam.name }}</h3>
            
            <div class="promo-info">
              <div class="discount-box" [ngClass]="cam.discount_type">
                <span class="value">{{ cam.discount_value }}{{ cam.discount_type === 'percentage' ? '%' : '฿' }}</span>
                <span class="off">{{ 'COUPON.OFF' | translate }}</span>
              </div>
              <div class="target-info">
                <span class="target-pill" [class.bill]="cam.is_all_bill">
                  {{ cam.is_all_bill ? ('COUPON.IS_ALL_BILL' | translate) : ('PROMO.TARGET_PRODUCT' | translate) }}
                </span>
                <div class="date-range">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                  <span>{{ cam.start_date | date:'shortDate' }} - {{ cam.end_date ? (cam.end_date | date:'shortDate') : ('COUPON.PERMANENT' | translate) }}</span>
                </div>
              </div>
            </div>

            <div class="usage-stats">
              <div class="stats-header">
                <span class="stats-label">{{ 'COUPON.REDEMPTION' | translate }}</span>
                <span class="stats-value">{{ cam.used_coupons || 0 }} / {{ cam.total_coupons || 0 }}</span>
              </div>
              <div class="progress-track">
                <div class="progress-fill" [style.width.%]="(cam.used_coupons || 0) / (cam.total_coupons || 1) * 100"></div>
              </div>
              <p class="usage-text">{{ 'COUPON.USAGE_HINT' | translate }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .coupon-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 24px; }
    .coupon-card { background: var(--surface); border: 1px solid var(--border-soft); border-radius: 20px; overflow: hidden; position: relative; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); display: flex; flex-direction: column; }
    .coupon-card:hover { transform: translateY(-8px); border-color: var(--primary-soft); box-shadow: var(--shadow-lg); }
    
    .card-glow { position: absolute; top: -50px; right: -50px; width: 150px; height: 150px; border-radius: 50%; filter: blur(60px); opacity: 0.1; z-index: 0; }
    .card-glow.percentage { background: var(--primary); }
    .card-glow.amount { background: #10b981; }

    .card-header { padding: 20px 24px; display: flex; justify-content: space-between; align-items: flex-start; z-index: 1; }
    .prefix-badge { display: flex; flex-direction: column; }
    .prefix-label { font-size: 0.65rem; font-weight: 800; color: var(--text-muted); letter-spacing: 0.05em; }
    .prefix-code { font-size: 1.4rem; font-weight: 900; color: var(--primary); font-family: 'Inter', sans-serif; }
    
    .status-pill { padding: 4px 12px; border-radius: 99px; font-size: 0.7rem; font-weight: 700; background: rgba(255, 255, 255, 0.05); color: var(--text-muted); border: 1px solid var(--border-soft); }
    .status-pill.active { background: rgba(16, 185, 129, 0.1); color: #10b981; border-color: rgba(16, 185, 129, 0.2); }

    .card-body { padding: 0 24px 24px; flex: 1; display: flex; flex-direction: column; z-index: 1; }
    .campaign-name { font-size: 1.1rem; font-weight: 700; color: var(--text); margin-bottom: 20px; }
    
    .promo-info { display: flex; gap: 16px; margin-bottom: 24px; }
    .discount-box { min-width: 80px; height: 80px; border-radius: 16px; display: flex; flex-direction: column; align-items: center; justify-content: center; color: white; background: var(--surface-hover); border: 1px solid var(--border-soft); box-shadow: inset 0 0 20px rgba(255,255,255,0.02); }
    .discount-box.percentage { background: linear-gradient(135deg, var(--primary), var(--primary-soft)); }
    .discount-box.amount { background: linear-gradient(135deg, #10b981, #059669); }
    .discount-box .value { font-size: 1.5rem; font-weight: 900; line-height: 1; }
    .discount-box .off { font-size: 0.7rem; font-weight: 700; margin-top: 4px; opacity: 0.8; }

    .target-info { flex: 1; display: flex; flex-direction: column; gap: 8px; justify-content: center; }
    .target-pill { font-size: 0.75rem; font-weight: 600; color: #f59e0b; background: rgba(245, 158, 11, 0.1); padding: 4px 10px; border-radius: 6px; width: fit-content; }
    .target-pill.bill { color: #6366f1; background: rgba(99, 102, 241, 0.1); }
    .date-range { display: flex; align-items: center; gap: 6px; font-size: 0.8rem; color: var(--text-muted); }

    .usage-stats { margin-top: auto; padding-top: 20px; border-top: 1px solid var(--border-soft); }
    .stats-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 8px; }
    .stats-label { font-size: 0.65rem; font-weight: 800; color: var(--text-muted); }
    .stats-value { font-size: 0.9rem; font-weight: 700; color: var(--text); }
    
    .progress-track { height: 8px; background: var(--surface-hover); border-radius: 99px; overflow: hidden; margin-bottom: 8px; border: 1px solid var(--border-soft); }
    .progress-fill { height: 100%; background: var(--primary); border-radius: 99px; transition: width 1s cubic-bezier(0.4, 0, 0.2, 1); }
    .usage-text { font-size: 0.7rem; color: var(--text-muted); font-style: italic; }

    .loading-container { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 100px 0; gap: 16px; color: var(--text-muted); }
    .spinner { width: 40px; height: 40px; border: 3px solid var(--border-soft); border-top-color: var(--primary); border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class CouponListComponent implements OnInit {
  campaigns: any[] = [];
  isLoading = true;
  isSuperAdmin = false;

  private apisSvc = inject(ApisService);
  private authSvc = inject(AuthService);

  ngOnInit() {
    this.isSuperAdmin = this.authSvc.currentUserValue?.role === 'superadmin';
    this.loadCampaigns();
  }

  async loadCampaigns() {
    this.isLoading = true;
    try {
      const res = await this.apisSvc.getCouponCampaigns();
      if (res.status === 200) {
        this.campaigns = res.msg || [];
      }
    } catch (e) {
      console.error(e);
    } finally {
      this.isLoading = false;
    }
  }
}
