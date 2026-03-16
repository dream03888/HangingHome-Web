import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-member-groups',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card p-8 text-center">
      <h2 class="text-2xl font-bold mb-4">Member Groups</h2>
      <p class="text-gray-400">Manage member tiers and their associated discounts. (Coming Soon)</p>
    </div>
  `,
  styles: [`
    .p-8 { padding: 2rem; }
    .text-center { text-align: center; }
    .text-2xl { font-size: 1.5rem; }
    .font-bold { font-weight: 700; }
    .mb-4 { margin-bottom: 1rem; }
    .text-gray-400 { color: #9ca3af; }
  `]
})
export class MemberGroupsComponent {}
