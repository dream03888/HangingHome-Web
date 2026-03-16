import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ApisService } from '../../services/apis.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-member-form',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './member-form.component.html',
  styleUrl: './member-form.component.scss'
})
export class MemberFormComponent implements OnInit {
  private apis = inject(ApisService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);

  form!: FormGroup;
  isEdit = false;
  memberId: string | null = null;
  groups: any[] = [];
  isLoading = false;

  constructor() {
    this.form = this.fb.group({
      member_code: ['', [Validators.required]],
      name: ['', [Validators.required]],
      phone: [''],
      email: ['', [Validators.email]],
      group_id: [null],
      points: [0],
      is_active: [true]
    });
  }

  async ngOnInit() {
    await this.loadGroups();
    this.memberId = this.route.snapshot.paramMap.get('id');
    if (this.memberId) {
      this.isEdit = true;
      this.loadMember(this.memberId);
    }
  }

  async loadGroups() {
    const res = await this.apis.getMemberGroups();
    if (res.status === 200) {
      this.groups = res.msg;
    }
  }

  async loadMember(id: string) {
    // In a real app, you might have getMemberById, but here we can filter from getMembers
    const res = await this.apis.getMembers({ search: id }); // Our search also matches ID in the backend code if we wanted, but let's assume we search it
    if (res.status === 200 && res.msg.length > 0) {
      const member = res.msg.find((m: any) => m.id === id);
      if (member) {
        this.form.patchValue(member);
      }
    }
  }

  async onSubmit() {
    if (this.form.invalid) return;

    this.isLoading = true;
    const data = { 
      ...this.form.value,
      id: this.memberId
    };

    const res = await this.apis.upsertMember(data);
    this.isLoading = false;

    if (res.status === 200) {
      Swal.fire('Success', `Member ${this.isEdit ? 'updated' : 'created'} successfully`, 'success');
      this.router.navigate(['/admin/control-panel/members']);
    } else {
      Swal.fire('Error', res.msg, 'error');
    }
  }
}
