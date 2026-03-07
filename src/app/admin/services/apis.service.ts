import { Injectable } from '@angular/core';
import { SocketSupplyService } from './socket-supply.service';
import { environment } from '../../environments/environment';

export interface IResponseMessage {
  status: IResponseStatus;
  header: string;
  msg: any;
  errorMessage?: unknown;
}

export type IResponseStatus = 200 | 201 | 404 | 500
@Injectable({
  providedIn: 'root'
})
export class ApisService {

  constructor(private socket: SocketSupplyService) { }

  async CreateStore(name: string, description: string): Promise<IResponseMessage> {
    await this.socket.emit('CreateStore', { name, description });
    return await this.socket
      .fromOneTimeEvent<IResponseMessage>('return_CreateStore')
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

}
