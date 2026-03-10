import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ApisService } from '../services/apis.service';
import { Ingredient, Menu } from '../models/admin.models';

@Component({
  selector: 'app-recipe-manager',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './recipe-manager.component.html',
  styleUrl: './recipe-manager.component.scss'
})
export class RecipeManagerComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private apisService = inject(ApisService);
  private fb = inject(FormBuilder);
  private location = inject(Location);

  storeId!: string;
  productId!: string;

  menuItem: Menu | null = null;
  ingredients: Ingredient[] = [];

  recipeForm!: FormGroup;
  isLoading = true;

  ngOnInit() {
    this.recipeForm = this.fb.group({
      items: this.fb.array([])
    });

    this.route.paramMap.subscribe(params => {
      this.storeId = params.get('storeId') || '';
      this.productId = params.get('productId') || '';
      if (this.storeId && this.productId) {
        this.loadData();
      }
    });
  }

  get items(): FormArray {
    return this.recipeForm.get('items') as FormArray;
  }

  createItemFormGroup(ingredientId: string | number = '', qty: number = 1): FormGroup {
    return this.fb.group({
      ingredient_id: [ingredientId, Validators.required],
      quantity_required: [qty, [Validators.required, Validators.min(0.01)]]
    });
  }

  addItem() {
    this.items.push(this.createItemFormGroup());
  }

  removeItem(index: number) {
    this.items.removeAt(index);
  }

  async loadData() {
    this.isLoading = true;
    try {
      // Fetch Product Info, Ingredients, and current Recipe
      const [prodRes, ingRes, recRes] = await Promise.all([
        this.apisService.getProduct(this.storeId),
        this.apisService.getIngredients(this.storeId),
        this.apisService.getRecipe(this.productId)
      ]);

      if (prodRes.status === 200) {
        const allMenus: Menu[] = prodRes.msg || [];
        // Note: product_id in SQL is UUID string
        this.menuItem = allMenus.find(m => m.product_id === this.productId) || null;
      }

      if (ingRes.status === 200) {
        this.ingredients = ingRes.msg || [];
      }

      if (recRes.status === 200) {
        const savedItems = recRes.msg || [];
        savedItems.forEach((item: any) => {
          this.items.push(this.createItemFormGroup(item.ingredient_id, item.quantity_required));
        });
      }

      // If empty, add one row by default
      if (this.items.length === 0) {
        // this.addItem();
      }

    } catch (err) {
      console.error('Failed to load recipe data', err);
    } finally {
      this.isLoading = false;
    }
  }

  async onSubmit() {
    if (this.recipeForm.invalid) {
      this.recipeForm.markAllAsTouched();
      return;
    }

    const formValue = this.recipeForm.value;
    try {
      const res = await this.apisService.upsertRecipe(this.productId, formValue.items);
      if (res.status === 200) {
        this.goBack();
      }
    } catch (err) {
      console.error('Failed to save recipe', err);
    }
  }

  getUnitForControl(index: number): string {
    const ingId = this.items.at(index).get('ingredient_id')?.value;
    if (!ingId) return '';
    const ing = this.ingredients.find(i => i.id == ingId);
    return ing ? ing.unit : '';
  }

  goBack() {
    this.location.back();
  }
}
