import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Store, Menu, MenuSet } from '../models/admin.models';
import { ApisService, IResponseMessage } from './apis.service';

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




  private apisService = inject(ApisService);

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

  updateStore(id: string, partialStore: Partial<Store>) {
    const idx = this.stores.findIndex(s => s.id === id);
    if (idx > -1) {
      this.stores[idx] = { ...this.stores[idx], ...partialStore };
      this.stores = [...this.stores];
      this.stores$.next(this.stores);
    }
  }



  getMenuSetsForStore(storeId: string): Observable<MenuSet[]> {
    return new Observable<MenuSet[]>(observer => {
      this.apisService.getMenuSets(storeId).then(res => {
        if (res.status === 200) {
          observer.next(res.msg || []);
        } else {
          observer.next([]);
        }
        observer.complete();
      });
    });
  }

  async saveMenuSet(menuSet: any): Promise<IResponseMessage> {
    return await this.apisService.upsertMenuSet(menuSet);
  }
}
