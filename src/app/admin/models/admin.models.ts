export interface Store {
    id: string;
    name: string;
    name_eng?: string;
    description?: string;
    is_stock_enabled?: boolean; // Phase 3 Inventory Support
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
    minChoices?: number;
    maxChoices?: number;
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
    promotion_id?: string | null;

    // new DB fields
    discount_type?: 'amount' | 'percentage';
    discount_value?: number;

    // legacy params for UI consistency
    discountParams?: {
        type: 'amount' | 'percentage';
        value: number;
    };
    items?: MenuOption[]; // mapped from DB's "items"
    master_product_id?: string | null; // links to master catalog
    linked_stores?: string[]; // Names of child stores using this master product
}

export interface MenuSet {
    id: string;
    storeId: string;
    name: string;
    menuIds: string[];
}

// --- Inventory Models ---
export interface Ingredient {
    id: number;
    store_id: string;
    name: string;
    unit: string;
    current_quantity: number;
    min_alert_level: number;
    created_at?: Date;
}

export interface StockTransaction {
    id: number;
    ingredient_id: number;
    type: 'in' | 'out' | 'adjust';
    quantity_changed: number;
    reason: string;
    created_at?: Date;
    created_by: string;
    // Joined fields from SQL
    ingredient_name?: string;
    unit?: string;
}

export interface RecipeItem {
    id?: number;
    product_id: string;
    ingredient_id: number;
    quantity_required: number;
    // Joined fields from SQL
    ingredient_name?: string;
    unit?: string;
}

// --- Promotions ---
export interface Promotion {
    id: string;
    code: string;
    type: 'percentage' | 'amount';
    value: number;
    target_type?: 'bill' | 'product';
    product_ids?: string[];
    is_active?: boolean;
    start_date?: string | null;
    end_date?: string | null;
    usage_limit?: number | null;
    used_count?: number;
    created_at?: string;
}
