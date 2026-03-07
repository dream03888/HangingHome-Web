import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../models/auth.model';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    // Mock Users
    private initialUsers: User[] = [
        { id: '1', username: 'superadmin', password: 'password', role: 'superadmin' },
        { id: '2', username: 'storeadmin1', password: 'password', role: 'storeadmin', storeId: '1', permissions: ['edit_store', 'edit_menus', 'toggle_menu'] },
        { id: '3', username: 'storeadmin2', password: 'password', role: 'storeadmin', storeId: '2', permissions: ['toggle_menu'] }, // Can only toggle menus, not edit prices
    ];

    private usersSubject = new BehaviorSubject<User[]>(this.initialUsers);
    public users$: Observable<User[]> = this.usersSubject.asObservable();

    private currentUserSubject = new BehaviorSubject<User | null>(null);
    public currentUser$: Observable<User | null> = this.currentUserSubject.asObservable();

    constructor() {
        // Retrieve users list if we added new ones
        const savedUsersList = localStorage.getItem('mock_users_list');
        if (savedUsersList) {
            this.usersSubject.next(JSON.parse(savedUsersList));
        }

        // Check if there is a saved user session in LocalStorage
        const savedUser = localStorage.getItem('mock_user_session');
        if (savedUser) {
            this.currentUserSubject.next(JSON.parse(savedUser));
        }
    }

    public get currentUserValue(): User | null {
        return this.currentUserSubject.value;
    }

    // --- Authentication --- //

    login(username: string, password?: string): boolean {
        const users = this.usersSubject.value;
        const user = users.find(u => u.username === username && u.password === password);
        if (user) {
            const userToSave = { ...user };
            delete userToSave.password; // Don't save pass in local storage session

            localStorage.setItem('mock_user_session', JSON.stringify(userToSave));
            this.currentUserSubject.next(userToSave);
            return true;
        }
        return false;
    }

    logout(): void {
        localStorage.removeItem('mock_user_session');
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
        return this.currentUserValue?.storeId === storeId;
    }

    hasPermission(permission: string): boolean {
        if (!this.isAuthenticated()) return false;
        if (this.isSuperAdmin()) return true; // Superadmin bypassed

        const user = this.currentUserValue;
        return !!(user?.permissions && user.permissions.includes(permission));
    }

    // --- User Management (Settings) --- //

    getUsers(): Observable<User[]> {
        return this.users$;
    }

    getUserById(id: string): User | undefined {
        return this.usersSubject.value.find(u => u.id === id);
    }

    addUser(user: User): void {
        const users = this.usersSubject.value;
        user.id = (users.length + 1).toString() + Math.random().toString(36).substring(7);
        const newUsers = [...users, user];
        this.usersSubject.next(newUsers);
        localStorage.setItem('mock_users_list', JSON.stringify(newUsers));
    }

    updateUser(id: string, updatedData: Partial<User>): void {
        const users = this.usersSubject.value;
        const index = users.findIndex(u => u.id === id);
        if (index > -1) {
            // Keep existing password if not updated
            const existingUser = users[index];
            if (!updatedData.password) {
                updatedData.password = existingUser.password;
            }
            users[index] = { ...existingUser, ...updatedData };
            this.usersSubject.next([...users]);
            localStorage.setItem('mock_users_list', JSON.stringify(users));

            // Also update current session if editing self
            if (this.currentUserValue?.id === id) {
                const refreshedSelf = { ...users[index] };
                delete refreshedSelf.password;
                localStorage.setItem('mock_user_session', JSON.stringify(refreshedSelf));
                this.currentUserSubject.next(refreshedSelf);
            }
        }
    }

    deleteUser(id: string): void {
        const users = this.usersSubject.value.filter(u => u.id !== id);
        this.usersSubject.next(users);
        localStorage.setItem('mock_users_list', JSON.stringify(users));
    }
}
