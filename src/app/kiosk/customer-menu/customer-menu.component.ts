import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ApisService } from '../../admin/services/apis.service';
import { Store, Menu, MenuSet, MenuOption, MenuOptionChoice, Promotion } from '../../admin/models/admin.models';
import { CartCheckoutService, CartItem } from '../services/cart-checkout.service';

@Component({
  selector: 'app-customer-menu',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './customer-menu.component.html',
  styleUrl: './customer-menu.component.scss'
})
export class CustomerMenuComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private apisService = inject(ApisService);
  public cartService = inject(CartCheckoutService);

  storeId!: string;
  store: Store | null = null;
  menus: Menu[] = [];
  categories: MenuSet[] = [];

  activeCategory: string = 'all';

  selectedProduct: Menu | null = null;
  selectedOptions: { [groupId: string]: MenuOptionChoice[] } = {};

  isLoading = true;
  isCartOpen = false;
  isCheckoutSuccess = false;

  promoCode: string = '';
  promoError: string = '';
  isApplyingPromo = false;

  async ngOnInit() {
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
      // Load store info
      const storeRes = await this.apisService.GetStore();
      if (storeRes.status === 200 || storeRes.status === 201) {
        const stores: Store[] = storeRes.msg || [];
        this.store = stores.find(s => s.id === this.storeId) || null;
      }

      // Load products for this store
      const prodRes = await this.apisService.getProduct(this.storeId);
      if (prodRes.status === 200) {
        // Only show active products to customers
        this.menus = (prodRes.msg || []).filter((m: Menu) => m.product_active);
      }

      // Load Menu Sets (Categories) for navigation
      // Note: We need a getMenuSet API, but for now we'll just fake it or leave flat if we don't have the explicit endpoint exposed publically.
      // Assuming a flat list if no categories exist.

    } catch (err) {
      console.error('Failed to load store data', err);
    } finally {
      this.isLoading = false;
    }
  }

  get filteredMenus(): Menu[] {
    if (this.activeCategory === 'all') {
      return this.menus;
    }
    // If we had categories, we would filter by menuId presence.
    return this.menus;
  }

  addToCart(product: Menu) {
    if (product.items && product.items.length > 0) {
      this.selectedProduct = product;
      this.selectedOptions = {};
      product.items.forEach(group => {
        this.selectedOptions[group.group_id!] = [];
      });
      return;
    }

    let finalPrice = product.price;
    if (product.discount_type === 'percentage' && product.discount_value) {
      finalPrice = product.price - (product.price * (product.discount_value / 100));
    } else if (product.discount_type === 'amount' && product.discount_value) {
      finalPrice = product.price - product.discount_value;
    }

    this.cartService.addItem(product, 1, '', finalPrice);
    this.isCartOpen = true; // Auto open cart to show feedback
  }

  // --- Addon Modal Logic --- //
  closeOptionsModal() {
    this.selectedProduct = null;
    this.selectedOptions = {};
  }

  toggleOption(group: MenuOption, choice: MenuOptionChoice) {
    const groupId = group.group_id!;
    let current = this.selectedOptions[groupId] || [];

    if (!group.isMultiple) {
      // Single selection: replace
      this.selectedOptions[groupId] = [choice];
    } else {
      // Multiple selection: toggle
      const idx = current.findIndex(c => c.option_id === choice.option_id);
      if (idx >= 0) {
        current.splice(idx, 1);
      } else {
        // Enforce max choices
        if (group.maxChoices && group.maxChoices > 0 && current.length >= group.maxChoices) {
          alert(`You can only select up to ${group.maxChoices} options for ${group.group_name}`);
          return;
        }
        current.push(choice);
      }
      this.selectedOptions[groupId] = current;
    }
  }

  isChoiceSelected(groupId: string, choiceId: string): boolean {
    const current = this.selectedOptions[groupId] || [];
    return current.some(c => c.option_id === choiceId);
  }

  isSelectionValid(): boolean {
    if (!this.selectedProduct || !this.selectedProduct.items) return true;

    for (const group of this.selectedProduct.items) {
      const selected = this.selectedOptions[group.group_id!] || [];
      // Enforce Required
      if (group.isRequired && selected.length === 0) return false;
      // Enforce Min Choices
      if (group.isMultiple && group.minChoices && group.minChoices > 0 && selected.length < group.minChoices) {
        return false;
      }
    }
    return true;
  }

  confirmOptionsAndAddToCart() {
    if (!this.selectedProduct) return;

    let optionsTextParts: string[] = [];
    let addonPrice = 0;

    if (this.selectedProduct.items) {
      this.selectedProduct.items.forEach(group => {
        const selected = this.selectedOptions[group.group_id!] || [];
        if (selected.length > 0) {
          const names = selected.map(c => c.options_name).join(', ');
          optionsTextParts.push(`${names}`);
          selected.forEach(c => {
            addonPrice += Number(c.options_price || 0);
          });
        }
      });
    }

    const optionsSummary = optionsTextParts.join(' | ');
    let finalPrice = this.selectedProduct.price;
    if (this.selectedProduct.discount_type === 'percentage' && this.selectedProduct.discount_value) {
      finalPrice = finalPrice - (finalPrice * (this.selectedProduct.discount_value / 100));
    } else if (this.selectedProduct.discount_type === 'amount' && this.selectedProduct.discount_value) {
      finalPrice = finalPrice - this.selectedProduct.discount_value;
    }

    finalPrice += addonPrice; // Add addons to discounted base price

    this.cartService.addItem(this.selectedProduct, 1, optionsSummary, finalPrice);
    this.isCartOpen = true;
    this.closeOptionsModal();
  }

  toggleCart() {
    this.isCartOpen = !this.isCartOpen;
  }

  async applyPromoCode() {
    if (!this.promoCode || this.promoCode.trim() === '') return;
    this.isApplyingPromo = true;
    this.promoError = '';

    try {
      const res = await this.apisService.validatePromotion(this.promoCode.trim().toUpperCase());

      if (res.status === 200 && res.msg) {
        this.cartService.applyPromo(res.msg);
        this.promoCode = '';
      } else {
        this.promoError = 'Invalid or inactive promo code.';
      }
    } catch (e) {
      this.promoError = 'Failed to apply promo code.';
    } finally {
      this.isApplyingPromo = false;
    }
  }

  removePromo() {
    this.cartService.clearPromo();
  }

  async checkout() {
    if (this.cartService.items.length === 0) return;

    const appliedPromo = this.cartService.appliedPromo;

    // Prepare payload
    const payload = {
      store_id: this.storeId,
      subtotal: this.cartService.subTotal,
      discount_amount: this.cartService.discountAmount,
      total_amount: this.cartService.cartTotal,
      promotion_id: appliedPromo ? appliedPromo.id : null,
      items: this.cartService.items.map(item => ({
        product_id: item.product.product_id,
        quantity: item.quantity,
        price: item.priceAtTime,
        options_summary: item.optionsSummary || ''
      }))
    };

    try {
      // NOTE: We need placeOrder added to ApisService. Using a generic emit for now or we update apisService.
      // Assuming apisService.placeOrder(payload) exists. We'll add it next.
      const res = await this.apisService.placeOrder(payload);
      if (res.status === 200) {
        this.isCheckoutSuccess = true;
        this.cartService.clearCart();
        setTimeout(() => {
          this.isCheckoutSuccess = false;
          this.isCartOpen = false;
        }, 4000);
      }
    } catch (e) {
      console.error("Checkout failed", e);
      alert("Checkout failed. Please try again.");
    }
  }
}
