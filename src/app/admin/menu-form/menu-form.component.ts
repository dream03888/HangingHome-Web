import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AdminDataService } from '../services/admin-data.service';
import { AuthService } from '../services/auth.service';
import { ApisService } from '../services/apis.service';
import { Menu, MenuOption, MenuOptionChoice, Store, Promotion } from '../models/admin.models';
import { TranslatePipe } from '../pipes/translate.pipe';

@Component({
  selector: 'app-menu-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, TranslatePipe],
  templateUrl: './menu-form.component.html',
  styleUrl: './menu-form.component.scss'
})
export class MenuFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private adminData = inject(AdminDataService);
  private location = inject(Location);
  public authService = inject(AuthService);
  private apisService = inject(ApisService);

  menuForm!: FormGroup;
  isEditMode = false;
  storeId!: string;
  store: Store | undefined;
  menuId: string | null = null;
  imagePreview: string | null = null;
  selectedFile: File | null = null;

  // Master Addon Groups State
  showMasterGroupModal = false;
  isLoadingMasterGroups = false;
  masterGroups: any[] = [];
  selectedMasterGroupIds: Set<string> = new Set();
  promotions: Promotion[] = [];

  // Master Catalog 'Publish To Stores' State
  isMasterCatalog = false;
  targetStores: Store[] = [];
  selectedPublishStoreIds: Set<string> = new Set();
  isMasterLinked = false;

  ngOnInit() {
    this.menuForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      nameEn: [''],
      price: [0, [Validators.required, Validators.min(0)]],
      isActive: [true],
      imageUrl: [''],
      hasDiscount: [false],
      discountType: ['percentage'],
      discountValue: [0],
      promotionId: [''],
      options: this.fb.array([])
    });

    this.route.paramMap.subscribe(async params => {
      this.storeId = params.get('storeId')!;
      this.menuId = params.get('menuId');
      this.isMasterCatalog = this.storeId === '00000000-0000-0000-0000-000000000000';

      await this.loadStore(this.storeId);
      await this.loadPromotions();

      if (this.menuId) {
        this.isEditMode = true;
        // Wait for products to load and find the specific menu item
        await this.loadProductsAndPatch(this.storeId, this.menuId);
      }

      this.enforceCentralization();
    });

    // Listen to image URL changes
    this.menuForm.get('imageUrl')?.valueChanges.subscribe(val => {
      this.imagePreview = val || null;
    });

    const canManageMenus = this.authService.hasPermission('manage_menus');
    const canToggleMenu = this.authService.hasPermission('toggle_menu');

    if (!canManageMenus) {
      this.menuForm.disable();
      if (canToggleMenu && this.isEditMode) {
        // Allow them to toggle status if they have permission, but not create new
        this.menuForm.get('isActive')?.enable();
      }
    }
  }

  async loadStore(id: string) {
    try {
      const res = await this.apisService.GetStore();
      if (res.status === 200) {
        const stores: Store[] = res.msg || [];
        this.store = stores.find(s => s.id === id);

        if (this.isMasterCatalog) {
          // Exclude the master store from the publish targets
          this.targetStores = stores.filter(s => s.id !== '00000000-0000-0000-0000-000000000000');
        }
      }
    } catch (error) {
      console.error('Failed to load store for menu form', error);
    }
  }

  async loadProductsAndPatch(storeId: string, menuId: string) {
    try {
      const res = await this.apisService.getProduct(storeId);
      if (res.status === 200) {
        const products: Menu[] = res.msg || [];
        const menu = products.find(p => p.product_id === menuId);
        if (menu) {
          this.menuForm.patchValue({
            name: menu.name,
            nameEn: menu.name_eng || '',
            price: menu.price,
            product_active: menu.product_active,
            imageUrl: menu.image_url || '',
            hasDiscount: !!menu.discount_type && (menu.discount_value ?? 0) > 0,
            discountType: menu.discount_type || 'percentage',
            discountValue: menu.discount_value || 0,
            promotionId: menu.promotion_id || ''
          });
          this.imagePreview = menu.image_url || null;
          this.isMasterLinked = !!menu.master_product_id;

          if (menu.items && menu.items.length > 0) {
            menu.items.forEach((opt: any) => {
              const optionGroup = this.createOptionGroup();
              optionGroup.patchValue({
                name: opt.group_name,
                nameEn: opt.group_name_eng || '',
                isRequired: opt.isRequired || false,
                isMultiple: opt.isMultiple || false,
                minChoices: opt.minChoices || 0,
                maxChoices: opt.maxChoices || 0
              });
              // Add choices
              if (opt.choices) {
                opt.choices.forEach((choice: any) => {
                  const choiceGroup = this.createChoiceGroup();
                  choiceGroup.patchValue({ name: choice.options_name, nameEn: choice.options_name_eng || '', price: choice.options_price });
                  (optionGroup.get('choices') as FormArray).push(choiceGroup);
                });
              }
              this.options.push(optionGroup);
            });

            if (this.isMasterLinked) {
              // Allow users to still edit the prices locally, but lock everything else
              this.lockMasterOptionsExceptPrice();
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to load products for editing', error);
    }
  }

  // --- Form Array Helpers for Options ---

  get options() {
    return this.menuForm.get('options') as FormArray;
  }

  createOptionGroup(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      nameEn: [''],
      isRequired: [false],
      isMultiple: [false],
      minChoices: [0, Validators.min(0)],
      maxChoices: [0, Validators.min(0)],
      choices: this.fb.array([])
    });
  }

  addOption() {
    this.options.push(this.createOptionGroup());
    // Auto add one empty choice
    this.addChoice(this.options.length - 1);
  }

  removeOption(index: number) {
    this.options.removeAt(index);
  }

  getChoices(optionIndex: number) {
    return this.options.at(optionIndex).get('choices') as FormArray;
  }

  createChoiceGroup(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      nameEn: [''],
      price: [0, [Validators.required, Validators.min(0)]]
    });
  }

  addChoice(optionIndex: number) {
    this.getChoices(optionIndex).push(this.createChoiceGroup());
  }

  removeChoice(optionIndex: number, choiceIndex: number) {
    this.getChoices(optionIndex).removeAt(choiceIndex);
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  async onSubmit() {
    if (this.menuForm.invalid) {
      this.menuForm.markAllAsTouched();
      return;
    }

    if (this.isEditMode) {
      await this.updateMenu();
    } else {
      await this.createMenu();
    }
  }

  private async prepareMenuPayload(): Promise<Menu | null> {
    const formValue = this.menuForm.getRawValue(); // Crucial: get disabled fields too

    if (this.selectedFile) {
      try {
        const uploadedUrl = await this.apisService.uploadImage(this.selectedFile);
        formValue.imageUrl = uploadedUrl;
      } catch (error) {
        console.error('Failed to upload image', error);
        return null;
      }
    }

    let discount_type = null;
    let discount_value = 0;
    if (formValue.hasDiscount && formValue.discountValue > 0) {
      discount_type = formValue.discountType;
      discount_value = formValue.discountValue;
    }

    const dbItems: MenuOption[] = formValue.options.map((opt: any) => ({
      group_name: opt.name,
      group_name_eng: opt.nameEn,
      isRequired: opt.isRequired,
      isMultiple: opt.isMultiple,
      minChoices: opt.minChoices,
      maxChoices: opt.maxChoices,
      choices: opt.choices.map((c: any) => ({
        options_name: c.name,
        options_name_eng: c.nameEn,
        options_price: c.price,
        options_active: true
      }))
    }));

    return {
      product_id: this.isEditMode && this.menuId ? this.menuId : Math.random().toString(36).substring(2, 9),
      storeId: this.storeId,
      name: formValue.name,
      name_eng: formValue.nameEn,
      price: formValue.price,
      product_active: formValue.isActive,
      image_url: formValue.imageUrl,
      discount_type: discount_type,
      discount_value: discount_value,
      promotion_id: formValue.promotionId || null,
      items: dbItems
    };
  }

  async loadPromotions() {
    try {
      const res = await this.apisService.getPromotions('');
      if (res.status === 200) {
        let promoList: Promotion[] = res.msg || [];
        if (this.isMasterCatalog) {
          promoList = promoList.filter(p => p.target_type === 'product');
        }
        this.promotions = promoList;
      }
    } catch (e) {
      console.error('Error fetching global promotions', e);
    }
  }

  async createMenu() {
    const menu = await this.prepareMenuPayload();
    if (!menu) return;

    const res = await this.apisService.createProduct(menu);
    console.log('Create Response:', res);

    // Check if we need to publish to other stores
    if (res.status === 200 && this.isMasterCatalog && this.selectedPublishStoreIds.size > 0 && res.data?.id) {
      await this.publishToSelectedStores(res.data.id);
    }

    if (res.status == 200) {
      this.router.navigate(['/admin/stores', this.storeId, 'menus']);
    }
  }

  async updateMenu() {
    const menu = await this.prepareMenuPayload();
    if (!menu) return;

    // Use updateProduct for edit mode
    const res = await this.apisService.updateProduct(menu);
    console.log('Update Response:', res);

    if (res.status === 200 && this.isMasterCatalog && this.selectedPublishStoreIds.size > 0 && res.data?.id) {
      await this.publishToSelectedStores(res.data.id);
    }

    if (res.status == 200) {
      this.router.navigate(['/admin/stores', this.storeId, 'menus']);
    }
  }

  async publishToSelectedStores(productId: string) {
    if (this.selectedPublishStoreIds.size === 0) return;

    // We clone sequentially to avoid overwhelming the server
    for (const targetId of this.selectedPublishStoreIds) {
      try {
        await this.apisService.cloneProductFromMaster({
          master_product_ids: [productId],
          target_store_id: targetId
        });
        console.log(`Successfully published product ${productId} to store ${targetId}`);
      } catch (err) {
        console.error(`Failed to publish to store ${targetId}`, err);
      }
    }
  }

  goBack() {
    this.location.back();
  }

  // --- Master Addon Groups Feature ---
  async openMasterGroupModal() {
    this.showMasterGroupModal = true;
    this.isLoadingMasterGroups = true;
    this.selectedMasterGroupIds.clear();
    this.masterGroups = [];

    try {
      const res = await this.apisService.getGlobalMasterOptions();
      if (res.status === 200 && res.msg) {
        this.masterGroups = res.msg;
      }
    } catch (error) {
      console.error('Failed to load global master options', error);
    } finally {
      this.isLoadingMasterGroups = false;
    }
  }

  closeMasterGroupModal() {
    this.showMasterGroupModal = false;
    this.selectedMasterGroupIds.clear();
  }

  togglePublishStoreSelection(storeId: string) {
    if (this.selectedPublishStoreIds.has(storeId)) {
      this.selectedPublishStoreIds.delete(storeId);
    } else {
      this.selectedPublishStoreIds.add(storeId);
    }
  }

  toggleMasterGroupSelection(groupId: string | number) {
    const idStr = String(groupId);
    if (this.selectedMasterGroupIds.has(idStr)) {
      this.selectedMasterGroupIds.delete(idStr);
    } else {
      this.selectedMasterGroupIds.add(idStr);
    }
  }

  importSelectedMasterGroups() {
    if (this.selectedMasterGroupIds.size === 0) return;

    this.masterGroups.forEach(group => {
      if (this.selectedMasterGroupIds.has(group.group_id)) {
        const optionGroup = this.createOptionGroup();
        optionGroup.patchValue({
          name: group.group_name,
          nameEn: group.group_name_eng || '',
          isRequired: group.isRequired || false,
          isMultiple: group.isMultiple || false,
          minChoices: group.minChoices || 0,
          maxChoices: group.maxChoices || 0
        });

        // Add choices
        if (group.choices && Array.isArray(group.choices)) {
          group.choices.forEach((choice: any) => {
            const choiceGroup = this.createChoiceGroup();
            choiceGroup.patchValue({
              name: choice.options_name,
              nameEn: choice.options_name_eng || '',
              price: choice.options_price
            });
            (optionGroup.get('choices') as FormArray).push(choiceGroup);
          });
        }

        this.options.push(optionGroup);
      }
    });

    this.closeMasterGroupModal();
  }

  enforceCentralization() {
    // Only lock down if it's explicitly linked to a master product.
    // Previously this incorrectly locked all local products.
    if (!this.isMasterCatalog && this.isEditMode && this.isMasterLinked) {
      const lockedFields = [
        'name', 'nameEn', 'imageUrl', 'promotionId',
        'options', 'hasDiscount', 'discountType', 'discountValue'
      ];

      lockedFields.forEach(field => {
        this.menuForm.get(field)?.disable();
      });

      // Instead of completely disabling the options FormArray, we only disable metadata fields,
      // so local stores can still adjust their own Option Prices.
      this.lockMasterOptionsExceptPrice();
    }
  }

  lockMasterOptionsExceptPrice() {
    this.options.controls.forEach(optGroup => {
      optGroup.get('name')?.disable();
      optGroup.get('nameEn')?.disable();
      optGroup.get('isRequired')?.disable();
      optGroup.get('isMultiple')?.disable();
      optGroup.get('minChoices')?.disable();
      optGroup.get('maxChoices')?.disable();

      const choices = optGroup.get('choices') as FormArray;
      choices.controls.forEach(choiceGroup => {
        choiceGroup.get('name')?.disable();
        choiceGroup.get('nameEn')?.disable();
        // notice we DO NOT disable 'price'!
      });
    });
  }
}
