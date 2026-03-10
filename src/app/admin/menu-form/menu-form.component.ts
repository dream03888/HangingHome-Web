import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AdminDataService } from '../services/admin-data.service';
import { AuthService } from '../services/auth.service';
import { ApisService } from '../services/apis.service';
import { Menu, MenuOption, MenuOptionChoice, Store } from '../models/admin.models';
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
      options: this.fb.array([])
    });

    this.route.paramMap.subscribe(async params => {
      this.storeId = params.get('storeId')!;
      this.menuId = params.get('menuId');

      await this.loadStore(this.storeId);

      if (this.menuId) {
        this.isEditMode = true;

        // Wait for products to load and find the specific menu item
        await this.loadProductsAndPatch(this.storeId, this.menuId);
      }
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
            discountValue: menu.discount_value || 0
          });
          this.imagePreview = menu.image_url || null;

          if (menu.items) {
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
    const formValue = this.menuForm.value;

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
      items: dbItems
    };
  }

  async createMenu() {
    const menu = await this.prepareMenuPayload();
    if (!menu) return;

    const res = await this.apisService.createProduct(menu);
    console.log('Create Response:', res);
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
    if (res.status == 200) {
      this.router.navigate(['/admin/stores', this.storeId, 'menus']);
    }
  }

  goBack() {
    this.location.back();
  }
}
