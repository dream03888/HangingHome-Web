import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../models/auth.model';
import { ApisService } from './apis.service';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private currentUserSubject = new BehaviorSubject<User | null>(null);
    public currentUser$: Observable<User | null> = this.currentUserSubject.asObservable();

    // We will use this promise to delay the guard until the initial auth check is done
    private initializationPromise: Promise<boolean>;

    constructor(private apisService: ApisService) {
        this.initializationPromise = this.loadTokenAsync();
    }

    public get isReady(): Promise<boolean> {
        return this.initializationPromise;
    }

    private async loadTokenAsync(): Promise<boolean> {
        const token = localStorage.getItem('kiosk_auth_token');
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                if (payload.exp && payload.exp * 1000 < Date.now()) {
                    this.logoutLocally();
                    return false;
                }

                // Verify with server checking if the token was revoked (logged in elsewhere)
                const res = await this.apisService.verifySession({ id: payload.id, token });
                if (res.status === 200 && (res as any).isValid) {
                    this.currentUserSubject.next({
                        id: payload.id.toString(),
                        username: payload.username,
                        role: payload.role,
                        storeId: payload.storeId?.toString() || undefined,
                        permissions: payload.permissions || []
                    });
                    return true;
                } else {
                    console.warn("Session revoked by Server (Multiple Logins)");
                    this.logoutLocally();
                    return false;
                }
            } catch (e) {
                console.error("Invalid token format in local storage", e);
                this.logoutLocally();
                return false;
            }
        }
        return false;
    }

    public get currentUserValue(): User | null {
        return this.currentUserSubject.value;
    }

    // --- Authentication --- //

    async login(username: string, password?: string): Promise<boolean> {
        try {
            const res = await this.apisService.login({ username, password });
            if (res.status === 200 && res.token) {
                localStorage.setItem('kiosk_auth_token', res.token);
                this.currentUserSubject.next({
                    id: res.user.id.toString(),
                    username: res.user.username,
                    role: res.user.role,
                    storeId: res.user.storeId?.toString() || undefined,
                    permissions: res.user.permissions || []
                });
                return true;
            }
            return false;
        } catch (error) {
            console.error("Login Error: ", error);
            return false;
        }
    }

    async logout(): Promise<void> {
        const user = this.currentUserSubject.value;
        if (user) {
            await this.apisService.logoutSession(user.id);
        }
        this.logoutLocally();
    }

    private logoutLocally(): void {
        localStorage.removeItem('kiosk_auth_token');
        this.currentUserSubject.next(null);
    }

    isAuthenticated(): boolean {
        return !!this.currentUserValue;
    }

    // --- Permissions --- //

    isSuperAdmin(): boolean {
        return this.currentUserValue?.role === 'superadmin';
    }

    canAccessStore(storeId: string): boolean {
        if (!this.isAuthenticated()) return false;
        if (this.isSuperAdmin()) return true;
        return this.currentUserValue?.storeId?.toString() === storeId.toString();
    }

    hasPermission(permission: string): boolean {
        if (!this.isAuthenticated()) return false;
        if (this.isSuperAdmin()) return true; // Superadmin bypassed

        const user = this.currentUserValue;
        return !!(user?.permissions && user.permissions.includes(permission));
    }
}
