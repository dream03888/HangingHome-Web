import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApisService } from '../../services/apis.service';
import { NotificationService } from '../../services/notification.service';
import Swal from 'sweetalert2';

interface MemberGroup {
  id: string;
  name: string;
  discount_pct: number;
}

@Component({
  selector: 'app-member-groups',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './member-groups.component.html',
  styleUrl: './member-groups.component.scss'
})
export class MemberGroupsComponent implements OnInit {
  groups = signal<MemberGroup[]>([]);
  isLoading = signal(false);

  constructor(
    private apis: ApisService,
    private notify: NotificationService
  ) {}

  ngOnInit() {
    this.loadGroups();
  }

  async loadGroups() {
    this.isLoading.set(true);
    try {
      const res = await this.apis.getMemberGroups();
      if (res.status === 200) {
        this.groups.set(res.msg);
      }
    } catch (e) {
      console.error(e);
      this.notify.error("Error", "Failed to load member groups");
    } finally {
      this.isLoading.set(false);
    }
  }

  async addGroup() {
    const { value: formValues } = await Swal.fire({
      title: 'Add Member Group',
      html:
        '<input id="swal-input1" class="swal2-input" placeholder="Group Name">' +
        '<input id="swal-input2" type="number" class="swal2-input" placeholder="Discount %">',
      focusConfirm: false,
      showCancelButton: true,
      preConfirm: () => {
        return [
          (document.getElementById('swal-input1') as HTMLInputElement).value,
          (document.getElementById('swal-input2') as HTMLInputElement).value
        ]
      }
    });

    if (formValues) {
      const [name, discount] = formValues;
      if (!name) return;
      
      try {
        this.notify.loading("Saving...");
        const res = await this.apis.upsertMemberGroup({
          name,
          discount_pct: Number(discount || 0)
        });
        this.notify.close();
        
        if (res.status === 200 || res.status === 201) {
          this.notify.success("Success", "Group added successfully");
          this.loadGroups();
        } else {
          this.notify.error("Error", res.msg);
        }
      } catch (e) {
        this.notify.error("Error", "Failed to save group");
      }
    }
  }

  async editGroup(group: MemberGroup) {
    const { value: formValues } = await Swal.fire({
      title: 'Edit Member Group',
      html:
        `<input id="swal-input1" class="swal2-input" placeholder="Group Name" value="${group.name}">` +
        `<input id="swal-input2" type="number" class="swal2-input" placeholder="Discount %" value="${group.discount_pct}">`,
      focusConfirm: false,
      showCancelButton: true,
      preConfirm: () => {
        return [
          (document.getElementById('swal-input1') as HTMLInputElement).value,
          (document.getElementById('swal-input2') as HTMLInputElement).value
        ]
      }
    });

    if (formValues) {
      const [name, discount] = formValues;
      if (!name) return;

      try {
        this.notify.loading("Saving...");
        const res = await this.apis.upsertMemberGroup({
          id: group.id,
          name,
          discount_pct: Number(discount || 0)
        });
        this.notify.close();

        if (res.status === 200) {
          this.notify.success("Success", "Group updated successfully");
          this.loadGroups();
        } else {
          this.notify.error("Error", res.msg);
        }
      } catch (e) {
        this.notify.error("Error", "Failed to update group");
      }
    }
  }

  async deleteGroup(group: MemberGroup) {
    const confirmed = await this.notify.confirm(
      "Delete Group?",
      `Are you sure you want to delete "${group.name}"?`
    );

    if (confirmed) {
      try {
        this.notify.loading("Deleting...");
        const res = await this.apis.deleteMemberGroup(group.id);
        this.notify.close();

        if (res.status === 200) {
          this.notify.success("Deleted", "Group removed successfully");
          this.loadGroups();
        } else {
          this.notify.error("Error", res.msg);
        }
      } catch (e) {
        this.notify.error("Error", "Failed to delete group");
      }
    }
  }
}
