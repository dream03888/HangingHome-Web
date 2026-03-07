import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AdminDataService } from '../services/admin-data.service';
import { AuthService } from '../services/auth.service';
import { Store } from '../models/admin.models';
import { ApisService } from '../services/apis.service';
import { TranslatePipe } from '../pipes/translate.pipe';

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

  constructor(private apisService: ApisService) {


  }
  ngOnInit() {
    this.storeForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['']
    });

    this.route.paramMap.subscribe(params => {
      this.storeId = params.get('id');
      if (this.storeId) {
        this.isEditMode = true;
        const store = this.adminData.getStore(this.storeId);
        if (store) {
          this.storeForm.patchValue({
            name: store.name,
            description: store.description
          });
        }
      }
    });

    if (!this.authService.hasPermission('manage_store')) {
      this.storeForm.disable();
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
      description: formValue.description,
      createdAt: new Date()
    };
    const res = await this.apisService.CreateStore(store.name, store.description?.toString() || '');
    if (res.status == 200) {
      console.log('CreateStore', res.msg);
      this.adminData.saveStore(store);
      this.router.navigate(['/admin/stores']);
    }

  }

  goBack() {
    this.location.back();
  }
}
