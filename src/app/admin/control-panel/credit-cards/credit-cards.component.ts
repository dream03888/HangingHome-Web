import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApisService } from '../../services/apis.service';
import Swal from 'sweetalert2';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-credit-cards',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './credit-cards.component.html',
  styleUrl: './credit-cards.component.scss'
})
export class CreditCardsComponent implements OnInit {
  private apis = inject(ApisService);
  private router = inject(Router);

  companies: any[] = [];
  isLoading = false;

  async ngOnInit() {
    await this.loadCompanies();
  }

  async loadCompanies() {
    this.isLoading = true;
    const res = await this.apis.getCreditCardCompanies();
    this.isLoading = false;
    if (res.status === 200) {
      this.companies = res.msg;
    }
  }

  addCompany() {
    this.router.navigate(['/admin/control-panel/credit-cards/new']);
  }

  editCompany(company: any) {
    this.router.navigate(['/admin/control-panel/credit-cards', company.id, 'edit']);
  }

  async deleteCompany(id: string) {
    const result = await Swal.fire({
      title: 'Delete Company?',
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      confirmButtonColor: '#ef4444'
    });

    if (result.isConfirmed) {
      const res = await this.apis.deleteCreditCardCompany(id);
      if (res.status === 200) {
        Swal.fire('Deleted', 'Company removed', 'success');
        this.loadCompanies();
      }
    }
  }

  async toggleStatus(company: any) {
    const res = await this.apis.upsertCreditCardCompany({
      ...company,
      is_active: !company.is_active
    });
    if (res.status === 200) {
      this.loadCompanies();
    }
  }
}
