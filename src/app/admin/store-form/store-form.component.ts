import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AdminDataService } from '../services/admin-data.service';
import { AuthService } from '../services/auth.service';
import { Store } from '../models/admin.models';
import { ApisService } from '../services/apis.service';
import { TranslatePipe } from '../pipes/translate.pipe';
import { environment } from '../../environments/environment';


@Component({
  selector: 'app-store-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, TranslatePipe],
  templateUrl: './store-form.component.html',
  styleUrl: './store-form.component.scss'
})
export class StoreFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private adminData = inject(AdminDataService);
  private location = inject(Location);
  public authService = inject(AuthService);

  storeForm!: FormGroup;
  isEditMode = false;
  storeId: string | null = null;
  signagePreview: string | null = null;
  selectedSignageFile: File | null = null;

  constructor(private apisService: ApisService) {


  }
  ngOnInit() {
    this.storeForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      nameEn: [''],
      description: [''],
      isStockEnabled: [false],
      allowTables: [false],
      tableCount: [0],
      store_code: [''],
      signage_url: ['']
    });

    this.route.paramMap.subscribe(params => {
      this.storeId = params.get('id');
      if (this.storeId) {
        this.isEditMode = true;
        const store = this.adminData.getStore(this.storeId);
        if (store) {
          this.storeForm.patchValue({
            name: store.name,
            nameEn: store.name_eng || '',
            description: store.description,
            isStockEnabled: store.is_stock_enabled || false,
            allowTables: store.allow_tables || false,
            tableCount: store.table_count || 0,
            store_code: store.store_code || '',
            signage_url: store.hardware_config?.signage_url || ''
          });
          const path = store.hardware_config?.signage_url;
          this.signagePreview = path ? path.startsWith('http') ? path : `${environment.API_URL}${path}` : null;
        }
      }
    });

    if (!this.authService.hasPermission('manage_store')) {
      this.storeForm.disable();
    }
  }

  onSignageFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedSignageFile = file;
      const reader = new FileReader();
      reader.onload = (e) => {
        this.signagePreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  async onSubmit() {
    if (this.storeForm.invalid) {
      this.storeForm.markAllAsTouched();
      return;
    }

    const formValue = this.storeForm.value;
    const store: Store = {
      id: this.isEditMode && this.storeId ? this.storeId : Math.random().toString(36).substring(2, 9),
      name: formValue.name,
      name_eng: formValue.nameEn,
      description: formValue.description,
      is_stock_enabled: formValue.isStockEnabled,
      allow_tables: formValue.allowTables,
      table_count: formValue.tableCount,
      store_code: formValue.store_code,
      hardware_config: {
        signage_url: formValue.signage_url
      },
      createdAt: new Date()
    };

    if (this.selectedSignageFile) {
      try {
        let uploadedUrl = await this.apisService.uploadImage(this.selectedSignageFile);
        // Store only the relative path if it contains the API_URL
        if (uploadedUrl.startsWith(environment.API_URL)) {
          uploadedUrl = uploadedUrl.replace(environment.API_URL, '');
        }
        if (!store.hardware_config) store.hardware_config = {};
        store.hardware_config.signage_url = uploadedUrl;
      } catch (error) {
        console.error('Failed to upload signage', error);
      }
    }

    let res;
    if (this.isEditMode && this.storeId) {
      res = await this.apisService.UpdateStore(this.storeId, store.name, store.name_eng || '', store.description?.toString() || '', formValue.isStockEnabled, formValue.allowTables, formValue.tableCount, store.store_code, store.hardware_config);
    } else {
      res = await this.apisService.CreateStore(store.name, store.name_eng || '', store.description?.toString() || '', formValue.isStockEnabled, formValue.allowTables, formValue.tableCount, store.store_code, store.hardware_config);
    }

    if (res.status == 200) {
      console.log(this.isEditMode ? 'UpdateStore' : 'CreateStore', res.msg);

      if (this.isEditMode) {
        this.adminData.updateStore(store.id, {
          name: store.name,
          name_eng: store.name_eng,
          description: store.description,
          is_stock_enabled: store.is_stock_enabled,
          allow_tables: store.allow_tables,
          table_count: store.table_count,
          store_code: store.store_code,
          hardware_config: store.hardware_config
        });
      } else {
        this.adminData.saveStore(store);
      }
      this.router.navigate(['/admin/stores']);
    }

  }

  goBack() {
    this.location.back();
  }
}
