import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApisService } from '../../services/apis.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-credit-card-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink, TranslatePipe],
  templateUrl: './credit-card-form.component.html',
  styleUrl: './credit-card-form.component.scss'
})
export class CreditCardFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private apis = inject(ApisService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  form: FormGroup;
  isEdit = false;
  isLoading = false;
  companyId: string | null = null;

  constructor() {
    this.form = this.fb.group({
      id: [null],
      name: ['', [Validators.required]],
      fee_pct: [0, [Validators.required, Validators.min(0)]],
      address: [''],
      contact_name: [''],
      email: ['', [Validators.email]],
      phone: [''],
      is_active: [true]
    });
  }

  async ngOnInit() {
    this.companyId = this.route.snapshot.paramMap.get('id');
    if (this.companyId) {
      this.isEdit = true;
      await this.loadCompany();
    }
  }

  async loadCompany() {
    this.isLoading = true;
    const res = await this.apis.getCreditCardCompanies();
    this.isLoading = false;
    if (res.status === 200) {
      const company = res.msg.find((c: any) => c.id === this.companyId);
      if (company) {
        this.form.patchValue(company);
      } else {
        this.router.navigate(['/admin/control-panel/credit-cards']);
      }
    }
  }

  async onSubmit() {
    if (this.form.invalid) return;

    this.isLoading = true;
    const res = await this.apis.upsertCreditCardCompany(this.form.value);
    this.isLoading = false;

    if (res.status === 200) {
      Swal.fire({
        title: 'Success',
        text: this.isEdit ? 'Company updated successfully' : 'Company created successfully',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
      this.router.navigate(['/admin/control-panel/credit-cards']);
    } else {
      Swal.fire('Error', res.msg, 'error');
    }
  }
}
