import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { ApisService } from '../../services/apis.service';
import { Promotion } from '../../models/admin.models';

@Component({
    selector: 'app-promotion-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
    template: `
    <div class="page-container">
        <div class="page-header">
            <div class="header-content">
                <button class="btn-icon header-back" (click)="goBack()" [title]="'COMMON.BACK' | translate">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="19" y1="12" x2="5" y2="12"></line>
                        <polyline points="12 19 5 12 12 5"></polyline>
                    </svg>
                </button>
                <div>
                    <h2 class="page-title">{{ isEditMode ? 'Edit Promotion' : 'Create Promotion' }}</h2>
                </div>
            </div>
        </div>

        <div class="form-container">
            <div class="form-main" style="flex: 1; max-width: 900px; margin: 0 auto;">
                <form [formGroup]="promoForm" (ngSubmit)="onSubmit()" class="form-card">
                    
                    <div class="form-row">
                        <div class="form-group flex-1">
                            <label for="code">{{ 'PROMO.CODE' | translate }} <span class="required">*</span></label>
                            <input type="text" id="code" formControlName="code" class="form-control" placeholder="e.g. SUMMER20" style="text-transform: uppercase;">
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group flex-1">
                            <label for="type">{{ 'PROMO.TYPE' | translate }} <span class="required">*</span></label>
                            <select id="type" formControlName="type" class="form-control">
                                <option value="percentage">{{ 'MENU.PERCENT' | translate }} (%)</option>
                                <option value="amount">{{ 'MENU.AMOUNT' | translate }} (THB)</option>
                            </select>
                        </div>
                        <div class="form-group flex-1">
                            <label for="value">{{ 'PROMO.VALUE' | translate }} <span class="required">*</span></label>
                            <input type="number" id="value" formControlName="value" class="form-control" placeholder="0" min="1">
                        </div>
                    </div>

                    <div class="form-row mt-4">
                        <div class="form-group flex-1">
                            <label>{{ 'PROMO.APPLY_TO' | translate }} <span class="required">*</span></label>
                            <div class="radio-group" style="display: flex; gap: 20px; margin-top: 8px;">
                                <label class="radio-container">
                                    <input type="radio" formControlName="targetType" value="product">
                                    <span class="radio-mark"></span>
                                    {{ 'PROMO.TARGET_PRODUCT' | translate }} <span class="text-muted">{{ 'PROMO.PRODUCT_HINT' | translate }}</span>
                                </label>
                                <label class="radio-container">
                                    <input type="radio" formControlName="targetType" value="bill">
                                    <span class="radio-mark"></span>
                                    {{ 'PROMO.TARGET_BILL' | translate }} <span class="text-muted">{{ 'PROMO.BILL_HINT' | translate }}</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <!-- Product Selection Section -->
                    <div class="form-group mt-4" *ngIf="promoForm.get('targetType')?.value === 'product'">
                        <label>Select Participating Products <span class="required">*</span></label>
                        <div class="product-selection-grid mt-2">
                            <div *ngFor="let group of storeProducts" class="store-group mb-4">
                                <div class="store-header">
                                    <h4 class="store-name">{{ group.storeName }}</h4>
                                    <button type="button" class="btn-text-sm" (click)="toggleAllInStore(group)">Select All</button>
                                </div>
                                <div class="products-list">
                                    <label *ngFor="let product of group.products" class="product-item">
                                        <input type="checkbox" [checked]="isSelected(product.product_id)" (change)="toggleProduct(product.product_id)">
                                        <span class="product-label">
                                            <span class="p-id text-muted">#{{ product.product_id.slice(0, 4) }}</span>
                                            <span class="p-name">{{ product.name }}</span>
                                        </span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="form-row mt-4">
                        <div class="form-group flex-1">
                            <label for="startDate">{{ 'PROMO.START_DATE' | translate }} <span class="text-muted">{{ 'PROMO.OPTIONAL' | translate }}</span></label>
                            <input type="datetime-local" id="startDate" formControlName="startDate" class="form-control">
                        </div>
                        <div class="form-group flex-1">
                            <label for="endDate">{{ 'PROMO.END_DATE' | translate }} <span class="text-muted">{{ 'PROMO.OPTIONAL' | translate }}</span></label>
                            <input type="datetime-local" id="endDate" formControlName="endDate" class="form-control">
                        </div>
                    </div>

                    <div class="form-row mt-4">
                        <div class="form-group flex-1">
                            <label for="usageLimit">Usage Limit <span class="text-muted">(Optional, leave empty for unlimited)</span></label>
                            <input type="number" id="usageLimit" formControlName="usageLimit" class="form-control" placeholder="Unlimited" min="1">
                        </div>
                    </div>

                    <div class="form-group mt-4">
                        <label>{{ 'MENU.AVAILABILITY' | translate }}</label>
                        <div class="toggle-wrapper" style="margin-top: 8px;">
                            <label class="toggle-switch">
                                <input type="checkbox" formControlName="isActive">
                                <span class="slider"></span>
                            </label>
                            <span class="toggle-label" style="margin-left: 12px;">{{ promoForm.get('isActive')?.value ? 'Active' : 'Inactive' }}</span>
                        </div>
                    </div>

                    <div class="form-actions mt-6">
                        <button type="button" class="btn-secondary" (click)="goBack()">{{ 'COMMON.CANCEL' | translate }}</button>
                        <button type="submit" class="btn-primary" [disabled]="promoForm.invalid || isSaving || (promoForm.get('targetType')?.value === 'product' && selectedProductIds.size === 0)">
                            {{ isEditMode ? ('COMMON.SAVE' | translate) : ('COMMON.CREATE' | translate) }}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
  `,
    styles: [`
        .product-selection-grid {
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid var(--border-soft);
            border-radius: 12px;
            padding: 16px;
            max-height: 400px;
            overflow-y: auto;
        }
        .store-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-bottom: 8px;
            border-bottom: 1px solid var(--border-soft);
            margin-bottom: 12px;
        }
        .store-name {
            font-size: 0.9rem;
            font-weight: 700;
            color: var(--brand-primary);
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        .products-list {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 12px;
        }
        .product-item {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 8px 12px;
            background: rgba(255, 255, 255, 0.02);
            border: 1px solid var(--border-soft);
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s;
        }
        .product-item:hover {
            background: rgba(255, 255, 255, 0.05);
            border-color: rgba(255, 255, 255, 0.1);
        }
        .product-label {
            display: flex;
            flex-direction: column;
            line-height: 1.2;
        }
        .p-id { font-size: 0.7rem; }
        .p-name { font-size: 0.85rem; font-weight: 500; }
        .btn-text-sm {
            background: none;
            border: none;
            color: var(--brand-primary);
            font-size: 0.75rem;
            font-weight: 600;
            cursor: pointer;
        }
    `]
})
export class PromotionFormComponent implements OnInit {
    promoId: string | null = null;
    isEditMode = false;
    promoForm: FormGroup;
    isSaving = false;

    storeProducts: { storeId: string, storeName: string, products: any[] }[] = [];
    selectedProductIds = new Set<string>();

    apisService = inject(ApisService);
    fb = inject(FormBuilder);
    route = inject(ActivatedRoute);
    router = inject(Router);
    location = inject(Location);

    constructor() {
        this.promoForm = this.fb.group({
            code: ['', [Validators.required, Validators.minLength(3)]],
            type: ['percentage', Validators.required],
            value: [0, [Validators.required, Validators.min(1)]],
            targetType: ['product', Validators.required],
            isActive: [true],
            startDate: [''],
            endDate: [''],
            usageLimit: [null, [Validators.min(1)]]
        });

        this.route.paramMap.subscribe(params => {
            this.promoId = params.get('id');
            if (this.promoId) {
                this.isEditMode = true;
            }
        });
    }

    async ngOnInit() {
        await this.loadAllProducts();
        if (this.isEditMode) {
            await this.loadPromotionDetails();
        }
    }

    async loadAllProducts() {
        try {
            const storeRes = await this.apisService.GetStore();
            if (storeRes.status === 200) {
                const stores = (storeRes.msg || []).filter((s: any) => s.id !== '00000000-0000-0000-0000-000000000000');
                const groups = [];
                for (const store of stores) {
                    const prodRes = await this.apisService.getProduct(store.id);
                    if (prodRes.status === 200) {
                        groups.push({
                            storeId: store.id,
                            storeName: store.name,
                            products: prodRes.msg || []
                        });
                    }
                }
                this.storeProducts = groups;
            }
        } catch (e) {
            console.error('Error loading products', e);
        }
    }

    async loadPromotionDetails() {
        try {
            const res = await this.apisService.getPromotions('');
            if (res.status === 200) {
                const promotions: Promotion[] = res.msg || [];
                const promo = promotions.find(p => p.id === this.promoId);
                if (promo) {
                    this.promoForm.patchValue({
                        code: promo.code,
                        type: promo.type,
                        value: promo.value,
                        targetType: promo.target_type || 'product',
                        isActive: promo.is_active,
                        startDate: promo.start_date ? new Date(new Date(promo.start_date).getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().slice(0, 16) : '',
                        endDate: promo.end_date ? new Date(new Date(promo.end_date).getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().slice(0, 16) : '',
                        usageLimit: promo.usage_limit
                    });

                    // Set initial product selections
                    this.selectedProductIds.clear();
                    this.storeProducts.forEach(group => {
                        group.products.forEach(p => {
                            if (p.promotion_id === this.promoId) {
                                this.selectedProductIds.add(p.product_id);
                            }
                        });
                    });
                }
            }
        } catch (e) {
            console.error('Error loading promotion details', e);
        }
    }

    toggleProduct(productId: string) {
        if (this.selectedProductIds.has(productId)) {
            this.selectedProductIds.delete(productId);
        } else {
            this.selectedProductIds.add(productId);
        }
    }

    isSelected(productId: string): boolean {
        return this.selectedProductIds.has(productId);
    }

    toggleAllInStore(group: any) {
        const allSelected = group.products.every((p: any) => this.isSelected(p.product_id));
        if (allSelected) {
            group.products.forEach((p: any) => this.selectedProductIds.delete(p.product_id));
        } else {
            group.products.forEach((p: any) => this.selectedProductIds.add(p.product_id));
        }
    }

    goBack() {
        this.location.back();
    }

    async onSubmit() {
        if (this.promoForm.invalid) return;
        if (this.promoForm.get('targetType')?.value === 'product' && this.selectedProductIds.size === 0) return;

        if (this.isSaving) return;
        this.isSaving = true;

        const formData = this.promoForm.value;
        const payload = {
            code: formData.code.toUpperCase(),
            type: formData.type,
            value: formData.value,
            target_type: formData.targetType,
            product_ids: formData.targetType === 'product' ? Array.from(this.selectedProductIds) : [],
            is_active: formData.isActive,
            start_date: formData.startDate ? new Date(formData.startDate).toISOString() : null,
            end_date: formData.endDate ? new Date(formData.endDate).toISOString() : null,
            usage_limit: formData.usageLimit || null
        };

        try {
            if (this.isEditMode && this.promoId) {
                await this.apisService.updatePromotion({ ...payload, id: this.promoId });
            } else {
                await this.apisService.createPromotion(payload);
            }
            this.goBack();
        } catch (error) {
            console.error('Failed to save promotion:', error);
        } finally {
            this.isSaving = false;
        }
    }
}
