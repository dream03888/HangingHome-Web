import { Injectable, signal } from '@angular/core';

export type Language = 'en' | 'th';

const TH_DICT: Record<string, string> = {
    // Common
    'COMMON.SAVE': 'บันทึก',
    'COMMON.CANCEL': 'ยกเลิก',
    'COMMON.DELETE': 'ลบ',
    'COMMON.EDIT': 'แก้ไข',
    'COMMON.CREATE': 'สร้าง',
    'COMMON.ACTIONS': 'จัดการ',
    'COMMON.BACK': 'กลับ',
    'COMMON.YES': 'ใช่',
    'COMMON.NO': 'ไม่ใช่',

    // Layout
    'LAYOUT.DASHBOARD': 'แผงควบคุม',
    'LAYOUT.STORES': 'ข้อมูลร้าน',
    'LAYOUT.SETTINGS': 'ตั้งค่าระบบ',
    'LAYOUT.LOGOUT': 'ออกจากระบบ',

    // Store
    'STORE.LIST_TITLE': 'สาขาทั้งหมด',
    'STORE.LIST_SUB': 'จัดการที่ตั้งสาขาและเมนู',
    'STORE.ADD_BTN': 'เพิ่มสาขาใหม่',
    'STORE.MANAGE_MENU': 'จัดการเมนู',
    'STORE.EDIT': 'แก้ไขร้าน',
    'STORE.CREATE_TITLE': 'สร้างสาขาใหม่',
    'STORE.EDIT_TITLE': 'แก้ไขสาขา',
    'STORE.NAME': 'ชื่อสาขา',
    'STORE.DESC': 'รายละเอียด',

    // Menu List
    'MENU.LIST_TITLE': 'เมนูของร้าน',
    'MENU.LIST_SUB': 'จัดการรายการอาหาร ราคา และสถานะ',
    'MENU.ADD_BTN': 'เพิ่มเมนู',
    'MENU.MANAGE_SETS': 'จัดการเซ็ต',
    'MENU.ITEM': 'รายการ',
    'MENU.PRICE': 'ราคา',
    'MENU.STATUS': 'สถานะ',
    'MENU.DISCOUNT': 'ส่วนลด',
    'MENU.EMPTY': 'ไม่พบเมนูในร้านนี้',
    'MENU.ADD_FIRST': 'เพิ่มเมนูแรก',
    'MENU.SEARCH_PLACEHOLDER': 'ค้นหาเมนูอาหาร...',

    // Menu Form
    'MENU.CREATE_TITLE': 'เพิ่มเมนูใหม่',
    'MENU.EDIT_TITLE': 'แก้ไขเมนู',
    'MENU.NAME': 'ชื่อเมนู',
    'MENU.AVAILABILITY': 'สถานะการขาย',
    'MENU.AVAILABLE': 'พร้อมขาย',
    'MENU.UNAVAILABLE': 'หมด/ปิดจำหน่าย',
    'MENU.DISCOUNT_OPT': 'ตั้งค่าส่วนลด',
    'MENU.TYPE': 'ประเภท',
    'MENU.VALUE': 'มูลค่า',
    'MENU.PERCENT': 'เปอร์เซ็นต์ (%)',
    'MENU.AMOUNT': 'จำนวนเงิน (บ.)',
    'MENU.FINAL_PRICE': 'ราคาสุทธิ',
    'MENU.IMAGE_URL': 'ลิงก์รูปภาพ',
    'MENU.IMAGE_PREVIEW': 'ตัวอย่างรูปภาพ',
    'MENU.NO_IMAGE': 'ไม่มีรูปภาพ',

    // Menu Options
    'OPTION.TITLE': 'ตัวเลือกเพิ่มเติม',
    'OPTION.SUB': 'เพิ่มตัวเลือก เช่น ความหวาน ท็อปปิ้ง หรือขนาด',
    'OPTION.ADD': '+ เพิ่มตัวเลือก',
    'OPTION.NAME': 'ชื่อตัวเลือก (เช่น ระดับความหวาน)',
    'OPTION.REQUIRED': 'บังคับเลือก',
    'OPTION.MULTIPLE': 'เลือกได้หลายข้อ',
    'OPTION.MIN_CHOICES': 'ขั้นต่ำ',
    'OPTION.MAX_CHOICES': 'สูงสุด',
    'OPTION.CHOICES': 'ตัวเลือกต่างๆ',
    'OPTION.ADD_CHOICE': '+ เพิ่มรายการย่อย',
    'OPTION.CHOICE_NAME': 'ชื่อรายการย่อย (เช่น 100%)',

    // Menu Sets
    'SET.TITLE': 'เซ็ตเมนู',
    'SET.SUB': 'จัดกลุ่มเมนูสำหรับโปรโมชั่นหรือคอมโบ',
    'SET.CREATE': 'สร้างเซ็ต',
    'SET.CREATE_TITLE': 'สร้างเซ็ตเมนูใหม่',
    'SET.NAME': 'ชื่อเซ็ต',
    'SET.SELECT_ITEMS': 'เลือกเมนูที่เข้าร่วม',
    'SET.EMPTY': 'ไม่พบเซ็ตเมนู',
    'SET.CREATE_FIRST': 'สร้างเซ็ตแรก',

    // Settings / Users
    'USER.TITLE': 'ผู้ใช้งานระบบ',
    'USER.SUB': 'จัดการบัญชีผู้ใช้และสิทธิ์การเข้าถึง',
    'USER.ADD': 'เพิ่มผู้ใช้',
    'USER.USERNAME': 'ชื่อผู้ใช้',
    'USER.ROLE': 'ระดับ',
    'USER.STORE': 'สาขาที่ดูแล',
    'USER.PERMISSIONS': 'สิทธิ์การใช้งาน',
    'USER.DEL_SUPER_ERR': 'ไม่สามารถลบ Super Admin บัญชีหลักได้',

    // User Form
    'USER.CREATE_TITLE': 'สร้างผู้ใช้ใหม่',
    'USER.EDIT_TITLE': 'แก้ไขผู้ใช้',
    'USER.PASS': 'รหัสผ่าน',
    'USER.PASS_HELP': 'เว้นว่างไว้หากต้องการใช้รหัสผ่านเริ่มต้น: password',
    'USER.ROLE_STORE': 'ผู้ดูแลสาขา (Store Admin)',
    'USER.ROLE_SUPER': 'ผู้ดูแลระบบสูงสุด (Super Admin)',
    'USER.BIND_STORE': 'ผูกกับสาขา',
    'USER.PERM_TITLE': 'สิทธิ์ย่อย',
    'USER.PERM_MANAGE_STORE': 'จัดการข้อมูลร้าน',
    'USER.PERM_MANAGE_MENU': 'เพิ่ม/แก้ไขเมนูและเซ็ต',
    'USER.PERM_TOGGLE_MENU': 'เปิด/ปิดสถานะเมนูเท่านั้น',
    'USER.PERM_MANAGE_STOCK': 'จัดการคลังวัตถุดิบ (Stock)',
    'USER.PERM_ACCESS_KIOSK': 'เข้าใช้งานหน้าร้าน (Cashier/Kiosk)'
};

const EN_DICT: Record<string, string> = {
    // Common
    'COMMON.SAVE': 'Save Changes',
    'COMMON.CANCEL': 'Cancel',
    'COMMON.DELETE': 'Delete',
    'COMMON.EDIT': 'Edit',
    'COMMON.CREATE': 'Create',
    'COMMON.ACTIONS': 'Actions',
    'COMMON.BACK': 'Go Back',
    'COMMON.YES': 'Yes',
    'COMMON.NO': 'No',

    // Layout
    'LAYOUT.DASHBOARD': 'Dashboard',
    'LAYOUT.STORES': 'Stores',
    'LAYOUT.SETTINGS': 'Settings',
    'LAYOUT.LOGOUT': 'Logout',

    // Store
    'STORE.LIST_TITLE': 'All Stores',
    'STORE.LIST_SUB': 'Manage your store locations and menus.',
    'STORE.ADD_BTN': 'Add Store',
    'STORE.MANAGE_MENU': 'Manage Menu',
    'STORE.EDIT': 'Edit Store',
    'STORE.CREATE_TITLE': 'Create New Store',
    'STORE.EDIT_TITLE': 'Edit Store',
    'STORE.NAME': 'Store Name',
    'STORE.DESC': 'Description',

    // Menu List
    'MENU.LIST_TITLE': 'Menus',
    'MENU.LIST_SUB': 'Manage menu items, prices, and availability.',
    'MENU.ADD_BTN': 'Add Menu Item',
    'MENU.MANAGE_SETS': 'Manage Sets',
    'MENU.ITEM': 'Item',
    'MENU.PRICE': 'Price',
    'MENU.STATUS': 'Status',
    'MENU.DISCOUNT': 'Discount',
    'MENU.EMPTY': 'No menu items found for this store.',
    'MENU.ADD_FIRST': 'Add First Item',
    'MENU.SEARCH_PLACEHOLDER': 'Search menus by name...',

    // Menu Form
    'MENU.CREATE_TITLE': 'Add Menu Item',
    'MENU.EDIT_TITLE': 'Edit Menu Item',
    'MENU.NAME': 'Item Name',
    'MENU.AVAILABILITY': 'Availability',
    'MENU.AVAILABLE': 'Available',
    'MENU.UNAVAILABLE': 'Unavailable',
    'MENU.DISCOUNT_OPT': 'Discount Settings',
    'MENU.TYPE': 'Type',
    'MENU.VALUE': 'Value',
    'MENU.PERCENT': 'Percentage (%)',
    'MENU.AMOUNT': 'Fixed Amount (THB)',
    'MENU.FINAL_PRICE': 'Final price',
    'MENU.IMAGE_URL': 'Image URL',
    'MENU.IMAGE_PREVIEW': 'Image Preview',
    'MENU.NO_IMAGE': 'No Image Available',

    // Menu Options
    'OPTION.TITLE': 'Options & Add-ons',
    'OPTION.SUB': 'Add customizations like Sweetness, Toppings, or Size variations.',
    'OPTION.ADD': '+ Add Option',
    'OPTION.NAME': 'Option Name (e.g. Sweetness)',
    'OPTION.REQUIRED': 'Required Option',
    'OPTION.MULTIPLE': 'Multiple Selection',
    'OPTION.MIN_CHOICES': 'Min',
    'OPTION.MAX_CHOICES': 'Max',
    'OPTION.CHOICES': 'Choices',
    'OPTION.ADD_CHOICE': '+ Add Another Choice',
    'OPTION.CHOICE_NAME': 'Choice Name (e.g. 100%)',

    // Menu Sets
    'SET.TITLE': 'Menu Sets',
    'SET.SUB': 'Group menu items together for promotions or combos.',
    'SET.CREATE': 'Create Set',
    'SET.CREATE_TITLE': 'Create New Menu Set',
    'SET.NAME': 'Set Name',
    'SET.SELECT_ITEMS': 'Select Menu Items',
    'SET.EMPTY': 'No menu sets found for this store.',
    'SET.CREATE_FIRST': 'Create First Set',

    // Settings / Users
    'USER.TITLE': 'System Users',
    'USER.SUB': 'Manage admin accounts and their backend access.',
    'USER.ADD': 'Create New User',
    'USER.USERNAME': 'Username',
    'USER.ROLE': 'Role',
    'USER.STORE': 'Assigned Store',
    'USER.PERMISSIONS': 'Permissions',
    'USER.DEL_SUPER_ERR': 'Cannot delete the primary Super Admin.',

    // User Form
    'USER.CREATE_TITLE': 'Create New User',
    'USER.EDIT_TITLE': 'Edit User',
    'USER.PASS': 'Password',
    'USER.PASS_HELP': 'Leave blank to use default: password',
    'USER.ROLE_STORE': 'Store Admin',
    'USER.ROLE_SUPER': 'Super Admin (Full Access)',
    'USER.BIND_STORE': 'Bind to Store',
    'USER.PERM_TITLE': 'Granular Permissions',
    'USER.PERM_MANAGE_STORE': 'Manage Store Details',
    'USER.PERM_MANAGE_MENU': 'Create/Edit Menus',
    'USER.PERM_TOGGLE_MENU': 'Toggle Menu Status (On/Off)',
    'USER.PERM_MANAGE_STOCK': 'Manage Inventory & Stock',
    'USER.PERM_ACCESS_KIOSK': 'Access Kiosk / Point of Sale (Cashier)'
};

@Injectable({
    providedIn: 'root'
})
export class TranslationService {
    currentLang = signal<Language>('en');

    constructor() {
        const savedLg = localStorage.getItem('app-lang') as Language;
        if (savedLg && (savedLg === 'en' || savedLg === 'th')) {
            this.currentLang.set(savedLg);
        }
    }

    setLanguage(lang: Language) {
        this.currentLang.set(lang);
        localStorage.setItem('app-lang', lang);
    }

    translate(key: string): string {
        const dict = this.currentLang() === 'th' ? TH_DICT : EN_DICT;
        return dict[key] || key;
    }
}
