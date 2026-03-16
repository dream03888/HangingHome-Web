import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private indigoTheme = {
    confirmButtonColor: '#6366f1',
    cancelButtonColor: 'rgba(255,255,255,0.1)',
    background: '#1e293b',
    color: '#f8fafc',
    customClass: {
      popup: 'indigo-swal-popup',
      title: 'indigo-swal-title',
      confirmButton: 'indigo-swal-confirm',
      cancelButton: 'indigo-swal-cancel'
    }
  };

  success(title: string, text?: string) {
    return Swal.fire({
      ...this.indigoTheme,
      icon: 'success',
      title,
      text,
      timer: 2000,
      showConfirmButton: false
    });
  }

  error(title: string, text?: string) {
    return Swal.fire({
      ...this.indigoTheme,
      icon: 'error',
      title: title || 'Error',
      text: text || 'An unexpected error occurred.',
      confirmButtonText: 'OK'
    });
  }

  async confirm(title: string, text?: string, confirmText: string = 'Confirm', cancelText: string = 'Cancel'): Promise<boolean> {
    const result = await Swal.fire({
      ...this.indigoTheme,
      icon: 'question',
      title,
      text,
      showCancelButton: true,
      confirmButtonText: confirmText,
      cancelButtonText: cancelText,
    });
    return result.isConfirmed;
  }

  loading(title: string = 'Processing...') {
    Swal.fire({
      ...this.indigoTheme,
      title,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
  }

  close() {
    Swal.close();
  }
}
