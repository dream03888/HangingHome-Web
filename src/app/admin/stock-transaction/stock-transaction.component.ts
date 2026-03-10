import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ApisService } from '../services/apis.service';
import { Ingredient, StockTransaction } from '../models/admin.models';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-stock-transaction',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './stock-transaction.component.html',
  styleUrl: './stock-transaction.component.scss'
})
export class StockTransactionComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private apisService = inject(ApisService);
  private fb = inject(FormBuilder);
  private location = inject(Location);
  public authService = inject(AuthService);

  storeId!: string;
  ingredients: Ingredient[] = [];
  transactions: StockTransaction[] = [];
  isLoading = true;

  txForm!: FormGroup;

  ngOnInit() {
    this.txForm = this.fb.group({
      ingredient_id: ['', Validators.required],
      type: ['in', Validators.required],
      quantity_changed: [null, [Validators.required, Validators.min(0.01)]],
      reason: ['', Validators.required]
    });

    this.route.paramMap.subscribe(params => {
      const id = params.get('storeId');
      if (id) {
        this.storeId = id;
        this.loadData();
      }
    });
  }

  async loadData() {
    this.isLoading = true;
    try {
      const [ingRes, txRes] = await Promise.all([
        this.apisService.getIngredients(this.storeId),
        this.apisService.getStockTransactions(this.storeId)
      ]);

      if (ingRes.status === 200) this.ingredients = ingRes.msg || [];
      if (txRes.status === 200) this.transactions = txRes.msg || [];
    } catch (err) {
      console.error('Failed to load transaction data', err);
    } finally {
      this.isLoading = false;
    }
  }

  async onSubmit() {
    if (this.txForm.invalid) {
      this.txForm.markAllAsTouched();
      return;
    }

    const val = this.txForm.value;

    // For 'out' and 'adjust' losing stock, make it negative. Actually, 'adjust' might be setting absolute value or diff.
    // Let's assume quantity_changed from form is an absolute amount to add/subtract.
    let qty = Number(val.quantity_changed);
    if (val.type === 'out') {
      qty = -qty;
    }

    const user = this.authService.currentUserValue;

    try {
      await this.apisService.createTransaction({
        ingredient_id: val.ingredient_id,
        type: val.type,
        quantity_changed: qty,
        reason: val.reason,
        created_by: user?.username || 'admin'
      });

      this.txForm.reset({ type: 'in' });
      await this.loadData();
    } catch (err) {
      console.error('Failed to save transaction', err);
    }
  }

  getUnit(ingredientId: number): string {
    const ing = this.ingredients.find(i => i.id == ingredientId);
    return ing ? ing.unit : '';
  }

  goBack() {
    this.location.back();
  }
}
