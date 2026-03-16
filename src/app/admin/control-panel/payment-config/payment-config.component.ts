import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApisService } from '../../services/apis.service';
import Swal from 'sweetalert2';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-payment-config',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './payment-config.component.html',
  styleUrl: './payment-config.component.scss'
})
export class PaymentConfigComponent implements OnInit {
  private apis = inject(ApisService);
  private translation = inject(TranslationService);

  cashMethod: any = null;
  otherMethods: any[] = [];
  isLoading = false;

  async ngOnInit() {
    await this.loadConfigs();
  }

  async loadConfigs() {
    this.isLoading = true;
    const res = await this.apis.getPaymentConfigs();
    this.isLoading = false;
    if (res.status === 200) {
      const pmConfig = res.msg.find((c: any) => c.config_key === 'PAYMENT_METHODS');
      const edcConfig = res.msg.find((c: any) => c.config_key === 'EDC_METHODS');
      
      let pMethods = pmConfig?.config_value || [];
      const eMethods = edcConfig?.config_value || [];

      // Separate Cash
      this.cashMethod = pMethods.find((m: any) => m.id === 'CASH');
      
      // Others: Combine rest of pMethods and all eMethods
      this.otherMethods = [
        ...pMethods.filter((m: any) => m.id !== 'CASH'),
        ...eMethods
      ];
    }
  }

  async saveConfig() {
    this.isLoading = true;
    
    // Prepare data for saving back to original config keys
    const pMethodsToSave = [this.cashMethod, ...this.otherMethods.filter(m => ['PROMPTPAY', 'CREDIT_CARD', 'MEMBER_POINTS'].includes(m.id))];
    const eMethodsToSave = this.otherMethods.filter(m => !['PROMPTPAY', 'CREDIT_CARD', 'MEMBER_POINTS', 'CASH'].includes(m.id));

    // Save Standard Payment Methods
    await this.apis.updatePaymentConfig({
      config_key: 'PAYMENT_METHODS',
      config_value: pMethodsToSave
    });

    // Save EDC Methods
    const res = await this.apis.updatePaymentConfig({
      config_key: 'EDC_METHODS',
      config_value: eMethodsToSave
    });

    this.isLoading = false;
    
    if (res.status === 200) {
      Swal.fire({
        icon: 'success',
        title: 'Saved',
        text: 'Configuration saved locally. Click "Sync" to broadcast to kiosks.',
        timer: 1500,
        showConfirmButton: false
      });
    }
  }

  async triggerSync() {
    this.isLoading = true;
    const res = await this.apis.triggerPaymentSync();
    this.isLoading = false;
    if (res.status === 200) {
      Swal.fire({
        icon: 'success',
        title: 'Sync Success',
        text: 'Payment configurations broadcasted to all Kiosks.',
        timer: 1500,
        showConfirmButton: false
      });
    }
  }

  async addEDCMethod() {
    const { value: formValues } = await Swal.fire({
      title: this.translation.translate('PAYMENT_CONFIG.ADD_EDC'),
      html:
        `<input id="swal-name" class="swal2-input" placeholder="${this.translation.translate('PAYMENT_CONFIG.METHOD_NAME')}">` +
        `<input id="swal-trade" class="swal2-input" placeholder="${this.translation.translate('PAYMENT_CONFIG.TRADE_TYPE')} (e.g. 01)">` +
        `<input id="swal-service" class="swal2-input" placeholder="${this.translation.translate('PAYMENT_CONFIG.SERVICE_TYPE')} (e.g. 30)">`,
      focusConfirm: false,
      showCancelButton: true,
      preConfirm: () => {
        return {
          id: 'EDC_' + Date.now(),
          name: (document.getElementById('swal-name') as HTMLInputElement).value,
          trade_type: (document.getElementById('swal-trade') as HTMLInputElement).value,
          service_type: (document.getElementById('swal-service') as HTMLInputElement).value,
          enabled: true
        }
      }
    });

    if (formValues && formValues.name) {
      this.otherMethods.push(formValues);
      await this.saveConfig();
    }
  }

  async editMethod(method: any) {
    if (method.id === 'CASH') return; // Cash usually doesn't need GHL params

    const { value: formValues } = await Swal.fire({
      title: this.translation.translate(method.id.startsWith('EDC_') ? 'PAYMENT_CONFIG.EDIT_EDC' : 'COMMON.EDIT'),
      html:
        `<input id="swal-name" class="swal2-input" value="${method.name}" placeholder="${this.translation.translate('PAYMENT_CONFIG.METHOD_NAME')}" ${!method.id.startsWith('EDC_') ? 'disabled' : ''}>` +
        `<input id="swal-trade" class="swal2-input" value="${method.trade_type || ''}" placeholder="${this.translation.translate('PAYMENT_CONFIG.TRADE_TYPE')}">` +
        `<input id="swal-service" class="swal2-input" value="${method.service_type || ''}" placeholder="${this.translation.translate('PAYMENT_CONFIG.SERVICE_TYPE')}">`,
      focusConfirm: false,
      showCancelButton: true,
      preConfirm: () => {
        return {
          ...method,
          name: (document.getElementById('swal-name') as HTMLInputElement).value,
          trade_type: (document.getElementById('swal-trade') as HTMLInputElement).value,
          service_type: (document.getElementById('swal-service') as HTMLInputElement).value
        }
      }
    });

    if (formValues) {
      const index = this.otherMethods.findIndex(m => m.id === method.id);
      if (index !== -1) {
        this.otherMethods[index] = formValues;
        await this.saveConfig();
      }
    }
  }

  async deleteMethod(id: string) {
    if (!id.startsWith('EDC_')) return; // Don't delete standard methods

    const result = await Swal.fire({
      title: 'Are you sure?',
      text: this.translation.translate('PAYMENT_CONFIG.DELETE_CONFIRM'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      this.otherMethods = this.otherMethods.filter(m => m.id !== id);
      await this.saveConfig();
    }
  }

  toggleMethod(method: any) {
    method.enabled = !method.enabled;
    this.saveConfig();
  }
}
