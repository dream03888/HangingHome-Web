export interface Store {
    id: string;
    name: string;
    description?: string;
    createdAt: Date;
}

export interface MenuOptionChoice {
    option_id?: string; // from SQL
    options_name: string;
    options_name_eng?: string;
    options_price: number; // Add-on price (+0, +10, etc.)
    options_active?: boolean;
}

export interface MenuOption {
    group_id?: string;
    group_name: string; // e.g., "Sweetness Level", "Extra Toppings"
    group_name_eng?: string;
    isRequired?: boolean; // kept for compatibility
    isMultiple?: boolean; // kept for compatibility
    choices: MenuOptionChoice[];
}

export interface Menu {
    product_id: string; // the database ID
    storeId: string; // keep for Angular logic
    name: string;
    name_eng?: string; // from SQL
    price: number;
    image_url?: string; // from SQL
    product_active: boolean; // from SQL

    // new DB fields
    discount_type?: 'amount' | 'percentage';
    discount_value?: number;

    // legacy params for UI consistency
    discountParams?: {
        type: 'amount' | 'percentage';
        value: number;
    };
    items?: MenuOption[]; // mapped from DB's "items"
}

export interface MenuSet {
    id: string;
    storeId: string;
    name: string;
    menuIds: string[];
}
