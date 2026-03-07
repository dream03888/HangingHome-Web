export type UserRole = 'superadmin' | 'storeadmin';

export interface User {
    id: string;
    username: string;
    password?: string;
    f_name?: string;
    l_name?: string;
    emp_code?: string;
    phone?: string;
    role: UserRole;
    storeId?: string; // Optional: Only for storeadmin
    permissions?: string[]; // E.g., ['manage_store', 'edit_menus', 'toggle_menu']
}
