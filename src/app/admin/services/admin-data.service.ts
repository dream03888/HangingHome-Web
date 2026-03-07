import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Store, Menu, MenuSet } from '../models/admin.models';

@Injectable({
  providedIn: 'root'
})
export class AdminDataService {
  private stores: Store[] = [
    { id: '1', name: 'Premium Coffee Shop', description: 'Best coffee in town', createdAt: new Date() },
    { id: '2', name: 'Steakhouse V2', description: 'Quality meats', createdAt: new Date() }
  ];

  private menuSets: MenuSet[] = [
    { id: 'ms1', storeId: '1', name: 'Morning Promo', menuIds: ['m1', 'm2'] }
  ];

  private stores$ = new BehaviorSubject<Store[]>(this.stores);
  private menuSets$ = new BehaviorSubject<MenuSet[]>(this.menuSets);

  constructor() { }




  getStores(): Observable<Store[]> {
    return this.stores$.asObservable();
  }

  getStore(id: string): Store | undefined {
    return this.stores.find(s => s.id === id);
  }

  saveStore(store: Store) {
    if (this.stores.find(s => s.id === store.id)) {
      this.stores = this.stores.map(s => s.id === store.id ? store : s);
    } else {
      this.stores = [...this.stores, store];
    }
    this.stores$.next(this.stores);
  }



  getMenuSetsForStore(storeId: string): Observable<MenuSet[]> {
    return new BehaviorSubject<MenuSet[]>(this.menuSets.filter(ms => ms.storeId === storeId)).asObservable();
  }

  saveMenuSet(menuSet: MenuSet) {
    if (this.menuSets.find(ms => ms.id === menuSet.id)) {
      this.menuSets = this.menuSets.map(ms => ms.id === menuSet.id ? menuSet : ms);
    } else {
      this.menuSets = [...this.menuSets, menuSet];
    }
    this.menuSets$.next(this.menuSets);
  }
}
