import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Menu, Promotion } from '../../admin/models/admin.models';

export interface CartItem {
  product: Menu;
  quantity: number;
  optionsSummary?: string; // e.g. "Sweetness: 50%, Size: Large"
  priceAtTime: number; // The computed final price per unit (after options)
}

@Injectable({
  providedIn: 'root'
})
export class CartCheckoutService {
  private cartItemsSubject = new BehaviorSubject<CartItem[]>([]);
  public cartItems$: Observable<CartItem[]> = this.cartItemsSubject.asObservable();

  private appliedPromoSubject = new BehaviorSubject<Promotion | null>(null);
  public appliedPromo$: Observable<Promotion | null> = this.appliedPromoSubject.asObservable();

  constructor() {
    // Optionally recover from session storage
    const savedCart = sessionStorage.getItem('kiosk_cart');
    if (savedCart) {
      this.cartItemsSubject.next(JSON.parse(savedCart));
    }
    const savedPromo = sessionStorage.getItem('kiosk_promo');
    if (savedPromo) {
      this.appliedPromoSubject.next(JSON.parse(savedPromo));
    }
  }

  get items(): CartItem[] {
    return this.cartItemsSubject.value;
  }

  get totalItemsCount(): number {
    return this.items.reduce((total, item) => total + item.quantity, 0);
  }

  get subTotal(): number {
    return this.items.reduce((total, item) => total + (item.priceAtTime * item.quantity), 0);
  }

  get discountAmount(): number {
    const promo = this.appliedPromoSubject.value;
    if (!promo) return 0;

    let discountBase = 0;

    if (promo.target_type === 'bill') {
      discountBase = this.subTotal;
    } else {
      discountBase = this.items
        .filter(item => item.product.promotion_id === promo.id)
        .reduce((sum, item) => sum + (item.priceAtTime * item.quantity), 0);
    }

    if (discountBase <= 0) return 0;

    let calculatedDiscount = 0;
    if (promo.type === 'percentage') {
      calculatedDiscount = discountBase * (promo.value / 100);
    } else if (promo.type === 'amount') {
      calculatedDiscount = Math.min(promo.value, discountBase); // Cannot discount more than the base
    }

    return calculatedDiscount;
  }

  get cartTotal(): number {
    return Math.max(0, this.subTotal - this.discountAmount);
  }

  get appliedPromo(): Promotion | null {
    return this.appliedPromoSubject.value;
  }

  applyPromo(promo: Promotion) {
    this.appliedPromoSubject.next(promo);
    sessionStorage.setItem('kiosk_promo', JSON.stringify(promo));
  }

  clearPromo() {
    this.appliedPromoSubject.next(null);
    sessionStorage.removeItem('kiosk_promo');
  }

  addItem(product: Menu, quantity: number = 1, optionsSummary: string = '', computedPrice: number) {
    const currentList = this.items;

    // Check if exactly identical item (same product + same options) exists to aggregate
    const existingIdx = currentList.findIndex(i => i.product.product_id === product.product_id && i.optionsSummary === optionsSummary);

    if (existingIdx > -1) {
      currentList[existingIdx].quantity += quantity;
    } else {
      currentList.push({
        product,
        quantity,
        optionsSummary,
        priceAtTime: computedPrice,
      });
    }

    this.cartItemsSubject.next([...currentList]);
    this.saveToSession();
  }

  updateQuantity(index: number, delta: number) {
    const currentList = this.items;
    if (currentList[index]) {
      currentList[index].quantity += delta;

      if (currentList[index].quantity <= 0) {
        currentList.splice(index, 1);
      }
      this.cartItemsSubject.next([...currentList]);
      this.saveToSession();
    }
  }

  removeItem(index: number) {
    const currentList = this.items;
    currentList.splice(index, 1);
    this.cartItemsSubject.next([...currentList]);
    this.saveToSession();
  }

  clearCart() {
    this.cartItemsSubject.next([]);
    sessionStorage.removeItem('kiosk_cart');
    this.clearPromo();
  }

  private saveToSession() {
    sessionStorage.setItem('kiosk_cart', JSON.stringify(this.items));
  }
}
