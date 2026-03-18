import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Observable, map } from 'rxjs';
import { AdminDataService } from '../services/admin-data.service';
import { AuthService } from '../services/auth.service';
import { ApisService } from '../services/apis.service';
import { Menu, MenuSet, Store } from '../models/admin.models';
import { TranslatePipe } from '../pipes/translate.pipe';

@Component({
  selector: 'app-menu-set',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, TranslatePipe],
  templateUrl: './menu-set.component.html',
  styleUrl: './menu-set.component.scss'
})
export class MenuSetComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private adminData = inject(AdminDataService);
  private location = inject(Location);
  public authService = inject(AuthService);
  private apisService = inject(ApisService);

  storeId!: string;
  store: Store | undefined;
  menuSets$!: Observable<MenuSet[]>;
  menus: Menu[] = [];

  showForm = false;
  setForm!: FormGroup;

  ngOnInit() {
    this.setForm = this.fb.group({
      id: [null],
      name: ['', Validators.required],
      nameEn: [''],
      sortOrder: [0],
      menuIds: [[], Validators.required]
    });

    this.route.paramMap.subscribe(params => {
      const id = params.get('storeId');
      if (id) {
        this.storeId = id;
        this.menuSets$ = this.adminData.getMenuSetsForStore(this.storeId);
        this.loadStore(this.storeId);
        this.loadProducts(this.storeId);
      }
    });

    if (!this.authService.hasPermission('manage_menus')) {
      this.setForm.disable();
    }
  }

  async loadStore(id: string) {
    if (id === '00000000-0000-0000-0000-000000000000') {
      this.store = {
        id: id,
        name: 'คลังเมนูส่วนกลาง',
        name_eng: 'Master Catalog',
        allow_tables: false,
        table_count: 0
      } as any;
      return;
    }
    try {
      const res = await this.apisService.GetStore();
      if (res.status === 200) {
        const stores: Store[] = res.msg || [];
        this.store = stores.find(s => s.id === id);
      }
    } catch (error) {
      console.error('Failed to load store for menu sets', error);
    }
  }

  async loadProducts(storeId: string) {
    try {
      const res = await this.apisService.getProduct(storeId);
      if (res.status === 200) {
        this.menus = res.msg || [];
      }
    } catch (error) {
      console.error('Failed to load menus for menu sets', error);
    }
  }

  toggleForm() {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.setForm.reset({ name: '', menuIds: [] });
    }
  }

  toggleSelection(menuId: string) {
    const currentSelection: string[] = this.setForm.get('menuIds')?.value || [];
    if (currentSelection.includes(menuId)) {
      this.setForm.patchValue({ menuIds: currentSelection.filter(id => id !== menuId) });
    } else {
      this.setForm.patchValue({ menuIds: [...currentSelection, menuId] });
    }
    this.setForm.get('menuIds')?.markAsTouched();
  }

  isSelected(menuId: string): boolean {
    const currentSelection: string[] = this.setForm.get('menuIds')?.value || [];
    return currentSelection.includes(menuId);
  }

  getMenuName(menuId: string, menus: Menu[] | null): string {
    if (!menus) return 'Unknown Item';
    return menus.find(m => m.product_id === menuId)?.name || 'Unknown Item';
  }

  editSet(set: MenuSet) {
    this.showForm = true;
    this.setForm.patchValue({
      id: set.id,
      name: set.name,
      nameEn: set.nameEn || '',
      sortOrder: (set as any).sortOrder || 0,
      menuIds: set.menuIds
    });
  }

  async deleteSet(id: string) {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      const res = await this.apisService.deleteMenuSet(id);
      if (res.status === 200) {
        this.menuSets$ = this.adminData.getMenuSetsForStore(this.storeId);
      }
    } catch (err) {
      console.error('Failed to delete set', err);
    }
  }

  async onSubmit() {
    if (this.setForm.invalid) {
      this.setForm.markAllAsTouched();
      return;
    }

    const formValue = this.setForm.value;
    const payload = {
      id: formValue.id,
      isNew: !formValue.id,
      storeId: this.storeId,
      name: formValue.name,
      nameEn: formValue.nameEn,
      sortOrder: formValue.sortOrder,
      menuIds: formValue.menuIds
    };

    try {
      const res = await this.adminData.saveMenuSet(payload);
      if (res.status === 200) {
        this.toggleForm();
        this.menuSets$ = this.adminData.getMenuSetsForStore(this.storeId);
      }
    } catch (err) {
      console.error('Failed to save menu set', err);
    }
  }

  goBack() {
    this.location.back();
  }
}
