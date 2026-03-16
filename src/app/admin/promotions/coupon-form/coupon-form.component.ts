import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { ApisService } from '../../services/apis.service';

@Component({
  selector: 'app-coupon-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, TranslatePipe],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div class="header-content">
          <button class="btn-icon header-back" routerLink="/admin/coupons">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          </button>
          <div>
            <h2 class="page-title">{{ isEditMode ? 'Edit Campaign' : ('COUPON.ADD' | translate) }}</h2>
            <p class="page-subtitle">{{ 'COUPON.SUBTITLE' | translate }}</p>
          </div>
        </div>
      </div>

      <div class="form-container">
        <div class="form-main">
          <form [formGroup]="couponForm" (ngSubmit)="onSubmit()" class="form-card">
            <div class="form-section">
              <h3 class="section-title">{{ 'COUPON.CAMPAIGN_DETAILS' | translate }}</h3>
              
              <div class="form-group">
                <label>{{ 'COUPON.NAME' | translate }} <span class="required">*</span></label>
                <input type="text" formControlName="name" class="form-control" [placeholder]="'COUPON.NAME' | translate">
              </div>

              <div class="form-row" *ngIf="!isEditMode">
                <div class="form-group flex-1">
                  <label>{{ 'COUPON.PREFIX' | translate }} <span class="required">*</span></label>
                  <input type="text" formControlName="prefix" class="form-control" placeholder="e.g. SK2026" (input)="onPrefixInput($event)">
                  <small class="help-text">{{ 'COUPON.PREVIEW' | translate }}: <span class="code-preview">{{ couponForm.get('prefix')?.value || 'PREFIX' }}-0001</span></small>
                </div>
                <div class="form-group flex-1">
                  <label>{{ 'COUPON.COUNT' | translate }} <span class="required">*</span></label>
                  <input type="number" formControlName="count" class="form-control" min="1" max="5000">
                </div>
              </div>

              <div class="form-row" *ngIf="isEditMode">
                <div class="form-group flex-1">
                  <label>Batch Prefix</label>
                  <input type="text" class="form-control" [value]="editingCampaign?.prefix || ''" disabled style="opacity: 0.5;">
                  <small class="help-text">Prefix cannot be changed after creation.</small>
                </div>
                <!-- Inline Add More Coupons Section -->
                <div class="form-group flex-1" style="background: rgba(var(--primary-rgb), 0.05); padding: 16px; border-radius: 12px; border: 1px dashed var(--primary-soft); margin-bottom: 0;">
                  <label style="color: var(--primary);">Generate More Coupons</label>
                  <div style="display: flex; gap: 8px;">
                    <input type="number" #addMoreInput class="form-control" min="1" max="1000" placeholder="Qty" style="background: var(--surface);">
                    <button type="button" class="btn-primary" (click)="addMoreCoupons(addMoreInput.value, addMoreInput)" [disabled]="isGeneratingMore" style="padding: 0 16px; min-width: 100px;">
                       <span *ngIf="!isGeneratingMore">Add</span>
                       <div class="spinner" *ngIf="isGeneratingMore" style="width: 14px; height: 14px; border: 2px solid white; border-top-color: transparent; border-radius: 50%; animation: spin 0.8s linear infinite;"></div>
                    </button>
                  </div>
                  <small class="help-text">Instantly adds to this campaign.</small>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group flex-1">
                  <label>{{ 'PROMO.TYPE' | translate }}</label>
                  <select formControlName="discount_type" class="form-control">
                    <option value="percentage">Percentage (%)</option>
                    <option value="amount">Fixed Amount (฿)</option>
                  </select>
                </div>
                <div class="form-group flex-1">
                  <label>{{ 'PROMO.VALUE' | translate }}</label>
                  <div class="input-with-icon">
                    <span class="currency-icon">{{ couponForm.get('discount_type')?.value === 'percentage' ? '%' : '฿' }}</span>
                    <input type="number" formControlName="discount_value" class="form-control pl-8">
                  </div>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group flex-1">
                  <label>{{ 'PROMO.START_DATE' | translate }}</label>
                  <input type="date" formControlName="start_date" class="form-control">
                </div>
                <div class="form-group flex-1">
                  <label>{{ 'PROMO.END_DATE' | translate }}</label>
                  <input type="date" formControlName="end_date" class="form-control">
                </div>
              </div>
            </div>

            <hr class="divider">

            <div class="form-section">
              <h3 class="section-title">{{ 'COUPON.RULES_TARGETING' | translate }}</h3>
              
              <div class="toggle-wrapper">
                <label class="toggle-switch">
                   <input type="checkbox" formControlName="is_all_bill">
                   <span class="slider"></span>
                </label>
                <div class="toggle-info">
                  <span class="toggle-label">{{ 'COUPON.IS_ALL_BILL' | translate }}</span>
                  <p class="help-text" *ngIf="couponForm.get('is_all_bill')?.value">{{ 'PROMO.BILL_HINT' | translate }}</p>
                  <p class="help-text" *ngIf="!couponForm.get('is_all_bill')?.value">{{ 'PROMO.PRODUCT_HINT' | translate }}</p>
                </div>
              </div>

              <!-- Stores Multi-select -->
              <div class="form-group mt-4">
                <label>{{ 'COUPON.SELECT_STORES' | translate }}</label>
                <div class="store-grid">
                  <label *ngFor="let s of stores" class="checkbox-container">
                    <input type="checkbox" [checked]="isStoreSelected(s.id)" (change)="toggleStore(s.id)">
                    <span class="checkmark"></span>
                    <span class="label-text">{{ s.name }}</span>
                  </label>
                </div>
              </div>

              <!-- Products Selection (Shown only if not all-bill) -->
              <div class="form-group mt-4" *ngIf="!couponForm.get('is_all_bill')?.value">
                <label>{{ 'COUPON.SELECT_PRODUCTS' | translate }}</label>
                <div class="product-selector-box">
                   <!-- Selected Tags Above -->
                   <div class="selected-items" *ngIf="selectedProducts.length > 0">
                      <div *ngFor="let p of selectedProducts; let i = index" class="selected-tag">
                         {{ p.name }}
                         <button type="button" class="remove-tag" (click)="removeProduct(i)">✕</button>
                      </div>
                   </div>

                   <div class="search-bar">
                      <input type="text" [placeholder]="'COUPON.SEARCH_HINT' | translate" class="form-control" (input)="searchProducts($event)" (focus)="onSearchFocus()">
                   </div>

                   <!-- Results Dropdown (Absolute) -->
                   <div class="search-results" *ngIf="filteredMasterProducts.length > 0">
                      <div *ngFor="let p of filteredMasterProducts" class="search-item" (click)="addProduct(p)">
                         <span class="p-name">{{ p.name }}</span>
                         <span class="p-price">{{ p.price }}฿</span>
                      </div>
                   </div>

                   <div *ngIf="selectedProducts.length === 0" class="text-center text-muted p-3 empty-hint">
                      {{ 'COUPON.NO_PRODUCTS' | translate }}
                   </div>
                </div>
              </div>
            </div>

            <div class="form-actions">
              <button type="button" class="btn-secondary" routerLink="/admin/coupons">{{ 'COMMON.CANCEL' | translate }}</button>
              <button type="submit" class="btn-primary" [disabled]="isLoading || couponForm.invalid">
                <div class="spinner" *ngIf="isLoading" style="width: 16px; height: 16px; border: 2px solid white; border-top-color: transparent; border-radius: 50%; animation: spin 0.8s linear infinite;"></div>
                {{ isLoading ? ('COUPON.GENERATING' | translate) : (isEditMode ? 'Save Changes' : ('COUPON.GENERATE' | translate)) }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container { padding: 0; }
    .form-container { display: flex; justify-content: center; padding: 0 24px 40px; }
    .form-main { width: 100%; max-width: 800px; }
    .form-card { background: var(--surface); border: 1px solid var(--border-soft); border-radius: 20px; padding: 32px; box-shadow: var(--shadow-sm); }
    .form-section { margin-bottom: 32px; }
    .section-title { font-size: 1.1rem; font-weight: 700; color: var(--primary); margin-bottom: 24px; border-left: 4px solid var(--primary); padding-left: 12px; }
    
    .form-row { display: flex; gap: 20px; margin-bottom: 0; }
    .form-group { display: flex; flex-direction: column; margin-bottom: 20px; }
    .flex-1 { flex: 1; }
    
    label { font-size: 0.85rem; font-weight: 600; margin-bottom: 8px; color: var(--text-sub); display: flex; align-items: center; }
    .required { color: #ef4444; margin-left: 4px; }
    
    .form-control { background: var(--surface-hover); border: 1px solid var(--border-soft); border-radius: 12px; padding: 12px 16px; color: var(--text); font-size: 0.95rem; transition: all 0.2s; width: 100%; }
    .form-control:focus { border-color: var(--primary); outline: none; background: var(--surface-active); box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1); }
    
    .input-with-icon { position: relative; width: 100%; }
    .currency-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--text-muted); font-weight: 600; z-index: 2; }
    .pl-8 { padding-left: 36px; }
    
    .help-text { font-size: 0.75rem; color: var(--text-muted); margin-top: 6px; }
    .code-preview { color: var(--primary); font-weight: 700; font-family: monospace; font-size: 0.9rem; }
    
    .divider { border: none; border-top: 1px solid var(--border-soft); margin: 32px 0; }
    
    .toggle-wrapper { display: flex; align-items: flex-start; gap: 16px; margin-bottom: 32px; min-height: 46px; }
    .toggle-info { display: flex; flex-direction: column; justify-content: center; }
    .toggle-label { font-size: 1rem; font-weight: 600; color: var(--text-main); margin-bottom: 4px; }
    
    .toggle-switch { position: relative; display: inline-block; width: 50px; height: 28px; flex-shrink: 0; }
    .toggle-switch input { opacity: 0; width: 0; height: 0; }
    .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(255, 255, 255, 0.15); transition: .4s; border-radius: 9999px; }
    .slider:before { position: absolute; content: ""; height: 22px; width: 22px; left: 3px; bottom: 3px; background-color: white; transition: .4s; border-radius: 50%; box-shadow: 0 2px 4px rgba(0,0,0,0.2); }
    input:checked + .slider { background-color: var(--brand-primary); }
    input:checked + .slider:before { transform: translateX(22px); }

    .store-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; background: var(--surface-hover); padding: 16px; border-radius: 12px; border: 1px solid var(--border-soft); }
    
    .checkbox-container { display: flex; align-items: center; position: relative; padding-left: 32px; cursor: pointer; font-size: 0.9rem; color: var(--text); transition: all 0.2s; margin-bottom: 0; }
    .checkbox-container:hover { color: var(--primary); }
    .checkbox-container input { position: absolute; opacity: 0; cursor: pointer; height: 0; width: 0; }
    .checkmark { position: absolute; top: 50%; left: 0; transform: translateY(-50%); height: 22px; width: 22px; background-color: var(--surface); border: 2px solid var(--border-soft); border-radius: 6px; transition: all 0.2s; }
    .checkbox-container:hover input ~ .checkmark { background-color: var(--surface-active); border-color: var(--text-muted); }
    .checkbox-container input:checked ~ .checkmark { background-color: var(--primary); border-color: var(--primary); }
    .checkmark:after { content: ""; position: absolute; display: none; left: 7px; top: 3px; width: 5px; height: 10px; border: solid white; border-width: 0 2px 2px 0; transform: rotate(45deg); }
    .checkbox-container input:checked ~ .checkmark:after { display: block; }
    
    .product-selector-box { background: var(--surface-hover); border: 1px solid var(--border-soft); border-radius: 12px; padding: 16px; position: relative; }
    .selected-items { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; }
    .selected-tag { background: rgba(99, 102, 241, 0.25); color: var(--primary); padding: 6px 14px; border-radius: 99px; font-size: 0.85rem; font-weight: 700; display: flex; align-items: center; gap: 8px; border: 1px solid var(--primary-soft); box-shadow: 0 2px 6px rgba(0,0,0,0.1); }
    
    .search-results { position: absolute; top: calc(100% - 10px); left: 16px; right: 16px; background: #1c1d26; border: 1px solid var(--primary); border-radius: 12px; z-index: 1000; box-shadow: 0 10px 30px rgba(0,0,0,0.5); max-height: 250px; overflow-y: auto; }
    .search-item { padding: 14px 18px; display: flex; justify-content: space-between; cursor: pointer; transition: all 0.2s; border-bottom: 1px solid rgba(255,255,255,0.05); }
    .search-item:last-child { border-bottom: none; }
    .search-item:hover { background: var(--primary); color: white; }
    .p-name { font-weight: 600; }
    .search-item .p-price { font-weight: 800; color: var(--primary); }
    .search-item:hover .p-price { color: white; }
    
    .remove-tag { background: none; border: none; color: inherit; padding: 0; font-size: 1.1rem; cursor: pointer; opacity: 0.6; transition: opacity 0.2s; display: flex; align-items: center; line-height: 1; }
    .remove-tag:hover { opacity: 1; }
    
    .empty-hint { background: rgba(255,255,255,0.03); border-radius: 8px; border: 1px dashed var(--border-soft); margin-top: 8px; }
    
    .form-actions { display: flex; justify-content: flex-end; gap: 16px; margin-top: 40px; padding-top: 24px; border-top: 1px solid var(--border-soft); }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class CouponFormComponent implements OnInit {
  couponForm!: FormGroup;
  isLoading = false;
  isEditMode = false;
  isGeneratingMore = false;
  editingCampaign: any = null;
  stores: any[] = [];
  selectedStoreIds: string[] = [];

  masterProducts: any[] = [];
  filteredMasterProducts: any[] = [];
  selectedProducts: any[] = [];

  private fb = inject(FormBuilder);
  private apisSvc = inject(ApisService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  ngOnInit() {
    this.initForm();
    const campaignId = this.route.snapshot.paramMap.get('id');
    if (campaignId) {
      this.isEditMode = true;
      this.loadInitialData(campaignId);
    } else {
      this.loadInitialData();
    }
  }

  initForm() {
    this.couponForm = this.fb.group({
      name: ['', Validators.required],
      prefix: ['', [Validators.required, Validators.maxLength(10)]],
      count: [100, [Validators.required, Validators.min(1), Validators.max(5000)]],
      discount_type: ['percentage', Validators.required],
      discount_value: [0, [Validators.required, Validators.min(0)]],
      start_date: [''],
      end_date: [''],
      is_all_bill: [true]
    });
  }

  async loadInitialData(campaignId?: string) {
    try {
      const storesRes = await this.apisSvc.GetStore();
      if (storesRes.status === 200) this.stores = storesRes.msg;

      const productsRes = await this.apisSvc.getProduct('');
      if (productsRes.status === 200) {
        this.masterProducts = productsRes.msg;
      }

      if (campaignId) {
        const camRes = await this.apisSvc.getCouponCampaignById(campaignId);
        if (camRes.status === 200) {
          const cam = camRes.msg;
          this.editingCampaign = cam;
          this.couponForm.patchValue({
            name: cam.name,
            discount_type: cam.discount_type,
            discount_value: cam.discount_value,
            start_date: cam.start_date ? cam.start_date.substring(0, 10) : '',
            end_date: cam.end_date ? cam.end_date.substring(0, 10) : '',
            is_all_bill: cam.is_all_bill
          });
          this.selectedStoreIds = cam.store_ids || [];
          // Map product IDs back to product objects
          if (cam.product_ids && cam.product_ids.length > 0) {
            this.selectedProducts = this.masterProducts.filter(p =>
              cam.product_ids.includes(p.product_id)
            );
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
  }

  onPrefixInput(event: any) {
    let val = event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    this.couponForm.get('prefix')?.setValue(val, { emitEvent: false });
  }

  // --- Store Selection ---
  isStoreSelected(id: string) { return this.selectedStoreIds.includes(id); }
  toggleStore(id: string) {
    if (this.isStoreSelected(id)) {
      this.selectedStoreIds = this.selectedStoreIds.filter(s => s !== id);
    } else {
      this.selectedStoreIds.push(id);
    }
  }

  // --- Product Selection ---
  onSearchFocus() {
    // Show first 10 items if just focused and empty
    if (this.filteredMasterProducts.length === 0) {
      this.filteredMasterProducts = this.masterProducts.slice(0, 10);
    }
  }

  searchProducts(event: any) {
    const q = event.target.value.toLowerCase();
    if (!q) {
      this.filteredMasterProducts = this.masterProducts.slice(0, 10);
      return;
    }
    this.filteredMasterProducts = this.masterProducts
      .filter(p => p.name.toLowerCase().includes(q))
      .slice(0, 10);
  }

  addProduct(p: any) {
    if (!this.selectedProducts.find(x => x.product_id === p.product_id)) {
      this.selectedProducts.push(p);
    }
    this.filteredMasterProducts = [];
  }

  removeProduct(index: number) {
    this.selectedProducts.splice(index, 1);
  }

  async onSubmit() {
    if (this.couponForm.invalid) return;

    this.isLoading = true;
    const data = {
      ...this.couponForm.value,
      store_ids: this.selectedStoreIds,
      product_ids: this.selectedProducts.map(p => p.product_id)
    };

    try {
      let res;
      if (this.isEditMode && this.editingCampaign) {
        res = await this.apisSvc.updateCouponCampaign({ ...data, id: this.editingCampaign.id });
      } else {
        res = await this.apisSvc.createCouponCampaign(data);
      }

      if (res.status === 200) {
        this.router.navigate(['/admin/coupons']);
      } else {
        alert('Error: ' + res.msg);
      }
    } catch (e) {
      console.error(e);
      alert('Failed to save campaign');
    } finally {
      this.isLoading = false;
    }
  }

  async addMoreCoupons(val: string, inputElement: HTMLInputElement) {
    const amount = parseInt(val, 10);
    if (!amount || amount < 1 || amount > 5000) {
        alert('Please enter a valid amount between 1 and 5000');
        return;
    }

    if (!this.editingCampaign?.id) return;

    this.isGeneratingMore = true;
    try {
        const res = await this.apisSvc.appendCoupons(this.editingCampaign.id, amount);
        if (res.status === 200) {
            alert(`Successfully added ${amount} more coupons to this campaign.`);
            inputElement.value = ''; // clear input
        } else {
            alert('Error generating more coupons: ' + res.msg);
        }
    } catch (e) {
        console.error(e);
        alert('Failed to generate more coupons.');
    } finally {
        this.isGeneratingMore = false;
    }
  }
}
