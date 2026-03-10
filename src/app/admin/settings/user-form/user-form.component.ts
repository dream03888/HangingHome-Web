import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { ApisService } from '../../services/apis.service';
import { Store } from '../../models/admin.models';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, TranslatePipe],
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.scss'
})
export class UserFormComponent implements OnInit {
  userForm: FormGroup;
  isEditMode = false;
  userId: string | null = null;

  availablePermissions = [
    { value: 'manage_store', label: 'USER.PERM_MANAGE_STORE' },
    { value: 'manage_menus', label: 'USER.PERM_MANAGE_MENU' },
    { value: 'toggle_menu', label: 'USER.PERM_TOGGLE_MENU' },
    { value: 'manage_stock', label: 'USER.PERM_MANAGE_STOCK' },
    { value: 'access_kiosk', label: 'USER.PERM_ACCESS_KIOSK' }
  ];

  apisService = inject(ApisService);
  router = inject(Router);
  route = inject(ActivatedRoute);
  fb = inject(FormBuilder);

  stores: Store[] = [];

  constructor() {
    this.userForm = this.fb.group({
      username: ['', Validators.required],
      password: [''], // Only required on create normally, but leaving optional here
      f_name: [''],
      l_name: [''],
      emp_code: [''],
      phone: [''],
      role: ['storeadmin', Validators.required],
      storeId: [''],
      permissions: [[]]
    });
  }

  ngOnInit(): void {
    this.loadStores();
    this.userId = this.route.snapshot.paramMap.get('id');
    if (this.userId) {
      this.isEditMode = true;
      this.loadUser(this.userId);
    }
  }

  async loadStores() {
    try {
      const res = await this.apisService.GetStore();
      if (res.status === 200) {
        this.stores = res.msg || [];
      }
    } catch (err) {
      console.error('Failed to load stores', err);
    }
  }

  async loadUser(id: string) {
    try {
      const res = await this.apisService.getUsers();
      if (res.status === 200) {
        const users = res.msg || [];
        const user = users.find((u: any) => u.id.toString() === id.toString());
        if (user) {
          this.userForm.patchValue({
            username: user.username,
            f_name: user.f_name || '',
            l_name: user.l_name || '',
            emp_code: user.emp_code || '',
            phone: user.phone || '',
            role: user.role,
            storeId: user.store_id || '', // Use db mapping store_id
            permissions: user.permissions || []
          });
        } else {
          this.router.navigate(['/admin/settings/users']);
        }
      }
    } catch (err) {
      console.error('Failed to load user info', err);
    }
  }

  onPermissionToggle(event: any) {
    const value = event.target.value;
    const isChecked = event.target.checked;
    const currentPermissions = this.userForm.value.permissions as string[];

    if (isChecked) {
      this.userForm.patchValue({ permissions: [...currentPermissions, value] });
    } else {
      this.userForm.patchValue({ permissions: currentPermissions.filter(p => p !== value) });
    }
  }

  isPermissionSelected(val: string): boolean {
    const perms = this.userForm.value.permissions as string[];
    return perms.includes(val);
  }

  async onSubmit() {
    if (this.userForm.invalid) return;

    const formData = this.userForm.value;

    // Clear store/permissions if superadmin
    if (formData.role === 'superadmin') {
      formData.storeId = null;
      formData.permissions = [];
    }

    try {
      if (this.isEditMode && this.userId) {
        await this.apisService.updateUser({ ...formData, id: this.userId });
      } else {
        // Create user MUST have a password
        if (!formData.password) formData.password = 'password';
        await this.apisService.createUser(formData);
      }
      this.router.navigate(['/admin/settings/users']);
    } catch (error) {
      console.error('Failed to save user:', error);
    }
  }
}
