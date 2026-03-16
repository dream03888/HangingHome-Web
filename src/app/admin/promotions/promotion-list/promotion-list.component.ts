import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { ApisService } from '../../services/apis.service';
import { AuthService } from '../../services/auth.service';
import { Promotion } from '../../models/admin.models';

@Component({
    selector: 'app-promotion-list',
    standalone: true,
    imports: [CommonModule, RouterModule, TranslatePipe],
    template: `
    <div class="page-container">
        <div class="page-header">
            <div class="header-content">
                <h2 class="page-title">{{ 'PROMO.TITLE' | translate }}</h2>
                <p class="page-subtitle">{{ 'PROMO.SUB' | translate }}</p>
            </div>
            <button class="btn-primary" routerLink="new" *ngIf="canManageMenus">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                {{ 'PROMO.ADD' | translate }}
            </button>
        </div>

        <div *ngIf="isLoading" class="loading-state">
            <div class="loading-spinner"></div>
            <p>Loading campaigns...</p>
        </div>

        <div *ngIf="!isLoading && promotions.length === 0" class="empty-state card">
            <div class="empty-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            </div>
            <h3>No Active Promotions</h3>
            <p>Create your first campaign to increase sales and reward loyal customers.</p>
        </div>

        <div class="promo-grid" *ngIf="!isLoading && promotions.length > 0">
            <div class="promo-card" *ngFor="let promo of promotions">
                <div class="card-header">
                    <div class="promo-code-box">
                        <span class="label">CODE</span>
                        <h3 class="promo-code">{{ promo.code }}</h3>
                    </div>
                    <div class="card-actions">
                         <button class="action-btn" [routerLink]="[promo.id, 'usage', promo.code]" [title]="'View Usage History'">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                        </button>
                        <button class="action-btn delete" (click)="deletePromo(promo.id)" *ngIf="canManageMenus" title="Delete Promotion">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                    </div>
                </div>

                <div class="card-body">
                    <div class="value-display">
                        <div class="icon-circle" [ngClass]="promo.type">
                            <svg *ngIf="promo.type === 'percentage'" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="5" x2="5" y2="19"></line><circle cx="6.5" cy="6.5" r="2.5"></circle><circle cx="17.5" cy="17.5" r="2.5"></circle></svg>
                            <svg *ngIf="promo.type === 'amount'" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                        </div>
                        <div class="value-info">
                            <span class="amount">{{ promo.value }}{{ promo.type === 'percentage' ? '%' : ' ฿' }} OFF</span>
                            <span class="target-type" [ngClass]="promo.target_type">
                                {{ promo.target_type === 'bill' ? ('PROMO.TARGET_BILL' | translate) : ('PROMO.TARGET_PRODUCT' | translate) }}
                            </span>
                        </div>
                    </div>

                    <div class="status-status">
                         <span class="live-pill" [ngClass]="getStaticLevel(promo)">
                            {{ getPromoStatus(promo) }}
                         </span>
                    </div>

                    <div class="usage-container" *ngIf="promo.usage_limit">
                        <div class="usage-label">
                            <span>USAGE</span>
                            <span>{{ promo.used_count || 0 }} / {{ promo.usage_limit }}</span>
                        </div>
                        <div class="usage-track">
                            <div class="usage-fill" [style.width.%]="(promo.used_count || 0) / promo.usage_limit * 100"></div>
                        </div>
                    </div>

                    <!-- Action Row: Toggle + Edit -->
                    <div class="card-actions-row" *ngIf="canManageMenus">
                        <button class="action-btn-wide edit-btn" [routerLink]="[promo.id, 'edit']" title="Edit Promotion">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                        Edit
                        </button>
                        <button class="action-btn-wide" [class.toggle-on]="promo.is_active" [class.toggle-off]="!promo.is_active"
                        (click)="togglePromo(promo)" [disabled]="promo.isToggling" title="Toggle Active">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="8" x2="12" y2="12"></line>
                            <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                        {{ promo.is_active ? 'Deactivate' : 'Activate' }}
                        </button>
                    </div>
                </div>

                <div class="card-footer" style="display: flex; justify-content: space-between; align-items: center;">
                    <div class="date-row">
                        <div class="date-item">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                            <span>{{ promo.start_date ? (promo.start_date | date:'dd MMM yyyy') : 'No Start' }}</span>
                        </div>
                        <div class="date-separator">→</div>
                        <div class="date-item" [class.no-expiry]="!promo.end_date">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                            <span>{{ promo.end_date ? (promo.end_date | date:'dd MMM yyyy') : ('PROMO.DATE_TBD' | translate) }}</span>
                        </div>
                    </div>
                    <a [routerLink]="[promo.id, 'usage', promo.code]" class="usage-link" style="font-size: 0.7rem; color: var(--brand-primary); font-weight: 700; text-decoration: none;">VIEW HISTORY</a>
                </div>
            </div>
        </div>
    </div>
  `,
    styles: [`
    .promo-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
        gap: 24px;
        margin-top: 16px;
    }

    .promo-card {
        background: var(--bg-panel);
        border: 1px solid var(--border-soft);
        border-radius: 16px;
        overflow: hidden;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        display: flex;
        flex-direction: column;
        box-shadow: var(--shadow-panel);

        &:hover {
            transform: translateY(-4px);
            border-color: var(--brand-primary);
            box-shadow: 0 12px 24px -10px rgba(0, 0, 0, 0.5);
        }
    }

    .card-header {
        padding: 20px;
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        background: rgba(255, 255, 255, 0.02);
        border-bottom: 1px solid var(--border-soft);
    }

    .promo-code-box {
        .label {
            display: block;
            font-size: 0.65rem;
            color: var(--text-sub);
            font-weight: 700;
            letter-spacing: 0.1em;
            margin-bottom: 4px;
        }
        .promo-code {
            font-size: 1.5rem;
            font-weight: 800;
            color: var(--brand-primary);
            margin: 0;
            letter-spacing: -0.02em;
        }
    }

    .card-actions {
        display: flex;
        gap: 8px;
    }

    .action-btn {
        width: 32px;
        height: 32px;
        border-radius: 8px;
        border: 1px solid var(--border-soft);
        background: rgba(255, 255, 255, 0.05);
        color: var(--text-sub);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;

        &:hover {
            background: var(--brand-primary);
            color: white;
            border-color: var(--brand-primary);
        }

        &.delete:hover {
            background: #ef4444;
            border-color: #ef4444;
        }
    }

    .card-actions-row {
      display: flex;
      gap: 8px;
      margin-top: 20px;
    }

    .action-btn-wide {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 9px;
      border-radius: 10px;
      font-size: 0.78rem;
      font-weight: 600;
      border: 1px solid var(--border-soft);
      cursor: pointer;
      transition: all 0.2s;
      background: rgba(255,255,255,0.04);
      color: var(--text-main);

      &:hover { border-color: var(--brand-primary); background: rgba(var(--brand-primary-rgb), 0.1); color: var(--brand-primary); }
      &:disabled { opacity: 0.4; cursor: not-allowed; }
      &.edit-btn { color: var(--brand-primary); border-color: var(--brand-soft); }
      &.toggle-on { color: #10b981; border-color: rgba(16,185,129,0.3); }
      &.toggle-off { color: #ef4444; border-color: rgba(239,68,68,0.3); }
      &.toggle-on:hover { background: rgba(16,185,129,0.1); }
      &.toggle-off:hover { background: rgba(239,68,68,0.1); }
    }

    .card-body {
        padding: 20px;
        flex: 1;
    }

    .value-display {
        display: flex;
        align-items: center;
        gap: 16px;
        margin-bottom: 20px;
    }

    .icon-circle {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;

        &.percentage {
            background: linear-gradient(135deg, #6366f1, #4f46e5);
        }
        &.amount {
            background: linear-gradient(135deg, #10b981, #059669);
        }
    }

    .amount {
        display: block;
        font-size: 1.1rem;
        font-weight: 700;
        color: var(--text-main);
    }

    .target-type {
        font-size: 0.8rem;
        color: var(--text-sub);
        padding: 2px 8px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 4px;

        &.bill {
            color: #f59e0b;
            background: rgba(245, 158, 11, 0.1);
        }
    }

    .status-status {
        margin-top: 12px;
    }

    .live-pill {
        display: inline-flex;
        align-items: center;
        padding: 4px 12px;
        border-radius: 99px;
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;

        &.level-active { background: rgba(16, 185, 129, 0.1); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.2); }
        &.level-expired { background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2); }
        &.level-upcoming { background: rgba(99, 102, 241, 0.1); color: #818cf8; border: 1px solid rgba(99, 102, 241, 0.2); }
        &.level-full { background: rgba(245, 158, 11, 0.1); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.2); }
        &.level-inactive { background: rgba(255, 255, 255, 0.05); color: var(--text-sub); border: 1px solid var(--border-soft); }
    }

    .usage-container {
        margin-top: 20px;
    }

    .usage-label {
        display: flex;
        justify-content: space-between;
        font-size: 0.65rem;
        font-weight: 700;
        color: var(--text-sub);
        margin-bottom: 6px;
        letter-spacing: 0.05em;
    }

    .usage-track {
        height: 6px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 99px;
        overflow: hidden;
    }

    .usage-fill {
        height: 100%;
        background: var(--brand-primary);
        border-radius: 99px;
        transition: width 1s ease-out;
    }

    .card-footer {
        padding: 16px 20px;
        background: rgba(0, 0, 0, 0.1);
        border-top: 1px solid var(--border-soft);
    }

    .date-row {
        display: flex;
        align-items: center;
        gap: 8px;
        color: var(--text-sub);
    }

    .date-item {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 0.75rem;
        font-weight: 500;

        &.no-expiry {
            color: var(--brand-soft);
            opacity: 0.8;
        }

        svg {
            opacity: 0.7;
        }
    }

    .date-separator {
        opacity: 0.3;
        font-size: 0.7rem;
    }

    .loading-state {
        text-align: center;
        padding: 60px;
        color: var(--text-sub);
    }

    .loading-spinner {
        width: 40px;
        height: 40px;
        border: 3px solid rgba(99, 102, 241, 0.1);
        border-top-color: var(--brand-primary);
        border-radius: 50%;
        margin: 0 auto 16px;
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        to { transform: rotate(360deg); }
    }
  `]
})
export class PromotionListComponent implements OnInit {
    storeId!: string;
    promotions: Promotion[] = [];
    isLoading = true;
    canManageMenus = false;
    isSuperAdmin = false;

    apisService = inject(ApisService);
    authService = inject(AuthService);
    route = inject(ActivatedRoute);

    ngOnInit() {
        const user = this.authService.currentUserValue;
        this.isSuperAdmin = user?.role === 'superadmin';
        this.storeId = this.isSuperAdmin ? '' : (user?.storeId || '');

        this.canManageMenus = this.authService.hasPermission('manage_menus');
        this.loadPromotions();
    }

    async loadPromotions() {
        this.isLoading = true;
        try {
            const res = await this.apisService.getPromotions(this.storeId);
            if (res.status === 200) {
                this.promotions = res.msg || [];
            }
        } catch (e) {
            console.error('Error fetching promotions', e);
        } finally {
            this.isLoading = false;
        }
    }

    async deletePromo(id: string) {
        if (confirm('Are you sure you want to delete this promotion?')) {
            try {
                await this.apisService.deletePromotion(id);
                this.loadPromotions();
            } catch (e) {
                console.error('Error deleting promotion', e);
            }
        }
    }

    async togglePromo(promo: any) {
        promo.isToggling = true;
        try {
            const res = await this.apisService.togglePromotion(promo.id);
            if (res.status === 200) {
                promo.is_active = res.data?.is_active ?? !promo.is_active;
            }
        } catch (e) {
            console.error('Error toggling promotion', e);
        } finally {
            promo.isToggling = false;
        }
    }

    getPromoStatus(promo: Promotion): string {
        if (!promo.is_active) return 'Disabled';

        const now = new Date();
        const start = promo.start_date ? new Date(promo.start_date) : null;
        const end = promo.end_date ? new Date(promo.end_date) : null;

        if (start && now < start) return 'Upcoming';
        if (end && now > end) return 'Expired';
        if (promo.usage_limit && (promo.used_count || 0) >= promo.usage_limit) return 'Full';

        return 'Active';
    }

    getStaticLevel(promo: Promotion): string {
        if (!promo.is_active) return 'level-inactive';

        const status = this.getPromoStatus(promo);
        switch (status) {
            case 'Active': return 'level-active';
            case 'Expired': return 'level-expired';
            case 'Upcoming': return 'level-upcoming';
            case 'Full': return 'level-full';
            default: return 'level-inactive';
        }
    }
}
