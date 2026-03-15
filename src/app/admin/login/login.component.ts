import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder
  ) {
    if (this.authService.isAuthenticated()) {
      const user = this.authService.currentUserValue;
      if (user?.role !== 'superadmin' &&
        user?.permissions?.includes('cashier') &&
        !user?.permissions?.includes('manage_store') &&
        !user?.permissions?.includes('manage_menus')) {
        this.router.navigate(['/kiosk']);
      } else {
        this.router.navigate(['/admin/stores']);
      }
    }

    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  async onSubmit() {
    if (this.loginForm.invalid) {
      return;
    }

    const { username, password } = this.loginForm.value;
    const success = await this.authService.login(username, password);
    if (success) {
      const user = this.authService.currentUserValue;

      // If the user's ONLY permission is cashier and they are not a superadmin
      if (user?.role !== 'superadmin' &&
        user?.permissions?.includes('cashier') &&
        !user?.permissions?.includes('manage_store') &&
        !user?.permissions?.includes('manage_menus')) {
        this.router.navigate(['/kiosk']);
      } else {
        this.router.navigate(['/admin/stores']);
      }
    } else {
      this.errorMessage = 'Invalid username or password';
    }
  }
}
