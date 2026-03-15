import { Injectable } from '@angular/core';
import { SocketSupplyService } from './socket-supply.service';
import { environment } from '../../environments/environment';

export interface IResponseMessage {
  status: IResponseStatus;
  header: string;
  msg: any;
  data?: any;
  errorMessage?: unknown;
  token?: string;
  user?: any;
}

export type IResponseStatus = 200 | 201 | 404 | 500
@Injectable({
  providedIn: 'root'
})
export class ApisService {
  constructor(public socket: SocketSupplyService) { } async CreateStore(name: string, name_eng: string, description: string, is_stock_enabled: boolean = false): Promise<IResponseMessage> {
    await this.socket.emit('CreateStore', { name, name_eng, description, is_stock_enabled });
    return await this.socket
      .fromOneTimeEvent<IResponseMessage>('return_CreateStore')
      .then((response) => {
        return response;
      });
  }

  async UpdateStore(id: string, name: string, name_eng: string, description: string, is_stock_enabled: boolean = false): Promise<IResponseMessage> {
    await this.socket.emit('updateStore', { id, name, name_eng, description, is_stock_enabled });
    return await this.socket
      .fromOneTimeEvent<IResponseMessage>('return_updateStore')
      .then((response) => {
        return response;
      });
  }



  async GetStore(): Promise<IResponseMessage> {
    await this.socket.emit('getStore');
    return await this.socket
      .fromOneTimeEvent<IResponseMessage>('return_getStore')
      .then((response) => {
        return response;
      });
  }

  async deleteStore(id: string): Promise<IResponseMessage> {
    await this.socket.emit('deleteStore', id);
    return await this.socket
      .fromOneTimeEvent<IResponseMessage>('return_deleteStore')
      .then((response) => {
        return response;
      });
  }
  //----------------------------
  async createProduct(data: any): Promise<IResponseMessage> {
    await this.socket.emit('createProduct', data);
    return await this.socket
      .fromOneTimeEvent<IResponseMessage>('return_createProduct')
      .then((response) => {
        return response;
      });
  }

  async updateProduct(data: any): Promise<IResponseMessage> {
    await this.socket.emit('updateProduct', data);
    return await this.socket
      .fromOneTimeEvent<IResponseMessage>('return_updateProduct')
      .then((response) => {
        return response;
      });
  }

  async cloneProductFromMaster(data: { master_product_ids: string[], target_store_id: string }): Promise<IResponseMessage> {
    await this.socket.emit('cloneProductFromMaster', data);
    return await this.socket
      .fromOneTimeEvent<IResponseMessage>('return_cloneProductFromMaster')
      .then((response) => {
        return response;
      });
  }

  async getMasterAddonGroups(): Promise<IResponseMessage> {
    await this.socket.emit('getMasterAddonGroups');
    return await this.socket
      .fromOneTimeEvent<IResponseMessage>('return_getMasterAddonGroups')
      .then((response) => {
        return response;
      });
  }




  async getProduct(store_id: string): Promise<IResponseMessage> {
    await this.socket.emit('getProduct', store_id);
    return await this.socket
      .fromOneTimeEvent<IResponseMessage>('return_getProduct')
      .then((response) => {
        return response;
      });
  }

  // --- File Upload ---
  async uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('image', file);
    try {
      const response = await fetch(`${environment.API_URL}/api/upload`, {
        method: 'POST',
        body: formData
      });
      const result = await response.json();
      if (response.ok) {
        return `${environment.API_URL}${result.url}`;
      }
      throw new Error(result.message || 'Upload failed');
    } catch (error) {
      console.error('Image upload error:', error);
      throw error;
    }
  }

  // --- User Management ---
  async login(credentials: any): Promise<IResponseMessage> {
    await this.socket.emit('login', credentials);
    return await this.socket
      .fromOneTimeEvent<IResponseMessage>('return_login')
      .then(response => response);
  }

  async verifySession(data: { id: string, token: string }): Promise<IResponseMessage> {
    await this.socket.emit('verifySession', data);
    return await this.socket
      .fromOneTimeEvent<IResponseMessage>('return_verifySession')
      .then(response => response);
  }

  async logoutSession(userId: string): Promise<IResponseMessage> {
    await this.socket.emit('logoutSession', userId);
    return await this.socket
      .fromOneTimeEvent<IResponseMessage>('return_logoutSession')
      .then(response => response);
  }

  async getUsers(): Promise<IResponseMessage> {
    await this.socket.emit('getUsers');
    return await this.socket
      .fromOneTimeEvent<IResponseMessage>('return_getUsers')
      .then(response => response);
  }

  async createUser(userData: any): Promise<IResponseMessage> {
    await this.socket.emit('createUser', userData);
    return await this.socket
      .fromOneTimeEvent<IResponseMessage>('return_createUser')
      .then(response => response);
  }

  async updateUser(userData: any): Promise<IResponseMessage> {
    await this.socket.emit('updateUser', userData);
    return await this.socket
      .fromOneTimeEvent<IResponseMessage>('return_updateUser')
      .then(response => response);
  }

  async deleteUser(userId: string): Promise<IResponseMessage> {
    await this.socket.emit('deleteUser', userId);
    return await this.socket
      .fromOneTimeEvent<IResponseMessage>('return_deleteUser')
      .then(response => response);
  }

  // --- Dashboard ---
  async getSalesSummary(storeId: string): Promise<IResponseMessage> {
    await this.socket.emit('getSalesSummary', storeId);
    return await this.socket
      .fromOneTimeEvent<IResponseMessage>('return_getSalesSummary')
      .then(response => response);
  }

  async getTopSellingItems(storeId: string): Promise<IResponseMessage> {
    await this.socket.emit('getTopSellingItems', storeId);
    return await this.socket
      .fromOneTimeEvent<IResponseMessage>('return_getTopSellingItems')
      .then(response => response);
  }

  // --- Inventory & Stock --- //
  async getIngredients(storeId: string): Promise<IResponseMessage> {
    await this.socket.emit('getIngredients', storeId);
    return await this.socket.fromOneTimeEvent<IResponseMessage>('return_getIngredients');
  }

  async createIngredient(data: any): Promise<IResponseMessage> {
    await this.socket.emit('createIngredient', data);
    return await this.socket.fromOneTimeEvent<IResponseMessage>('return_createIngredient');
  }

  async updateIngredient(data: any): Promise<IResponseMessage> {
    await this.socket.emit('updateIngredient', data);
    return await this.socket.fromOneTimeEvent<IResponseMessage>('return_updateIngredient');
  }

  async deleteIngredient(id: number): Promise<IResponseMessage> {
    await this.socket.emit('deleteIngredient', id);
    return await this.socket.fromOneTimeEvent<IResponseMessage>('return_deleteIngredient');
  }

  async getStockTransactions(storeId: string): Promise<IResponseMessage> {
    await this.socket.emit('getStockTransactions', storeId);
    return await this.socket.fromOneTimeEvent<IResponseMessage>('return_getStockTransactions');
  }

  async createTransaction(data: any): Promise<IResponseMessage> {
    await this.socket.emit('createTransaction', data);
    return await this.socket.fromOneTimeEvent<IResponseMessage>('return_createTransaction');
  }

  async getRecipe(productId: string): Promise<IResponseMessage> {
    await this.socket.emit('getRecipe', productId);
    return await this.socket.fromOneTimeEvent<IResponseMessage>('return_getRecipe');
  }

  async upsertRecipe(productId: string, items: any[]): Promise<IResponseMessage> {
    await this.socket.emit('upsertRecipe', { product_id: productId, items });
    return await this.socket.fromOneTimeEvent<IResponseMessage>('return_upsertRecipe');
  }

  // --- Promotions --- //
  async getPromotions(storeId: string): Promise<IResponseMessage> {
    await this.socket.emit('getPromotions', storeId);
    return await this.socket.fromOneTimeEvent<IResponseMessage>('return_getPromotions');
  }

  async createPromotion(data: any): Promise<IResponseMessage> {
    await this.socket.emit('createPromotion', data);
    return await this.socket.fromOneTimeEvent<IResponseMessage>('return_createPromotion');
  }

  async updatePromotion(data: any): Promise<IResponseMessage> {
    await this.socket.emit('updatePromotion', data);
    return await this.socket.fromOneTimeEvent<IResponseMessage>('return_updatePromotion');
  }

  async deletePromotion(id: string): Promise<IResponseMessage> {
    await this.socket.emit('deletePromotion', id);
    return await this.socket.fromOneTimeEvent<IResponseMessage>('return_deletePromotion');
  }

  // --- Coupons --- //
  async createCouponCampaign(data: any): Promise<IResponseMessage> {
    await this.socket.emit('createCouponCampaign', data);
    return await this.socket.fromOneTimeEvent<IResponseMessage>('return_createCouponCampaign');
  }

  async getCouponCampaigns(): Promise<IResponseMessage> {
    await this.socket.emit('getCouponCampaigns');
    return await this.socket.fromOneTimeEvent<IResponseMessage>('return_getCouponCampaigns');
  }

  async validateCoupon(data: { code: string, storeId: string, productIds: string[] }): Promise<IResponseMessage> {
    await this.socket.emit('validateCoupon', data);
    return await this.socket.fromOneTimeEvent<IResponseMessage>('return_validateCoupon');
  }

  async markCouponAsUsed(data: { code: string, orderId: string }): Promise<IResponseMessage> {
    await this.socket.emit('markCouponAsUsed', data);
    return await this.socket.fromOneTimeEvent<IResponseMessage>('return_markCouponAsUsed');
  }

  async validatePromotion(code: string): Promise<IResponseMessage> {
    await this.socket.emit('validatePromotion', { code });
    return await this.socket.fromOneTimeEvent<IResponseMessage>('return_validatePromotion');
  }

  async getPromotionUsage(id: string): Promise<IResponseMessage> {
    await this.socket.emit('getPromotionUsage', id);
    return await this.socket.fromOneTimeEvent<IResponseMessage>('return_getPromotionUsage');
  }

  async getOrderDetails(orderId: string): Promise<IResponseMessage> {
    await this.socket.emit('getOrderDetails', orderId);
    return await this.socket.fromOneTimeEvent<IResponseMessage>('return_getOrderDetails');
  }

  // --- Kiosk / Order Execution --- //
  async placeOrder(payload: any): Promise<IResponseMessage> {
    await this.socket.emit('placeOrder', payload);
    return await this.socket.fromOneTimeEvent<IResponseMessage>('return_placeOrder');
  }

  // --- Master Options (Global Library) --- //
  async getGlobalMasterOptions(): Promise<IResponseMessage> {
    await this.socket.emit('getMasterOptions');
    return await this.socket.fromOneTimeEvent<IResponseMessage>('return_getMasterOptions');
  }

  async createGlobalMasterOption(data: any): Promise<IResponseMessage> {
    await this.socket.emit('createMasterOption', data);
    return await this.socket.fromOneTimeEvent<IResponseMessage>('return_createMasterOption');
  }

  async updateGlobalMasterOption(data: any): Promise<IResponseMessage> {
    await this.socket.emit('updateMasterOption', data);
    return await this.socket.fromOneTimeEvent<IResponseMessage>('return_updateMasterOption');
  }

  async deleteGlobalMasterOption(id: string): Promise<IResponseMessage> {
    await this.socket.emit('deleteMasterOption', id);
    return await this.socket.fromOneTimeEvent<IResponseMessage>('return_deleteMasterOption');
  }
}
