import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Menu } from '../../admin/models/admin.models';

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

  constructor() {
    // Optionally recover from session storage
    const savedCart = sessionStorage.getItem('kiosk_cart');
    if (savedCart) {
      this.cartItemsSubject.next(JSON.parse(savedCart));
    }
  }

  get items(): CartItem[] {
    return this.cartItemsSubject.value;
  }

  get totalItemsCount(): number {
    return this.items.reduce((total, item) => total + item.quantity, 0);
  }

  get cartTotal(): number {
    return this.items.reduce((total, item) => total + (item.priceAtTime * item.quantity), 0);
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
  }

  private saveToSession() {
    sessionStorage.setItem('kiosk_cart', JSON.stringify(this.items));
  }
}
