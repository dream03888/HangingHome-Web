import { Component, OnInit, inject } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { User } from '../models/auth.model';
import { CommonModule } from '@angular/common';
import { TranslationService, Language } from '../services/translation.service';
import { TranslatePipe } from '../pipes/translate.pipe';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterModule, CommonModule, TranslatePipe],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.scss'
})
export class AdminLayoutComponent implements OnInit {
  currentUser: User | null = null;
  public translationService = inject(TranslationService);

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  toggleLanguage() {
    const current = this.translationService.currentLang();
    const nextLang: Language = current === 'en' ? 'th' : 'en';
    this.translationService.setLanguage(nextLang);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
