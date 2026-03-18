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
  constructor(public socket: SocketSupplyService) { }

  async CreateStore(name: string, name_eng: string, description: string, is_stock_enabled: boolean = false, allow_tables: boolean = false, table_count: number = 0, store_code: string = '', hardware_config: any = {}): Promise<IResponseMessage> {
    await this.socket.emit('CreateStore', { name, name_eng, description, is_stock_enabled, allow_tables, table_count, store_code, hardware_config });
    return await this.socket.fromOneTimeEvent<IResponseMessage>('return_CreateStore');
  }

  async UpdateStore(id: string, name: string, name_eng: string, description: string, is_stock_enabled: boolean = false, allow_tables: boolean = false, table_count: number = 0, store_code: string = '', hardware_config: any = {}): Promise<IResponseMessage> {
    await this.socket.emit('updateStore', { id, name, name_eng, description, is_stock_enabled, allow_tables, table_count, store_code, hardware_config });
    return await this.socket.fromOneTimeEvent<IResponseMessage>('return_updateStore');
  }

  async GetStore(): Promise<IResponseMessage> {
    await this.socket.emit('getStore');
    return await this.socket.fromOneTimeEvent<IResponseMessage>('return_getStore');
  }

  async deleteStore(id: string): Promise<IResponseMessage> {
    await this.socket.emit('deleteStore', id);
    return await this.socket.fromOneTimeEvent<IResponseMessage>('return_deleteStore');
  }

  async createProduct(data: any): Promise<IResponseMessage> {
    await this.socket.emit('createProduct', data);
    return await this.socket.fromOneTimeEvent<IResponseMessage>('return_createProduct');
  }

  async updateProduct(data: any): Promise<IResponseMessage> {
    await this.socket.emit('updateProduct', data);
    return await this.socket.fromOneTimeEvent<IResponseMessage>('return_updateProduct');
  }

  async cloneProductFromMaster(data: { master_product_ids: string[], target_store_id: string }): Promise<IResponseMessage> {
    await this.socket.emit('cloneProductFromMaster', data);
    return await this.socket.fromOneTimeEvent<IResponseMessage>('return_cloneProductFromMaster');
  }

  async getMasterAddonGroups(): Promise<IResponseMessage> {
    await this.socket.emit('getMasterAddonGroups');
    return await this.socket.fromOneTimeEvent<IResponseMessage>('return_getMasterAddonGroups');
  }

  async getProduct(store_id: string): Promise<IResponseMessage> {
    await this.socket.emit('getProduct', store_id);
    return await this.socket.fromOneTimeEvent<IResponseMessage>('return_getProduct');
  }

  async getSyncStatus(master_product_id: string): Promise<IResponseMessage> {
    await this.socket.emit('getSyncStatus', master_product_id);
    return await this.socket.fromOneTimeEvent<IResponseMessage>('return_getSyncStatus');
  }

  async unsyncProductFromStore(master_product_id: string, store_id: string): Promise<IResponseMessage> {
    await this.socket.emit('unsyncProductFromStore', { master_product_id, store_id });
    return await this.socket.fromOneTimeEvent<IResponseMessage>('return_unsyncProductFromStore');
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
    return await this.socket.fromOneTimeEvent<IResponseMessage>('return_login');
  }

  async verifySession(data: { id: string, token: string }): Promise<IResponseMessage> {
    await this.socket.emit('verifySession', data);
    return await this.socket.fromOneTimeEvent<IResponseMessage>('return_verifySession');
  }

  async logoutSession(userId: string): Promise<IResponseMessage> {
    await this.socket.emit('logoutSession', userId);
    return await this.socket.fromOneTimeEvent<IResponseMessage>('return_logoutSession');
  }

  async getUsers(): Promise<IResponseMessage> {
    await this.socket.emit('getUsers');
    return await this.socket.fromOneTimeEvent<IResponseMessage>('return_getUsers');
  }

  async createUser(userData: any): Promise<IResponseMessage> {
    await this.socket.emit('createUser', userData);
    return await this.socket.fromOneTimeEvent<IResponseMessage>('return_createUser');
  }

  async updateUser(userData: any): Promise<IResponseMessage> {
    await this.socket.emit('updateUser', userData);
    return await this.socket.fromOneTimeEvent<IResponseMessage>('return_updateUser');
  }

  async deleteUser(userId: string): Promise<IResponseMessage> {
    await this.socket.emit('deleteUser', userId);
    return await this.socket.fromOneTimeEvent<IResponseMessage>('return_deleteUser');
  }

  // --- Dashboard ---
  async getSalesSummary(data: { storeId: string, startDate?: string, endDate?: string }): Promise<IResponseMessage> {
    await this.socket.emit('getSalesSummary', data);
    return await this.socket.fromOneTimeEvent<IResponseMessage>('return_getSalesSummary');
  }

  async getTopSellingItems(data: { storeId: string, startDate?: string, endDate?: string }): Promise<IResponseMessage> {
    await this.socket.emit('getTopSellingItems', data);
    return await this.socket.fromOneTimeEvent<IResponseMessage>('return_getTopSellingItems');
  }

  async getBuyPerBillDashboard(data: { storeId: string, startDate: string, endDate: string }): Promise<IResponseMessage> {
    await this.socket.emit('getBuyPerBillDashboard', data);
    return await this.socket.fromOneTimeEvent<IResponseMessage>('return_getBuyPerBillDashboard');
  }

  async getProductSalesDashboard(data: { storeId: string, startDate: string, endDate: string }): Promise<IResponseMessage> {
    await this.socket.emit('getProductSalesDashboard', data);
    return await this.socket.fromOneTimeEvent<IResponseMessage>('return_getProductSalesDashboard');
  }

  async getPaymentDashboard(data: { storeId: string, startDate: string, endDate: string }): Promise<IResponseMessage> {
    await this.socket.emit('getPaymentDashboard', data);
    return await this.socket.fromOneTimeEvent<IResponseMessage>('return_getPaymentDashboard');
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

  async togglePromotion(id: string): Promise<IResponseMessage> {
    await this.socket.emit('togglePromotion', id);
    return await this.socket.fromOneTimeEvent<IResponseMessage>('return_togglePromotion');
  }

  async getPromotionById(id: string): Promise<IResponseMessage> {
    await this.socket.emit('getPromotionById', id);
    return await this.socket.fromOneTimeEvent<IResponseMessage>('return_getPromotionById');
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

  async getCouponCampaignById(id: string): Promise<IResponseMessage> {
    await this.socket.emit('getCouponCampaignById', id);
    return await this.socket.fromOneTimeEvent<IResponseMessage>('return_getCouponCampaignById');
  }

  async toggleCouponCampaign(id: string): Promise<IResponseMessage> {
    await this.socket.emit('toggleCouponCampaign', id);
    return await this.socket.fromOneTimeEvent<IResponseMessage>('return_toggleCouponCampaign');
  }

  async updateCouponCampaign(data: any): Promise<IResponseMessage> {
    await this.socket.emit('updateCouponCampaign', data);
    return await this.socket.fromOneTimeEvent<IResponseMessage>('return_updateCouponCampaign');
  }

  async appendCoupons(campaignId: string, count: number): Promise<IResponseMessage> {
    await this.socket.emit('appendCoupons', { campaignId, count });
    return await this.socket.fromOneTimeEvent<IResponseMessage>('return_appendCoupons');
  }

  async deleteCouponCampaign(id: string): Promise<IResponseMessage> {
    await this.socket.emit('deleteCouponCampaign', id);
    return await this.socket.fromOneTimeEvent<IResponseMessage>('return_deleteCouponCampaign');
  }

  async validateCoupon(data: { code: string, storeId: string, productIds: string[] }): Promise<IResponseMessage> {
    await this.socket.emit('validateCoupon', data);
    return await this.socket.fromOneTimeEvent<IResponseMessage>('return_validateCoupon');
  }

  async markCouponAsUsed(data: { code: string, orderId: string }): Promise<IResponseMessage> {
    await this.socket.emit('markCouponAsUsed', data);
    return await this.socket.fromOneTimeEvent<IResponseMessage>('return_markCouponAsUsed');
  }

  async getCouponUsage(campaignId: string): Promise<IResponseMessage> {
    await this.socket.emit('getCouponUsage', campaignId);
    return await this.socket.fromOneTimeEvent<IResponseMessage>('return_getCouponUsage');
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

  // --- Member Management --- //
  async getMembers(filters: any = {}): Promise<IResponseMessage> {
    await this.socket.emit('getMembers', filters);
    return await this.socket.fromOneTimeEvent<IResponseMessage>('return_getMembers');
  }

  async getMemberGroups(): Promise<IResponseMessage> {
    await this.socket.emit('getMemberGroups');
    return await this.socket.fromOneTimeEvent<IResponseMessage>('return_getMemberGroups');
  }

  async upsertMember(data: any): Promise<IResponseMessage> {
    await this.socket.emit('upsertMember', data);
    return await this.socket.fromOneTimeEvent<IResponseMessage>('return_upsertMember');
  }

  async upsertMemberGroup(data: any): Promise<IResponseMessage> {
    await this.socket.emit('upsertMemberGroup', data);
    return await this.socket.fromOneTimeEvent<IResponseMessage>('return_upsertMemberGroup');
  }

  async deleteMember(id: string): Promise<IResponseMessage> {
    await this.socket.emit('deleteMember', id);
    return await this.socket.fromOneTimeEvent<IResponseMessage>('return_deleteMember');
  }

  async deleteMemberGroup(id: string): Promise<IResponseMessage> {
    await this.socket.emit('deleteMemberGroup', id);
    return await this.socket.fromOneTimeEvent<IResponseMessage>('return_deleteMemberGroup');
  }

  async getMemberTransactions(memberId: string): Promise<IResponseMessage> {
    await this.socket.emit('getMemberTransactions', memberId);
    return await this.socket.fromOneTimeEvent<IResponseMessage>('return_getMemberTransactions');
  }

  async adjustMemberPoints(data: any): Promise<IResponseMessage> {
    await this.socket.emit('adjustPoints', data);
    return await this.socket.fromOneTimeEvent<IResponseMessage>('return_adjustPoints');
  }

  async getMemberByCode(code: string): Promise<IResponseMessage> {
    await this.socket.emit('getMemberByCode', code);
    return await this.socket.fromOneTimeEvent<IResponseMessage>('return_getMemberByCode');
  }

  // --- Credit Card Companies --- //
  async getCreditCardCompanies(): Promise<IResponseMessage> {
    await this.socket.emit('getCreditCardCompanies');
    return await this.socket.fromOneTimeEvent<IResponseMessage>('return_getCreditCardCompanies');
  }

  async upsertCreditCardCompany(data: any): Promise<IResponseMessage> {
    await this.socket.emit('upsertCreditCardCompany', data);
    return await this.socket.fromOneTimeEvent<IResponseMessage>('return_upsertCreditCardCompany');
  }

  async deleteCreditCardCompany(id: string): Promise<IResponseMessage> {
    await this.socket.emit('deleteCreditCardCompany', id);
    return await this.socket.fromOneTimeEvent<IResponseMessage>('return_deleteCreditCardCompany');
  }

  // --- Payment Configuration --- //
  async getPaymentConfigs(): Promise<IResponseMessage> {
    await this.socket.emit('getPaymentConfigs');
    return await this.socket.fromOneTimeEvent<IResponseMessage>('return_getPaymentConfigs');
  }

  async getMenuSets(store_id: string): Promise<IResponseMessage> {
    await this.socket.emit('getMenuSets', store_id);
    return await this.socket.fromOneTimeEvent<IResponseMessage>('return_getMenuSets');
  }

  async upsertMenuSet(data: any): Promise<IResponseMessage> {
    await this.socket.emit('upsertMenuSet', data);
    return await this.socket.fromOneTimeEvent<IResponseMessage>('return_upsertMenuSet');
  }

  async deleteMenuSet(id: string): Promise<IResponseMessage> {
    await this.socket.emit('deleteMenuSet', id);
    return await this.socket.fromOneTimeEvent<IResponseMessage>('return_deleteMenuSet');
  }

  async updatePaymentConfig(data: { config_key: string, config_value: any }): Promise<IResponseMessage> {
    await this.socket.emit('updatePaymentConfig', data);
    return await this.socket.fromOneTimeEvent<IResponseMessage>('return_updatePaymentConfig');
  }

  async triggerPaymentSync(): Promise<IResponseMessage> {
    await this.socket.emit('triggerPaymentSync', {});
    return await this.socket.fromOneTimeEvent<IResponseMessage>('return_triggerPaymentSync');
  }

  // --- Shift Management ---
  async startShift(data: { store_id: string, user_id: string, opening_balance: number }): Promise<IResponseMessage> {
    await this.socket.emit('startShift', data);
    return await this.socket.fromOneTimeEvent<IResponseMessage>('return_startShift');
  }

  async getCurrentShift(store_id: string): Promise<IResponseMessage> {
    await this.socket.emit('getCurrentShift', store_id);
    return await this.socket.fromOneTimeEvent<IResponseMessage>('return_getCurrentShift');
  }

  async getShiftSummary(shift_id: string): Promise<IResponseMessage> {
    await this.socket.emit('getShiftSummary', shift_id);
    return await this.socket.fromOneTimeEvent<IResponseMessage>('return_getShiftSummary');
  }

  async endShift(data: { shift_id: string, closing_balance_actual: number }): Promise<IResponseMessage> {
    await this.socket.emit('endShift', data);
    return await this.socket.fromOneTimeEvent<IResponseMessage>('return_endShift');
  }
}
