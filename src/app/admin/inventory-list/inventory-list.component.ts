import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ApisService } from '../services/apis.service';
import { Ingredient } from '../models/admin.models';

@Component({
  selector: 'app-inventory-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './inventory-list.component.html',
  styleUrl: './inventory-list.component.scss'
})
export class InventoryListComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private apisService = inject(ApisService);
  private fb = inject(FormBuilder);
  private location = inject(Location);

  storeId!: string;
  ingredients: Ingredient[] = [];
  isLoading = true;

  // Inline Form State
  showForm = false;
  ingredientForm!: FormGroup;
  editingId: number | null = null;

  ngOnInit() {
    this.initForm();
    this.route.paramMap.subscribe(params => {
      const id = params.get('storeId');
      if (id) {
        this.storeId = id;
        this.loadIngredients();
      }
    });
  }

  initForm() {
    this.ingredientForm = this.fb.group({
      name: ['', Validators.required],
      unit: ['', Validators.required],
      min_alert_level: [0, [Validators.required, Validators.min(0)]]
    });
  }

  async loadIngredients() {
    this.isLoading = true;
    try {
      const res = await this.apisService.getIngredients(this.storeId);
      if (res.status === 200) {
        this.ingredients = res.msg || [];
      }
    } catch (err) {
      console.error('Failed to load ingredients', err);
    } finally {
      this.isLoading = false;
    }
  }

  openAddForm() {
    this.showForm = true;
    this.editingId = null;
    this.ingredientForm.reset({ min_alert_level: 0 });
  }

  openEditForm(item: Ingredient) {
    this.showForm = true;
    this.editingId = item.id;
    this.ingredientForm.patchValue({
      name: item.name,
      unit: item.unit,
      min_alert_level: item.min_alert_level
    });
  }

  closeForm() {
    this.showForm = false;
    this.editingId = null;
    this.ingredientForm.reset();
  }

  async onSubmit() {
    if (this.ingredientForm.invalid) return;

    const val = this.ingredientForm.value;
    try {
      if (this.editingId) {
        await this.apisService.updateIngredient({
          id: this.editingId,
          name: val.name,
          unit: val.unit,
          min_alert_level: val.min_alert_level
        });
      } else {
        await this.apisService.createIngredient({
          store_id: this.storeId,
          name: val.name,
          unit: val.unit,
          min_alert_level: val.min_alert_level
        });
      }
      await this.loadIngredients();
      this.closeForm();
    } catch (err) {
      console.error('Failed to save ingredient', err);
    }
  }

  async deleteIngredient(id: number) {
    if (confirm('Are you sure you want to delete this ingredient? Recipe dependencies will be removed.')) {
      try {
        await this.apisService.deleteIngredient(id);
        await this.loadIngredients();
      } catch (err) {
        console.error('Delete failed', err);
      }
    }
  }

  goBack() {
    this.location.back();
  }
}
