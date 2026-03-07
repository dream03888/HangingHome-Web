import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ApisService } from '../../services/apis.service';
import { User } from '../../models/auth.model';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss'
})
export class UserListComponent implements OnInit {
  users: User[] = [];

  constructor(
    public authService: AuthService,
    private apisService: ApisService,
    private translationService: TranslationService
  ) { }

  ngOnInit(): void {
    this.loadUsers();
  }

  async loadUsers() {
    try {
      const res = await this.apisService.getUsers();
      if (res.status === 200) {
        this.users = res.msg || [];
      }
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  }

  async deleteUser(id: string) {
    const msg = this.translationService.currentLang() === 'th' ? 'คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้นี้?' : 'Are you sure you want to delete this user?';
    if (confirm(msg)) {
      try {
        const res = await this.apisService.deleteUser(id);
        if (res.status === 200) {
          await this.loadUsers(); // Refresh the list
        } else {
          console.error('Failed to delete user:', res.msg);
        }
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  }
}
