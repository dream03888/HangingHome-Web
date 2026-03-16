import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApisService } from '../../services/apis.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-member-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TranslatePipe],
  templateUrl: './member-list.component.html',
  styleUrl: './member-list.component.scss'
})
export class MemberListComponent implements OnInit {
  private apis = inject(ApisService);

  members: any[] = [];
  groups: any[] = [];
  searchQuery: string = '';
  selectedGroupId: string = '';
  isLoading: boolean = false;

  async ngOnInit() {
    await this.loadGroups();
    await this.loadMembers();
  }

  async loadGroups() {
    const res = await this.apis.getMemberGroups();
    if (res.status === 200) {
      this.groups = res.msg;
    }
  }

  async loadMembers() {
    this.isLoading = true;
    const res = await this.apis.getMembers({ search: this.searchQuery, group_id: this.selectedGroupId });
    this.isLoading = false;
    if (res.status === 200) {
      this.members = res.msg;
    }
  }

  onFilterChange() {
    this.loadMembers();
  }

  async deleteMember(id: string) {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      const res = await this.apis.deleteMember(id);
      if (res.status === 200) {
        Swal.fire('Deleted!', 'Member has been deleted.', 'success');
        this.loadMembers();
      }
    }
  }

  async showTransactions(member: any) {
    // This could open a modal or navigate to a sub-page
    // For now, let's just log or show a simple sweetalert with info
    const res = await this.apis.getMemberTransactions(member.id);
    if (res.status === 200) {
      const txs = res.msg;
      let txHtml = '<div style="max-height: 400px; overflow-y: auto;">';
      if (txs.length === 0) txHtml += '<p>No transactions found.</p>';
      txs.forEach((tx: any) => {
        txHtml += `
          <div style="border-bottom: 1px solid #eee; padding: 10px 0; text-align: left;">
            <div style="display: flex; justify-content: space-between;">
              <span style="font-weight: bold;">${tx.type}</span>
              <span style="color: ${tx.points >= 0 ? 'green' : 'red'};">${tx.points > 0 ? '+' : ''}${tx.points} pts</span>
            </div>
            <div style="font-size: 0.8em; color: #666;">
              ${new Date(tx.created_at).toLocaleString()}
            </div>
            <div style="font-size: 0.9em; margin-top: 4px;">${tx.description || ''}</div>
          </div>
        `;
      });
      txHtml += '</div>';

      Swal.fire({
        title: `Points History - ${member.name}`,
        html: txHtml,
        width: '600px',
        showCloseButton: true,
      });
    }
  }
}
